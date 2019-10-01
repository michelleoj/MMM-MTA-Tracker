const fetch = require("node-fetch");
const parse = require('csv-parse');
const fs = require('fs');

const fetchStations = () => {
  return fetch('http://web.mta.info/developers/data/nyct/subway/Stations.csv')
    .then(response => response.text())
    .then(text => {
      return new Promise((resolve, reject) => {
        parse(text, {columns: true}, function(err, stations) {
          resolve(stations);
        });
      });
    });
}

const fetchComplexes = () => {
  return fetch('http://web.mta.info/developers/data/nyct/subway/StationComplexes.csv')
    .then(response => response.text())
    .then(text => {
      return new Promise((resolve, reject) => {
        parse(text, {columns: true}, function(err, stations) {
          resolve(stations);
        });
      });
    });
}

const buildJSON = () => {
  return Promise.all(
    [
      fetchStations(),
      fetchComplexes()
    ]
  ).then(([stations, complexes]) => {
    const json = {};
    complexes.forEach(complex => {
      const id = complex['Complex ID'];
      const name = complex['Complex Name'];
      json[id] = {
        id,
        name,
        daytimeRoutes: []
      };
    });
    stations.forEach(station => {
      const id = station['Complex ID'];
      const name = station['Stop Name'];
      let complex = {};
      if (json[id]) {
        complex = json[id];
      } else {
        complex = { 
          id,
          name,
          daytimeRoutes: []
        };
      }
      complex.latitude = station['GTFS Latitude'];
      complex.longitude = station['GTFS Longitude'];
      complex.daytimeRoutes = complex.daytimeRoutes.concat(station['Daytime Routes'].split(' '));
      json[id] = complex;
    });
    return json;
  });
}

buildJSON()
  .then(complexes => {
    fs.writeFile('complexes.json', JSON.stringify(complexes, null, 2), (err) => {
      if (err) {
        throw err;
      }
      console.log(`Complete.`);
    });
  })