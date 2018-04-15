/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */
(function () {
    var Chance = require('chance'),
        chance = new Chance();

    var generator = {
        generate: function (aDataBlitz, aTuple) {

            if (aDataBlitz.configuration.copyAttributeName)
                if (aTuple[aDataBlitz.configuration.copyAttributeName])
                    return aTuple[aDataBlitz.configuration.copyAttributeName];
                else
                    return 'missing_'+aDataBlitz.configuration.copyAttributeName+'_in_tuple';
            else
                return 'missing_configuration_see_schema';
        }
    }
    exports.module = generator;
})();
