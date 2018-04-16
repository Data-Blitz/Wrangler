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


    var createStep = function (aTimeStep) {
        time = 0;
        if (aTimeStep['timeStepInMilliseconds'])
            time = time + aTimeStep.timeStepInMilliseconds;
        if (aTimeStep['timeStepInSeconds'])
            time = time + (aTimeStep.timeStepInSeconds * 1000);
        if (aTimeStep['timeStepInHours'])
            time = time + (aTimeStep.timeStepInHours * 1000 * 60);
        if (aTimeStep['timeStepInDays'])
            time = time + (aTimeStep.timeStepInDays * 1000 * 60 * 24);
        if (aTimeStep['timeStepInWeeks'])
            time = time + (aTimeStep.timeStepInWeeks * 1000 * 60 * 24 * 7);
        if (aTimeStep['timeStepInYears'])
            time = time + (aTimeStep.timeStepInYears * 1000 * 60 * 24 * 7 * 52);
        return time;
    }


    var createNoise = function (aNoise) {
        time = 0;
        if (aNoise['noiseInMilliseconds'])
            time = time + aNoise.noiseInMilliseconds;
        if (aNoise['noiseInSeconds'])
            time = time + (aNoise.noiseInSeconds * 1000);
        if (aNoise['noiseInHours'])
            time = time + (aNoise.noiseInHours * 1000 * 60);
        if (aNoise['noiseInDays'])
            time = time + (aNoise.noiseInDays * 1000 * 60 * 24);
        if (aNoise['noiseInWeeks'])
            time = time + (aNoise.noiseInWeeks * 1000 * 60 * 24 * 7);
        if (aNoise['noiseInYears'])
            time = time + (aNoise.noiseInYears * 1000 * 60 * 24 * 7 * 52);
        return time;
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
            moment().millisecond(time);

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
