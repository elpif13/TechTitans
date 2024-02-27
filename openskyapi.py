import json
from opensky_api import OpenSkyApi
api = OpenSkyApi()
states = api.get_states()

    # Uçak verilerini JSON formatına dönüştür
aircraft_data = []
for state in states.states:
        aircraft_data.append({
            "icao24": state.icao24,
            "callsign": state.callsign,
            "origin_country": state.origin_country,
            "longitude": state.longitude,
            "latitude": state.latitude,
            "velocity": state.velocity,
            "true_track": state.true_track,
            "vertical_rate": state.vertical_rate,
            "time_position": state.time_position,
            "last_contact": state.last_contact,
            "on_ground": state.on_ground
        })

with open("aircraft_data.json", "w") as f:
    json.dump(aircraft_data, f, indent=4)