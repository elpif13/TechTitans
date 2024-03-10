import json
import time
from opensky_api import OpenSkyApi

def collect_and_save_data():
    api = OpenSkyApi()
    first_data_received = False

    while True:
        try:
            states = api.get_states()

            aircraft_data_current = []
            aircraft_data_first = []

            for state in states.states:
                if state.callsign in ["SWR7EA  "]:
                    if not first_data_received:
                        aircraft_data_first.append({
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
                    else:
                        aircraft_data_current.append({
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

            # Save the collected data to JSON files
            if not first_data_received:
                with open("first_aircraft_data.json", "w") as f:
                    json.dump(aircraft_data_first, f, indent=4)
                print("First data saved successfully.")
                first_data_received = True
            else:
                with open("aircraft_data.json", "w") as f:
                    json.dump(aircraft_data_current, f, indent=4)
                print("Current data saved successfully.")

        except Exception as e:
            print("Error occurred:", e)

        # Wait for a specified interval before collecting data again
        time.sleep(30)  # Adjust the interval as needed

collect_and_save_data()