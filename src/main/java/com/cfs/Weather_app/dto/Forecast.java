package com.cfs.Weather_app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;


@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class Forecast {
    public ArrayList<Forecastday> forecastday;
}