/*
 Copyright (c) Bright Peak Financial, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Bright Peak Financial, Inc. (BPF)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users of Bright Peak Financial.
 */
(function () {

    var sugar = require('sugar');
    var _ = require('underscore');
    var merge = require('merge'), original, cloned;


    function generateTuple(aSchema, aTimelines) {
        production.logger.log('info', 'wrangler', {
            production: production.name,
            wrangler: "GenerateEvents",
            info: 'generating Tuple from schema',
            schema: JSON.stringify(aSchema)
        });
        var tuple = {};
        properties = aSchema.properties;
        propertyKeys = _.keys(aSchema.properties);
        for (i = 0; i < propertyKeys.length; i++) {

            property = properties[propertyKeys[i]];
            if (property.type === 'object') {
                propertyName = propertyKeys[i]
                tuple[propertyName] = generateTuple(property, tuple,aTimelines );
                production.logger.log('info', 'wrangler', {
                    production: production.name,
                    wrangler: "GenerateEvents",
                    info: 'generated object ' + JSON.stringify(tuple[propertyName])
                });
            }

            else if (property['dataBlitz']) {
                production.logger.log('info', 'wrangler', {
                    production: production.name,
                    wrangler: "GenerateEvents",
                    info: 'generating property ' + propertyKeys[i]
                });
                propertyName = propertyKeys[i]
                generator = require(property.dataBlitz.generator).module;
                tuple[propertyName] = generator.generate(property.dataBlitz, tuple, aTimelines);
            }
        }
        return tuple;
    }


    var generateEvents = function (aReferenceTuple, aReferenceTupleName, aEventSchema, aNumberOfEvents, aTimelines) {
        tuples = [];
        for (events = 0; events < aNumberOfEvents; events++ ) {
            tuple = generateTuple(aEventSchema, aTimelines);
            tuple[aReferenceTupleName] = aReferenceTuple;
            production.logger.log('info', 'wrangler', {
                production: production.name,
                wrangler: "GenerateEvents",
                info: 'pushing injected reference tuple ' + JSON.stringify(tuple)
            });
            tuples.push(tuple);
        }
        return tuples;
    };


    var wrangler = {

        configuration: undefined,
        self: undefined,

        init: function (aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
            self.timelines = aConfiguration.timeline;
            self.eventSchema = require(wrangler.configuration.schema);
        },

        execute: function (aTupleStream, aSinkCallback) {
            if (aTupleStream)
                if (aTupleStream.length > 0) {
                    eventTupleStream = [];
                    for (tupleIndex = 0; tupleIndex < aTupleStream.length; tupleIndex++) {
                        tupleStreamPerReference = generateEvents(aTupleStream[tupleIndex],
                            wrangler.configuration.referenceName, wrangler.eventSchema, wrangler.configuration.size, wrangler.timelines)
                        eventTupleStream = eventTupleStream.concat(tupleStreamPerReference);
                    }
                    aSinkCallback(null, eventTupleStream)
                }
                else
                    aSinkCallback('tupleStream empty');
            else
                aSinkCallback('tupleStream missing')
        }
    };
    exports.module = wrangler;
})();
