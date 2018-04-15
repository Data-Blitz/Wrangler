/*
 Copyright (c) Data-Blitz, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Data-Blitz, Inc. (Data-Blitz)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users and customers of Data-Blitz.
 */
(function () {

 var uuid = require('node-uuid');



 var generator = {

  generate: function (aDataBlitz, aTuple) {
   return uuid.v4()

  }
 }
 exports.module = generator;
})();
