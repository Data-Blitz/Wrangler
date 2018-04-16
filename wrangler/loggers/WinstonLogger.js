
var winston = require('winston');


var logger = null;

module.exports = {

    "name":"wintonlogger",


    setLogLevel: function (aLogLevel) {
        if (winston) {
            logger.level = aLogLevel;
            this.logLevel = aLogLevel;
            logger.log('info',' Winston logger has set log level to:' + this.logLevel );
        }
    },

    init:function(aConfiguration) {
        options = {
            'timestamp': true,
            'depth':true,
            'prettyPrint':true
        }
        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)(aConfiguration.options),
                new (winston.transports.File)({ filename: aConfiguration.filename }),
            ]
        });

    },
    /*
            "configuration": {
          "options": {
            "timestamp": true,
            "depth": true,
            "prettyPrint": true
          },
          "filename":"/Users/paul/data/together-log/DataBlitzLog.json"
        }
     */



    log : function() {
        switch (arguments.length) {
            case 1:
                logger.log(arguments[0]);
                break;
            case 2:
                logger.log(arguments[0],arguments[1] );
                break;
            case 3:
                logger.log(arguments[0],arguments[1], arguments[2] );
                break;
            case 4:
                logger.log(arguments[0],arguments[1], arguments[2], arguments[3]);
                break;
            case 5:
                logger.log(arguments[0],arguments[1], arguments[2], arguments[3], arguments[4]);
                break;
            case 6:
                logger.log(arguments[0],arguments[1], arguments[2], arguments[3], arguments[4],  arguments[5]);
                break;
        }

    }
}

