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
    currentPrices: {
        type: Mixed,
        default: {}
    },
    lastHour: {
    	type: Mixed,
    	default: {}
    },
    lastDay: {
    	type: Mixed,
    	default: {}
    },
    lastThirtyDays: {
    	type: Mixed,
    	default: {}
    }
});
