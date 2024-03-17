import json
import time
from opensky_api import OpenSkyApi

first_data_received = False

def helper_function():
    global first_data_received
    api = OpenSkyApi()
    try:
        states = api.get_states()

        aircraft_data_current = []
        aircraft_data_first = []

        for state in states.states:
            if state.origin_country in ["Turkey"]:
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
            with open("src/first_aircraft_data.json", "w") as f: 
                json.dump(aircraft_data_first, f, indent=4)
                print("First data saved successfully.")
                first_data_received = True
        else:
            with open("src/aircraft_data.json", "w") as f:
                json.dump(aircraft_data_current, f, indent=4)
            print("Current data saved successfully.")

    except Exception as e:
            print("Error occurred:", e)

            # Wait for a specified interval before collecting data again
    time.sleep(30)  # Adjust the interval as needed


def collect_and_save_data(test:bool):
    global first_data_received
    
    if(test):
        for i in range(2):
            helper_function()
    else:
        while(True):
            helper_function()

if __name__ == '__main__':
    collect_and_save_data(False)