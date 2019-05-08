(function () {

    const csv = require('csvtojson')
    var async = require('async');
    var _ = require('underscore')
    var spout = require('../spouts/ToTupleStream.js').module;

    var _source = {
        configuration: null,
        self: null,
        init: init,
        execute: execute
    }

    function processsStack(aProduction, aTupleStream, aCallback) {

        var productionStack = [];

        productionStack[0] = function (aCallback) {
            spout.toStream(aTupleStream, aCallback)
        };
        for (i = 0; i < aProduction.length; i++) {
            productionStack[i+1] =  aProduction[i]
        }
        async.waterfall(productionStack, aCallback);

    }

    exports.module = _source;


    function init(aConfiguration) {
        self = this;
        if (aConfiguration)
            self.configuration = aConfiguration;
    }

    function execute(aProduction, aCallback) {
        console.log('executing CsvFileToStream')
        var batch = [];
        var batchCount = 0;
        var totalCount = 0;
        csv()
            .fromFile(_source.configuration.filename)
            .on('json', function (aRecord) {
                if (batchCount < self.configuration.batchSize) {
                    batch.push(aRecord)
                    batchCount++;
                    totalCount++;
                }
                else {
                    console.log('batch processing:'+ batchCount+' documents of total '+ totalCount);
                    processsStack(aProduction, batch,
                        function (anError, aResult) {
                            if (anError)
                                console.log("fault: " + JSON.stringify(anError));
                            else
                                console.log("success all done: " + JSON.stringify(aResult));
                        })
                }
            })
            .on('error', function () {
                aCallback("error pushing")
            })
            .on('done', function () {
                processsStack(aProduction, batch,
                    function (aError, aResult) {
                        if (aError)
                            console.log("fault: " + JSON.stringify(anError));
                        else
                            console.log("success all done: " + JSON.stringify(aResult));
                    })

            })
    }

})();

/*
 configuration = {
 "filename": "/Users/paul/dataBlitz/workspace/logstash/indexes/vwplatform/heap/data/pageviews.csv",
 "batchSize": 100000
 }

 exports.module.init(configuration);
 exports.module.execute(function(anError, aResult){
 console.log('read:'+aResult.length+' documents');
 });
 */