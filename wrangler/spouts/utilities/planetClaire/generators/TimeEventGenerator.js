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
        if (aTimeline.timeStep['noiseInMilliseconds'])
            time = time + aTimeline.timeStep.noiseInMilliseconds;
        if (aTimeline.timeStep['noiseInSeconds'])
            time = time + (aTimeline.timeStep.noiseInSeconds * 1000);
        if (aTimeline.timeStep['noiseInHours'])
            time = time + (aTimeline.timeStep.noiseInHours * 1000 * 60);
        if (aTimeline.timeStep['noiseInDays'])
            time = time + (aTimeline.timeStep.noiseInDays * 1000 * 60 * 24);
        if (aTimeline.timeStep['noiseInWeeks'])
            time = time + (aTimeline.timeStep.noiseInWeeks * 1000 * 60 * 24 * 7);
        if (aTimeline.timeStep['noiseInYears'])
            time = time + (aTimeline.timeStep.noiseInYears * 1000 * 60 * 24 * 7 * 52);
        return time;
    }


    var addTimeStep = function (aTimeline) {
        time = 0;
        if (aTimeline.timeStep['timeStepInMilliseconds'])
            time = time + aTimeline.timeStep.timeStepInMilliseconds;
        if (aTimeline.timeStep['timeStepInSeconds'])
            time = time + (aTimeline.timeStep.timeStepInSeconds * 1000);
        if (aTimeline.timeStep['timeStepInHours'])
            time = time + (aTimeline.timeStep.timeStepInHours * 1000 * 60);
        if (aTimeline.timeStep['timeStepInDays'])
            time = time + (aTimeline.timeStep.timeStepInDays * 1000 * 60 * 24);
        if (aTimeline.timeStep['timeStepInWeeks'])
            time = time + (aTimeline.timeStep.timeStepInWeeks * 1000 * 60 * 24 * 7);
        if (aTimeline.timeStep['timeStepInYears'])
            time = time + (aTimeline.timeStep.timeStepInYears * 1000 * 60 * 24 * 7 * 52);
        return time;
    }


    var resolveStartTime = function (aTimeline, aTuple) {

        return aTuple[aTimeline.event];
    }


    var generator = {

        generate: function (aDataBlitz, aTuple) {
            date = undefined;
            time = undefined;
            if (aTuple['timeline']) {
                if (aTuple['timeline'][aDataBlitz.configuration.timeline.timeline]) {
                    date = new Date();
                    time = new Date(aTuple['timeline'][aDataBlitz.configuration.timeline.timeline]).getTime();
                }
            }

            stepTime = addTimeStep(aDataBlitz.configuration.timeline)
            noise = addTimeStepNoise(aDataBlitz.configuration.timeline)

            delta = chance.normal({
                mean: stepTime,
                dev: noise
            })
            delta = Math.round( delta);
            time = time + delta;
            timestamp = new Date(time).toISOString();
            aTuple['timeline'][aDataBlitz.configuration.timeline.timeline] = timestamp;
            return timestamp
        }
    }
    exports.module = generator;
})();
