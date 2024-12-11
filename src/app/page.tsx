'use client'

import { useRouter } from 'next/navigation'
import SearchBox from "@/components/SearchBox";
import { useState, useCallback } from "react";
import axios from "axios";
import { debounce } from 'lodash';
import { useAtom } from 'jotai';
import { placeAtom } from './atom';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [_, setPlace] = useAtom(placeAtom);
  const [isPostalCode, setIsPostalCode] = useState(false);
  const router = useRouter();

  const debouncedFetchSuggestions = useCallback(
    debounce(async (value: string) => {
      if (!isPostalCode && value.length >= 3) {
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/find?q=${value}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`
          );
          const suggestions = response.data.list.map((item: any) => item.name);
          setSuggestions(suggestions);
          setError("");
          setShowSuggestions(true);
        } catch (error) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    }, 500),
    [isPostalCode]
  );

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    // Check if input matches postal code format (adjust regex for your country's format)
    const isPostal = /^\d{5,6}$/.test(value);
    setIsPostalCode(isPostal);
    
    if (!isPostal) {
      debouncedFetchSuggestions(value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  function handleSuggestionClick(value: string) {
    setSearchTerm(value);
    setPlace(value);
    setShowSuggestions(false);
    router.push(`/forecast?city=${encodeURIComponent(value)}`);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;

    setPlace(searchTerm);
    if (isPostalCode) {
      router.push(`/forecast?zip=${searchTerm}`);
    } else {
      router.push(`/forecast?city=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Weather Forecast</h1>
        <div className="relative">
          <SearchBox
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            onSubmit={handleSubmit}
            placeholder="Enter city name or postal code"
            className="w-full"
          />
          {isPostalCode && (
            <p className="text-sm text-gray-600 mt-2">
              ℹ️ Searching by postal code
            </p>
          )}
          {((showSuggestions && suggestions.length > 0) || error) && !isPostalCode && (
            <ul className="absolute w-full bg-white border mt-1 rounded-md shadow-lg">
              {error && suggestions.length < 1 && (
                <li className="text-red-500 p-2">{error}</li>
              )}
              {suggestions.map((item, i) => (
                <li
                  key={i}
                  onClick={() => handleSuggestionClick(item)}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}