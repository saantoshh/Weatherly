# 🌤 Weatherly — Live Weather App

<div align="center">

![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![WeatherAPI](https://img.shields.io/badge/WeatherAPI.com-Live_Data-60c8ff?style=for-the-badge&logo=cloud&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A full-stack weather application featuring a Spring Boot REST API backend and a stunning React frontend with real-time animated sky scenes, canvas particle effects, and a glassmorphism UI.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Reference](#-api-reference) • [Project Structure](#-project-structure)

</div>

---

## ✨ Features

- 🌍 **Real-time weather** for any city worldwide via WeatherAPI.com
- 📅 **Multi-day forecast** — 1, 3, 5, or 7 days
- 🌦 **Animated sky scenes** — rain, snow, thunder, fog, aurora, clear skies and more
- ⚡ **Live lightning bolt effects** rendered on canvas during storm conditions
- ❄️ **Particle system** — animated rain drops and snowflakes via `requestAnimationFrame`
- 🌡️ **°C / °F toggle** with smooth color transitions per temperature range
- 💧 Humidity bar, pressure, wind speed, and visibility stats
- 🎨 **Glassmorphism UI** with `backdrop-filter`, frosted cards, and aurora blobs
- 🔽 **Custom portal dropdown** — fully themed day-selector that escapes stacking contexts
- 📱 Fully responsive design
- 🏗️ Clean REST API with proper exception handling

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Java 17+, Spring Boot 3.x |
| **HTTP Client** | Spring `RestTemplate` |
| **Weather Data** | [WeatherAPI.com](https://www.weatherapi.com) |
| **Frontend** | React 18+, CSS-in-JS inline styles |
| **Animations** | Canvas API (`requestAnimationFrame`), CSS keyframes |
| **Fonts** | Google Fonts — Fraunces (display) + DM Sans (body) |
| **Build Tool** | Maven + Vite (or CRA) |

---

## 📁 Project Structure

```
Weather_app/
├── src/
│   └── main/
│       ├── java/com/cfs/Weather_app/
│       │   ├── controller/
│       │   │   └── Controller.java              # REST endpoints
│       │   ├── dto/
│       │   │   ├── Root.java                    # WeatherAPI root response
│       │   │   ├── Location.java
│       │   │   ├── Current.java
│       │   │   ├── Condition.java
│       │   │   ├── Forecast.java
│       │   │   ├── Forecastday.java
│       │   │   ├── Day.java
│       │   │   ├── Hour.java
│       │   │   ├── Astro.java
│       │   │   ├── WeatherResponse.java          # Current weather DTO
│       │   │   ├── WeatherForecast.java          # Forecast wrapper DTO
│       │   │   └── DayTemp.java                  # Per-day forecast DTO
│       │   ├── exception/
│       │   │   ├── WeatherApiException.java
│       │   │   └── GlobalExceptionHandler.java
│       │   ├── service/
│       │   │   └── WeatherService.java           # Business logic
│       │   └── WeatherAppApplication.java
│       └── resources/
│           ├── static/                           # Built React output (after npm run build)
│           └── application.properties
├── frontend/                                     # React source
│   ├── src/
│   │   └── WeatherApp.jsx                        # Main React component
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── pom.xml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js 18+ and npm
- A free API key from [WeatherAPI.com](https://www.weatherapi.com/signup.aspx)

---

### 1. Clone the repository

```bash
git clone https://github.com/saantoshh/Weatherly.git
cd Weatherly
```

---

### 2. Configure your API key

Open `src/main/resources/application.properties` and set your values:

```properties
# WeatherAPI credentials
weather.api.key=YOUR_API_KEY_HERE
weather.api.url=http://api.weatherapi.com/v1/current.json
weather.api.forecast.url=http://api.weatherapi.com/v1/forecast.json

# Server port
server.port=8080
```

> ⚠️ **Never commit your real API key.** Add `application.properties` to `.gitignore` and commit an `.example` file with placeholder values instead.

---

### 3. Run the backend

```bash
./mvnw spring-boot:run
```

The Spring Boot server starts at `http://localhost:8080`.

---

### 4. Run the React frontend

```bash
cd frontend
npm install
npm run dev
```

The React dev server starts at `http://localhost:5173` and proxies API calls to `localhost:8080`.

> **For production:** run `npm run build` inside `frontend/`, then copy the `dist/` output into `src/main/resources/static/` so Spring Boot serves it directly.

---

## 📡 API Reference

### Get current weather

```
GET /weather/current/{city}
```

**Example:** `GET /weather/current/Mumbai`

```json
{
  "city": "Mumbai",
  "region": "Maharashtra",
  "country": "India",
  "condition": "Partly cloudy",
  "temperature": 31.0,
  "feelslike_c": 36.2,
  "humidity": 78.0,
  "pressure": 1006.0,
  "windSpeed": 19.8,
  "visibility": 6.0
}
```

---

### Get weather forecast

```
GET /weather/forecast/{city}?days={1|3|5|7}
```

**Example:** `GET /weather/forecast/London?days=3`

```json
{
  "weatherResponse": { "city": "London", "temperature": 18.0, "..." : "..." },
  "dayTemp": [
    {
      "date": "2026-06-07",
      "minTemp": 14.0,
      "avgTemp": 18.5,
      "maxTemp": 22.0,
      "humidity": 65.0,
      "condition": "Sunny",
      "pressure": 0
    }
  ]
}
```

---

### Test endpoint

```
GET /weather/test/{city}
```

Returns `"Good"` if the server is reachable.

---

## 🎨 Frontend Architecture

The React frontend (`WeatherApp.jsx`) is a single-file component with these key parts:

| Component | Purpose |
|-----------|---------|
| `AnimatedScene` | Full-screen canvas background — stars, clouds, rain/snow particles, lightning bolts |
| `HeroCard` | Current weather — large temperature display, stats pills, humidity bar |
| `ForecastCard` | Day-by-day forecast grid with animated entrance |
| `CustomSelect` | Portal-based day-selector dropdown themed to match the dark UI |
| `Skeleton` | Shimmer loading placeholders |
| `Placeholder` | Empty state with floating globe animation |

Sky themes (`clear`, `rain`, `thunder`, `snow`, `fog`, `cloudy`, `overcast`, `sunny_warm`, `sunny_cool`) are derived from the API condition string and drive the canvas particle mode, aurora opacity, star visibility, and cloud count.

---

## 🔐 Keeping Your API Key Safe

```gitignore
# application.properties contains secrets — never commit it
src/main/resources/application.properties
```

Commit a template instead:

```bash
cp src/main/resources/application.properties \
   src/main/resources/application.properties.example
# Replace real values with placeholders in the .example file, then commit it
```

---

## 🌐 CORS

The controller uses `@CrossOrigin(origins = "*")` for development convenience. **Restrict this to your frontend domain in production.**

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/hourly-forecast`
3. Commit your changes: `git commit -m 'feat: add hourly forecast endpoint'`
4. Push to the branch: `git push origin feature/hourly-forecast`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [WeatherAPI.com](https://www.weatherapi.com) for the free weather data API
- [Google Fonts](https://fonts.google.com) — Fraunces & DM Sans

---

<div align="center">
  Made with ☕ Spring Boot and ⚛️ React
</div>
