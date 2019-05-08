/*
 Copyright (c) Bright Peak Financial, Inc. All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Bright Peak Financial, Inc. (BPF)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users of Bright Peak Financial.
 */
(function () {
    //
    // This wrangler computes the real time Persona from a stream of Users
    //
    var elasticsearch = require('elasticsearch');
    var Merge = require('merge'), original, cloned;
    var _ = require('underscore');



    addMatches = function (aTupleStream, aMatchStream) {
        for (i = 0; i < aTupleStream.length; i++) {
            if (aMatchStream[i].hits.hits.length > 0) {
                usersLikeMe = {};
                now = new Date();
                usersLikeMe['createTimestamp'] = now.toUTCString();
                usersLikeMe['users'] = [];
                length = aMatchStream[i].hits.hits.length;
                if (length > 10)
                    length = 10;
                for (j = 0; j < length; j++) {
                    usersLikeMe['users'].push({ userId:aMatchStream[i].hits.hits[j]._source.userid,score:aMatchStream[i].hits.hits[j]._score * .1})
                }
                aTupleStream[i]['usersLikeMe'] = usersLikeMe;
                aTupleStream[i]['usersLikeMe']['winner'] = usersLikeMe.users[0]
            }
        }
        return aTupleStream;
    };


    createPersonaMultiSearchQuery = function (aTupleStream) {
        body = [];
        searchIndexAndType = {index: wrangler.configuration.personaIndex, type: wrangler.configuration.personaType};
        earchIndexAndType = {index: wrangler.configuration.personaIndex};

        for (i = 0; i < aTupleStream.length; i++) {
            queryDsl = {};
            queryDsl['query'] = {};
            queryDsl['query']['bool'] = {};
            queryDsl['query']['bool']['should'] = [];
            attributes = _.pairs(aTupleStream[i].attributes);
            if (attributes.length === 0) {
                //
                // Put in a place holder (i.e. no input to compute persona)
                // insert a search guaranteed to return zero hits as a placeholder
                // to maintain order of searches to tuple streams
                //
                placeHolderQuery = {};
                action = {};
                action['match'] = {"placeHolder": "placeHolder"};
                queryDsl['query']['bool']['should'].push(action);
                body.push(searchIndexAndType);
                body.push(queryDsl)
            }
            else {
                if (aTupleStream[i].gender) {
                    action = {};
                    action['match'] = {"gender": aTupleStream[i].gender}
                    queryDsl['query']['bool']['should'].push(action);
                    //queryDsl['query']['bool']['should'].push(boost)
                }
                if (aTupleStream[i].state) {
                    action['match'] = {"state": aTupleStream[i].state}
                    queryDsl['query']['bool']['should'].push(action);
                }
                for (attributeIndex = 0; attributeIndex < attributes.length; attributeIndex++) {
                    action = {};
                    action['match'] = {};
                    name = 'attributes.' + attributes[attributeIndex][0];
                    if (attributes[attributeIndex][1]) {
                        value = attributes[attributeIndex][1];
                        matchAttribute = {};
                        matchAttribute[name] = value;
                        action['match'] = matchAttribute;
                        queryDsl['query']['bool']['should'].push(action);
                    }
                }
                body.push(searchIndexAndType);
                body.push(queryDsl)
            }
        }
        return body;
    };


    var wrangler = {
        configuration: undefined,
        self: undefined,


        init: function (aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
            bpfElasticsearch_url = process.env.elasticsearch_url;
            if (!bpfElasticsearch_url)
                production.logger.log('warning', 'init-wrangler', {
                    production: production.name,
                    source: 'MergeAttributeContent',
                    info: 'failed to find environment'
                });
            else
                aConfiguration.host = bpfElasticsearch_url;

            self.client = new elasticsearch.Client(
                {
                    host: aConfiguration.host
                });
        },
        execute: function (aTupleStream, aSinkCallback) {
            console.log('executing AddPersona');
            production.logger.log('info', 'enter-wrangler', {
                production: production.name,
                wrangler: "ComputeLikeMe"
            });
            tupleStream = aTupleStream;
            if (aTupleStream)
                if (aTupleStream.length > 0) {
                    personaQuery = createPersonaMultiSearchQuery(aTupleStream);

                    wrangler.client.msearch({
                        body: personaQuery
                    }, function (anError, aResult) {
                        if (anError) {
                            aSinkCallback(anError);
                        }
                        else {
                            tupleStream = addMatches(aTupleStream, aResult.responses);
                            aSinkCallback(null, tupleStream);
                        }
                    })
                }
                else aSinkCallback('tupleStream empty');
            else
                aSinkCallback('no tupleStream')
        }
    };
    exports.module = wrangler;
})();


