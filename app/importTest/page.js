'use client';
import { useState } from 'react';
import Navigation from '../components/Navigation';

export default function ImportTest() {
  const [inputData, setInputData] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/processTest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputData }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Імпорт договір на тест</h1>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label htmlFor="inputData" className="block text-sm font-medium text-gray-700 mb-2">
              Введіть номери договорів (по одному на рядок)
            </label>
            <textarea
              id="inputData"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded-md"
              placeholder="Введіть номери договорів..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Обробка...' : 'Обробити'}
          </button>
        </form>

        {results.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Результати:</h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="bg-white p-4 rounded-md shadow">
                  <p className="font-medium">Договір: {result.contractNumber}</p>
                  <p className="mt-2">Результат: {JSON.stringify(result.data)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 