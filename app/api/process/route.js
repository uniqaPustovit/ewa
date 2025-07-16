// app/api/process/route.js
import connectToDatabase from "../../../lib/mongodb"
import Result from "../../../models/Result"

export async function POST(req) {
    try {
        // Log environment variables (remove in production)
        // console.log('Environment variables check:', {
        //     tokenUrl: process.env.NEXT_PUBLIC_ISTUDIO_TOKEN_URL,
        //     getTariffUrl: process.env.NEXT_PUBLIC_ISTUDIO_GETTARIFF_URL,
        //     setContractUrl: process.env.NEXT_PUBLIC_ISTUDIO_SETCONTRACT_URL,
        //     euaLoginUrl: process.env.NEXT_PUBLIC_EUA_LOGIN_URL,
        //     euaContractUrl: process.env.NEXT_PUBLIC_EUA_CONTRACT_URL,
        // })

        const { inputData, inputDate } = await req.json()

        if (!inputData) {
            return new Response(JSON.stringify({ error: "Дані обов'язкові" }), {
                status: 400,
            })
        }

        // Функція обробки рядків
        const processStringBlock = (input) =>
            input.split("\n").map((str) => str.trim())

        // Отримуємо масив контрактів
        const contractNumbers = processStringBlock(inputData)

        const getToken = async () => {
            try {
                const response = await fetch(
                    process.env.NEXT_PUBLIC_ISTUDIO_TOKEN_URL,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: new URLSearchParams({
                            grant_type: "password",
                            username: process.env.NEXT_PUBLIC_ISTUDIO_USERNAME,
                            password: process.env.NEXT_PUBLIC_ISTUDIO_PASSWORD,
                        }),
                    }
                )

                if (!response.ok) {
                    throw new Error("Network response was not ok")
                }

                const data = await response.json()
                return data.access_token
            } catch (error) {
                console.error(
                    { error: "Failed to fetch token" },
                    { status: 500 }
                )
                return null
            }
        }

        // Функція для отримання нового токена
        async function fetchAuthToken() {
            try {
                const response = await fetch(
                    process.env.NEXT_PUBLIC_EUA_LOGIN_URL,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: new URLSearchParams({
                            email: process.env.NEXT_PUBLIC_EUA_EMAIL,
                            password: process.env.NEXT_PUBLIC_EUA_PASSWORD,
                        }),
                    }
                )

                if (!response.ok)
                    throw new Error(
                        `Помилка отримання токена: ${response.status}`
                    )
                const data = await response.json()
                return data.sessionId
            } catch (error) {
                console.error("Помилка отримання токена:", error.message)
                return null
            }
        }

        const getContractData = async (contractNumber, sessionId) => {
            let response1 = await fetch(
                `${process.env.NEXT_PUBLIC_EUA_CONTRACT_URL}/${contractNumber}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Cookie: `JSESSIONID=${sessionId}`,
                    },
                    method: "GET",
                }
            )

            return response1.json()
        }

        const getTariff = async (data1) => {
            let newData

            if (inputDate && /^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
                newData = {
                    ...data1,
                    customer: {
                        ...data1.customer,
                        birthDate: inputDate,
                    },
                }
            } else if (inputDate && inputDate.length === 4) {
                newData = {
                    ...data1,
                    insuranceObject: {
                        ...data1.insuranceObject,
                        year: inputDate,
                    },
                }
            } else {
                newData = data1
            }
            // console.log(newData)
            let response2 = await fetch(
                process.env.NEXT_PUBLIC_ISTUDIO_GETTARIFF_URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${await getToken()}`,
                    },
                    body: JSON.stringify(newData),
                }
            )
            return response2.json()
        }

        const setContract = async (data2) => {
            let response3 = await fetch(
                process.env.NEXT_PUBLIC_ISTUDIO_SETCONTRACT_URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${await getToken()}`,
                    },
                    body: JSON.stringify(data2),
                }
            )
            return response3.json()
        }

        // Підключення до бази даних
        await connectToDatabase()

        // Функція для виклику API
        async function processContracts(contractNumbers) {
            const results = []

            for (let contractNumber of contractNumbers) {
                try {
                    let sessionId = await fetchAuthToken()
                    let data1 = await getContractData(contractNumber, sessionId)

                    if (data1.state !== "SIGNED" && data1.state !== "EMITTED") {
                        throw new Error(
                            `Помилка Step1: договір не в статусі укладений`
                        )
                    } else {
                        let data2 = await getTariff(data1)

                        if (data2.ErrorCode) {
                            results.push({ contractNumber, data: data2 })
                            const result = new Result({
                                contractNumber,
                                data: data2.ErrorMsg,
                                environment: "production",
                            })
                            await result.save()
                        } else {
                            // console.log(data1)
                            let finalData = await setContract(data1)
                            results.push({ contractNumber, data: finalData })
                            const result = new Result({
                                contractNumber,
                                data: finalData,
                                environment: "production",
                            })
                            await result.save()
                        }
                    }
                } catch (error) {
                    console.error(
                        `Помилка обробки ${contractNumber}:`,
                        error.message
                    )
                    results.push({ contractNumber, data: error.message })
                    const result = new Result({
                        contractNumber,
                        data: error.message,
                        environment: "production",
                    })
                    await result.save()
                }
            }

            return results
        }

        const processedResults = await processContracts(contractNumbers)
        return new Response(JSON.stringify(processedResults), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        })
    }
}
