// app/page.js
"use client";

import { useState } from "react";
import Navigation from './components/Navigation';

export default function Home() {
  const [inputData, setInputData] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputData }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Реімпорт договорів</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="inputData" className="block text-sm font-medium text-gray-700 mb-2">
                Введіть номери договорів (по одному на рядок)
              </label>
              <textarea
                id="inputData"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                className="w-full h-32 px-3 py-2 text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Введіть номери договорів..."
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Обробка...
                  </span>
                ) : 'Обробити'}
              </button>
            </div>
          </form>

          {results.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Результати:</h2>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-50 rounded-md p-4 border border-gray-200"
                  >
                    <p className="font-medium text-gray-900">Договір: {result.contractNumber}</p>
                    <p className="mt-2 text-sm text-gray-600">
                      Результат: {JSON.stringify(result.data)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
