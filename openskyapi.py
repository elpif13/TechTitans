import json
import time
from opensky_api import OpenSkyApi

def collect_and_save_data():
    api = OpenSkyApi()
    while True:
        try:
            states = api.get_states()

            aircraft_data = []
            for state in states.states:
                if state.origin_country in ["Turkey"]:
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

            # Save the collected data to a JSON file
            with open("aircraft_data.json", "w") as f:
                json.dump(aircraft_data, f, indent=4)

            print("Data saved successfully.")

        except Exception as e:
            print("Error occurred:", e)

        # Wait for a specified interval before collecting data again
        time.sleep(30)  # Adjust the interval as needed
collect_and_save_data()
