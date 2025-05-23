export async function POST(req) {
    try {
       

        const { inputData } = await req.json()

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
                    // process.env.NEXT_PUBLIC_TEST_ISTUDIO_TOKEN_URL,
                    process.env.NEXT_PUBLIC_ISTUDIO_TOKEN_URL,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: new URLSearchParams({
                            // grant_type: "password",
                            // username: process.env.NEXT_PUBLIC_ISTUDIO_USERNAME_TEST,
                            // password: process.env.NEXT_PUBLIC_ISTUDIO_PASSWORD_TEST,
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
                    process.env.NEXT_PUBLIC_TEST_EUA_LOGIN_URL,
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
                `${process.env.NEXT_PUBLIC_TEST_EUA_CONTRACT_URL}/${contractNumber}`,
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
            // console.log(JSON.stringify(data1))
            let dataNew = {
                ...data1,
                tariff: {
                    ...data1.tariff,
                    externalId: '4448_New',
                },
            }
            // console.log(dataNew)
            let response2 = await fetch(
                // process.env.NEXT_PUBLIC_TEST_ISTUDIO_GETTARIFF_URL,
                process.env.NEXT_PUBLIC_ISTUDIO_GETTARIFF_URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${await getToken()}`,
                    },
                    body: JSON.stringify(data1),
                }
            )
            return response2.json()
        }

        const setContract = async (data2) => {
            let dataNew = {
                ...data2,
                tariff: {
                    ...data2.tariff,
                    externalId: '4448_New',
                },
            }
            let response3 = await fetch(
                // process.env.NEXT_PUBLIC_TEST_ISTUDIO_SETCONTRACT_URL,
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

        // Функція для виклику API
        async function processContracts(contractNumbers) {
            const results = []

            for (let contractNumber of contractNumbers) {
                try {
                    let sessionId = await fetchAuthToken()
                    let data1 = await getContractData(contractNumber, sessionId)

                    // if (data1.state !== "SIGNED" && data1.state !== "EMITTED") {
                    //     throw new Error(
                    //         `Помилка Step1: договір не в статусі укладений`
                    //     )
                    // } else {
                        let data2 = await getTariff(data1)
                        results.push({ 
                            contractNumber, 
                            data: data2,
                            environment: 'test'
                        })
                        // console.log(data2)
                    //     if (data2.ErrorCode) {
                    //         results.push({ 
                    //             contractNumber, 
                    //             data: data2,
                    //             environment: 'test'
                    //         })
                    //     } else {
                    //         let finalData = await setContract(data1)
                    //         results.push({ 
                    //             contractNumber, 
                    //             data: finalData,
                    //             environment: 'test'
                    //         })
                    //     // }
                    // }
                } catch (error) {
                    console.error(
                        `Помилка обробки ${contractNumber}:`,
                        error.message
                    )
                    results.push({ 
                        contractNumber, 
                        data: error.message,
                        environment: 'test'
                    })
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