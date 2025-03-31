package com.cgi.testAssignment.models;

import lombok.Data;

@Data
public class Seat {
    private String seatNumber;
    private boolean occupied;
    private boolean window;
    private boolean extraLegroom;
    private boolean nearExit;
    private SeatClass seatClass;
}