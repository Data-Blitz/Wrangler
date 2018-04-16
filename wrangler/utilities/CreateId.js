var uuid = require('node-uuid');

module.exports = {
    "createId": function(){
        return uuid.v4();
    }
}
