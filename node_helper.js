/* Magic Mirror
 * Module: MMM-VastTrafik-OldSchool
 *
 * By Tommy Bandzaw, https://github.com/bandzaw/MMM-VastTrafik-OldSchool
 * Boost Software Licensed.
 */

const NodeHelper = require('node_helper');
const http = require('node:http');
const cheerio = require('cheerio');

module.exports = NodeHelper.create({

    start: function() {
        console.log('Starting node_helper for: ' + this.name);
    },

    fetchDepartures: function(stopurl) {
        http.get(stopurl, (res) => {
            let data = '';

            // A chunk of data has been received.
            res.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            res.on('end', () => {
                // Ok, all data received successfully from the server.
                const $ = cheerio.load(data);

                departures = {};
                const info = $('span.s6').text().trim();
                departures.updated = info.substring(0, info.indexOf('M') + 1);
                departures.stopStation = info.substring(info.indexOf('M') + 2, info.indexOf('(') - 1);
                departures.departures = [];
                $('table tr').each((index, row) => {
                    const rowData = [];
                    $(row).find('td').each((index, cell) => {
                        rowData.push($(cell).text().trim());
                    });

                    if (rowData.length > 0 && rowData[0] === 'Linjer') {
                        return;
                    }
                
                    arrivesIn = "";
                    for (let i = 2; i < rowData.length; i++) {
                        const potentialInt = parseInt(rowData[i]); 
                        if (!isNaN(potentialInt) && rowData[i] !== '') {
                            arrivesIn += (rowData[i] + " ");
                        }
                    }
                
                    departures.departures.push({
                        line: rowData[0],
                        destination: rowData[1],
                        arrivesIn: arrivesIn 
                    });
                });
                //console.log(JSON.stringify(departures, null, 4));
                this.sendSocketNotification('DEPARTURES', departures);
            });
        }).on('error', (err) => {
            console.log("Error: " + err.message);
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'FETCH_DEPARTURES') {
            this.fetchDepartures(payload.stopurl);
        }
    }
});
