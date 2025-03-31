package com.cgi.testAssignment.controllers;

import com.cgi.testAssignment.models.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/flights")
public class FlightController {

    @Value("${aviationstack.api.key}")
    private String apiKey;

    @Value("${aviationstack.base.url}")
    private String baseUrl;

    private final RestTemplate restTemplate;
    private final Random random = new Random();

    public FlightController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping
    public List<Flight> getFlights() {
        String url = String.format("%s/flights?access_key=%s&dep_iata=TLL", baseUrl, apiKey);
        AviationStackResponse response = restTemplate.getForObject(url, AviationStackResponse.class);

        Calendar calendar = Calendar.getInstance();
        Date today = calendar.getTime();

        calendar.add(Calendar.DAY_OF_YEAR, 30);
        Date endDate = calendar.getTime();

        long range = endDate.getTime() - today.getTime();

        /**
         * Selle lennuandmete töötlemise koodilõigu lõin tehisintellekti abiga
         */
        return response.getData().stream()
                .map(data -> {
                    Flight flight = new Flight();
                    flight.setFlightNumber(data.getFlight().getIata());
                    flight.setDepartureAirport(data.getDeparture().getAirport());

                    // Generate random date within 30-day range
                    long randomTime = today.getTime() + (long) (random.nextDouble() * range);
                    Date randomDate = new Date(randomTime);
                    SimpleDateFormat sdf = new SimpleDateFormat("d.M.yyyy, HH:mm:ss");
                    flight.setScheduledDeparture(sdf.format(randomDate));

                    flight.setDestination(data.getArrival().getAirport());
                    flight.setPrice((int) (Math.random() * 250 + 50));
                    flight.setDuration(mockFlightDuration());
                    return flight;
                })
                .collect(Collectors.toList());
    }

    private String mockFlightDuration() {
        int hours = (int) (Math.random() * 3 + 1);
        int minutes = (int) (Math.random() * 60);
        return String.format("%dh %02dmin", hours, minutes);
    }

    @GetMapping("/seats/{flightNumber}")
    public FlightSeatMap getSeatMap(@PathVariable String flightNumber) {
        FlightSeatMap seatMap = new FlightSeatMap();
        seatMap.setFlightNumber(flightNumber);
        seatMap.setRows(generateRandomSeatMap());
        return seatMap;
    }

    private List<SeatRow> generateRandomSeatMap() {
        List<SeatRow> rows = new ArrayList<>();
        Random rand = new Random();

        for (int i = 1; i <= 30; i++) {
            SeatRow row = new SeatRow();
            row.setRowNumber(i);
            row.setSeats(Arrays.asList(
                    createSeat(i, "A", rand),
                    createSeat(i, "B", rand),
                    createSeat(i, "C", rand),
                    createSeat(i, "D", rand),
                    createSeat(i, "E", rand),
                    createSeat(i, "F", rand)
            ));
            rows.add(row);
        }
        return rows;
    }

    private Seat createSeat(int row, String seatLetter, Random rand) {
        Seat seat = new Seat();
        seat.setSeatNumber(row + seatLetter);
        seat.setOccupied(rand.nextBoolean());
        seat.setWindow(seatLetter.equals("A") || seatLetter.equals("F"));
        seat.setExtraLegroom(row % 4 == 0);
        seat.setNearExit(row > 25);

        /**
         * Kasutasin veidi tehisintellekti abi siin, et integreerida istmete klassid nende valikusse
         */
        if (row <= 5) {
            seat.setSeatClass(SeatClass.FIRST);
        } else if (row <= 10) {
            seat.setSeatClass(SeatClass.BUSINESS);
        } else {
            seat.setSeatClass(SeatClass.ECONOMY);
        }

        return seat;
    }
}