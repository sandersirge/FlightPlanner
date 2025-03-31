document.addEventListener('DOMContentLoaded', () => {
    let allFlights = [];

    const priceSlider = document.getElementById('price-slider');
    const priceValue = document.getElementById('price-value');

    priceSlider.addEventListener('input', () => {
        priceValue.textContent = `${priceSlider.value}€`;
    });

    fetch('/api/flights')
        .then(response => response.json())
        .then(flights => {
            allFlights = flights;
            populateFlightsTable(flights);
            populateFilters(flights);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('flights-table').innerHTML = `
                <tr>
                    <td colspan="6">Lendude laadimisel tekkis viga</td>
                </tr>
            `;
        });

    document.getElementById('apply-filters').addEventListener('click', applyFilters);

    function populateFilters(flights) {
        const durationOptions = document.getElementById('duration-options');
        durationOptions.innerHTML = '';

        const durationGroups = [
            { min: 60, max: 89, label: "1h - 1h 29min" },
            { min: 90, max: 119, label: "1h 30min - 1h 59min" },
            { min: 120, max: 149, label: "2h - 2h 29min" },
            { min: 150, max: 179, label: "2h 30min - 2h 59min" },
            { min: 180, max: 209, label: "3h - 3h 29min" },
            { min: 210, max: 239, label: "3h 30min - 3h 59min" },
            { min: 240, max: 1000, label: "4h või rohkem" }
        ];

        durationGroups.forEach(group => {
            const label = document.createElement('label');
            label.innerHTML = `
            <input type="checkbox" name="duration" value="${group.min}-${group.max}">
            ${group.label}
        `;
            durationOptions.appendChild(label);
        });

        const destinationSelect = document.getElementById('destination-select');
        const destinations = [...new Set(flights.map(flight => flight.destination))];

        destinations.forEach(destination => {
            const option = document.createElement('option');
            option.value = destination;
            option.textContent = destination;
            destinationSelect.appendChild(option);
        });
    }

    document.getElementById('clear-all-filters').addEventListener('click', function() {
        document.getElementById('price-slider').value = 300;
        document.getElementById('price-value').textContent = '300€';
        document.querySelectorAll('input[name="duration"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        const destinationSelect = document.getElementById('destination-select');
        Array.from(destinationSelect.options).forEach(option => {
            option.selected = false;
        });

        document.querySelectorAll('input[name="date-range"]').forEach(radio => {
            radio.checked = false;
        });

        populateFlightsTable(allFlights);
    });

    function applyFilters() {
        const maxPrice = parseInt(document.getElementById('price-slider').value);

        const selectedDurations = Array.from(document.querySelectorAll('input[name="duration"]:checked'))
            .map(checkbox => checkbox.value);

        const selectedDestinations = Array.from(document.getElementById('destination-select').selectedOptions)
            .map(option => option.value);

        const dateRadio = document.querySelector('input[name="date-range"]:checked');
        const selectedDateRange = dateRadio ? parseInt(dateRadio.value) : null;

        let filteredFlights = [...allFlights];

        filteredFlights = filteredFlights.filter(flight => {
            const flightPrice = parseInt(flight.price);
            return flightPrice <= maxPrice;
        });

        if (selectedDurations.length > 0) {
            filteredFlights = filteredFlights.filter(flight => {
                const durationMatch = flight.duration.match(/(\d+)h\s*(\d+)min/);
                let durationMinutes = 0;

                if (durationMatch) {
                    durationMinutes = parseInt(durationMatch[1]) * 60 + parseInt(durationMatch[2]);
                }

                return selectedDurations.some(range => {
                    const [min, max] = range.split('-').map(Number);
                    return durationMinutes >= min && durationMinutes <= max;
                });
            });
        }

        if (selectedDestinations.length > 0) {
            filteredFlights = filteredFlights.filter(flight =>
                selectedDestinations.includes(flight.destination)
            );
        }

        if (selectedDateRange !== null) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const endDate = new Date();
            endDate.setDate(today.getDate() + selectedDateRange);
            endDate.setHours(23, 59, 59, 999);

            filteredFlights = filteredFlights.filter(flight => {
                try {
                    const flightDate = new Date(flight.scheduledDeparture);
                    return flightDate >= today && flightDate <= endDate;
                } catch (e) {
                    console.error("Error parsing date:", flight.scheduledDeparture, e);
                    return false;
                }
            });
        }

        populateFlightsTable(filteredFlights);
    }

    function populateFlightsTable(flights) {
        const table = document.getElementById('flights-table');
        table.innerHTML = flights.map(flight => `
            <tr class="flight-row" data-flight-number="${flight.flightNumber}">
                <td>${flight.flightNumber}</td>
                <td>${flight.departureAirport}</td>
                <td>${flight.destination}</td>
                <td>${formatDateTime(flight.scheduledDeparture)}</td>
                <td>${flight.price}€</td>
                <td>${flight.duration}</td>
            </tr>
        `).join('');


        table.addEventListener('click', (event) => {
            const row = event.target.closest('.flight-row');
            if (row) {
                const flightNumber = row.dataset.flightNumber;
                window.location.href = `seat.html?flight=${encodeURIComponent(flightNumber)}`;
            }
        });
    }
    function formatDateTime(dateTimeString) {
        const [datePart, timePart] = dateTimeString.split(', ');
        const [day, month, year] = datePart.split('.');
        return `${parseInt(day)}.${parseInt(month)}.${year}, ${timePart}`;
    }
});