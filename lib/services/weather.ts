const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '';

export interface WeatherData {
  temperature: number;
  pressure: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  conditions: string;
  description: string;
  icon: string;
}

export async function getWeatherData(latitude: number, longitude: number): Promise<WeatherData | null> {
  if (!OPENWEATHER_API_KEY) {
    console.warn('OpenWeather API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      temperature: data.main.temp,
      pressure: data.main.pressure,
      humidity: data.main.humidity,
      windSpeed: data.wind?.speed || 0,
      windDirection: data.wind?.deg || 0,
      conditions: data.weather[0]?.main || '',
      description: data.weather[0]?.description || '',
      icon: data.weather[0]?.icon || '',
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}

export function getWeatherConditionScore(weather: WeatherData | null): number {
  if (!weather) return 0;

  let score = 0;

  // Temperature score (optimal: 60-80°F)
  if (weather.temperature >= 60 && weather.temperature <= 80) {
    score += 10;
  } else if (weather.temperature >= 50 && weather.temperature < 60) {
    score += 5;
  } else if (weather.temperature > 80 && weather.temperature <= 90) {
    score += 5;
  }

  // Pressure score (stable: 30.0-30.2 inHg)
  if (weather.pressure >= 30.0 && weather.pressure <= 30.2) {
    score += 5;
  }

  // Wind score (calm: < 10 mph)
  if (weather.windSpeed < 10) {
    score += 5;
  }

  return score;
}
