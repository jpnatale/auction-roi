var mongoose = require('mongoose');

module.exports = mongoose.model('record', {
    itemId: {
        type: String,
        default: ''
    },
    itemName: {
    	type: String,
    	default: ''
    },
    lastHour: {
    	type: Mixed,
    	default: {}
    },
    lastDay: {
    	type: Mixed,
    	default: {}
    },
    lastFiveDays: {
    	type: Mixed,
    	default: {}
    }
});
