/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */

console.log('argv:' + process.argv);
var async = require('async');
var configuration = require(process.argv[2]);
/*
The starting runtime of the Data-Blitz-Wrangler
*/

for (productionIndex = 0; productionIndex < configuration.productions.length; productionIndex++) {
    production = configuration.productions[productionIndex];
    loggerConfiguration = configuration.productions[productionIndex].logger;
    logger = require(loggerConfiguration.loggerImpl);
    production['logger'] = logger;
    productionStack = [];
    production._id = 4;
    production.logger.log('info', 'starting-production', {
        production: production.name
    });
    for (wranglerIndex = 0;
         wranglerIndex < configuration.productions[productionIndex].wranglers.length;
         wranglerIndex++) {
        wrangler = configuration.productions[productionIndex].wranglers[wranglerIndex];
        wranglerImpl = require(wrangler.wranglerImpl);
        wranglerImpl.module.init(wrangler.configuration)
        productionStack.push(wranglerImpl.module.execute)// push execute function of implementation runs in series
    }

    sink = production.sink;
    sinkImpl = require(sink.sinkImpl).module;
    production.logger.log('info', 'wrangler-main', {
        production: production.name
    });
    sinkImpl.init(sink.configuration);
    productionStack.push(sinkImpl.execute)
    source = production.source;
    sourceImpl = require(source.sourceImpl).module;
    sourceImpl.init(source.configuration);


    production.logger.log('info', 'wrangler-main-production-stack', {
        production: production.name,
        stack: JSON.stringify(JSON.stringify(productionStack))
    });
    sourceImpl.execute(productionStack,
        function (anError, aResult) {
            if (anError) {
                production.logger.log('info', 'wrangler-main', {
                    production: production.name,
                    status: "faulted",
                    error: JSON.stringify(anError)
                });
            }
            else {
                production.logger.log('info', 'wrangler-main', {
                    production: production.name,
                    status: "successful"
                });
            }
        });

}

