document.addEventListener('DOMContentLoaded', () => {
    const flightData = JSON.parse(localStorage.getItem('currentViewingFlight'));

    if (flightData) {
        document.getElementById('detail-flight-number').textContent = flightData.flightNumber || 'N/A';
        document.getElementById('detail-departure').textContent = flightData.departure || 'N/A';
        document.getElementById('detail-destination').textContent = flightData.destination || 'N/A';
        document.getElementById('detail-price').textContent = flightData.price ? `${flightData.price}€` : 'N/A';
        document.getElementById('detail-duration').textContent = flightData.duration || 'N/A';
        document.getElementById('detail-seats').textContent = flightData.seats ? flightData.seats.join(', ') : 'N/A';
        document.getElementById('detail-passengers').textContent = flightData.passengerCount || 'N/A';
        document.getElementById('detail-saved').textContent = flightData.date || 'N/A';
    } else {
        console.error('No flight data found in localStorage');
    }
});