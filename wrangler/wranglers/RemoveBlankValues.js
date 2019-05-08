/*
 Copyright (c) Bright Peak Financial, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Bright Peak Financial, Inc. (BPF)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users of Bright Peak Financial.
 */
(function () {


    function removeBlanks(aTuple) {
        if (aTuple) {
            keys = Object.keys(aTuple)
            if (keys)
                for (i = 0; i < keys.length; i++)
                    if (aTuple[keys[i]] === "")
                        delete aTuple[keys[i]]
        }
        return aTuple;
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
                wrangler: 'RemoveBlankValues'
            });
            tupleStream = [];
            if (aTupleStream)
                if (aTupleStream.length > 0) {
                    for (tupleIndex = 0; tupleIndex < aTupleStream.length; tupleIndex++)
                        tupleStream.push(removeBlanks(aTupleStream[i]));

                    production.logger.log('info', 'exit-wrangler', {
                        production: production.name,
                        wrangler: "RemoveBlankValues"
                    });
                    aSinkCallback(null, tupleStream);
                }
                else aSinkCallback('tupleStream empty');
            else
                aSinkCallback('no tupleStream')
        }
    }
    exports.module = wrangler;
})();


