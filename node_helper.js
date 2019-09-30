/* Magic Mirror
 * Module: mmm-mtatracker
 *
 * By mchlljy
 * MIT Licensed
 */

const { createClient } = require('mta-realtime-subway-departures');
const request = require("request");
const rp = require('request-promise');
const async = require('async');
const GtfsRealtimeBinding = require("gtfs-realtime-bindings");
const fs = require("fs");
const NodeHelper = require("node_helper");
const date = require('date-and-time');

module.exports = NodeHelper.create({

	start: function () {
		console.log("Starting node helper for ", this.name);
	},

	getParams: function (key, feedId) {
		let params = `http://datamine.mta.info/mta_esi.php?key=${key}&feed_id=${feedId}`;
		return params;
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === "CONFIG") {
			const {
									stationIds,
									apiKey
							} = payload;
			
			const client = createClient(apiKey)
			this.getData(client, stationIds);
		}
	},

	getData: function (client, stationIds) {
		const departures = []
		/*
					stations = [{
						name: marcy av
						Ntimes: [{ line: M, time: t1}, {line: J, time: t2}, {line: J, time: t3}, {line: M, time: t4}]
						Stimes: [{ line: M, time: t1}, {line: J, time: t2}, {line: J, time: t3}, {line: M, time: t4}]
					}]
				*/
		client.departures(stationIds).then(resp => {
			const stations = resp
			const departures = []
			stations.forEach(({lines, name: stationName}) => {
				// a line can have multiple trains
				let times = []			
				lines.forEach(({departures: {N, S} }) => {
					const first4N  = N.splice(0,4).map(obj => {
													obj.time = this.getMinutes(obj.time)
													return obj
												}).sort((a,b) => a.time - b.time)
					const first4S = S.splice(0,4).map(obj => {
													obj.time = this.getMinutes(obj.time)
													return obj
												}).sort((a,b) => a.time - b.time)
					times.push({
						nBound: first4N,
						sBound: first4S
					})
				})

				if (times.length > 1) {
					const newTimes = []
					const combinedNTimes = []
					const combinedSTimes = []
					times.forEach(({nBound, sBound}) => {
						nBound.forEach(obj => combinedNTimes.push(obj))
						sBound.forEach(obj => combinedSTimes.push(obj))
					})
					times = [{nBound: combinedNTimes.sort((a,b) => a.time - b.time).splice(0,4), sBound: combinedSTimes.sort((a,b) => a.time - b.time).splice(0,4)}]
				}

				departures.push({
					name: stationName,
					times
				})
			})

			this.sendSocketNotification('ON_DEPARTURE_TIME', departures)
		}).catch(err => {
			console.error('Error with fetching departures: ', error)
		})
	},

	getMinutes: time => {
		const now = Math.round((new Date()).getTime() / 1000);
		const diffInSec = time - now; // in seconds
		let diffInMin = Math.floor(diffInSec / 60);

		diffInMin = '0' + diffInMin % 60;

		// Will display time in minutes format
		return Number(diffInMin.substr(-2));
	}
});

