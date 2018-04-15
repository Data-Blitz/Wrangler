/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */
(function () {
    var moment = require('moment');
    var Chance = require('chance'),
        chance = new Chance();

    /*
     "time": {
     "currentTime":"2017-12-20T17:34:47.937Z",
     "timeStepInMilliseconds":30000,
     "noise":3000
     }
     */


    var generator = {

        generate: function (aDataBlitz, aTuple) {

            var date = new Date();
            var time = new Date(aDataBlitz.configuration.time.currentTime).getTime();
            moment().millisecond(time);
            delta = chance.normal({mean: aDataBlitz.configuration.time.timeStepInMilliseconds, dev: aDataBlitz.configuration.time.noise})
            time = time + delta;
            timestamp = new Date(time).toISOString();
            aDataBlitz.configuration.time.currentTime = timestamp;
            return timestamp
        }
    }
    exports.module = generator;
})();
