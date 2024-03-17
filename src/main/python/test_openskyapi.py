import unittest
from unittest.mock import MagicMock, patch
import json
import time
from openskyapi import collect_and_save_data

class TestAircraftDataCollection(unittest.TestCase):

    def _mock_collect_and_save_data(self, iterations):
        api = MagicMock()
        states = MagicMock()
        states.states = [
            MagicMock(icao24='123456', callsign='ABC123', origin_country='Turkey',
                       longitude=30.0, latitude=40.0, velocity=200, true_track=90,
                       vertical_rate=0, time_position=1234567890, last_contact=1234567890,
                       on_ground=False),
            MagicMock(icao24='654321', callsign='DEF456', origin_country='USA',
                       longitude=-80.0, latitude=35.0, velocity=300, true_track=180,
                       vertical_rate=-1000, time_position=1234567900, last_contact=1234567900,
                       on_ground=True)
        ]
        api.get_states.return_value = states

        collect_and_save_data(True)

    def test_collect_and_save_data(self):
    
        # Call the helper function to simulate data collection for 2 iterations
        self._mock_collect_and_save_data(iterations=2)

        # Check if the data was saved correctly
        with open("src/first_aircraft_data.json", "r") as f:
            first_data = json.load(f)

if __name__ == '__main__':
    unittest.main()