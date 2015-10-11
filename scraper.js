'use strict';

var request = require('request');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var transientEventCtrl = require('./controllers/transientEvent.controller.js');
var async = require('async');
var utilities = require('./utilities');
var config = require('./config');

mongoose.connect(config.mongoUri);

module.exports = {
    repopulate: repopulate
};

function repopulate(req, res, next) {

    async.waterfall([
        getHtml,
        buildEvents,
        //dropCollection,
        saveEvents
    ], finalCallback);

    function getHtml(waterfallNext) {
        request('http://integral.esac.esa.int/bexrbmonitor/webpage_oneplot.php', function (error, response, html) {
            if (!error && response.statusCode == 200) {
                waterfallNext(error, html);
            }
        });
    }

    function buildEvents(html, waterfallNext) {
        var events = [];

        var $ = cheerio.load(html);

        $('tbody tr').each(function (rowIndex, row) {
            var eventData = {};
            var temp;

            eventData['name'] = $(row).find('td div#name_cell').html().trim();

            var columns = $(row).find('td div.formated_cell');

            temp = $(columns[1]).html().trim();
            if (isDataValid(temp)) {
                eventData['ra'] = temp;
            }

            temp = $(columns[2]).html().trim();
            if (isDataValid(temp)) {
                eventData['dec'] = temp;
            }

            temp = $(columns[3]).html().trim();
            if (isDataValid(temp)) {
                eventData['orbital_period'] = temp;
            }

            if ($(columns[4]).find('div.formated_cell').length !==0) {
                temp = $(columns[4]).find('div.formated_cell span').html().trim();
                if (isDataValid(temp)) {
                    eventData['MAXI_flux_change_prob'] = temp.substring(0, temp.length-1)/100;
                }
            }

            temp = $(columns[5]).html().trim();
            if (isDataValid(temp)) {
                eventData['MAXI_avg_flux_mCrab'] = temp;
            }

            temp = $(columns[6]).html().trim();
            if (isDataValid(temp)) {
                eventData['MAXI_data_date'] = utilities.formatDate(temp);
            }

            if ($(columns[7]).find('div.formated_cell').length !==0) {
                temp = $(columns[7]).find('div.formated_cell span').html().trim();
                if (isDataValid(temp)) {
                    eventData['swift_avg_flux_change_prob'] = temp.substring(0, temp.length-1)/100;
                }
            }

            temp = $(columns[8]).html().trim();
            if (isDataValid(temp)) {
                eventData['swift_avg_flux_mCrab'] = temp;
            }

            temp = $(columns[9]).html().trim();
            if (isDataValid(temp)) {
                eventData['swift_data_date'] = utilities.formatDate(temp);
            }

            if ($(columns[10]).find('div.formated_cell').length !==0) {
                temp = $(columns[10]).find('div.formated_cell span').html().trim();
                if (isDataValid(temp)) {
                    eventData['fermi_flux_change_prob'] = temp.substring(0, temp.length-1)/100;
                }
            }

            temp = $(columns[11]).html().trim(); // in keV cm^-2 s^-1
            if (isDataValid(temp)) {
                eventData['fermi_average_pulsed_flux'] = temp;
            }

            temp = $(columns[12]).html().trim();
            if (isDataValid(temp)) {
                eventData['fermi_data_date'] = utilities.formatDate(temp);
            }

            events.push(eventData);
        });

        waterfallNext(null, events);

        function isDataValid(text) {
            return text && text !== 'NO DATA' && text !== '-';
        }
    }

    function saveEvents(events, waterfallNext) {
        transientEventCtrl.saveEvents(events, waterfallNext);
    }

    function finalCallback(error) {
        if (error) {
            next(error);
        }

        res.status(200).send({message: 'Successfully repopulated events.'});
    }
}