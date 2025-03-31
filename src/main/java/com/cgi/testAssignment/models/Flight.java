package com.cgi.testAssignment.models;

import lombok.Data;

@Data
public class Flight {
    private String flightNumber;
    private String departureAirport;
    private String scheduledDeparture;
    private int price;
    private String duration;
    private String destination;
}