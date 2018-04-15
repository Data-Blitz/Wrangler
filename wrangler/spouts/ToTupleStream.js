var total = 0;
(function(){
    var spout = {
        configuation:undefined,
        tupleStream:undefined,
        total: 0,
        toStream:   function (aCallback) {
            total = total + tupleStream.length;
            //console.log('spout streamed a total of: '+total);
            aCallback(null,tupleStream)
        },
        setStream: function(aTupleStream){
            tupleStream = aTupleStream;
        },
        init: function(aConfiguation){
            configuation = aConfiguation;
        }
    }
    exports.module =  spout;
})();
