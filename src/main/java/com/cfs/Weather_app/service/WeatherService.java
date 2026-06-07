package com.cfs.Weather_app.service;

import com.cfs.Weather_app.dto.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class WeatherService {

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.url}")
    private String apiUrl;

    @Value("${weather.api.forecast.url}")
    private String apiForecastUrl;

    private RestTemplate template = new RestTemplate();

    public String test() {
        return "Good";
    }

    public WeatherResponse getData(String city) {
        String url = apiUrl + "?key=" + apiKey + "&q=" + city;
        Root response = template.getForObject(url, Root.class);

        WeatherResponse weatherResponse = new WeatherResponse();
        weatherResponse.setCity(response.getLocation().name);
        weatherResponse.setRegion(response.getLocation().region);
        weatherResponse.setCountry(response.getLocation().country);
        weatherResponse.setCondition(response.getCurrent().getCondition().getText());
        weatherResponse.setTemperature(response.getCurrent().getTemp_c());
        weatherResponse.setHumidity((double) response.getCurrent().getHumidity());

        // ✅ pressure in millibars (was pressure_in before — wrong unit)
        weatherResponse.setPressure(response.getCurrent().getPressure_mb());

        // ✅ feels like °C
        weatherResponse.setFeelslike_c(response.getCurrent().getFeelslike_c());

        // ✅ wind speed in km/h
        weatherResponse.setWindSpeed(response.getCurrent().getWind_kph());

        // ✅ visibility in km
        weatherResponse.setVisibility(response.getCurrent().getVis_km());

        return weatherResponse;
    }

    public WeatherForecast getForCast(String city, Integer days) {
        WeatherResponse weatherResponse = getData(city);

        String url = apiForecastUrl + "?key=" + apiKey + "&q=" + city + "&days=" + days;
        Root apiResponse = template.getForObject(url, Root.class);

        Forecast forecast = apiResponse.getForecast();
        ArrayList<Forecastday> forecastdays = forecast.getForecastday();

        List<DayTemp> dayList = new ArrayList<>();
        for (Forecastday rs : forecastdays) {
            DayTemp d = new DayTemp();
            d.setDate(rs.getDate());
            d.setMinTemp(rs.getDay().mintemp_c);
            d.setAvgTemp(rs.getDay().avgtemp_c);
            d.setMaxTemp(rs.getDay().maxtemp_c);
            d.setHumidity(rs.getDay().getAvghumidity());

            // ✅ condition text per day (drives weather emoji in forecast cards)
            d.setCondition(rs.getDay().getCondition().getText());

            // ✅ WeatherAPI has no pressure per forecast day — set 0
            d.setPressure(0);

            dayList.add(d);
        }

        WeatherForecast response = new WeatherForecast();
        response.setWeatherResponse(weatherResponse);
        response.setDayTemp(dayList);
        return response;
    }
}