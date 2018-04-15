/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */

(function () {

    const csv = require('csvtojson')
    var async = require('async');
    var _ = require('underscore');
    var spout = require('../spouts/ToTupleStream.js').module;


    function generateTuple(aSchema) {
        production.logger.log('info', 'source', {
            production: production.name,
            source: "PlanetClaireToStream",
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
                tuple[propertyName] = generateTuple(property, tuple);
                production.logger.log('info', 'source', {
                    production: production.name,
                    source: "PlanetClaireToStream",
                    info: 'generated object ' + JSON.stringify(tuple[propertyName])
                });
            }

            else if (property['dataBlitz']) {
                production.logger.log('info', 'source', {
                    production: production.name,
                    source: "PlanetClaireToStream",
                    info: 'generating property ' + propertyKeys[i]
                });
                propertyName = propertyKeys[i]
                generator = require(property.dataBlitz.generator).module;
                tuple[propertyName] = generator.generate(property.dataBlitz, tuple);
            }
        }
        return tuple;
    }


    function processsProduction(aProduction, aBatchTupleStream, aBatchCallback) {
        source.countingSemphore.take(
            function () {
                setTimeout(function () {
                    var productionStack = []; //reset
                    for (i = 0; i < aProduction.length; i++) {
                        productionStack[i + 1] = aProduction[i]
                    }
                    /*
                     Inject the spout with this Batch stream (i.e. aBatchTupleStream)
                     */
                    spout.setStream(aBatchTupleStream)
                    /*
                     Load newly injected spout onto the top Production stack
                     */
                    productionStack[0] = spout.toStream
                    /*
                     Process a batch sized tuple stream through Production Stack without back pressure (i.e. no waiting/wide-open)
                     */
                    production.logger.log('info', 'process-production-stack', {
                        production: production.name,
                        source: "CsvFileToStream"
                    });
                    async.waterfall(productionStack, aBatchCallback);
                    aBatchTupleStream = null;

                }, source.configuration.backPressureWaitInMilliseconds);

            })
    }

    var source = {

      configuration: undefined,
      self: undefined,

        init: function init(aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
            self.countingSemphore = require('semaphore')(self.configuration.maxNumberOfOutstandingBatches);
        },

        execute: function (aProduction, aCallback) {

            production.logger.log('info', 'enter-source', {
                production: production.name,
                source: "PlanetClaireToStream"
            });

            var schema = require(self.configuration.schema);

            production.logger.log('info', 'source', {
                production: production.name,
                source: "PlanetClaireToStream",
                status: 'successful',
                schema: JSON.stringify(schema)
            });

            if (source.configuration.size) {
                var batch = []

                for (tupleCount = 0; tupleCount < source.configuration.size; tupleCount++) {
                    tuple = generateTuple(schema);
                    batch.push(tuple);

                    if (batch.length >= source.configuration.batchSize) {
                        production.logger.log('info', 'source', {
                            production: production.name,
                            source: "PlanetClaireToStream",
                            status: 'successful',
                            info: 'pushing batch'
                        });
                        processsProduction(aProduction, batch,
                            function (anError, aResult) {
                                if (anError)
                                    console.log("fault: " + JSON.stringify(anError));
                                else {
                                    production.logger.log('info', 'source', {
                                        production: production.name,
                                        source: "PlanetClaireToStream",
                                        more: "batching "+batch.length+' documents'
                                    });
                                    batch = [];
                                    aCallback(null, 'submit batch: ' + JSON.stringify(aResult))
                                }
                            })
                    }

                }

            }
        }
    }
    exports.module = source;
})
();
