# 🌤 Weatherly — Live Weather App

<div align="center">

![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![WeatherAPI](https://img.shields.io/badge/WeatherAPI.com-Live_Data-60c8ff?style=for-the-badge&logo=cloud&logoColor=white)
![HTML5](https://img.shields.io/badge/Frontend-HTML%2FCSS%2FJS-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A full-stack weather application featuring a Spring Boot REST API backend and a stunning animated frontend with real-time sky scenes.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Reference](#-api-reference) • [Project Structure](#-project-structure)

</div>

---

## ✨ Features

- 🌍 **Real-time weather** for any city worldwide via WeatherAPI.com
- 📅 **Multi-day forecast** — 1, 3, 5, or 7 days
- 🌦 **Animated sky scenes** — rain, snow, thunder, fog, aurora, and more
- ⚡ **Live lightning effects** during storm conditions
- 🌡️ **°C / °F toggle** with smooth transitions
- 💧 Humidity, pressure, wind speed, visibility stats
- 📱 Fully responsive design
- 🏗️ Clean REST API with proper exception handling

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Java 17+, Spring Boot 3.x |
| **HTTP Client** | Spring `RestTemplate` |
| **Weather Data** | [WeatherAPI.com](https://www.weatherapi.com) |
| **Frontend** | Vanilla HTML / CSS / JavaScript |
| **Fonts** | Google Fonts — Outfit + Playfair Display |
| **Build Tool** | Maven |

---

## 📁 Project Structure

```
Weather_app/
├── src/
│   └── main/
│       ├── java/com/cfs/Weather_app/
│       │   ├── controller/
│       │   │   └── Controller.java          # REST endpoints
│       │   ├── dto/
│       │   │   ├── Root.java                # WeatherAPI root response
│       │   │   ├── Location.java
│       │   │   ├── Current.java
│       │   │   ├── Condition.java
│       │   │   ├── Forecast.java
│       │   │   ├── Forecastday.java
│       │   │   ├── Day.java
│       │   │   ├── Hour.java
│       │   │   ├── Astro.java
│       │   │   ├── WeatherResponse.java     # Current weather DTO
│       │   │   ├── WeatherForecast.java     # Forecast wrapper DTO
│       │   │   └── DayTemp.java             # Per-day forecast DTO
│       │   ├── exception/
│       │   │   ├── WeatherApiException.java
│       │   │   └── GlobalExceptionHandler.java
│       │   ├── service/
│       │   │   └── WeatherService.java      # Business logic
│       │   └── WeatherAppApplication.java
│       └── resources/
│           ├── static/
│           │   └── index.html               # Weatherly frontend
│           └── application.properties
├── .gitignore
├── pom.xml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- A free API key from [WeatherAPI.com](https://www.weatherapi.com/signup.aspx)

### 1. Clone the repository

```bash
git clone https://github.com/saantoshh/weatherly.git
cd weatherly
```

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

> ⚠️ **Never commit your real API key.** The `.gitignore` already excludes `application.properties` — see the note below.

### 3. Build and run

```bash
./mvnw spring-boot:run
```

The backend starts at `http://localhost:8080`.

### 4. Open the frontend

Navigate to `http://localhost:8080` in your browser — the frontend is served as a static file from Spring Boot.

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
  "weatherResponse": { ... },
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

Returns `"Good"` if the server is running.

---

## 🔐 Keeping Your API Key Safe

Add this to your `.gitignore` to avoid accidentally pushing secrets:

```gitignore
# Application secrets
src/main/resources/application.properties
```

Then create a template file to commit instead:

```bash
cp src/main/resources/application.properties \
   src/main/resources/application.properties.example
```

Edit the `.example` file to replace real values with placeholders before committing.

---

## 🌐 CORS

The controller uses `@CrossOrigin(origins = "*")`, which allows requests from any origin during development. **Restrict this in production** to your actual frontend domain.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/add-hourly-forecast`
3. Commit your changes: `git commit -m 'feat: add hourly forecast endpoint'`
4. Push to the branch: `git push origin feature/add-hourly-forecast`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [WeatherAPI.com](https://www.weatherapi.com) for the free weather data API
- [Google Fonts](https://fonts.google.com) — Outfit & Playfair Display

---

<div align="center">
  Made with ☕ and Spring Boot
</div>
