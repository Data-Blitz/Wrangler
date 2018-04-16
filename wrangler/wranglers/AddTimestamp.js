/*
 Copyright (c) Bright Peak Financial, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Bright Peak Financial, Inc. (BPF)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users of Bright Peak Financial.
 */
(function () {

    function createTimestamp(aFormat) {
        now = new Date();
        timestamp = undefined;
        if (aFormat === 'ISO')
            timestamp = now.toISOString()
        else if (aFormat === 'UTC')
            timestamp = now.toUTCString();
        else if (aFormat === 'TIME')
            timestamp = now.getTime();
        return timestamp;
    }

    var wrangler = {
        configuration: undefined,
        self: undefined,

        init: function (aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
        },
        execute: function (aTupleStream, aSinkCallback) {
            production.logger.log('info', 'enter-wrangler', {
                production: production.name,
                wrangler: "AddTimestamp"
            });
            tupleStream = aTupleStream
            if (tupleStream)
                if (tupleStream.length > 0) {
                    for (tupleIndex = 0; tupleIndex < tupleStream.length; tupleIndex++)
                        tupleStream[tupleIndex][wrangler.configuration.timestampAttributeName] =
                            createTimestamp(wrangler.configuration.format)

                    production.logger.log('info', 'exit-wrangler', {
                        production: production.name,
                        wrangler: "AddTimestamp"
                    });
                    aSinkCallback(null, tupleStream);
                }
                else  aSinkCallback('tupleStream empty');
            else
                aSinkCallback('no tupleStream')
        }
    }
    exports.module = wrangler;
})();


