package com.cfs.Weather_app.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingPathVariableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Centralized exception handler for the entire application.
 * All unhandled exceptions bubble up here and are returned
 * as structured JSON responses instead of raw stack traces.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ─────────────────────────────────────────────
    // 1. Our own custom exception (city not found,
    //    API unreachable, etc.)
    // ─────────────────────────────────────────────
    @ExceptionHandler(WeatherApiException.class)
    public ResponseEntity<Map<String, Object>> handleWeatherApiException(WeatherApiException ex) {
        return buildResponse(ex.getStatus(), ex.getMessage(), "Weather API Error");
    }

    // ─────────────────────────────────────────────
    // 2. Network / DNS / timeout failures
    //    (UnknownHostException wraps here)
    // ─────────────────────────────────────────────
    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<Map<String, Object>> handleResourceAccessException(ResourceAccessException ex) {
        return buildResponse(
            HttpStatus.SERVICE_UNAVAILABLE,
            "Cannot reach the Weather API. Check internet connectivity or API URL. Detail: " + ex.getMessage(),
            "Service Unavailable"
        );
    }

    // ─────────────────────────────────────────────
    // 3. HTTP 4xx errors from the external API
    //    (invalid API key, bad city name, etc.)
    // ─────────────────────────────────────────────
    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<Map<String, Object>> handleHttpClientErrorException(HttpClientErrorException ex) {
        return buildResponse(
            (HttpStatus) ex.getStatusCode(),
            "External API returned: " + ex.getResponseBodyAsString(),
            "API Client Error"
        );
    }

    // ─────────────────────────────────────────────
    // 4. Missing @PathVariable (e.g. /weather/my/ )
    // ─────────────────────────────────────────────
    @ExceptionHandler(MissingPathVariableException.class)
    public ResponseEntity<Map<String, Object>> handleMissingPathVariable(MissingPathVariableException ex) {
        return buildResponse(
            HttpStatus.BAD_REQUEST,
            "Required path variable '" + ex.getVariableName() + "' is missing.",
            "Bad Request"
        );
    }

    // ─────────────────────────────────────────────
    // 5. Route not found (404)
    // ─────────────────────────────────────────────
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResourceFound(NoResourceFoundException ex) {
        return buildResponse(
            HttpStatus.NOT_FOUND,
            "The requested endpoint was not found: " + ex.getMessage(),
            "Not Found"
        );
    }

    // ─────────────────────────────────────────────
    // 6. Catch-all for any unexpected exception
    // ─────────────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        return buildResponse(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "An unexpected error occurred: " + ex.getMessage(),
            "Internal Server Error"
        );
    }

    // ─────────────────────────────────────────────
    // Helper: builds a consistent error response body
    // ─────────────────────────────────────────────
    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String message, String error) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status",    status.value());
        body.put("error",     error);
        body.put("message",   message);
        return ResponseEntity.status(status).body(body);
    }
}
