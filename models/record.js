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
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    lastHour: {
    	type: mongoose.Schema.Types.Mixed,
    	default: {}
    },
    lastDay: {
    	type: mongoose.Schema.Types.Mixed,
    	default: {}
    },
    lastThirtyDays: {
    	type: mongoose.Schema.Types.Mixed,
    	default: {}
    }
});
