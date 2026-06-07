package com.cfs.Weather_app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class DayTemp {
     private String date;
     private double minTemp;
     private double avgTemp;
     private double maxTemp;
     private double pressure;
     private double humidity;

     private String condition;

}
