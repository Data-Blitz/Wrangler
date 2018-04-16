(function () {
    var Ajv = require('ajv');
    var validators = {};

    var validator = {
        configuration: undefined,
        self: undefined,

        loadSchemas: function(aSchemas) {
          schemaIds = _.keys(aSchemas);
            for (i=0; i<schemaIds.length; i++) {
                validators[schemaIds[i]] =1

            }

        },

        init: function (aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
        },

        validate: function (aTuple,aSchemaId) {
            production.logger.log('info', 'enter-schema-validator', {
                production: production.name,
                utilitity: "SchemaValidator"
            });
            if (aTuple) {
                production.logger.log('info', 'exit-wrangler', {
                    production: production.name,
                    wrangler: "WranglerTemplate"
                });
                aSinkCallback(null, aTupleStream);
            }
            else {
                production.logger.log('error', 'wrangler', {
                    production: production.name,
                    wrangler: "WranglerTemplate",
                    "status":"fault",
                    "reason":'tupleStreamEmpty'
                });
                aSinkCallback('no tupleStream');
            }
        }
    }
    exports.module = validator;
})();


