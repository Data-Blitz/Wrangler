/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */
(function () {
    var Chance = require('chance'),
        chance = new Chance();


    function generateTuple(aSchema, aTuple) {
        production.logger.log('info', 'source', {
            production: production.name,
            source: "PlanetClaireToStream",
            info: 'generating Tuple from schema',
            schema: JSON.stringify(aSchema)
        });
        properties = aSchema.properties;
        propertyKeys = _.keys(aSchema.properties);
        tuple = {};

        if (aTuple)
            tuple = aTuple;

        for (i = 0; i < propertyKeys.length; i++) {
            property = properties[propertyKeys[i]];
            if (property.type === 'object') {

                propertyName = propertyKeys[i]
                tuple[propertyName] = generateTuple(property, tuple);
                production.logger.log('info', 'source', {
                    production: production.name,
                    source: "PlanetClaireToStream",
                    info: 'generated object ' + JSON.stringify(tuple[propertyName])
                });
                tuple[propertyName] = generator.generate(property.dataBlitz, tuple);
            }

            else if (property['dataBlitz']) {
                production.logger.log('info', 'source', {
                    production: production.name,
                    source: "PlanetClaireToStream",
                    info: 'generating property ' + propertyKeys[i]
                });
                propertyName = propertyKeys[i]
                generator = require(property.dataBlitz.generator).module;
                tuple[propertyName] = generator.generate(property.dataBlitz, tuple);
            }
        }
        return tuple;
    }


    var generator = {

        generate: function (aDataBlitz, aTuple) {
            return chance.weighted(aDataBlitz.configuration.possibleValues, aDataBlitz.configuration.likelyhoods);
        }
    }
    exports.module = generator;
})()
//chance.weighted(['a', 'b', 'c', 'd'], [0.1, 0.2, 0.3, 0.4]);