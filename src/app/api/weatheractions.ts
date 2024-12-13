'use server'

export async function fetchCitySuggestions(query: string) {
  if (!query || query.length < 3) return [];
  
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/find?q=${query}&appid=${"95cb7270654c7f74be35b5f94abf2ff9"}`
    );
    const data = await response.json();
    return data.list.map((item: any) => item.name);
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    return [];
  }
}

export async function fetchWeatherData(city: string) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${"95cb7270654c7f74be35b5f94abf2ff9"}&cnt=56`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}