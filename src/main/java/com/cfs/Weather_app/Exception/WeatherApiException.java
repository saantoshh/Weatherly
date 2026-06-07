package com.cfs.Weather_app.exception;

import org.springframework.http.HttpStatus;

/**
 * Custom runtime exception for Weather API related errors.
 * Carries an HttpStatus so the GlobalExceptionHandler
 * can return the correct HTTP response code.
 */
public class WeatherApiException extends RuntimeException {

    private final HttpStatus status;

    public WeatherApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
