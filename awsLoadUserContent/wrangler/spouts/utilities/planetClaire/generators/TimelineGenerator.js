/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */
(function () {
    var moment = require('moment');
    var _ = require('underscore');
    var Chance = require('chance'),
        chance = new Chance();


    var addTimeStepNoise = function (aTimeline) {
        time = 0;
        if (aTimeline.timings['noiseInMilliseconds'])
            time = time + aTimeline.timings.timeStepInMilliseconds;
        if (aTimeline.timings['noiseInSeconds'])
            time = time + (aTimeline.timings.timeStepInSeconds * 1000);
        if (aTimeline.timings['noiseInHours'])
            time = time + (aTimeline.timings.timeStepInHours * 1000 * 60);
        if (aTimeline.timings['noiseInDays'])
            time = time + (aTimeline.timings.timeStepInDays * 1000 * 60 * 24);
        if (aTimeline.timings['noiseInWeeks'])
            time = time + (aTimeline.timings.timeStepInWeeks * 1000 * 60 * 24 * 7);
        if (aTimeline.timings['noiseInYears'])
            time = time + (aTimeline.timings.timeStepInYears * 1000 * 60 * 24 * 7 * 52);
        return time;
    }


    var addTimeStep = function (aTimeline) {
        time = 0;
        if (aTimeline.timings['timeStepInMilliseconds'])
            time = time + aTimeline.timings.timeStepInMilliseconds;
        if (aTimeline.timings['timeStepInSeconds'])
            time = time + (aTimeline.timings.timeStepInSeconds * 1000);
        if (aTimeline.timings['timeStepInHours'])
            time = time + (aTimeline.timings.timeStepInHours * 1000 * 60);
        if (aTimeline.timings['timeStepInDays'])
            time = time + (aTimeline.timings.timeStepInDays * 1000 * 60 * 24);
        if (aTimeline.timings['timeStepInWeeks'])
            time = time + (aTimeline.timings.timeStepInWeeks * 1000 * 60 * 24 * 7);
        if (aTimeline.timings['timeStepInYears'])
            time = time + (aTimeline.timings.timeStepInYears * 1000 * 60 * 24 * 7 * 52);
        return time;
    }


    var resolveStartTime = function (aTimeline, aTuple) {

        return aTuple[aTimeline.event];
    }


    var generator = {

        generate: function (aDataBlitz, aTuple) {
            if (!aTuple['timeline']) {
                aTuple['timeline'] = {}
                keys = _.keys(aDataBlitz.configuration.timelines)
                if (keys)
                    for (i = 0; i < keys.length; i++) {
                        key = keys[i];
                        if (!(aTuple['timeline'][key]))
                            aTuple.timeline[key] = aDataBlitz.configuration.timelines[key]
                    }
            }
            return aTuple.timeline
        }
    }
    exports.module = generator;
})();
