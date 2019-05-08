/*
 Copyright (c) Bright Peak Financial, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Bright Peak Financial, Inc. (BPF)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users of Bright Peak Financial.
 */
(function () {

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
                wrangler: "WranglerTemplate"
            });
            if (aTupleStream)
                if (aTupleStream.length > 0) {
                    production.logger.log('info', 'exit-wrangler', {
                        production: production.name,
                        wrangler: "WranglerTemplate"
                    });
                    aSinkCallback(null, aTupleStream);
                }
                else {
                    production.logger.log('error', 'wrangler', {
                        production: production.name,
                        wrangler: "WranglerTemplate",
                        "status":"fault",
                        "reason":'tupleStreamEmpty'
                    });
                    aSinkCallback('tupleStream empty');
                }
            else {
                production.logger.log('error', 'wrangler', {
                    production: production.name,
                    wrangler: "WranglerTemplate",
                    "status":"fault",
                    "reason":'tupleStreamEmpty'
                });
                aSinkCallback('no tupleStream');
            }
        }
    }
    exports.module = wrangler;
})();


