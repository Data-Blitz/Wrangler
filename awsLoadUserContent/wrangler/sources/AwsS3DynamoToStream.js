/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */


(function () {
    var async = require('async');
    var _ = require('underscore')
    var s3TailStream = require('..'), moment = require('moment');
    var spout = require('../spouts/ToTupleStream.js').module;
    var productionProcessor = require('../utilities/ProductionProcessor.js').module;


    function readTuples(aConfiguration, aCallback) {
        jsonFile.readFile(aConfiguration.filename, function (anError, aTupleStream) {
            if (anError) {
                aCallback(anError)
            }
            else
                aCallback(null, aTupleStream);
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
                source: "CemplateToStream.js"
            });
            readTuples(source.configuration, function (anError, aTupleStream) {
                if (anError)
                    console.log(anError)
                else {
                    console.log(aTupleStream);
                    batch = []
                    // send it in one batch
                    if (aTupleStream.length < source.configuration.batchSize) {
                        batch = aTupleStream;
                        productionProcessor.processsProduction(aProduction, batch, source.countingSemphore , spout,
                            function(anError, aResult){
                                source.countingSemphore.leave();
                                aCallback(null, "a ok")
                            })
                    }
                    //send it in multiple batches
                    else {
                        //break the TupleStream into individual batches
                        for (tupleStreamIndex = 0; tupleStreamIndex < aTupleStream.length; tupleStreamIndex++) {
                            batch.push(aTupleStream[tupleStreamIndex])
                            if (batch.length === source.configuration.batchSize) {
                                productionProcessor.processsProduction(aProduction, batch, source.countingSemphore , spout,
                                    function(anError, aResult){
                                        source.countingSemphore.leave();
                                    })
                            }
                            else if ((aTupleStream.length - tupleStreamIndex) < source.configuration.batchSize) {
                                productionProcessor.processsProduction(aProduction, batch, source.countingSemphore , spout,
                                    function(anError, aResult){
                                        source.countingSemphore.leave();
                                        aCallback(null,"a ok")
                                    })
                            }
                        }
                    }


                    //batch them out

                }
            })

        }
    }
    exports.module = source;
})
();


