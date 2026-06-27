import React, { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/styles';

type GeolocationPosition = {
  coords: {
    latitude: number;
    longitude: number;
  };
};

type GeolocationError = {
  code?: number;
  message?: string;
};

type BrowserGeolocation = {
  getCurrentPosition: (
    success: (position: GeolocationPosition) => void,
    error: (error: GeolocationError) => void,
    options?: { enableHighAccuracy?: boolean; timeout?: number; maximumAge?: number }
  ) => void;
};

type WeatherState =
  | { status: 'loading'; message: string }
  | {
      status: 'ready';
      temperature: number;
      condition: string;
      city: string;
      icon: string;
    }
  | { status: 'unavailable'; message: string };

const WEATHER_CODES: Record<number, { condition: string; icon: string }> = {
  0: { condition: 'Clear', icon: '☀️' },
  1: { condition: 'Mostly clear', icon: '🌤️' },
  2: { condition: 'Partly cloudy', icon: '⛅' },
  3: { condition: 'Cloudy', icon: '☁️' },
  45: { condition: 'Foggy', icon: '🌫️' },
  48: { condition: 'Foggy', icon: '🌫️' },
  51: { condition: 'Light drizzle', icon: '🌦️' },
  53: { condition: 'Drizzle', icon: '🌦️' },
  55: { condition: 'Heavy drizzle', icon: '🌧️' },
  61: { condition: 'Light rain', icon: '🌧️' },
  63: { condition: 'Rain', icon: '🌧️' },
  65: { condition: 'Heavy rain', icon: '🌧️' },
  71: { condition: 'Light snow', icon: '❄️' },
  73: { condition: 'Snow', icon: '❄️' },
  75: { condition: 'Heavy snow', icon: '❄️' },
  80: { condition: 'Showers', icon: '🌦️' },
  81: { condition: 'Showers', icon: '🌦️' },
  82: { condition: 'Heavy showers', icon: '🌧️' },
  95: { condition: 'Thunderstorm', icon: '⛈️' },
};

function getBrowserGeolocation(): BrowserGeolocation | null {
  if (Platform.OS !== 'web') return null;

  const navigatorLike = globalThis.navigator as
    | { geolocation?: BrowserGeolocation }
    | undefined;
  return navigatorLike?.geolocation ?? null;
}

function readWeatherCode(code: number | null | undefined) {
  if (typeof code !== 'number') {
    return { condition: 'Weather', icon: '☁️' };
  }

  return WEATHER_CODES[code] ?? { condition: 'Weather', icon: '☁️' };
}

async function getCity(latitude: number, longitude: number) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en&format=json`
    );
    if (!response.ok) return 'Current location';

    const payload = (await response.json()) as {
      results?: Array<{ name?: string; admin1?: string; country?: string }>;
    };
    const place = payload.results?.[0];
    return place?.name || place?.admin1 || place?.country || 'Current location';
  } catch {
    return 'Current location';
  }
}

async function getWeather(latitude: number, longitude: number) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
  );
  if (!response.ok) throw new Error('Weather request failed');

  return (await response.json()) as {
    current?: {
      temperature_2m?: number;
      weather_code?: number;
    };
  };
}

export default function WeatherCard() {
  const [weather, setWeather] = useState<WeatherState>({
    status: 'loading',
    message: 'Checking weather...',
  });

  useEffect(() => {
    let active = true;
    const geolocation = getBrowserGeolocation();

    if (!geolocation) {
      setWeather({
        status: 'unavailable',
        message: 'Weather unavailable.',
      });
      return () => {
        active = false;
      };
    }

    geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const [weatherPayload, city] = await Promise.all([
            getWeather(latitude, longitude),
            getCity(latitude, longitude),
          ]);

          if (!active) return;

          const current = weatherPayload.current;
          if (typeof current?.temperature_2m !== 'number') {
            throw new Error('Missing weather values');
          }

          const condition = readWeatherCode(current.weather_code);
          setWeather({
            status: 'ready',
            temperature: Math.round(current.temperature_2m),
            condition: condition.condition,
            city,
            icon: condition.icon,
          });
        } catch {
          if (!active) return;
          setWeather({
            status: 'unavailable',
            message: 'Weather unavailable.',
          });
        }
      },
      () => {
        if (!active) return;
        setWeather({
          status: 'unavailable',
          message: 'Weather unavailable.',
        });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );

    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.weatherCard}>
      {weather.status === 'ready' ? (
        <>
          <Text style={styles.weatherEmoji}>{weather.icon}</Text>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
            <Text style={styles.weatherCondition} numberOfLines={1}>
              {weather.condition}
            </Text>
            <Text style={styles.weatherCity} numberOfLines={1}>
              {weather.city}
            </Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.weatherFallbackIcon}>
            <Ionicons name="partly-sunny-outline" size={18} color="#A86B24" />
          </View>
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherCondition}>
              {weather.status === 'loading' ? weather.message : weather.message}
            </Text>
            <Text style={styles.weatherCity}>Location optional</Text>
          </View>
        </>
      )}
    </View>
  );
}
