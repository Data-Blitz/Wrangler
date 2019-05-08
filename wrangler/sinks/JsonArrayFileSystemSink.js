(function () {
    var jsonfile = require('jsonfile')
    var elasticsearch = require('elasticsearch');
    var uploadedDocument = 0;
    var fileCount = 0;
    var totalCount = 0;

    /*
     Create ElasticSearch Bulk Request Data Structure

     See: https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-bulk
     */


    var sink = {
        self: undefined,
        configuration: undefined,
        client: undefined,

        init: function (aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
        },

        execute: function (aTupleStream, aSinkCallback) {
            production.logger.log('info', 'enter-sink', {
                production: production.name,
                sink: 'JsonArrayFileSystemSink',
                tupleStreamSize: aTupleStream.length
            });

            totalCount = totalCount + aTupleStream.length;

            jsonfile.writeFile(sink.configuration.fileName + fileCount++ + '.json', aTupleStream,
                function (anError, aResult) {
                    if (anError) {
                        production.logger.log('error', 'error-sink', {
                            production: production.name,
                            sink: 'JsonArrayFileSystemSink',
                            tupleStreamSize: aTupleStream.length,
                            batchNumber: fileCount,
                            total: totalCount
                        });
                    }
                    else {
                        production.logger.log('info', 'write-sink', {
                            production: production.name,
                            sink: 'JsonArrayFileSystemSink',
                            tupleStreamSize: aTupleStream.length,
                            batchNumber: fileCount,
                            total: totalCount
                        });
                    }
                })
        }
    }

    exports.module = sink;

})();

