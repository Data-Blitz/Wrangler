/*
 Copyright (c) Bright Peak Financial, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Bright Peak Financial, Inc. (BPF)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users of Bright Peak Financial.
 */

(function () {
    var Geohash = require('latlon-geohash');
    var wrangler = {
        configuration: undefined,
        self: undefined,
        logger: undefined,

        init: function (aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
        },
        execute: function (aTuplesInput, aSinkCallback) {
            production.logger.log('info', 'enter-wrangler', {
                production: production.name,
                wrangler: "AdjustTimestampFormat"
            });
            /*
                      "configuration": {
                        "geoJAttributeName": "location",
                        "format": "GeoJSON",
                        "latAttributeName":"latitude",
                        "longAttributeName":"longitude",
                      "geoHash":false,
                        "mustHave":false

             */
            if (aTuplesInput)
                if (aTuplesInput.length > 0) {
                    for (tupleIndex = 0; tupleIndex < aTuplesInput.length; tupleIndex++) {
                        tuple = aTuplesInput[tupleIndex]
                        latName = wrangler.configuration.latAttributeName
                        if (tuple[latName]) {
                            production.logger.log('info', 'wrangler', {
                                production: production.name,
                                wrangler: "AddGeo"
                            });
                            tuple[wrangler.configuration.geoAttributeName] = {};
                            tuple[wrangler.configuration.geoAttributeName] ['lat'] = tuple[wrangler.configuration.latAttributeName];
                            tuple[wrangler.configuration.geoAttributeName] ['long'] = tuple[wrangler.configuration.longAttributeName];
                            if (wrangler.configuration.geoHash)
                                tuple[wrangler.configuration.geoAttributeName]['geohash'] = Geohash.encode(tuple[wrangler.configuration.geoJAttributeName] ['latitude'],
                                    tuple[wrangler.configuration.geoAttributeName] ['longitude'], 6);
                        }
                    }

                    aSinkCallback(null, aTuplesInput)
                }
                else {
                    production.logger.log('error', 'exit-wrangler', {
                        production: production.name,
                        wrangler: "AdjustTimestampFormat",
                        reason: "empty tuple stream"
                    });
                    aSinkCallback('tupleStream is empty')
                }
            else {
                aSinkCallback('tupleStream is empty')
                production.logger.log('error', 'exit-wrangler', {
                    production: production.name,
                    wrangler: "AdjustTimestampFormat",
                    reason: "tuple stream is null"
                });
            }
        }
    }
    exports.module = wrangler;

})();