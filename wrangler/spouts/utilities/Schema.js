/**
 * Created by paul on 12/29/17.
 */
var Ajv = require('ajv');
var ajv = new Ajv({allErrors: true});

var schemas = require('/schemas/UserPlanetClaire.json');

var validate = ajv.compile(schemas);

input =       {
    "firstName":"Fred",
    "lastName":"Smith",
    "age":37

}



function test(data) {
    var valid = validate(data);
    if (valid) console.log('Valid!');
    else console.log('Invalid: ' + ajv.errorsText(validate.errors));
}