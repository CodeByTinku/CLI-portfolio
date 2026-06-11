/**
 * Weather utilities for DevPulse OS Weather Daemon
 */

export const getWeatherAscii = (condition, temp, feelsLike, wind, humidity, desc = "") => {
  const cond = (condition || "clear").toLowerCase();
  const t = Math.round(temp);
  const fl = Math.round(feelsLike);
  const w = wind || 0;
  const h = humidity || 0;
  const d = desc || condition || "unknown";

  if (cond.includes("thunderstorm")) {
    return [
      "     .--.     Weather: " + d.toUpperCase(),
      "  .-(    ).   Temp: " + t + "°C (Feels: " + fl + "°C)",
      " (___.__)__)  Wind: " + w + " m/s | Hum: " + h + "%",
      "  ⚡  ⚡  ⚡     UPLINK: WARNING // ELECTRICAL",
      "  ′ ′ ′ ′     SYS_STAT: POWER_SURGE_DAMPENED"
    ];
  } else if (cond.includes("drizzle") || cond.includes("rain")) {
    return [
      "     .--.     Weather: " + d.toUpperCase(),
      "  .-(    ).   Temp: " + t + "°C (Feels: " + fl + "°C)",
      " (___.__)__)  Wind: " + w + " m/s | Hum: " + h + "%",
      "  ′ ′ ′ ′     Precip: Liquid H2O Downpour",
      " ′ ′ ′ ′      UPLINK: SECURE // DATALINK_OK"
    ];
  } else if (cond.includes("snow")) {
    return [
      "     .--.     Weather: " + d.toUpperCase(),
      "  .-(    ).   Temp: " + t + "°C (Feels: " + fl + "°C)",
      " (___.__)__)  Wind: " + w + " m/s | Hum: " + h + "%",
      "  *  *  *     Precip: Cryogenic Crystals",
      " *  *  *      UPLINK: OK // COOLING_EFFECT"
    ];
  } else if (
    cond.includes("mist") ||
    cond.includes("smoke") ||
    cond.includes("haze") ||
    cond.includes("dust") ||
    cond.includes("fog") ||
    cond.includes("sand") ||
    cond.includes("ash")
  ) {
    return [
      " _ - _ - _ -  Weather: " + d.toUpperCase(),
      "  _ - _ - _   Temp: " + t + "°C (Feels: " + fl + "°C)",
      " _ - _ - _ -  Wind: " + w + " m/s | Hum: " + h + "%",
      "              Visibility: Attenuated",
      "              UPLINK: SECURE // RADAR_SCANS_ON"
    ];
  } else if (cond.includes("cloud")) {
    return [
      "     .--.     Weather: " + d.toUpperCase(),
      "  .-(    ).   Temp: " + t + "°C (Feels: " + fl + "°C)",
      " (___.__)__)  Wind: " + w + " m/s | Hum: " + h + "%",
      "              Clouds: Obscuring Star Core",
      "              UPLINK: ESTABLISHED // SYNC_OK"
    ];
  } else if (cond.includes("clear")) {
    return [
      "   \\   /      Weather: " + d.toUpperCase(),
      "    .-.       Temp: " + t + "°C (Feels: " + fl + "°C)",
      " ─ (   ) ─    Wind: " + w + " m/s | Hum: " + h + "%",
      "    `-`       Downlink: Solar Radiation Max",
      "   /   \\      UPLINK: ACTIVE // EXCELLENT"
    ];
  } else {
    // Default
    return [
      "     .-.      Weather: " + d.toUpperCase(),
      "    (   )     Temp: " + t + "°C (Feels: " + fl + "°C)",
      "     `-`      Wind: " + w + " m/s | Hum: " + h + "%",
      "              Sys-Telemetry: Atmospheric",
      "              UPLINK: STABLE // SCANNING"
    ];
  }
};

/**
 * Get dynamic simulated mock weather data for typical locations
 * to use as fallbacks or overrides if API is offline.
 */
