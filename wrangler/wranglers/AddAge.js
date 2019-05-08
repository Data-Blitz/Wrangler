/*
 Copyright (c) Bright Peak Financial, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Bright Peak Financial, Inc. (BPF)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users of Bright Peak Financial.
 */
(function () {

    function getAge(dateString) {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    var wrangler = {
        configuration: undefined,
        self: undefined,
        init: function (aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
        },
        execute: function (aTupleStream, aSinkCallback) {
            console.log('executing AddAge')
            tupleStream = aTupleStream
            if (aTupleStream)
                if (aTupleStream.length > 0) {
                    for (tupleIndex = 0; tupleIndex < aTupleStream.length; tupleIndex++)
                        if (aTupleStream[tupleIndex][wrangler.configuration.dobAttributeName]) {
                            aTupleStream[tupleIndex][wrangler.configuration.ageAttributeName] = getAge(aTupleStream[tupleIndex][wrangler.configuration.dobAttributeName])
                            if (wrangler.configuration.generations) {

                            }
                        }


                    aSinkCallback(null, aTupleStream)
                }
                else
                    aSinkCallback('tupleStream empty')
            else
                aSinkCallback('tupleStream empty')
        }
    }
    exports.module = wrangler;
})();
