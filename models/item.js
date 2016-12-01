var mongoose = require('mongoose');

module.exports = mongoose.model('item', {
    itemId: {
        type: String,
        default: ''
    },
    itemName: {
    	type: String,
    	default: ''
    },
    costToBuy: {
    	type: Number,
    	default: ''
    },
    costToMake: {
    	type: Number,
    	default: ''
    },
    profit: {
    	type: Number,
    	default: ''
    },
    roi: {
    	type: Number,
    	default: ''
    },
    mats: {
    	type: String,
    	default: ''
    }
});
