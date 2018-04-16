/*
 Copyright (c) Bright Peak Financial, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Bright Peak Financial, Inc. (BPF)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users of Bright Peak Financial.
 */
(function () {

    var elasticsearch = require('elasticsearch');
    var Merge = require('merge'), original, cloned;
    var _ = require('underscore')

    function resolveAttribute(anUnResolveAttribute) {
        resolvedAttribute = {};
        resolvedAttribute['assessmentname'] = anUnResolveAttribute.assessmentname;
        resolvedAttribute[anUnResolveAttribute.attributename] = anUnResolveAttribute.attributevalue;
        resolvedAttribute['creationdatetime'] = anUnResolveAttribute.createdatetime;


        return resolvedAttribute;
    }

    function createReferenceBulkQuery(aTupleStream) {
        var body = [];
        searchIndexAndType = {index: wrangler.configuration.referenceIndex, type: wrangler.configuration.referenceType};
        for (i = 0; i < aTupleStream.length; i++) {
            var search = {};
            term = {};
            term[wrangler.configuration.referenceSearchKey] = {};
            term[wrangler.configuration.referenceSearchKey] = aTupleStream[i][wrangler.configuration.referenceKey];
            search['query'] = {};
            search['from']= 0;
            search['size']= 500;
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

        combine: function (aTupleStream, aReferenceStream) {
            if ((aTupleStream.length) === (aReferenceStream.length))

            //reference = _.indexBy(aReferenceStream,'')


                for (i = 0; i < aTupleStream.length; i++) {
                    var attributes = {};
                    //console.log('loading '+aReferenceStream[i].hits.hits.length+' attributes')
                    if (aReferenceStream[i].hits.hits.length > 0) {
                        for (j = 0; j < aReferenceStream[i].hits.hits.length; j++)
                            attributes = Merge(attributes, resolveAttribute(aReferenceStream[i].hits.hits[j]._source))
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
            production.logger.log('info', 'exit-wrangler', {
                production: production.name,
                wrangler: "MergeAttributeContent",
                tupleStreamSize:aTupleStream.length
            });
            if (aTupleStream)
                if (aTupleStream.length > 0) {
                    var tuples = [];
                    var bulkSearch = createReferenceBulkQuery(aTupleStream)
                    wrangler.client.msearch({
                        body: bulkSearch
                    }, function (anError, aResult) {
                        if (anError)
                            aSinkCallback(anError)
                        else {
                            wrangledTuples = wrangler.combine(aTupleStream, aResult.responses)
                            production.logger.log('debug', 'debug-wrangler', {
                                production: production.name,
                                wrangler: "MergeAttributeContent",
                                tupleStreamSize:aTupleStream.length,
                                referenceCount:aResult.responses.length
                            });
                            aSinkCallback(null, wrangledTuples);
                        }
                    });
                }
                else
                    aSinkCallback('no tupleStream');
            else
                aSinkCallback('tupleStream empty');
        }
    }
    exports.module = wrangler;
})


();









