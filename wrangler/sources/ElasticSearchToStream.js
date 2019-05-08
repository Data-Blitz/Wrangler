/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */

(function () {

    var elasticsearch = require('elasticsearch');
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
            self.configuration = aConfiguration;
            self.client = new elasticsearch.Client({
                host: aConfiguration.host
            });


        },

        execute: function (aProduction, aCallback) {
            production.logger.log('info', 'enter-source', {
                production: production.name,
                sink: 'ElasticSearchToStream',
            });
            var batch = [];
            var batchCount = 0;
            var batchSize = 0;


            source.client.count({
                index:source.configuration.sourceIndex,
                type:source.configuration.sourceType
            }, function(anError, aCount){
                if (anError) {
                    production.logger.log('error', 'source', {
                        production: production.name,
                        sink:'ElasticSearchSink',
                        tupleStreamSize : aTupleStream.length,
                        error:JSON.stringify(anError)
                    });
                }
                else {
                    production.logger.log('info', 'sink', {
                        production: production.name,
                        sink:'ElasticSearchSink',
                        index:source.configuration.sourceIndex,
                        type:source.configuration.sourceType,
                        count:JSON.stringify(aCount.count)
                    });
                }
            })




            /*
                        sink.client.bulk({
                body: bulk
            }, function (anError, aResult) {
                if (anError) {
                    production.logger.log('error', 'sink', {
                        production: production.name,
                        sink:'ElasticSearchSink',
                        tupleStreamSize : aTupleStream.length,
                        error:JSON.stringify(anError)
                    });
                    aSinkCallback(anError)
                }
                else {
                    production.logger.log('info', 'exit-sink', {
                        production: production.name,
                        sink:'ElasticSearchSink',
                        tupleStreamSize : aTupleStream.length,
                        more:JSON.stringify(aResult)
                    });
                    aTupleStream = null;
                    aSinkCallback(null, aResult);
                }

            });
             */


        }

    }
    exports.module = source;
})
();
