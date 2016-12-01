var express = require('express')
var app = express()
var PORT = process.env.PORT || 8080
var pullData = require('./app.js')
//var db = require('./db.js')
var itemsOG = require('./items.js')()
var allItems = Object.keys(itemsOG)
var mongoose = require('mongoose')
var async = require('async')
var maxRoiItem = {}
var maxProfitItem = {}
var maxRoiKey = ""
var maxProfitKey = ""



mongoose.connect('mongodb://localhost/auction')

var item = require('./models/item.js');
var best = require('./models/best.js')
var itemsToCheck = require('./models/itemsToCheck.js')

app.get('/', function (req,res){
	getItems(res)
})

app.get('/recipes', function (req,res){
	recipes(res)
})

app.get('/prop', function (req,res){
	prop(res)
})

app.get('/best', function (req,res){

	console.log("Pulling Best Choices")

	getBestRoi().then(getBestProfit()).then(function(){
		var out = {"ROI":String(maxRoiItem.itemName+ " - "+maxRoiItem.roi),"Profit":String(maxProfitItem.itemName+ " - "+Math.round(maxProfitItem.profit))}
		res.json(out)
	})	
})

function getBestRoi(){
	return new Promise(function(resolve,reject){
		best.findOne({roiOrProfit:'roi'}, 'itemId', function(err,item){
			if (err) {res.json(err)}

			maxRoiKey = item.itemId
			item.findOne({itemId:maxRoiKey}, function(err,foundItem){
				maxRoiItem = foundItem
				resolve()
			})
	})
	})
}


function getBestProfit(){
	return new Promise(function(resolve,reject){
		best.findOne({roiOrProfit:'profit'}, 'itemId', function(err,item){
			if (err) {res.json(err)}

			maxProfitKey = item.itemId
			item.findOne({itemId:maxProfitKey}, function(err,foundItem){
				maxProfitItem = foundItem
				resolve()
			})	
	})
	})
}

app.get('/update', function (req, res){

	pullData.pullData().then(function(out){

		var allData = out.allData
console.log("Updating Database:")
		allItems.forEach(function(eachItem){

			item.findOne({itemId:eachItem},function (err, doc){
				if (err){res.json(err)}

				if (doc){
					if(doc.mats){
					item.findOneAndUpdate({itemId:eachItem}, { $set: {
						'itemId' : eachItem,
						'itemName' : allData[eachItem].itemName,
						'costToBuy' : allData[eachItem].costToBuy,
						'costToMake' : allData[eachItem].costToMake,
						'profit' : allData[eachItem].profit,
						'roi' : allData[eachItem].roi,
						'mats' : JSON.stringify(allData[eachItem].mats)
								} },	 
					{new: true},
					function (err, dbItem){
						if(err){
        				console.log("Something wrong when updating data!");
    					}
					})					
				}}
			})
		})

		console.log("Updating Best Choices:")

best.findOneAndUpdate({roiOrProfit:'roi'}, {$set: {itemId:out.roiBody}}, function (err,roiItem){
	best.findOneAndUpdate({roiOrProfit:'profit'}, {$set: {itemId:out.profitBody}}, function (err,profiItem){
			res.json(out.bestChoice)
			})


		})
	})
})//end of update

function prop(res) {
	var counter = 0
	for (var i = 0, len = allItems.length; i < len; i++){
			item.create({
				itemId : allItems[i],
				itemName : itemsOG[allItems[i]].itemName,
				costToBuy : itemsOG[allItems[i]].costToBuy,
				costToMake : itemsOG[allItems[i]].costToMake,
				profit : itemsOG[allItems[i]].profit,
				roi : itemsOG[allItems[i]].roi,
				mats : JSON.stringify(itemsOG[allItems[i]].mats)
			}, function(err,item){
				
				if(err){res.send(err)}
				counter++
				if (counter == len){
					getItems(res)
				}
			})
	}
}

function recipes(res) {

	var counter = 0
	
	for (var i = 0, len = allItems.length; i < len; i++){

		itemsToCheck.findOne({itemId:allItems[i]}, function(err,item){
			
			if(!item){
				itemsToCheck.create({itemID:allItems[i]},function(err,item){
					counter++
					if (counter == len){
						getItemsToCheck(res)
					}
				})
			} else {
				console.log("Item for " + allItems[i] + " already exists.")
				counter ++ 
				if (counter == len){
						getItemsToCheck(res)
					}
			}
		})
	}


}
function getItems(res) {
    item.find(function (err, items) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        } else {

        res.json(items)
        } // return all todos in JSON format
    });
};

function getItemsToCheck(res) {
    itemsToCheck.find(function (err, items) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        } else {

        res.json(items)
        } // return all todos in JSON format
    });
};

function getBests(res) {
    best.find(function (err, bests) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }
console.log(bests)
console.log('here')
        res.json(bests); // return all todos in JSON format
    });
};

//db.sequelize.sync().then(function(){

		app.listen(PORT, function(){

		console.log("Express server listening on port " + PORT +"!")

	})
//})
