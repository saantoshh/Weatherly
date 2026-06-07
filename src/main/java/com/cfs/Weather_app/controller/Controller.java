package com.cfs.Weather_app.controller;

import com.cfs.Weather_app.dto.WeatherForecast;
import com.cfs.Weather_app.dto.WeatherResponse;
import com.cfs.Weather_app.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/weather")
@CrossOrigin(origins = "*")
public class Controller {

    @Autowired
    private WeatherService weatherService;

    @GetMapping("/test/{city}")
    public String getWeatherData(@PathVariable String city) {
        return weatherService.test();
    }

    // Call: GET /weather/forecast/London?days=3
    @GetMapping("/forecast/{city}")
    public WeatherForecast getForecast(
            @PathVariable String city,
            @RequestParam Integer days) {
        return weatherService.getForCast(city, days);
    }

    // Call: GET /weather/current/London
    @GetMapping("/current/{city}")
    public WeatherResponse getCurrentWeather(@PathVariable String city) {
        return weatherService.getData(city);
    }
}