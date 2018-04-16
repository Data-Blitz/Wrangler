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
        if (aTimeStep['timeStepInMinutes'])
            time = time + (aTimeStep.timeStepInMinutes * 1000 * 60);
        if (aTimeStep['timeStepInHours'])
            time = time + (aTimeStep.timeStepInHours * 1000 * 60 * 60);
        if (aTimeStep['timeStepInDays'])
            time = time + (aTimeStep.timeStepInDays * 1000 * 60 * 60 * 24);
        if (aTimeStep['timeStepInWeeks'])
            time = time + (aTimeStep.timeStepInWeeks * 1000 * 60 * 60 * 24 * 7);
        if (aTimeStep['timeStepInYears'])
            time = time + (aTimeStep.timeStepInYears * 1000 * 60 * 60 * 24 * 7 * 52);
        return time;
    }


    var createNoise = function (aNoise) {
        time = 0;
        if (aNoise['noiseInMilliseconds'])
            time = time + aNoise.noiseInMilliseconds;
        if (aNoise['noiseInSeconds'])
            time = time + (aNoise.noiseInSeconds * 1000);
        if (aNoise['noiseInSeconds'])
            time = time + (aNoise.noiseInMinutess * 1000 * 60);
        if (aNoise['noiseInHours'])
            time = time + (aNoise.noiseInHours * 1000 * 60 * 60);
        if (aNoise['noiseInDays'])
            time = time + (aNoise.noiseInDays * 1000 * 60 * 60 * 24);
        if (aNoise['noiseInWeeks'])
            time = time + (aNoise.noiseInWeeks * 1000 * 60 * 60  * 24 * 7);
        if (aNoise['noiseInYears'])
            time = time + (aNoise.noiseInYears * 1000 * 60 * 60 * 24 * 7 * 52);
        return time;
    }



    var generator = {

        generate: function (aDataBlitz, aTuple, aTimelines) {
            if (aDataBlitz.configuration['conditions']) {
                length = aDataBlitz.configuration.conditions.length
                for (conditionIndex = 0; conditionIndex < length; conditionIndex++) {
                    condition = aDataBlitz.configuration.conditions[conditionIndex];
                    if (aTuple[condition.attributeName] === condition.attributeValue) {
                        conditionIndex = length;
                        timeStep = createStep(condition.timeStep);
                        noise = createNoise(condition.noise);
                        if (!aDataBlitz['context']) {
                            aDataBlitz['context'] = {};
                            aDataBlitz['context']['timelines'] = {};
                        }
                        delta = Math.round(chance.normal({
                            mean: timeStep,
                            dev: noise
                        }))

                        if (!aDataBlitz.context.timelines[condition.timeline]) {
                            aDataBlitz.context.timelines[condition.timeline] = aTimelines[condition.timeline];
                        }

                        var date = new Date();
                        var time = new Date( aDataBlitz.context.timelines[condition.timeline]).getTime();


                        time = time + delta;
                        timestamp = new Date(time).toISOString();
                        aDataBlitz.context.timelines[condition.timeline] = timestamp;


                        return timestamp

                    }
                }
            }
        }
    }
    exports.module = generator;
})();
