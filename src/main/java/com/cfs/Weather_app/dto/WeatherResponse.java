package com.cfs.Weather_app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class WeatherResponse {

    private String city;
    private String region;
    private String country;

    private String condition;
    private Double temperature;

    private Double humidity;
    private Double pressure;

    private Double feelslike_c;
    private double windSpeed;
    private double visibility;


}
