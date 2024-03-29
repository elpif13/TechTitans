// Initialize the map
function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: {lat: 39, lng: 32}, // Default center (Ankara)
        restriction: {
            latLngBounds: {
                north: 85, // northern border
                south: -85, // southern border
                east: 180, // eastern border
                west: -180 // western border
            },
            strictBounds: true
        }
    });

    // Fetch data and process
    let latitudes = {};
    let longitudes = {};
    const icao24Array = [];
    fetch('first_aircraft_data.json')
        .then(response => response.json())
        .then(dataInitial => {

            // Arrays containing latitude and longitude values
            // Add the latitude and longitude values of each plane to the array
            dataInitial.forEach(aircraft => {
                latitudes[aircraft.icao24] = [];
                longitudes[aircraft.icao24] = [];
                icao24Array.push(aircraft.icao24);
            });

            dataInitial.forEach(aircraft => {
                latitudes[aircraft.icao24].push(aircraft.latitude);
                longitudes[aircraft.icao24].push(aircraft.longitude);
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
                    if (!icao24Array.includes(aircraft.icao24)) {
                        // Add new aircraft icao24 code to icao24Array
                        icao24Array.push(aircraft.icao24);
                        // Create latitudes and longitudes arrays for new aircraft
                        latitudes[aircraft.icao24] = [aircraft.latitude];
                        longitudes[aircraft.icao24] = [aircraft.longitude];
                    } else {
                        // Update latitudes and longitudes arrays for previously existing aircraft
                        latitudes[aircraft.icao24].push(aircraft.latitude);
                        longitudes[aircraft.icao24].push(aircraft.longitude);
                    }

                    // Update the aircraftCallsigns array
                    aircraftCallsigns = data.map(aircraft => aircraft.callsign);

                    // Initialize the autocomplete search box
                    $("#search-box").autocomplete({
                        source: aircraftCallsigns,
                        select: function(event, ui) {
                            // Find the selected aircraft
                            var selectedAircraft = data.find(aircraft => aircraft.callsign === ui.item.value);

                            // Zoom to the selected aircraft
                            map.setZoom(10);
                            map.setCenter(new google.maps.LatLng(selectedAircraft.latitude, selectedAircraft.longitude));

                            // Find the marker for the selected aircraft
                            var selectedMarker = markers.find(marker => marker.title === selectedAircraft.callsign);

                            // Trigger a click event on the marker to open the infobox
                            new google.maps.event.trigger(selectedMarker, 'click');
                        }
                    }).autocomplete( "instance" )._renderItem = function( ul, item ) {
                        return $( "<li>" )
                            .append( "<div><img src='aircraft.png' style='height: 16px; width: 16px; margin-right: 10px;'/>" + item.label + "</div>" )
                            .appendTo( ul );
                    };
                    $("#search-box").css({
                        'border-radius': '10px' // Adjust this value to change the roundness of the borders
                    });

                    function createMarkerIcon(rotation) {
                        return {
                            path: 'M192 93.68C192 59.53 221 0 256 0C292 0 320 59.53 320 93.68V160L497.8 278.5C506.7 284.4 512 294.4 512 305.1V361.8C512 372.7 501.3 380.4 490.9 376.1L320 319.1V400L377.6 443.2C381.6 446.2 384 450.1 384 456V497.1C384 505.7 377.7 512 369.1 512C368.7 512 367.4 511.8 366.1 511.5L256 480L145.9 511.5C144.6 511.8 143.3 512 142 512C134.3 512 128 505.7 128 497.1V456C128 450.1 130.4 446.2 134.4 443.2L192 400V319.1L21.06 376.1C10.7 380.4 0 372.7 0 361.8V305.1C0 294.4 5.347 284.4 14.25 278.5L192 160L192 93.68z',
                            fillColor: 'black', // Fill color of the arrow
                            fillOpacity: 1, // Opacity of the fill
                            scale: 0.05, // Scale of the icon
                            strokeColor: 'white', // Stroke color of the arrow
                            strokeWeight: 2, // Stroke weight of the arrow
                            rotation: rotation, // Rotation angle in degrees
                            anchor: new google.maps.Point(250, 256), // Anchor point of the icon (middle top)
                        };
                    }

                    var marker = new google.maps.Marker({
                        position: {lat: aircraft.latitude, lng: aircraft.longitude},
                        map: map,
                        title: aircraft.callsign,
                        icon: createMarkerIcon(aircraft.true_track) // Set rotation based on true_track value
                    });

                    var contentString = `
                        <div class="info-box" style="background-color: #f8f8f8; padding: 10px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,.3);">
                            <h2 style="margin: 0; color: #333; font-size: 18px;">${aircraft.callsign}</h2>
                            <hr style="border: none; border-top: 1px solid #ddd;">
                            <p style="margin: 5px 0;"><b>Origin Country:</b> ${aircraft.origin_country}</p>
                            <p style="margin: 5px 0;"><b>Velocity:</b> ${aircraft.velocity} m/s</p>
                            <p style="margin: 5px 0;"><b>True Track:</b> ${aircraft.true_track}°</p>
                            <p style="margin: 5px 0;"><b>Vertical Rate:</b> ${aircraft.vertical_rate} m/s</p>
                        </div>
                    `;

                    var infoWindow = new google.maps.InfoWindow({
                        content: contentString
                    });

                    // Add click event listener to marker to open info window
                    marker.addListener('click', function () {
                        infoWindow.open(map, marker);
                        drawPath(aircraft);
                        this.setAnimation(google.maps.Animation.BOUNCE); // Add bounce animation
                        // Stop the animation after 2 bounces (approx. 1400ms)
                        setTimeout(() => { this.setAnimation(null); }, 1400);
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

        const locations = [];
        for (let i = 0; i < icao24Array.length; i++) {
            if (icao24Array[i] == aircraft.icao24) {
                // Assuming latitudes and longitudes are populated correctly
                for (let j = 0; j < latitudes[aircraft.icao24].length; j++) {
                    locations.push({ lat: latitudes[aircraft.icao24][j], lng: longitudes[aircraft.icao24][j] });
                }
                break;
            }
        }

        var path = new google.maps.Polyline({
            path: locations,
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

    // Array to store aircraft callsigns
    var aircraftCallsigns = [];

    // Fetch data and process initially
    fetchDataAndProcess();

    // Fetch data and process every 30 seconds
    setInterval(fetchDataAndProcess, 30000);
}
