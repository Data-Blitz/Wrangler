/*
 Copyright (c) Bright Peak Financial, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Bright Peak Financial, Inc. (BPF)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users of Bright Peak Financial.
 */
(function () {

    var elasticsearch = require('elasticsearch');
    //var Merge = require('merge'), original, cloned;
    var _ = require('underscore')

/*
{
    "query": {
        "match" : {
            "userid" : "12d14e6a-7f07-4a55-a3ee-a6e4b49423b2"
        }
    }
}
 */

    function createReferenceBulkQuery(aTupleStream) {
        var body = [];
        searchIndexAndType = {index: wrangler.configuration.referenceIndex, type: wrangler.configuration.referenceType};
        for (i = 0; i < aTupleStream.length; i++) {
            var search = {};
            query = {};
            match = {};
            match[wrangler.configuration.referenceSearchKey] = {};
            match[wrangler.configuration.referenceSearchKey] = aTupleStream[i][wrangler.configuration.referenceKey];
            search['query'] = match
            body.push(searchIndexAndType);
            body.push(search)

       /*
           "query": {
        "match" : {
            "userid" : "12d14e6a-7f07-4a55-a3ee-a6e4b49423b2"
        }
    }
        */



        }
        return body;
    }

    var wrangler = {

        configuration: undefined,
        self: undefined,
        client: undefined,

        merge: function (aTupleStream, aReferenceStream) {
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

            if (aTupleStream)
                if (aTupleStream.length > 0) {
                    var tuples = [];
                    var bulkSearch = createReferenceBulkQuery(aTupleStream)
                    wrangler.client.msearch({
                        body: bulkSearch
                    }, function (anError, aResult) {
                        if (anError) {
                            production.logger.log('error', 'wrangler', {
                                production: production.name,
                                wrangler: "MergeDocument",
                                reason:"tupleStream is missing"
                            });
                            aSinkCallback(anError)
                        }
                        else {
                            tuples = wrangler.merge(aTupleStream, aResult.responses)
                            aSinkCallback(null, tuples);
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









