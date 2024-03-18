// Initialize the map
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {lat: 39, lng: 32} // Default center (Ankara)
    });

    // Fetch data and process
    const latitudeArray = [];
    const longitudeArray = [];
    const icao24Array = [];
    fetch('first_aircraft_data.json')
        .then(response => response.json())
        .then(dataInitial => {

            // Arrays containing latitude and longitude values
            // Add the latitude and longitude values of each plane to the array
            dataInitial.forEach(aircraft => {
                latitudeArray.push(aircraft.latitude);
                longitudeArray.push(aircraft.longitude);
                icao24Array.push(aircraft.icao24);
            });

            // Show results
            console.log("Latitude Array:", latitudeArray);
            console.log("Longitude Array:", longitudeArray);
        })
        .catch(error => {
            console.error('An error occurred while fetching data', error);
        });

    function fetchDataAndProcess() {
        fetch('aircraft_data.json')
            .then(response => response.json())
            .then(data => {
                // Clear existing markers and paths
                markers.forEach(marker => {
                    marker.setMap(null);
                });
                markers = [];
                paths.forEach(path => {
                    path.setMap(null);
                });
                paths = [];

                // Process each aircraft data
                data.forEach(aircraft => {
                    // Create marker for last location only
                    function createMarkerIcon(rotation) {
                        return {
                            path: 'M192 93.68C192 59.53 221 0 256 0C292 0 320 59.53 320 93.68V160L497.8 278.5C506.7 284.4 512 294.4 512 305.1V361.8C512 372.7 501.3 380.4 490.9 376.1L320 319.1V400L377.6 443.2C381.6 446.2 384 450.1 384 456V497.1C384 505.7 377.7 512 369.1 512C368.7 512 367.4 511.8 366.1 511.5L256 480L145.9 511.5C144.6 511.8 143.3 512 142 512C134.3 512 128 505.7 128 497.1V456C128 450.1 130.4 446.2 134.4 443.2L192 400V319.1L21.06 376.1C10.7 380.4 0 372.7 0 361.8V305.1C0 294.4 5.347 284.4 14.25 278.5L192 160L192 93.68z',
                            fillColor: 'black', // Fill color of the arrow
                            fillOpacity: 1, // Opacity of the fill
                            scale: 0.05, // Scale of the icon
                            strokeColor: 'white', // Stroke color of the arrow
                            strokeWeight: 2, // Stroke weight of the arrow
                            rotation: rotation, // Rotation angle in degrees
                            anchor: new google.maps.Point(8, 10), // Anchor point of the icon
                        };
                    }

                    var marker = new google.maps.Marker({
                        position: {lat: aircraft.latitude, lng: aircraft.longitude},
                        map: map,
                        title: aircraft.callsign,
                        icon: createMarkerIcon(aircraft.true_track) // Set rotation based on true_track value
                    });

                    var contentString = `
                    <div>
                        <h2>${aircraft.callsign}</h2>
                        <p><b>Origin Country:</b> ${aircraft.origin_country}</p>
                        <p><b>Velocity:</b> ${aircraft.velocity} m/s</p>
                        <p><b>True Track:</b> ${aircraft.true_track}°</p>
                        <p><b>Vertical Rate:</b> ${aircraft.vertical_rate} m/s</p>
                    </div>
                `;

                    var infoWindow = new google.maps.InfoWindow({
                        content: contentString
                    });

                    // Add click event listener to marker to open info window
                    marker.addListener('click', function () {
                        infoWindow.open(map, marker);
                        drawPath(aircraft);
                    });

                    // Push marker to markers array
                    markers.push(marker);
                });
            })
            .catch(error => {
                console.error('Error fetching aircraft data:', error);
            });
    }

    // Draw path function
    // Draw path function
    function drawPath(aircraft) {
        // Clear existing paths for the specific aircraft
        paths.forEach(path => {
            if (path.aircraftICAO === aircraft.icao24) {
                path.setMap(null);
            }
        });
        paths = paths.filter(path => path.aircraftICAO !== aircraft.icao24);

        var firstLocation, lastLocation;
        for (var i = 0; i < icao24Array.length; i++) {
            if (icao24Array[i] == aircraft.icao24) {
                firstLocation = {lat: latitudeArray[i], lng: longitudeArray[i]};
                lastLocation = {lat: aircraft.latitude, lng: aircraft.longitude};
                break;
            }
        }

        var path = new google.maps.Polyline({
            path: [firstLocation, lastLocation],
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        path.aircraftICAO = aircraft.icao24; // Set the aircraft's ICAO for reference
        path.setMap(map);
        paths.push(path);

        map.addListener('click', function () {
            infoWindow.close();
            clearPaths(aircraft.icao24); // Clear paths for the specific aircraft
        });
    }


    // Clear markers and paths function
    function clearPaths(icao) {
        markers.forEach(marker => {
            marker.setMap(null);
        });
        markers = markers.filter(marker => marker.aircraftICAO !== icao);
        paths.forEach(path => {
            if (path.aircraftICAO === icao) {
                path.setMap(null);
            }
        });
        paths = paths.filter(path => path.aircraftICAO !== icao);
    }


    // Array to store markers and paths
    var markers = [];
    var paths = [];

    // Fetch data and process initially
    fetchDataAndProcess();

    // Fetch data and process every 30 seconds
    setInterval(fetchDataAndProcess, 30000);
}