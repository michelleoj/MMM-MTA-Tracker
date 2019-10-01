# MTA Subway Stations

The MTA releaes [Stations.csv](http://web.mta.info/developers/data/nyct/subway/Stations.csv), which includes information about each subway station. This is a port of that data into JavaScript.

## Installation

```bash
npm install --save mta-subway-stations
```

## Usage

```js
const stations = require('mta-subway-stations');
```

`stations` is an array containing an object representation of each station:

```js
{
  "Station ID": "1",
  "Complex ID": "1",
  "GTFS Stop ID": "R01",
  "Division": "BMT",
  "Line": "Astoria",
  "Stop Name": "Astoria - Ditmars Blvd",
  "Borough": "Q",
  "Daytime Routes": "N W",
  "Structure": "Elevated",
  "GTFS Latitude": "40.775036, -73.912034",
  "GTFS Longitude": "-73.912034"
}
```