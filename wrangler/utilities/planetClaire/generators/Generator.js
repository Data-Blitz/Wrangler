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
   return chance.weighted(aDataBlitz.configuration.possibleValues, aDataBlitz.configuration.likelyhoods);
  }
 }
 exports.module = generator;
})()
//chance.weighted(['a', 'b', 'c', 'd'], [0.1, 0.2, 0.3, 0.4]);