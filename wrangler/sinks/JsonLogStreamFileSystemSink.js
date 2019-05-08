(function () {
    fs = require('fs')
    var sink = {
        self: undefined,
        configuration: undefined,
        client: undefined,

        init: function (aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
        },

        execute: function (aTupleStream, aSinkCallback) {
            tupleIndex : undefined;
            production.logger.log('info', 'enter-sink', {
                production: production.name,
                sink: 'JsonLogStreamFileSystemSink',
                tupleStreamSize: aTupleStream.length
            });

            for (tupleIndex = 0; tupleIndex < aTupleStream.length; tupleIndex++)
                fs.appendFile(sink.configuration.fileName, JSON.stringify(aTupleStream[tupleIndex]) + '\n',
                    function (anError, aResult) {
                        if (anError) {
                            production.logger.log('error', 'error-sink', {
                                production: production.name,
                                sink: 'JsonLogStreamFileSystemSink',
                                tupleStreamSize: aTupleStream.length
                            })
                        }
                        else {
                            production.logger.log('info', 'write-sink', {
                                production: production.name,
                                sink: 'JsonLogStreamFileSystemSink',
                                tupleStreamSize: aTupleStream.length
                            })
                        }
                    });
        }
    }
   exports.module = sink;
})();

