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

    mergePersonas = function (aTupleStream, aPersonaStream) {

        for (i = 0; i < aTupleStream.length; i++) {
            if (aPersonaStream[i].hits.hits.length > 0) {
                persona = {};
                now = new Date();
                persona['createTimestamp'] = now.toUTCString();
                persona['personas'] = {}
                for (j = 0; j < aPersonaStream[i].hits.hits.length; j++) {
                    persona['personas'][aPersonaStream[i].hits.hits[j]._source.personaName] = aPersonaStream[i].hits.hits[j]._score*.1;
                    aTupleStream[i]['persona'] = persona;
                }
                personaArray = _.pairs(persona.personas);
                maxPersona = [];
                maxScore = 0;
                for (k = 0; k < personaArray.length; k++) {
                    personaItem = personaArray[k]
                    if (personaItem[1] > maxScore) {
                        maxScore = personaItem[1];
                        maxPersona = personaItem;
                    }
                    aTupleStream[i]['persona']['persona'] = maxPersona[0]
                }
            }
        }
        return aTupleStream;
    }


    createPersonaMultiSearchQuery = function (aTupleStream) {
        body = [];
        searchIndexAndType = {index: wrangler.configuration.personaIndex, type: wrangler.configuration.personaType};
        for (i = 0; i < aTupleStream.length; i++) {
            queryDsl = {};
            queryDsl['query'] = {}
            queryDsl['query']['bool'] = {};
            queryDsl['query']['bool']['should'] = [];
            attributes = _.pairs(aTupleStream[i].attributes)
            if (attributes.length === 0) {
                //
                // Put in a place holder (i.e. no input to compute persona)
                // insert a search guaranteed to return zero hits as a placeholder
                // to maintain order of searches to tuple streams
                //
                placeHolderQuery = {};
                action = {}
                action['match'] = {"placeHolder": "placeHolder"}
                queryDsl['query']['bool']['should'].push(action);
                body.push(searchIndexAndType);
                body.push(queryDsl)
            }
            else {
                if (aTupleStream[i].gender) {
                    action = {};
                    action['match'] = {"gender": aTupleStream[i].gender}
                    queryDsl['query']['bool']['should'].push(action);
                }
                if (aTupleStream[i].state) {
                    action['match'] = {"state": aTupleStream[i].state}
                    queryDsl['query']['bool']['should'].push(action);
                }
                for (attributeIndex = 0; attributeIndex < attributes.length; attributeIndex++) {
                    action = {};
                    action['match'] = {};
                    name = 'attributes.' + attributes[attributeIndex][0];
                    value = attributes[attributeIndex][1];
                    matchAttribute = {};
                    matchAttribute[name] = value;
                    action['match'] = matchAttribute;
                    queryDsl['query']['bool']['should'].push(action);
                    //console.log(action);
                }
                body.push(searchIndexAndType);
                body.push(queryDsl)
            }
        }
        return body;
    }


    var wrangler = {
        configuration: undefined,
        self: undefined,


        init: function (aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
            self.client = new elasticsearch.Client(
                {
                    host: aConfiguration.host
                });
        },
        execute: function (aTupleStream, aSinkCallback) {
            console.log('executing AddPersona')
            production.logger.log('info', 'enter-wrangler', {
                production: production.name,
                wrangler: "AddPersona"
            });
            tupleStream = aTupleStream
            if (aTupleStream)
                if (aTupleStream.length > 0) {
                    personaQuery = createPersonaMultiSearchQuery(aTupleStream);
                    //console.log(JSON.stringify(personaQuery))
                    wrangler.client.msearch({
                        body: personaQuery
                    }, function (anError, aResult) {
                        if (anError) {
                            //console.log('fault:' + JSON.stringify(anError))
                            aSinkCallback(anError);
                        }
                        else {
                            //console.log('success:' + JSON.stringify(aResult.responses))
                            tupleStream = mergePersonas(aTupleStream, aResult.responses)
                            aSinkCallback(null, tupleStream);
                        }
                    })


                }
                else  aSinkCallback('tupleStream empty');
            else
                aSinkCallback('no tupleStream')
        }
    }
    exports.module = wrangler;
})();


