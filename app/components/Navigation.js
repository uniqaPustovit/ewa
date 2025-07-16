"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Navigation() {
    const pathname = usePathname()

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex space-x-8">
                        <Link
                            href="/"
                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                pathname === "/"
                                    ? "border-blue-500 text-gray-900"
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            }`}
                        >
                            Реімпорт договорів
                        </Link>
                        <Link
                            href="/importTest"
                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                pathname === "/importTest"
                                    ? "border-blue-500 text-gray-900"
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            }`}
                        >
                            Імпорт договір в 10 статус (Тестові)
                        </Link>
                        <Link
                            href="/kasco"
                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                pathname === "/kasco"
                                    ? "border-blue-500 text-gray-900"
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            }`}
                        >
                            Імпорт договір КАСКО (рік випуску ТЗ)
                        </Link>
                        <Link
                            href="/trevel"
                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                pathname === "/trevel"
                                    ? "border-blue-500 text-gray-900"
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            }`}
                        >
                            Імпорт договір Тревел (дата народження
                            Страхувальника)
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
