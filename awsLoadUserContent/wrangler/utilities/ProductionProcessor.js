/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */



(function () {

    var async = require('async');

    var processor = {
        processsProduction: function (aProduction, aBatchTupleStream, aCountingSemphore, aSpout, aBatchCallback) {
            aCountingSemphore.take(
                function () {
                    setTimeout(function () {

                        var productionStack = []; //reset
                        for (i = 0; i < aProduction.length; i++) {
                            productionStack[i + 1] = aProduction[i]
                        }
                        /*
                         Inject the spout with this Batch stream (i.e. aBatchTupleStream)
                         */
                        aSpout.setStream(aBatchTupleStream)
                        /*
                         Load newly injected spout onto the top Production stack
                         */
                        productionStack[0] = aSpout.toStream //above function to stack
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
    }
    exports.module = processor;
})();
