// pages/index.tsx
"use client";
// pages/index.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import OpenAI from "openai";


const locales = [
  { label: 'US', value: 'US' },
  { label: 'Hong Kong (HK)', value: 'HK' },
  { label: 'China', value: 'CN' },
  { label: 'Global', value: 'GLOBAL' },
];

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Simplified Chinese', value: 'zh-CN' },
  { label: 'Traditional Chinese', value: 'zh-TW' },
];

interface Stock {
  symbol: string;
  name: string;
  exchange: string;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('US');
  const [language, setLanguage] = useState('en');
  const [tickers, setTickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [exchange, setExchange] = useState('');
  function extractData(message: string): { stockTickers: string[]; region: string } {
    // Match the stock tickers (only the portion after "Stock Ticker(s):" and before "Region:")
    const regex = /Stock Ticker\(s\):\s*(.*?),\s*Region:/;

    // Use the `match` method
    const match = message.match(regex);
    let parsedArray:string[] = [];
    if (match && match[1]) {
      const result = match[1];
      parsedArray = result.split(",").map(ticker => ticker.trim());
      console.log(result); // Output: 0005.HK, NVDA
      console.log(parsedArray);
    }
    // const tickerMatch = message.match(/Stock Ticker\(s\):\s*([\w\s,]+)(?=,?\s*Region:)/);
    // const tickers = tickerMatch
    //   ? tickerMatch[1]
    //       .split(',')
    //       .map(ticker => ticker.trim())
    //       .filter(ticker => ticker !== '') // Remove empty entries
    //   : [];
  
    // Match the region
    const regionMatch = message.match(/Region:\s*([\w\s]+)/);
    const region = regionMatch ? regionMatch[1].trim() : '';
    const stockTickers:string[] = parsedArray;
    return { stockTickers, region };
  }
  const extractTickers = async () => {
    setLoading(true);
    setTickers([]);
    const prompt:string = `Given a natural language input, extract the following information: \n
    Region: Determine the region or market associated with the stock containing in the input(s)." \n
    Stock Ticker(s): Identify the stock ticker of the company in the region. If no ticker is explicitly mentioned or implied, return "No tickers found. \n
    Example: Input: "AMD and NVDA are the hottest AI stock recently", Output: {Stock Ticker(s): AMD, NVDA, Region: US} \n
    Example: Input: "Tell me about HKEX and Tesla", Output: {Stock Ticker(s): 0388.HK, TSLA, Region: Global} \n
    Example: Input "HASE has laid off over 100 employees in the investment banking division in HK headquarters ", Output: {Stock Ticker(s): 0011.HK, Region: Hong Kong} \n
    Example: Input "What is the profit of BOC in China", Output: {Stock Ticker(s): 601988. SS, Region: ShangHai} \n
    input: `;
    const input:String = prompt + query;
    try {
      console.log("query is", query);
      const res = await fetch('api/chat',{
        method:'POST',
        headers:{
          'Content-Type':'application/json'
        },
        body: JSON.stringify(input),
      })
      if (!res.ok){
        throw new Error('Failed to fetch response');
      }
      const data = await res.json();
      setTickers(data);
      console.log(data);
      const stockInfo = extractData(data.message);

      console.log(stockInfo); // { stockTicker: 'HSBC', region: 'Global' }
      console.log(stockInfo.stockTickers);
      const response = await fetch(`/api/searchSymbol`,{
          method:'POST',
          headers:{
            'Content-Type':'application/json'
          },
          body: JSON.stringify(stockInfo.stockTickers),
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data2 = await response.json();
      console.log("data2 is",data2);
      if (data2 && data2.message && data2.message.length > 0 ) {
        data2.message.map((stock:any) => {
          setTickers(prevTickers => Array.isArray(prevTickers) ? [...prevTickers, stock.symbol] : [stock.symbol]);
        })
        setExchange(data2.message[0].exchange)
      }
      // setTickers(prev => [...prev, data2.message.symbol]);
      // // setStringArray(prevArray => [...prevArray, newString]);
      // setExchange(data2.message.exchange);
      console.log(exchange);
      console.log(tickers);
    } catch (error) {
      console.error('Error extracting tickers:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">NLP Stock Ticker Identifier</h1>

        {/* User Input */}
        <textarea
          className="w-full p-2 border border-gray-300 rounded mb-4"
          style={{ color: 'black' }}
          placeholder="Type your query here..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        ></textarea>


        {/* Output */}
        <button
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          style={{ color: 'black' }}
          onClick={extractTickers}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Extract Tickers'}
        </button>

        <div className="mt-4">
        <h2 className="text-lg font-semibold" style={{ color: 'black' }}>Extracted Tickers:</h2>
          {tickers.length > 0 && exchange ? (
            <>
              { <ul className="list-disc list-inside mt-2" style={{ color: 'black' }}>
              {tickers.map((str, val) => (
                    <li key = {val}>{str}</li>
                ))}
              </ul> }
              <ul className="list-disc list-inside mt-2" style={{ color: 'black' }}>
                {exchange}
              </ul>
            </>
          ) : (
            <p className="text-gray-500 mt-2">No tickers found</p>
          )}
        </div>
      </div>
    </div>
  );
}