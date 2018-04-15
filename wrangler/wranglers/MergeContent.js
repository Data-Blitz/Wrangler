/*
 Copyright (c) Bright Peak Financial, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Bright Peak Financial, Inc. (BPF)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users of Bright Peak Financial.
 */
(function () {
    var elasticsearch = require('elasticsearch');
    var _ = require('underscore')

    function resolveAttribute(anUnResolveAttribute) {
        resolvedAttribute = {};
        resolvedAttribute[anUnResolveAttribute.attributename] = anUnResolveAttribute.attributevalue;
        return anUnResolveAttribute;
    }

    function createReferenceBulkQuery(aTupleStream) {
        var body = [];
        searchIndexAndType = {index: wrangler.configuration.referenceIndex, type: wrangler.configuration.referenceType};
        for (i = 0; i < aTupleStream.length; i++) {
            var search = {};
            term = {};
            term[wrangler.configuration.referenceSearchKey] = {};
            term[wrangler.configuration.referenceSearchKey] = aTupleStream[i][wrangler.configuration.referenceKey];
            search['from']= 0;
            search['size']= 450;
            search['query'] = {};
            search['query']['term'] = term;
            body.push(searchIndexAndType);
            body.push(search)
        }
        return body;
    }

    var wrangler = {

        configuration: undefined,
        self: undefined,
        client: undefined,

        merge: function (aTupleStream, aReferenceStream) {
            production.logger.log('info', 'merge-wrangler', {
                production: production.name,
                wrangler: "MergeContent",
                tupleStreamSize:aTupleStream.length,
                referenceStreamSize:aReferenceStream.length
            });
            if ((aTupleStream.length) === (aReferenceStream.length))
                for (i = 0; i < aTupleStream.length; i++) {
                    if (aReferenceStream[i].hits.hits.length > 0) {
                        attributes = [];
                        for (j = 0; j < aReferenceStream[i].hits.hits.length; j++)
                            attributes.push(aReferenceStream[i].hits.hits[j]._source);
                        aTupleStream[i][wrangler.configuration.mergeKey] = attributes
                    }
                }
            return aTupleStream;
        },


        init: function (aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
            self.client = new elasticsearch.Client(
                {
                    host: aConfiguration.host
                });
        },

        execute: function (aTupleStream, aSinkCallback) {
            production.logger.log('info', 'enter-wrangler', {
                production: production.name,
                wrangler: "MergeContent",
                tupleStreamSize:aTupleStream.length
            });
            if (aTupleStream)
                if (aTupleStream.length > 0) {
                    var tuples = [];
                    var bulkSearch = createReferenceBulkQuery(aTupleStream)
                    wrangler.client.msearch({
                        body: bulkSearch
                    }, function (anError, aResult) {
                        if (anError) {
                            production.logger.log('error', 'error-wrangler', {
                                production: production.name,
                                wrangler: "MergeContent",
                                reason:"error searching for reference stream"
                            });
                            aSinkCallback(anError)
                        }
                        else {
                            tuples = wrangler.merge(aTupleStream, aResult.responses)
                            production.logger.log('info', 'exit-wrangler', {
                                production: production.name,
                                wrangler: "MergeContent",
                                tupleStreamSize:aTupleStream.length
                            });
                            aSinkCallback(null, tuples);
                        }
                    });

                }
                else {
                    production.logger.log('error', 'wrangler', {
                        production: production.name,
                        wrangler: "MergeContent",
                        reason:"empty tuple stream"
                    });
                    aSinkCallback('tupleStream empty');
                }
            else {
                production.logger.log('error', 'wrangler', {
                    production: production.name,
                    wrangler: "MergeContent",
                    reason:"tupleStream is missing"
                });
                aSinkCallback('tupleStream is missing');
            }
        }
    }
    exports.module = wrangler;
})


();









