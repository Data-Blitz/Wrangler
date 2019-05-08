
/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */






(function () {

    var Tail = require('tail').Tail;

    var async = require('async');
    var _ = require('underscore')
    var spout = require('../spouts/ToTupleStream.js').module;

    function processsProduction(aProduction, aBatchTupleStream, aBatchCallback) {
        source.countingSemphore.take(
            function () {
                setTimeout(function () {
                    var productionStack = []; //reset Production

                    for (i = 0; i < aProduction.length; i++) {
                        productionStack[i + 1] = aProduction[i]
                    }
                    //Inject the spout with this Batch stream (i.e. aBatchTupleStream)
                    spout.setStream(aBatchTupleStream)
                    //Load newly injected spout onto the top Production stack
                    productionStack[0] = spout.toStream
                    production.logger.log('info', 'process-production-stack', {
                        production: production.name,
                        source: "TailedJsonLogToStream"
                    });
                    //Process a batch sized tuple stream through Production Stack
                    async.waterfall(productionStack, aBatchCallback);
                    //Reset for next batch
                    aBatchTupleStream = null;
                    //Wait for next processing opportunity
                }, source.configuration.backPressureWaitInMilliseconds);

            })
    }

    var source = {
        configuration: undefined,
        self: undefined,
        logger: undefined,
        tail: undefined,

        init: function init(aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
            self.countingSemphore = require('semaphore')(self.configuration.maxNumberOfOutstandingBatches);
            self.tail = new Tail(self.configuration.tailedFilename);
        },

        execute: function (aProduction, aCallback) {
            production.logger.log('info', 'enter-source', {
                production: production.name,
                source: "TailedJsonLogToStream"
            });
            var batch = [];
            var batchCount = 0;

            source.tail().watch()
                /*
                 Load translated JSON object into Batch Array Buffer
                 */
               source.tail.on('line', function (aDocument) {
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
                                        source: "TailedJsonLogToStream"
                                    });
                                    //source.tail().watch()
                                    source.countingSemphore.leave();
                                }
                            })
                        batch = []

                    }
                })
            source.tail.on('error', function (anError) {
                    production.logger.log('error', 'source', {
                        production: production.name,
                        source: "TailedJsonLogToStream",
                        error:JSON.stringify(anError)
                    });
                    aCallback(JSON.stringify(anError))
                })
        }

    }
    exports.module = source;
})
();
