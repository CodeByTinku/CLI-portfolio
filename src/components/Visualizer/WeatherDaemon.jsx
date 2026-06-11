import React, { useState, useEffect, useRef } from 'react';
import { CloudSun, Sun, CloudRain, CloudSnow, CloudLightning, CloudFog, Wind, Droplets, Compass, Search, Radio, Thermometer, ShieldCheck } from 'lucide-react';
import { getWeatherAscii, getSimulatedWeather } from '../../utils/weatherUtils';

function WeatherDaemon({ weatherCity, onCitySearch }) {
  const [cityInput, setCityInput] = useState('');
  const [currentCity, setCurrentCity] = useState(weatherCity || 'Delhi');
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [logs, setLogs] = useState([]);
  
  const apiCallCountRef = useRef(0);

  // Sync with global terminal searches
  useEffect(() => {
    if (weatherCity && weatherCity !== currentCity) {
      setCurrentCity(weatherCity);
      fetchWeatherData(weatherCity);
    }
  }, [weatherCity]);

  // Initial load
  useEffect(() => {
    fetchWeatherData(currentCity);
  }, []);

  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-4), `[${timestamp}] ${msg}`]);
  };

  const fetchWeatherData = async (targetCity) => {
    setIsLoading(true);
    setErrorText(null);
    addLog(`INITIALIZING TELEMETRY DOWNLINK FOR: ${targetCity.toUpperCase()}`);
    
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || "fdc6799c537b6effb3255b30e3f102c3";
    
    try {
      addLog(`CONTACTING SATELLITE SYSTEM UPLINK...`);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(targetCity)}&appid=${apiKey}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error(`Satellite reports: HTTP-${response.status}`);
      }
      
      const data = await response.json();
      setWeatherData(data);
      setIsSimulated(false);
      addLog(`TELEMETRY TRANSMISSION SECURE // DATA RECEIVED.`);
    } catch (err) {
      console.warn("Weather API fetch failed, utilizing emulated telemetry fallback:", err);
      // Fallback to simulated weather
      const simulated = getSimulatedWeather(targetCity);
      setWeatherData(simulated);
      setIsSimulated(true);
      addLog(`DNLINK FAIL: FALLING BACK TO EMULATED PROCEDURAL DATABASE.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    const search = cityInput.trim();
    setCurrentCity(search);
    fetchWeatherData(search);
    if (onCitySearch) {
      onCitySearch(search);
    }
    setCityInput('');
  };

  const renderAnimatedWeather = () => {
    if (!weatherData) return null;
    const condition = weatherData.weather[0].main.toLowerCase();

    if (condition.includes('thunderstorm')) {
      return (
        <div className="relative w-24 h-24 flex items-center justify-center">
          <CloudLightning className="w-16 h-16 text-yellow-400 animate-pulse" />
          <span className="absolute w-2 h-4 bg-yellow-400 rounded-sm top-12 left-10 animate-bounce" style={{ animationDelay: '0.2s' }} />
          <span className="absolute w-2 h-4 bg-yellow-400 rounded-sm top-14 left-14 animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      );
    } else if (condition.includes('drizzle') || condition.includes('rain')) {
      return (
        <div className="relative w-24 h-24 flex items-center justify-center">
          <CloudRain className="w-16 h-16 text-cyan-400" />
          <div className="absolute top-14 left-7 flex gap-2">
            <span className="w-[2px] h-3 bg-cyan-400 animate-[audioWave_0.8s_infinite] opacity-60" style={{ animationDelay: '0.1s' }} />
            <span className="w-[2px] h-3 bg-cyan-400 animate-[audioWave_0.8s_infinite] opacity-60" style={{ animationDelay: '0.3s' }} />
            <span className="w-[2px] h-3 bg-cyan-400 animate-[audioWave_0.8s_infinite] opacity-60" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>
      );
    } else if (condition.includes('snow')) {
      return (
        <div className="relative w-24 h-24 flex items-center justify-center">
          <CloudSnow className="w-16 h-16 text-white animate-spin" style={{ animationDuration: '20s' }} />
        </div>
      );
    } else if (
      condition.includes('mist') ||
      condition.includes('smoke') ||
      condition.includes('haze') ||
      condition.includes('fog')
    ) {
      return (
        <div className="relative w-24 h-24 flex items-center justify-center">
          <CloudFog className="w-16 h-16 text-teal-400/80 animate-pulse" />
        </div>
      );
    } else if (condition.includes('clear')) {
      return (
        <div className="relative w-24 h-24 flex items-center justify-center">
          <Sun className="w-16 h-16 text-amber-400 animate-spin" style={{ animationDuration: '12s' }} />
          <span className="absolute w-12 h-12 bg-amber-400/20 rounded-full blur-md animate-ping" style={{ animationDuration: '4s' }} />
        </div>
      );
    } else {
      // Cloudy / default
      return (
        <div className="relative w-24 h-24 flex items-center justify-center">
          <CloudSun className="w-16 h-16 text-slate-300 animate-bounce" style={{ animationDuration: '8s' }} />
        </div>
      );
    }
  };

  const asciiLines = weatherData 
    ? getWeatherAscii(
        weatherData.weather[0].main, 
        weatherData.main.temp, 
        weatherData.main.feels_like, 
        weatherData.wind.speed, 
        weatherData.main.humidity,
        weatherData.weather[0].description
      )
    : [];

  return (
    <div className="glass-panel p-5 glow-border bg-[rgba(0,0,0,0.25)] flex flex-col space-y-4 relative overflow-hidden transition-all duration-300">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 select-none">
        <h3 className="font-outfit text-sm font-semibold tracking-wider text-[var(--primary-color)] flex items-center gap-2">
          <Radio className="w-4 h-4 animate-pulse" />
          SATELLITE WEATHER DECK // {isSimulated ? 'EMULATOR' : 'LIVE'}
        </h3>
        <span className="font-fira text-[9px] text-[var(--text-secondary)]">
          TELEMETRY PORTAL v2.0
        </span>
      </div>

      {/* Retro CLI Search Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="ENTER GLOBAL CITY TO DOWNLINK..."
            className="w-full bg-black/40 border border-[var(--border-color)] rounded px-3 py-1.5 font-fira text-xs text-[var(--text-primary)] placeholder-gray-600 focus:outline-none focus:border-[var(--primary-color)] transition-colors"
          />
          <Search className="absolute right-2.5 top-2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-3 py-1.5 bg-black/60 hover:bg-[var(--primary-color)] hover:text-black border border-[var(--border-color)] hover:border-[var(--primary-color)] rounded text-xs font-outfit font-bold tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'SYNCING...' : 'DOWNLINK'}
        </button>
      </form>

      {/* Main Weather Visual Grid */}
      {weatherData ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          
          {/* Animated SVG representation & coordinate radar scanner */}
          <div className="md:col-span-2 flex flex-col items-center justify-center bg-black/20 border border-[var(--border-color)] rounded-lg p-3 relative overflow-hidden">
            {/* SVG radar grids backdrop */}
            <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
              <svg className="w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--primary-color)" strokeWidth="0.5" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="var(--primary-color)" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="15" fill="none" stroke="var(--primary-color)" strokeWidth="0.5" />
                <line x1="50" y1="5" x2="50" y2="95" stroke="var(--primary-color)" strokeWidth="0.5" />
                <line x1="5" y1="50" x2="95" y2="50" stroke="var(--primary-color)" strokeWidth="0.5" />
              </svg>
            </div>
            
            {renderAnimatedWeather()}
            
            <div className="mt-2 text-center z-10">
              <h4 className="font-outfit text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                {weatherData.name}, {weatherData.sys.country}
              </h4>
              <p className="font-fira text-[9px] text-[var(--text-secondary)] uppercase">
                LAT: {weatherData.coord.lat}° | LON: {weatherData.coord.lon}°
              </p>
            </div>
          </div>

          {/* Core Numerical Diagnostics */}
          <div className="md:col-span-3 flex flex-col justify-between space-y-2 border-l border-[var(--border-color)] pl-0 md:pl-4 font-fira select-none">
            
            {/* Temperature values */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)]/30 pb-1.5">
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Thermometer className="w-3.5 h-3.5 text-[var(--primary-color)]" />
                CORE TEMP
              </span>
              <div className="text-right">
                <span className="text-lg font-bold text-[var(--primary-color)]">
                  {Math.round(weatherData.main.temp)}°C
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block">
                  FEELS LIKE {Math.round(weatherData.main.feels_like)}°C
                </span>
              </div>
            </div>

            {/* Atmosphere readings (Wind & Humidity) */}
            <div className="grid grid-cols-2 gap-2 py-1">
              <div className="bg-black/30 border border-[var(--border-color)]/40 rounded p-1.5 flex flex-col items-center justify-center">
                <Wind className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="text-[8px] text-[var(--text-secondary)] uppercase">WIND SPEED</span>
                <span className="text-xs font-bold text-white mt-0.5">{weatherData.wind.speed} m/s</span>
              </div>

              <div className="bg-black/30 border border-[var(--border-color)]/40 rounded p-1.5 flex flex-col items-center justify-center">
                <Droplets className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-[8px] text-[var(--text-secondary)] uppercase">HUMIDITY</span>
                <span className="text-xs font-bold text-white mt-0.5">{weatherData.main.humidity}%</span>
              </div>
            </div>

            {/* Coordinates & Pressure */}
            <div className="text-[9px] text-[var(--text-secondary)] space-y-0.5 pt-1">
              <div className="flex justify-between">
                <span>BAROMETRIC PRESSURE:</span>
                <span className="text-[var(--text-primary)] font-bold">{weatherData.main.pressure} hPa</span>
              </div>
              <div className="flex justify-between">
                <span>CLOUD DENSITY:</span>
                <span className="text-[var(--text-primary)] font-bold">{weatherData.clouds.all}%</span>
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center border border-[var(--border-color)] rounded bg-black/15">
          <p className="font-fira text-xs text-[var(--text-secondary)] animate-pulse">
            NO TELEMETRY BUFFER CAPTURED
          </p>
        </div>
      )}

      {/* Monospace ASCII Art Box */}
      {weatherData && (
        <div className="border border-[var(--border-color)] rounded bg-black/40 p-2.5 font-mono text-[9px] sm:text-[10px] leading-tight text-[var(--primary-color)] overflow-x-auto whitespace-pre">
          {asciiLines.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      )}

      {/* Satellite telemetry transmission log stream */}
      <div className="border border-dashed border-[var(--border-color)]/60 rounded p-2 bg-black/20 font-fira text-[8px] tracking-wide text-green-400/80 space-y-0.5 select-none max-h-[70px] overflow-y-auto">
        {logs.map((log, idx) => (
          <div key={idx} className="truncate">{log}</div>
        ))}
      </div>

      {/* Network link safety info */}
      <div className="flex items-center gap-1.5 text-[8px] text-[var(--text-secondary)] font-fira pt-1">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        <span>SYS LINK SECURE: AES-256 SATELLITE DOWNLINK</span>
      </div>

    </div>
  );
}

export default WeatherDaemon;
