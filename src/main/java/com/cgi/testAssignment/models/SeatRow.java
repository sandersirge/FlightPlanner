package com.cgi.testAssignment.models;

import lombok.Data;
import java.util.List;

@Data
public class SeatRow {
    private int rowNumber;
    private List<Seat> seats;
}