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
    var sugar = require('sugar')


    addMatches = function (aTupleStream, aMatchStream) {

        if (aTupleStream.length !== aMatchStream.length) {
            production.logger.log('error', 'init-wrangler', {
                production: production.name,
                wrangler: 'ScoreLikeMe',
                info: 'search match length problem'

            });
            return null;
        }

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
                    usersLikeMe['users'].push({
                        userId: aMatchStream[i].hits.hits[j]._source.userid,
                        score: aMatchStream[i].hits.hits[j]._score * .1
                    })
                }
                aTupleStream[i]['usersLikeMe'] = usersLikeMe;
                aTupleStream[i]['usersLikeMe']['winner'] = usersLikeMe.users[0];
            }
        }
        return aTupleStream;
    };


    find = function (aMatchDefinition, aTuple) {

        match = sugar.Object.get(aTuple, aMatchDefinition.path)
        //does input exist in this Tuple at the configured path?
        if (match && (match !== '')) {
            action = {};
            action['term'] = {}
            action['term'][aMatchDefinition.path] = {};
            action['term'][aMatchDefinition.path]['value'] = match;
            if (aMatchDefinition.boost)
                action['term'][aMatchDefinition.path]['boost'] = aMatchDefinition.boost;  //  action['match']['boost'] = aMatchDefinition.boost;
            return action;
        }
        return null;
    }


    filterMustHave = function (aTuple) {
            mustHave = true;
            for (attributeI = 0; (attributeI < wrangler.configuration.matchingScheme.length && mustHave); attributeI++) {
                matchingScheme = wrangler.configuration.matchingScheme[attributeI];
                if (matchingScheme.mustHave) {
                    match = sugar.Object.get(aTuple, matchingScheme.path)
                    if (!match && (match == ''))
                        mustHave = false;
                }
            }
        return mustHave
    }


    createPersonaMultiSearchQuery = function (aTupleStream) {
        body = [];
        searchIndexAndType = {index: wrangler.configuration.personaIndex, type: wrangler.configuration.personaType};

        /*
              "must_not": [
        {
          "term": {
            "userid": {
              "value": "8dab576c-2499-4472-9a01-abeb979d9375"
            }
          }
        }
      ]
         */

        for (i = 0; i < aTupleStream.length; i++) {
            queryDsl = {};
            queryDsl['query'] = {};
            queryDsl['query']['bool'] = {};
            queryDsl['query']['bool']['must_not'] = [];
            queryDsl['query']['bool']['must_not'].push({
                "term":{
                    "userid":aTupleStream[i].userid
                }
            })
            queryDsl['query']['bool']['should'] = [];
            found = false;

            if (filterMustHave(aTupleStream[i])) //honor must haves
                for (matchI = 0; matchI < wrangler.configuration.matchingScheme.length; matchI++) {
                    matchDoc = wrangler.configuration.matchingScheme[matchI]
                    action = find(matchDoc, aTupleStream[i]);

                    if (action) {
                        found = true;
                        queryDsl['query']['bool']['should'].push(action);
                    }
                }
            if (!found)
                queryDsl['query']['bool']['should'].push({'match': {'placeholder': 'placeholder'}});
            body.push(searchIndexAndType);
            body.push(queryDsl)
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
                    wrangler: 'ScoreLikeMe',
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
                wrangler: "ScoreLikeMe"
            });
            if (aTupleStream)
                if (aTupleStream.length > 0) {
                    //var tupleStreamMustHave = filterMustHave(aTupleStream);
                    var personaQuery = createPersonaMultiSearchQuery(aTupleStream);

                    wrangler.client.msearch({
                        body: personaQuery
                    }, function (anError, aResult) {
                        if (anError)
                            aSinkCallback(anError);

                        else {
                            matchedTupleStream = addMatches(aTupleStream, aResult.responses);
                            aSinkCallback(null, matchedTupleStream);
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


