/*
 Copyright (c) Bright Peak Financial, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Bright Peak Financial, Inc. (BPF)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users of Bright Peak Financial.
 */
(function () {



        function translateList(aTupleList) {
            var tupleList = [];

            for (i = 0; i < aTupleList; i++) {
                rawAttribute = aTupleList[i]

                if (rawAttribute.S)
                    tupleList.push(rawAttribute.S)

                else if (rawAttribute.BOOL)
                    tupleList.push(rawAttribute.BOOL)

                else if (rawAttribute.N)
                    tupleList.push(rawAttribute.rawAttribute.N)

                else if (rawAttribute.M)
                    tupleList.push(translate(rawAttribute.M));

                else if (rawAttribute.L)
                    tupleList.push(translate(translateList(rawAttribute.L)));

                else if (rawAttribute.NULL)
                    tupleList.push('missing-date')

                else
                    console.log('cannot translate type'+JSON.stringify(rawAttribute))
            }
            return tupleList;
        }



        function translate(aTuple) {
            var tuple = {};
            attributeNames = Object.keys(aTuple);
            for (i = 0; i < attributeNames.length; i++) {

                rawAttribute = aTuple[attributeNames[i]]

                if (rawAttribute.S)
                        tuple[attributeNames[i]] = rawAttribute.S

                else if (rawAttribute.BOOL)
                    tuple[attributeNames[i]] = rawAttribute.BOOL

                else if (rawAttribute.N)
                    tuple[attributeNames[i]] = new Number(rawAttribute.N);
/*
                else if (rawAttribute.M) {
                    tuple[attributeNames[i]] = translate(rawAttribute.M);
                    console.log(JSON.stringify(tuple[attributeNames[i]]));
                }

                else if (rawAttribute.L)
                    tuple[attributeNames[i]] = translateList(rawAttribute.L);*/

                else if (rawAttribute.NULL)
                    tupleList.push('missing-date')

                else
                    console.log('cannot translate type'+JSON.stringify(rawAttribute));
            }
            return tuple;
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
                wrangler: "TranslateFromDynamo"
            });
            tupleStream = aTupleStream
            if (tupleStream)
                if (tupleStream.length > 0) {
                    for (tupleI = 0; tupleI < tupleStream.length; tupleI++) {
                        tupleStream[tupleI] = translate(tupleStream[tupleI]['NewImage']);
                        production.logger.log('info', 'exit-wrangler', {
                            production: production.name,
                            wrangler: "TranslateFromDynamo",
                            "translateTuple":JSON.stringify(tupleStream[tupleI])
                        });
                    }
                    production.logger.log('info', 'exit-wrangler', {
                        production: production.name,
                        wrangler: "TranslateFromDynamo",
                        "info":"callingBack"
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


