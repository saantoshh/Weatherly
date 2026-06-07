package com.cfs.Weather_app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
public class Forecastday{
    public String date;
    public int date_epoch;
    public Day day;
    public Astro astro;
    public ArrayList<Hour> hour;
}