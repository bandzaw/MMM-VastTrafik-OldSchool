/* Magic Mirror
 * Module: MMM-VastTrafik-OldSchool
 *
 * By Tommy Bandzaw, https://github.com/bandzaw/MMM-VastTrafik-OldSchool
 * Boost Software Licensed.
 */

Module.register('MMM-VastTrafik-OldSchool', {
    // Default module config.
    defaults: {
        stopurl: 'http://wap.vasttrafik.se/MobileQuery.aspx?hpl=R%C3%A5da+portar+(H%C3%A4rryda)',
    },

    // Override dom generator.
    getDom: function() {
        var wrapper = document.createElement("div");

        if (this.departures && this.departures.departures.length > 0) {
            var table = document.createElement("table");
            for (var departure in this.departures.departures) {
                var row = document.createElement("tr");
    
                var lineCell = document.createElement("td");
                lineCell.className = "line";
                lineCell.innerHTML = this.departures.departures[departure].line;
                row.appendChild(lineCell);

                var destinationCell = document.createElement("td");
                destinationCell.className = "destination";
                destinationCell.innerHTML = this.departures.departures[departure].destination;
                row.appendChild(destinationCell);

                var arrivesInCell = document.createElement("td");
                arrivesInCell.className = "arrivesin";
                arrivesInCell.innerHTML = this.departures.departures[departure].arrivesIn;
                row.appendChild(arrivesInCell);

                table.appendChild(row);
            }
            wrapper.appendChild(table);
    
        } else {
            wrapper.innerHTML = 'Waiting for data...';
        }
    
        return wrapper;
    },

    // Override start method.
    start: function() {
        Log.info('Starting module: ' + this.name);
        this.departures = {};
        this.data.header = "Västtrafik";
        this.sendSocketNotification('FETCH_DEPARTURES', this.config);
    },

    getHeader: function() {
        return this.data.header;
    },
    
    // Override socket notification handler.
    socketNotificationReceived: function(notification, payload) {
        Log.info('Received socketNotification: ' + notification);
        if (notification === 'DEPARTURES') {
            this.departures = payload;
            this.data.header = 'Västtrafik ' + this.departures.stopStation + " " + this.departures.updated;
            this.updateDom();
        }
    },

    notificationReceived: function(notification, payload, sender) {
        if (notification === 'REFRESH_DATA') {
            Log.info('REFRESH_DATA received, sending FETCH_DEPARTURES to node_helper...');

            this.data.header = 'Västtrafik ' + this.departures?.stopStation + " updating...";
            this.departures = null;
            this.updateDom();

            this.sendSocketNotification('FETCH_DEPARTURES', this.config);
        }
    }
});
