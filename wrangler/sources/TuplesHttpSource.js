
var self = this;
var timeout = 200;
var responsive;
var app;
module.exports = {
    init: function (aDsl) {
        self = this;
        var express = require('express');
        var morgan = require('morgan');
        var bodyParser = require('body-parser');
        var methodOverride = require('method-override');
        var app = express();
        app.use(express.static(__dirname + '/public'));   // set the static files location /public/img will be /img for users
        app.use(morgan('dev'));           // log every request to the console
        app.use(bodyParser());           // pull information from html in POST
        app.use(methodOverride());           // simulate DELETE and PUT
        var router = express.Router();
        var responsive = self.configuration.responsive; //implies create and pass a future id
        var reqParams;                 //used to create indexes for downstream processing
        /*
         */
        router.get('/fetch/:id?',
            function (aRequest, aResponse) {
                self.logger.log('info', self.name + 'attempting to fetch future');
                if (responsive)
                    self.futuresDatabase.get(aRequest.params.id,
                        function (anErr, aResult) {
                            if (anErr)
                                aResponse.send([anErr]);
                            else
                                aResponse.send([self.fetchHandler.handle(aResult)]);
                        })
                else
                    aResponse.send({
                        completionCode: 'failed',
                        reason: 'this resource does not support get()'
                    });
            })
        /*
         */
        router.post(/\/execute\/(.+)?/,//'
            function (aRequest, aResponse) {
                if (aRequest.params[0].slice(-1) == "/")
                    reqParams = aRequest.params[0].slice(0, -1).split("/");
                else
                    reqParams = aRequest.params[0].split("/");
                if (responsive) {
                    var futureId = self.futureIdGenerator.createId();
                    self.sink.sink(futureId, reqParams, aRequest.body);
                    aResponse.send({future: futureId, completionCode: 'successful'})
                }
                else {
                    self.sink.sink(null, reqParams, aRequest.body);
                    aResponse.send({completionCode: 'successful'})
                }
            })
        /*
         */
        router.post(/\/executeFetch\/(.+)?/,//'
            function (aRequest, aResponse) {
                // create index tuple from url
                if (aRequest.params[0].slice(-1) == "/")
                    reqParams = aRequest.params[0].slice(0, -1).split("/");
                else
                    reqParams = aRequest.params[0].split("/");
                var futureId = self.futureIdGenerator.createId(); //id of results and processing evidence
                self.sink.sink(futureId, reqParams, aRequest.body); //send downsteam for processing
                setTimeout(function () {
                    self.futuresDatabase.get(futureId,
                        function (anErr, aResult) {
                            if (anErr) {
                                aResult = {};
                                aResult.completionCode = 'failed';
                                aResult.futureId = futureId;
                                result.reasons = ["timed out waiting " + timeout + " milliseconds for synchronous response"];
                                aResponse.send(aResult);
                            }
                            else
                                aResponse.send([self.fetchHandler.handle(aResult)]);
                            clearInterval(self.configuration.maxSynchronousWaitTime);
                        })
                }, self.configuration.maxSynchronousWaitTime);
            });
        app.use(self.configuration.dbUrl, router);
        self.app = app;
    },
    exzecute: function () {
        console.log('instanceId:' + self.instanceId + ' Opening http://*****/:' + self.configuration.dbPort + '/' + self.configuration.dbUrl);
        this.app.listen(self.configuration.dbPort);
        console.log('instanceId:' + self.instanceId + ' Opened http://*****/:' + self.configuration.dbPort + '/' + self.configuration.dbUrl);
    }
}
