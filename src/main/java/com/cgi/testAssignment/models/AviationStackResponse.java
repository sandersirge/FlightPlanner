package com.cgi.testAssignment.models;

import lombok.Data;
import java.util.List;

@Data
public class AviationStackResponse {
    private Pagination pagination;
    private List<FlightData> data;

    @Data
    public static class Pagination {
        private int count;
        private int total;
    }

    @Data
    public static class FlightData {
        private FlightInfo flight;
        private Departure departure;
        private Arrival arrival;

        @Data
        public static class FlightInfo {
            private String number;
            private String iata;
        }

        @Data
        public static class Departure {
            private String airport;
            private String scheduled;
            private String estimated;
        }

        @Data
        public static class Arrival {
            private String airport;
        }
    }
}