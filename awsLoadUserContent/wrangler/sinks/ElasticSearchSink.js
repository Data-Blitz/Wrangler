(function () {

    var elasticsearch = require('elasticsearch');
    //var uploadedDocument = 0;

    /*
     Create ElasticSearch Bulk Request Data Structure

     See: https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-bulk
     */

    function createBulk(aTupleStream, aBulkAction, aBulkSize, anIdAttributeName) {
        batch = []
        for (documentIndex = 0; documentIndex < aBulkSize; documentIndex++) {
            batchDirective = {};
            batchDirective[aBulkAction] = {};
            batchDirective[aBulkAction]['_index'] = sink.configuration.sinkIndex;
            batchDirective[aBulkAction]['_type'] = sink.configuration.sinkType;
            if (anIdAttributeName !== null)
                batchDirective[aBulkAction]['_id'] = aTupleStream[documentIndex][anIdAttributeName];
            batch.push(batchDirective);
            batch.push(aTupleStream[documentIndex]);
        }
        return batch;
    }

    var sink = {
        self: undefined,
        configuration: undefined,
        client: undefined,


        init: function (aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
            self.client = new elasticsearch.Client({
                host: aConfiguration.host
            });
        },

        execute: function (aTupleStream, aSinkCallback) {
            production.logger.log('info', 'enter-sink', {
                production: production.name,
                sink:'ElasticSearchSink',
                tupleStreamSize : aTupleStream.length
            });
            bulkSize = aTupleStream.length;

            bulk = createBulk(aTupleStream, sink.configuration.bulkAction, aTupleStream.length, sink.configuration._idAttributeName);
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
        }
    }

    exports.module = sink;

})();

