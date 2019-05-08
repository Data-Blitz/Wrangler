(function () {

    var elasticsearch = require('elasticsearch');

    function createBulk(aTupleStream, aBulkAction, aBulkSize, anIdAttributeName) {
        batch = []
        for (documentIndex = 0; documentIndex < aBulkSize; documentIndex++) {
            batchDirective = {};
            batchDirective[aBulkAction] = {};
            batchDirective[aBulkAction]['_index'] = wrangler.configuration.sinkIndex;
            batchDirective[aBulkAction]['_type'] = wrangler.configuration.sinkType;
            if (anIdAttributeName !== null)
                batchDirective[aBulkAction]['_id'] = aTupleStream[documentIndex][anIdAttributeName];
            batch.push(batchDirective);
            batch.push(aTupleStream[documentIndex]);
        }
        return batch;
    }

    var wrangler = {
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
            production.logger.log('info', 'enter-wrangler', {
                production: production.name,
                wrangler:'SinkElasticSearchWrangler',
                tupleStreamSize : aTupleStream.length
            });
            bulkSize = aTupleStream.length;

            bulk = createBulk(aTupleStream, wrangler.configuration.bulkAction,
                aTupleStream.length, wrangler.configuration._idAttributeName);
            wrangler.client.bulk({
                body: bulk
            }, function (anError, aResult) {
                if (anError) {
                    production.logger.log('error', 'wrangler', {
                        production: production.name,
                        wrangler:'SinkElasticSearchWrangler',
                        tupleStreamSize : aTupleStream.length,
                        error:JSON.stringify(anError)
                    });
                    aSinkCallback(anError)
                }
                else {
                    production.logger.log('info', 'exit-wrangler', {
                        production: production.name,
                        wrangler:'SinkElasticSearchWrangler',
                        tupleStreamSize : aTupleStream.length,
                        more:JSON.stringify(aResult)
                    });
                    aSinkCallback(null, aTupleStream);
                }
            });
        }
    }
    exports.module = wrangler;
})();

