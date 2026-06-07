package com.cfs.Weather_app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Astro{
    public String sunrise;
    public String sunset;
    public String moonrise;
    public String moonset;
    public String moon_phase;
    public int moon_illumination;
    public int is_moon_up;
    public int is_sun_up;
}