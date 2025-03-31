/**
 * Kasutasin nuppude funktsioonide loomisel tehisintellekti abi
 */

document.addEventListener('DOMContentLoaded', () => {
    const savedFlights = JSON.parse(localStorage.getItem('seatConfigurations')) || [];
    const listElement = document.getElementById('saved-flights');
    const noPlansMsg = document.querySelector('.no-plans-msg');

    listElement.innerHTML = '';

    if (savedFlights.length === 0) {
        noPlansMsg.style.display = 'block';
        return;
    }

    noPlansMsg.style.display = 'none';

    savedFlights.forEach((config, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'flight-item';
        listItem.innerHTML = `
            <div>
                <div class="flight-info">Lennu nr ${config.flightNumber}</div>
                <div class="flight-details">
                    <span>Kohad: ${config.seats.join(', ')}</span><br>
                    <span>Reisijaid: ${config.passengerCount}</span><br>
                    <span>Salvestatud: ${config.date}</span>
                </div>
            </div>
            <div class="button-group">
                <button class="view-btn" data-index="${index}">Vaata</button>
                <button class="edit-btn" data-index="${index}">Muuda</button>
                <button class="delete-btn" data-index="${index}">Kustuta</button>
            </div>
        `;

        const viewBtn = listItem.querySelector('.view-btn');
        viewBtn.addEventListener('click', () => {
            const config = savedFlights[index];
            localStorage.setItem('currentViewingFlight', JSON.stringify(config));
            window.location.href = 'flight-details.html';
        });

        const editBtn = listItem.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            const config = savedFlights[index];
            const params = new URLSearchParams({
                flight: config.flightNumber,
                seats: config.seats.join(','),
                passengers: config.passengerCount,
                edit: 'true'
            });
            window.location.href = `seat.html?${params.toString()}`;
        });

        const deleteBtn = listItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            savedFlights.splice(index, 1);
            localStorage.setItem('seatConfigurations', JSON.stringify(savedFlights));

            listItem.remove();

            if(savedFlights.length === 0) {
                noPlansMsg.style.display = 'block';
            }
        });

        listElement.appendChild(listItem);
    });
});