/*
 Copyright (c) Bright Peak Financial, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Bright Peak Financial, Inc. (BPF)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users of Bright Peak Financial.
 */
(function () {

    var _ = require('underscore');

    var mustHave = function (aTupleStream, aMustHaveList) {
        passedTupleStream = [];
        for (i = 1; i < aTupleStream.length; i++) {
            attributeNames = _.keys(aTupleStream[i])
            good = true;
            for (j = 0; j < aMustHaveList.length; j++) {
                good = true;
                position = _.indexOf(attributeNames, aMustHaveList[j]);
                if (position < 0) {
                    j = aMustHaveList.length;
                    good = false;
                }
            }
            if (good)
                passedTupleStream.push(tupleStream[i])
        }
        return passedTupleStream
    }


    var wrangler = {
        configuration: undefined,
        self: undefined,

        init: function (aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
        },

        execute: function (aTupleStream, aSinkCallback) {
            console.log('executing MustHave Wrangler')
            if (aTupleStream)
                if (aTupleStream.length > 0) {

                    aSinkCallback(null, mustHave(aTupleStream, wrangler.configuration.mustHave));
                }
                else  aSinkCallback('tupleStream empty');
            else
                aSinkCallback('no tupleStream')
        }
    }
    exports.module = wrangler;
})
();


