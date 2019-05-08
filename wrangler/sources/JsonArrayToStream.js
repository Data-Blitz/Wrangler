/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */

(function () {

    var jsonFile = require('jsonfile')
    var async = require('async');
    var _ = require('underscore')
    var spout = require('../spouts/ToTupleStream.js').module;

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
                    async.waterfall(productionStack, aBatchCallback);

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
            console.log('executing JsonArrayToStream Source')
            production.logger.log('info', 'enter-sink', {
                production: production.name,
                sink:'JsonArrayFileSystemSink',
            });
            var batch = [];
            var batchCount = 0;
            var batchSize = 0;
            jsonFile.readFile(source.configuration.filename, function (anError, aTupleStream) {
                if (anError) {
                    production.logger.log('error', 'sink', {
                        production: production.name,
                        sink:'JsonArrayFileSystemSink',
                        error:JSON.stringify(anError)
                    });
                    aCallback(anError)
                }

                else {
                    if (batchSize === 0)
                        if (source.configuration.batchSize > aTupleStream.length)
                            batchSize = aTupleStream.length;
                        else
                            batchSize = source.configuration.batchSize;


                    for (docCount = 0; docCount < aTupleStream.length; docCount++) {

                        if (batchCount < batchSize) {
                            batch.push(aTupleStream[docCount]);
                            batchCount++;
                        }

                        else if ((docCount < aTupleStream.length - source.configuration.batchSize)) {
                            batchCount = 0;
                            processsProduction(aProduction, batch,
                                function (anError, aResult) {
                                    if (anError)
                                        console.log('fault: ' + JSON.stringify(anError));
                                    else {
                                        batch = [];
                                        console.log('successfully batched:' + aResult);
                                        production.logger.log('info', 'sink', {
                                            production: production.name,
                                            sink:'JsonArrayFileSystemSink',
                                            status:'successful',
                                            reason:'successfully batched '+aTupleStream.length+' tuples',
                                            more:'releasing semphore'
                                        });

                                        source.countingSemphore.leave();
                                    }
                                })


                        }
                        //check for last batch...
                        else if (true) {
                            batchCount = 0;
                            processsProduction(aProduction, batch,
                                function (anError, aResult) {
                                    if (anError)
                                        console.log('fault: ' + JSON.stringify(anError));
                                    else {
                                        batch = [];
                                        console.log('successfully batching last batch:' + aResult);
                                        production.logger.log('info', 'sink', {
                                            production: production.name,
                                            sink:'JsonArrayFileSystemSink',
                                            status:'successful',
                                            reason:'successfully batched last batch '+aTupleStream.length+' tuples',
                                            more:'releasing semphore'
                                        });
                                        source.countingSemphore.leave();
                                    }
                                })


                        }


                        else {
                            batchCount = 0;
                            processsProduction(aProduction, batch,
                                function (anError, aResult) {
                                    if (anError)
                                        console.log('fault: ' + JSON.stringify(anError));
                                    else {
                                        batch = [];
                                        console.log('successfully batched:' + aResult);
                                        source.countingSemphore.leave();
                                    }
                                })


                        }

                    }
                }
            })


        }

    }
    exports.module = source;
})
();
