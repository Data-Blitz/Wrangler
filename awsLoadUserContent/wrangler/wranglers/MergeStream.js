/*
 Copyright (c) Bright Peak Financial, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Bright Peak Financial, Inc. (BPF)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users of Bright Peak Financial.
 */
(function () {

    var elasticsearch = require('elasticsearch');
    var merge = require('merge'), original, cloned;
    var _ = require('underscore')


    function resolveAttribute(anUnResolveAttribute) {
        resolvedAttribute = {};
        resolvedAttribute[anUnResolveAttribute.attributename] = anUnResolveAttribute.attributevalue;
        return resolvedAttribute;
    }

    function createMergeInputMap(aMergeInputStream) {
        map = {};
        for (i = 0; i < aMergeInputStream.length; i++) {
            mergeStreamDocument = aMergeInputStream[i];
            if (mergeStreamDocument[streamReferenceId])
                map[streamReferenceId] = resolveAttribute(mergeStreamDocument);
        }
        return map;
    }


    function getReferenceIds(anIdAttributeName, aReferenceStream) {
        var referenceIds = [];
        for (i = 0; i < aReferenceStream.length; i++)
            if (aReferenceStream[i][anIdAttributeName])
                referenceIds.push(aReferenceStream[i][anIdAttributeName]);
        return referenceIds;
    }

    function mergeBatch(aTupleStream, aReferenceStream) {
        var mergeGrid = {};
        var mergeStream = [];

        for (i = 0; i < aTupleStream.length; i++) {
            if (!mergeGrid[aTupleStream[i][wrangler.configuration.streamReferenceId]]) {
                mergeGrid[aTupleStream[i][wrangler.configuration.streamReferenceId]] = [];
                mergeGrid[aTupleStream[i][wrangler.configuration.streamReferenceId]].push(resolveAttribute(aTupleStream[i]))
            }
            else
                mergeGrid[aTupleStream[i][wrangler.configuration.streamReferenceId]].push(resolveAttribute(aTupleStream[i]))
        }

        for (j = 0; j < aReferenceStream.length; j++) {

            if (aReferenceStream[j].found) {
                mergedDocument = aReferenceStream[j]._source;
             console.log('doc#:' + j )
                id = mergedDocument[wrangler.configuration.streamReferenceId]
                attributes = {}
                mergeAttributes = mergeGrid[id];
                if (mergeAttributes) {
                    for (k = 0; k < mergeAttributes.length; k++)
                        attributes = merge(attributes, mergeAttributes[k])
                    //delete mergeGrid[id]
                    mergedDocument[wrangler.configuration.mergedAttributesName] = attributes;
                    mergeStream.push(mergedDocument);
                }
            }
        }
        return mergeStream;
    }

    /*
     configuration = {
     "referenceIndex": "wrangled-users",
     "referenceType": "user",
     "streamReferenceId": "userid",
     "mergedAttributesName": "attributes"
     }

     */
    var wrangler = {

        configuration: undefined,
        self: undefined,
        client: undefined,

        init: function (aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
            self.client = new elasticsearch.Client({
                host: aConfiguration.host
            });
        },

        execute: function (aTupleStream, aSinkCallback) {
            console.log('executing MergeDocument.js')
            if (aTupleStream)
                if (aTupleStream.length > 0) {
                    referenceIds = getReferenceIds(wrangler.configuration.streamReferenceId, aTupleStream);
                    wrangler.client.mget({
                        index: wrangler.configuration.referenceIndex,
                        type: wrangler.configuration.referenceType,
                        body: {
                            ids: referenceIds
                        }
                    }, function (anError, aReferenceStream) {
                        if (anError)
                            aSinkCallback(anError);

                        else {
                            mergeBatch(aTupleStream, aReferenceStream.docs)
                            aSinkCallback(null, mergeBatch(aTupleStream, aReferenceStream.docs))
                            /*                          mergedStream = [];
                             for (docIndex = 0; docIndex < aReferenceStream.docs.length; docIndex++) {
                             resolvedAttribute = resolveAttribute(aTupleStream[docIndex]);
                             mergedStream[docIndex] = merge(aReferenceStream.docs[docIndex]._source, resolvedAttribute);
                             //console.log( mergedStream[docIndex])
                             }
                             aSinkCallback(null, mergedStream)*/
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










