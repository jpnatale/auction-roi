var mongoose = require('mongoose');

module.exports = mongoose.model('itemsToCheck', {

    itemId: {
    	type: String,
    	default: ''
    }
});

