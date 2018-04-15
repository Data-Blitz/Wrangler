/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */


(function () {
    const csv = require('csvtojson')

    var async = require('async');
    var _ = require('underscore')
    var spout = require('../spouts/ToTupleStream.js').module;

    function processsProduction(aProduction, aBatchTupleStream, aBatchCallback) {
        source.countingSemphore.take(
            function () {
                setTimeout(function(){

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
                    productionStack[0] = spout.toStream //above function to stack
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
        logger: undefined,

        init: function init(aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
            self.countingSemphore = require('semaphore')(self.configuration.maxNumberOfOutstandingBatches);
        },

        execute: function (aProduction, aCallback) {
            production.logger.log('info', 'enter-source', {
                production: production.name,
                source: "CsvFileToStream"
            });
            var batch = [];
            var batchCount = 0;

            parameters  = {}

            if (source.configuration.columnNames) {
                parameters['noheader'] = true;
                parameters['headers'] = source.configuration.columnNames;
            }
            csv(parameters)
            /*
             Read and convert csv rows into JSON object
             */
                .fromFile(source.configuration.filename)
                /*
                 Load translated JSON object into Batch Array Buffer
                 */
                .on('json', function (aDocument) {
                    /*
                     Batch buffer not filled, keep loading
                     */
                    if (batchCount < source.configuration.batchSize) {
                        batch.push(aDocument);
                        batchCount++;
                    }
                    /*
                     Batch buffer filled, pass the Batch buffer to be to be processed
                     */
                    else {
                        //console.log('batching:' + batchCount + ' documents for processing');
                        batchCount = 0;
                        processsProduction(aProduction, batch,
                            function (anError, aResult) {
                                if (anError)
                                    console.log('fault: ' + JSON.stringify(anError));
                                else {
                                    //console.log('successfully batched:' + aResult);
                                    batch = [];
                                    production.logger.log('info', 'exit-source', {
                                        production: production.name,
                                        source: "CsvFileToStream"
                                    });
                                    source.countingSemphore.leave();
                                }
                            })
                        batch = []
                    }
                })
                .on('error', function (anError) {
                    aCallback(JSON.stringify(anError))
                })
                .on('done', function () {
                    processsProduction(aProduction, batch,
                        function (anError, aResult) {
                            if (anError)
                                console.log("fault: " + JSON.stringify(anError));
                            else {
                                production.logger.log('info', 'exit-source', {
                                    production: production.name,
                                    source: "CsvFileToStream",
                                    more:"lastBatch"
                                });
                                batch = [];
                                aCallback(null, 'success all done: ' + JSON.stringify(aResult))
                            }
                        })
                })
        }
    }
    exports.module = source;
})
();
