Module.register("mta-tracker", {
	defaults: {
		apiKey: "",
		stationIds: [101, 629],
		reload: 60000, // every 60 seconds
		trains: {
				G: {
					nBound: 'Court Sq',
					sBound: 'Church Ave',
				},
				L: {
					nBound: '8th Ave',
					sBound: 'Canarsie',
				},
				M: {
					nBound: 'Forest Hills',
					sBound: 'Metropolitan Ave',
				},
				J: {
					nBound: 'Brooklyn Bridge',
					sBound: 'Jamaica Center',
				},
				Z: {
					nBound: 'Broad St',
					sBound: 'Jamaica Center',
				},
			},
	},
	
	departureTimes: [],

	getScripts: function(){
		return [this.file("node_modules/lodash/lodash.js")];
	},

	getStyles: function() {
		return [this.file("styles/mta-tracker.css")];
	},

	start: function() {
		Log.info("Starting module: " + this.name);

		// start immediately
		this.sendSocketNotification("CONFIG", this.config);
		
		setInterval(() => {
     	this.sendSocketNotification("CONFIG", this.config);
    }, this.config.reload);
	},

	socketNotificationReceived: function(notification, payload) {
		switch (notification) {
			case 'ON_DEPARTURE_TIME':
				this.departureTimes = payload;
				this.updateDom();
				break;
			default:
				break;
		}
	},

	getDom: function () {
		const wrapper = document.createElement("div");
		wrapper.classList.add("mta-tracker");
		
		const data = this.departureTimes

		if (data) {
			this.directionHash = this.setUpDirectionHash(data)
			const subwayLinesElements = this.getSubwayLinesDOMElements(data);
	
			_.forEach(subwayLinesElements, (element) => {
				wrapper.appendChild(element);
			});
		}

		return wrapper;
	},

	setUpDirectionHash: function(data) {
		const directionHash = Object.assign({}, this.config.trains)
		// init empty time arrays
		for (let key of Object.keys(directionHash)) {
			directionHash[key].nDepartureTimes = []
			directionHash[key].sDepartureTimes = []
		}

		data.forEach(station => {
			station.times[0].nBound.forEach(ntime => {
				directionHash[ntime.routeId].nDepartureTimes.push(ntime)
			})

			station.times[0].sBound.forEach(stime => {
				directionHash[stime.routeId].sDepartureTimes.push(stime)
			})
		})
		
		return directionHash
	},

	/**
	 * @param {Object} lines - An array of line name strings.
	 */
	getSubwayLinesDOMElements: function(data) {
		const elements = [];

		// station div and lines
		data.forEach(station => {
			const stationDiv = document.createElement('div')
			stationDiv.classList.add('station')
			const stationHeader = document.createElement('h2')
			stationHeader.innerHTML = `${station.name} Station`
			const directionNorthHeader = document.createElement('h3')
			directionNorthHeader.innerHTML = 'Manhattan/Queens Bound'
			const directionSouthHeader = document.createElement('h3')
			directionSouthHeader.innerHTML = 'Brooklyn Bound'
			
			stationDiv.appendChild(stationHeader)
			
			// the north trains
			stationDiv.appendChild(directionNorthHeader)
			const nBoundTimesDiv = document.createElement('div')
			nBoundTimesDiv.classList.add('times')
			station.times[0].nBound.forEach(timeObj => {
				const line = this.createLineDiv(timeObj, 'nBound')
				nBoundTimesDiv.appendChild(line)
			})
			stationDiv.appendChild(nBoundTimesDiv)

			// the south trains
			stationDiv.appendChild(directionSouthHeader)
			const sBoundTimesDiv = document.createElement('div')
			sBoundTimesDiv.classList.add('times')
			station.times[0].sBound.forEach(timeObj => {
				const line = this.createLineDiv(timeObj, 'sBound')
				sBoundTimesDiv.appendChild(line)
			})
			stationDiv.appendChild(sBoundTimesDiv)

			elements.push(stationDiv)
		})

		return elements;
	},

	createLineDiv: function(timeObj, dir) {
		const train = document.createElement("div");
		const logo = document.createElement("div");
		const name = document.createElement("div");
		const time = document.createElement("div");
		const direction = document.createElement("div");

		train.classList.add("train");
		logo.classList.add("logo");
		direction.classList.add("direction")
		name.classList.add("name", timeObj.routeId);
		time.classList.add("time");

		name.innerHTML = timeObj.routeId;
		time.innerHTML = '--';
		direction.innerHTML = this.config.trains[timeObj.routeId][dir]

		if (!_.isEmpty(this.departureTimes)) {
			time.innerHTML = `${timeObj.time} min`
		}

		logo.appendChild(name);
		train.appendChild(logo);
		train.appendChild(direction)
		train.appendChild(time);

		return train
	},
});
