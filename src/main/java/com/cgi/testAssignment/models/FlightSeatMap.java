package com.cgi.testAssignment.models;

import lombok.Data;
import java.util.List;

@Data
public class FlightSeatMap {
    private String flightNumber;
    private List<SeatRow> rows;
}