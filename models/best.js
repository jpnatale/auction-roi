var mongoose = require('mongoose');

module.exports = mongoose.model('best', {
    roiOrProfit: {
        type: String,
        default: ''
    },
    itemId: {
    	type: String,
    	default: ''
    }
});

