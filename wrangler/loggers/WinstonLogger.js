
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

    init:function(aDsl) {
        options = {
            'timestamp': true,
            'depth':true,
            'prettyPrint':true
        }
        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.Console)(options),
                new (winston.transports.File)({ filename: 'Wrangler.log' }),
            ]
        });

    },

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

 logger = module.exports;
 logger.init(); //
 logger.log('info', 'startingTuples');
