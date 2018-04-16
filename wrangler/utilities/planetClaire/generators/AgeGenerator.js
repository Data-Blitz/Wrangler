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

  generate: function (aDataBlitz, aTuple, aReference) {
   return chance.age({type: 'adult'});;
  }
 }
 exports.module = generator;
})();
