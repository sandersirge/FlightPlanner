document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const flightNumber = params.get('flight');
    let selectedSeats = [];
    let currentSeatMap = null;
    let recommendedSeats = [];

    const savedConfigurations = JSON.parse(localStorage.getItem('seatConfigurations')) || [];

    document.getElementById('flight-number').textContent = flightNumber || 'teadmata';

    fetch(`/api/flights/seats/${flightNumber}`)
        .then(response => {
            if (!response.ok) throw new Error('Võrgu viga');
            return response.json();
        })
        .then(seatMap => {
            currentSeatMap = seatMap;

            localStorage.setItem('currentFlightDetails', JSON.stringify({
                departure: seatMap.departureTime || 'Teadmata',
                destination: seatMap.destination || 'Teadmata',
                price: seatMap.price || 'Teadmata',
                duration: seatMap.duration || 'Teadmata'
            }));

            renderSeatMap(seatMap);

            const params = new URLSearchParams(window.location.search);
            if(params.has('edit')) {
                const seats = params.get('seats').split(',');
                document.getElementById('passenger-count').value = params.get('passengers');
                seats.forEach(seatNumber => {
                    const seatDiv = document.querySelector(`[data-seat-number="${seatNumber}"]`);
                    if(seatDiv && !seatDiv.classList.contains('occupied')) {
                        seatDiv.classList.add('selected');
                        selectedSeats.push(seatNumber);
                    }
                });
                updateSaveButtonState();
            }

            setupEventListeners();
        })
        .catch(error => {
            console.error('Viga:', error);
            document.getElementById('seat-map').innerHTML = `
                <div class="error-message">
                    Istekohtade laadimisel tekkis viga: ${error.message}
                </div>
            `;
        });

    function renderSeatMap(seatMap) {
        const seatMapDiv = document.getElementById('seat-map');
        seatMapDiv.innerHTML = '';

        seatMap.rows.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'seat-row';

            row.seats.forEach(seat => {
                const seatDiv = document.createElement('div');
                seatDiv.className = `seat ${seat.occupied ? 'occupied' : 'available'}`;
                seatDiv.textContent = seat.seatNumber;
                seatDiv.dataset.seatNumber = seat.seatNumber;

                if(selectedSeats.includes(seat.seatNumber)) seatDiv.classList.add('selected');
                if(recommendedSeats.includes(seat.seatNumber)) seatDiv.classList.add('recommended');

                if(!seat.occupied) {
                    seatDiv.addEventListener('click', () => toggleSeatSelection(seatDiv, seat));
                }

                rowDiv.appendChild(seatDiv);
            });

            seatMapDiv.appendChild(rowDiv);
        });
    }

    function toggleSeatSelection(seatDiv, seat) {
        const passengerCount = parseInt(document.getElementById('passenger-count').value);

        seatDiv.classList.toggle('selected');
        if(seatDiv.classList.contains('selected')) {
            if(selectedSeats.length >= passengerCount) {
                seatDiv.classList.remove('selected');
                alert(`Olete valinud maksimaalse arvu istmeid (${passengerCount})`);
                return;
            }
            if(seatDiv.classList.contains('recommended')) {
                seatDiv.classList.remove('recommended');
                recommendedSeats = recommendedSeats.filter(s => s !== seat.seatNumber);
            }
            selectedSeats.push(seat.seatNumber);
        } else {
            selectedSeats = selectedSeats.filter(s => s !== seat.seatNumber);
        }
        updateSaveButtonState();
    }

    function setupEventListeners() {
        document.getElementById('recommend-seats').addEventListener('click', () => {
            updateRecommendations();
            scrollToFirstRecommended();
        });

        document.getElementById('clear-selections').addEventListener('click', () => {
            selectedSeats = [];
            document.querySelectorAll('.seat.selected').forEach(seat => {
                seat.classList.remove('selected');
            });
            document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            document.getElementById('passenger-count').value = 1;
            document.querySelectorAll('.seat.recommended').forEach(seat => {
                seat.classList.remove('recommended');
            });
            recommendedSeats = [];

            updateSaveButtonState();
        });
        document.getElementById('save-configuration').addEventListener('click', saveConfiguration);
        document.getElementById('passenger-count').addEventListener('input', updateSaveButtonState);
    }

    function updateSaveButtonState() {
        const saveBtn = document.getElementById('save-configuration');
        const passengerCount = parseInt(document.getElementById('passenger-count').value);
        saveBtn.disabled = selectedSeats.length !== passengerCount;
    }

    function getClassRowRange(seatClass) {
        switch(seatClass) {
            case 'FIRST': return { min: 1, max: 5 };
            case 'BUSINESS': return { min: 6, max: 10 };
            case 'ECONOMY': return { min: 11, max: 30 };
            default: return { min: 1, max: 30 };
        }
    }

    function checkClassAvailability(filters, seats) {
        if(filters.seatClass === 'all') return true;

        const requiredSeats = filters.passengerCount;
        const availableInClass = seats.filter(seat => {
            const seatRow = parseInt(seat.seatNumber.match(/^\d+/)[0]);
            const range = getClassRowRange(filters.seatClass);
            return seatRow >= range.min && seatRow <= range.max;
        }).length;

        return availableInClass >= requiredSeats;
    }

    function updateRecommendations() {

        document.querySelectorAll('.seat.recommended').forEach(seatDiv => {
            seatDiv.classList.remove('recommended');
        });
        recommendedSeats = [];

        const filters = {
            window: document.getElementById('window-seat').checked,
            legroom: document.getElementById('extra-legroom').checked,
            exit: document.getElementById('near-exit').checked,
            consecutive: document.getElementById('consecutive-seats').checked,
            passengerCount: parseInt(document.getElementById('passenger-count').value),
            seatClass: document.getElementById('seat-class-filter').value
        };

        let matchingSeats = [];
        const classFilter = filters.seatClass === 'all'
            ? () => true
            : seat => {
                const seatRow = parseInt(seat.seatNumber.match(/^\d+/)[0]);
                const range = getClassRowRange(filters.seatClass);
                return seatRow >= range.min && seatRow <= range.max;
            };

        if(filters.consecutive) {
            matchingSeats = findBestConsecutiveSeats(filters, classFilter);
        } else {
            matchingSeats = findStandardSeats(filters, classFilter);
        }

        if(filters.seatClass !== 'all' && !checkClassAvailability(filters, matchingSeats)) {
            alert(`Valitud klassis pole piisavalt vabu kohti (vaja ${filters.passengerCount})`);
            return;
        }
        if(matchingSeats.length < filters.passengerCount) {
            matchingSeats = currentSeatMap.rows.flatMap(row =>
                row.seats.filter(seat => !seat.occupied)
            );
        }

        matchingSeats.slice(0, filters.passengerCount).forEach(seat => {
            const seatDiv = document.querySelector(`[data-seat-number="${seat.seatNumber}"]`);
            if(seatDiv) {
                seatDiv.classList.add('recommended');
                recommendedSeats.push(seat.seatNumber);
            }
        });
    }

    function findBestConsecutiveSeats(filters) {
        const needed = filters.passengerCount;
        let bestMatch = [];
        const range = getClassRowRange(filters.seatClass);

        for(const row of currentSeatMap.rows) {
            const rowNumber = row.rowNumber;
            if(filters.seatClass !== 'all' &&
                (rowNumber < range.min || rowNumber > range.max)) continue;

            const available = row.seats.filter(seat =>
                !seat.occupied &&
                (!filters.window || seat.window) &&
                (!filters.legroom || seat.extraLegroom) &&
                (!filters.exit || seat.nearExit) &&
                classFilter(seat)
            );
            for(let i = 0; i <= available.length - needed; i++) {
                const sequence = available.slice(i, i + needed);
                if(sequence.length === needed) {
                    return sequence;
                }
            }
        }

        if(needed > 1) {
            const allAvailable = currentSeatMap.rows.flatMap(row =>
                row.seats.filter(seat =>
                    !seat.occupied &&
                    (!filters.window || seat.window) &&
                    (!filters.legroom || seat.extraLegroom) &&
                    (!filters.exit || seat.nearExit) &&
                    (filters.seatClass === 'all' || seat.seatClass === filters.seatClass)
                )
            ).sort((a, b) => {
                const getRow = s => parseInt(s.seatNumber.match(/^\d+/)[0]);
                return getRow(a) - getRow(b) || a.seatNumber.localeCompare(b.seatNumber);
            });

            let currentGroup = [];
            for(const seat of allAvailable) {
                if(currentGroup.length === 0) {
                    currentGroup.push(seat);
                } else {
                    const last = currentGroup[currentGroup.length-1];
                    const lastRow = parseInt(last.seatNumber.match(/^\d+/)[0]);
                    const currentRow = parseInt(seat.seatNumber.match(/^\d+/)[0]);

                    if(currentRow === lastRow || currentRow === lastRow + 1) {
                        currentGroup.push(seat);
                        if(currentGroup.length === needed) break;
                    } else {
                        currentGroup = [seat];
                    }
                }
            }
            return currentGroup.slice(0, needed);
        }

        return [];
    }

    function findStandardSeats(filters, classFilter) {
        const range = getClassRowRange(filters.seatClass);

        return currentSeatMap.rows
            .filter(row => filters.seatClass === 'all' ||
                (row.rowNumber >= range.min && row.rowNumber <= range.max))
            .flatMap(row =>
                row.seats.filter(seat =>
                    !seat.occupied &&
                    (!filters.window || seat.window) &&
                    (!filters.legroom || seat.extraLegroom) &&
                    (!filters.exit || seat.nearExit) &&
                    classFilter(seat)
                )
            );
    }

    function scrollToFirstRecommended() {
        if(recommendedSeats.length > 0) {
            const firstSeat = document.querySelector(`[data-seat-number="${recommendedSeats[0]}"]`);
            firstSeat?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    function saveConfiguration() {
        const passengerCount = parseInt(document.getElementById('passenger-count').value);
        const flightNumber = document.getElementById('flight-number').textContent;
        const params = new URLSearchParams(window.location.search);
        const isEdit = params.has('edit');

        if (selectedSeats.length !== passengerCount) {
            alert(`Valige täpselt ${passengerCount} istet enne salvestamist!`);
            return;
        }

        const flightDetails = JSON.parse(localStorage.getItem('currentFlightDetails')) || {};

        const configuration = {
            flightNumber: flightNumber,
            seats: selectedSeats,
            date: new Date().toLocaleString('et-EE'),
            passengerCount: passengerCount,
            departure: flightDetails.departure || '',
            destination: flightDetails.destination || '',
            price: flightDetails.price || '',
            duration: flightDetails.duration || ''
        };

        if(isEdit) {
            const index = savedConfigurations.findIndex(c =>
                c.flightNumber === configuration.flightNumber &&
                c.date === params.get('saved')
            );
            if(index > -1) {
                savedConfigurations[index] = configuration;
            }
        } else {
            savedConfigurations.push(configuration);
        }

        localStorage.setItem('seatConfigurations', JSON.stringify(savedConfigurations));
        alert('Istmete valik salvestatud!');
        window.location.href = '/planeeringud.html';
    }
});