export const getSimulatedWeather = (city) => {
  const cityName = city.trim().toLowerCase();
  
  const mockDatabase = {
    delhi: { name: "Delhi", sys: { country: "IN" }, main: { temp: 38, feels_like: 42, humidity: 35, pressure: 1002 }, wind: { speed: 4.2 }, clouds: { all: 10 }, weather: [{ main: "Clear", description: "clear sky", id: 800 }], coord: { lat: 28.67, lon: 77.22 } },
    mumbai: { name: "Mumbai", sys: { country: "IN" }, main: { temp: 29, feels_like: 34, humidity: 80, pressure: 1008 }, wind: { speed: 6.5 }, clouds: { all: 90 }, weather: [{ main: "Rain", description: "heavy intensity rain", id: 502 }], coord: { lat: 19.08, lon: 72.88 } },
    london: { name: "London", sys: { country: "GB" }, main: { temp: 15, feels_like: 14, humidity: 75, pressure: 1015 }, wind: { speed: 5.1 }, clouds: { all: 75 }, weather: [{ main: "Clouds", description: "broken clouds", id: 803 }], coord: { lat: 51.51, lon: -0.13 } },
    tokyo: { name: "Tokyo", sys: { country: "JP" }, main: { temp: 22, feels_like: 22, humidity: 60, pressure: 1012 }, wind: { speed: 3.6 }, clouds: { all: 20 }, weather: [{ main: "Clear", description: "clear sky", id: 800 }], coord: { lat: 35.68, lon: 139.69 } },
    newyork: { name: "New York", sys: { country: "US" }, main: { temp: 12, feels_like: 10, humidity: 55, pressure: 1018 }, wind: { speed: 8.2 }, clouds: { all: 90 }, weather: [{ main: "Snow", description: "light snow", id: 600 }], coord: { lat: 40.71, lon: -74.01 } },
    sydney: { name: "Sydney", sys: { country: "AU" }, main: { temp: 19, feels_like: 19, humidity: 65, pressure: 1020 }, wind: { speed: 4.8 }, clouds: { all: 40 }, weather: [{ main: "Clouds", description: "scattered clouds", id: 802 }], coord: { lat: -33.87, lon: 151.21 } }
  };

  // Check if city matches mock DB, otherwise generate procedurally
  const matched = Object.keys(mockDatabase).find(k => cityName.includes(k) || k.includes(cityName));
  if (matched) {
    return mockDatabase[matched];
  }

  // Procedural generator based on letter count
  const length = cityName.length;
  const hash = cityName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const temp = Math.floor(10 + (hash % 30)); // 10 to 40
  const feels_like = temp + (hash % 3 === 0 ? 3 : -1);
  const humidity = 20 + (hash % 70); // 20% to 90%
  const speed = parseFloat((1 + (hash % 12) * 0.8).toFixed(1)); // 1 to 10.6 m/s
  const cloudPct = hash % 100;
  
  let mainCond = "Clouds";
  let descCond = "broken clouds";
  let weatherId = 803;

  if (hash % 4 === 0) {
    mainCond = "Clear";
    descCond = "clear sky";
    weatherId = 800;
  } else if (hash % 4 === 1) {
    mainCond = "Rain";
    descCond = "moderate rain";
    weatherId = 501;
  } else if (hash % 4 === 2) {
    mainCond = "Thunderstorm";
    descCond = "thunderstorm with rain";
    weatherId = 201;
  }

  const capitalizedName = city.charAt(0).toUpperCase() + city.slice(1);

  return {
    name: capitalizedName,
    sys: { country: "SYS" },
    main: { temp, feels_like, humidity, pressure: 1005 + (hash % 15) },
    wind: { speed },
    clouds: { all: cloudPct },
    weather: [{ main: mainCond, description: descCond, id: weatherId }],
    coord: { 
      lat: parseFloat((15 + (hash % 45)).toFixed(2)), 
      lon: parseFloat((30 + (hash % 90)).toFixed(2)) 
    }
  };
};
