var express = require('express')
var app = express()
var PORT = 8080
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
var util = require('util')
var database = {
    remoteUrl : 'mongodb://oldjpnatale:ginger0923@ec2-184-73-108-253.compute-1.amazonaws.com:27017/dummDB',
    localUrl: 'mongodb://localhost:27017/dummDB'
};
var savedOut = "Data has not been pulled since the server was started"

var running = false
var timeUpdated = ""





mongoose.connect('mongodb://oldjpnatale:ginger0923@ec2-184-73-108-253.compute-1.amazonaws.com:27017/dummDB')
//mongoose.connect(database.localUrl)

startLoop()
//myCount()

var item = require('./models/item.js');
var best = require('./models/best.js')
var itemsToCheck = require('./models/itemsToCheck.js')
var record = require('./models/record.js')

app.get('/', function (req,res){
	getItems(res)
})


app.get('/track', function (req, res){

})

app.get('/recipes', function (req,res){
	recipes(res)
})

app.get('/best', function (req,res){
	if(running){
		updateTime()
			console.log("Pulling Best Choices: " + timeUpdated)
	res.json(savedOut)
} else {
	res.json("Server is not currently running")
}

	// getBestRoi().then(function(){
	// 	getBestProfit()}).then(function(){

	// 	var out = {"ROI":String(maxRoiItem.itemName+ " - "+maxRoiItem.roi),"Profit":String(maxProfitItem.itemName+ " - "+Math.round(maxProfitItem.profit))}
	// 	res.json(out)
	// })	
})

app.get('/start', function(req,res){
	startLoop()
	res.json("Server has been started.")
})
app.get('/stop', function(req,res){
	stopLoop()
	res.json("Server has been stopped.")
})

app.get('/update', function (req, res){
	update()
	running = true
	res.json("Server manually updated.")
})

function getBestRoi(){
	return new Promise(function(resolve,reject){
		best.findOne({roiOrProfit:'roi'}, function(err,bestRoiItemId){
			if (err) {res.json(err)}
				
			if (bestRoiItemId){
	
			maxRoiKey = bestRoiItemId.itemId
			
			item.findOne({itemId:maxRoiKey}, function(err,foundItem){
				maxRoiItem = foundItem
				resolve()
			})
		} else {resolve("Error")}	
	})
	})
}


function getBestProfit(){
	return new Promise(function(resolve,reject){
		best.findOne({roiOrProfit:'profit'}, function(err,bestProfitItemId){
			if (err) {res.json(err)}
			if (bestProfitItemId){
			maxProfitKey = bestProfitItemId.itemId
			console.log(maxProfitKey)
			item.findOne({itemId:maxProfitKey}, function(err,foundItem){
				maxProfitItem = foundItem
				resolve()
			})	
		} else {resolve("Error")}
	})
	})
}

function recipes(res) {

	var counter = 0

	allItems.forEach(function(eachItem){

		itemsToCheck.findOne({itemId:eachItem}, function(err,checkedItem){
			console.log(checkedItem)
			if(!checkedItem){
				itemsToCheck.create(
					{'itemId':eachItem}
					,function(err,newItem){
					counter++
					console.log(newItem)

					if (counter == allItems.length){
						getItemsToCheck(res)
					}
				})
			} else {
				console.log("Item for " + eachItem + " already exists.")
				counter ++ 
				if (counter == allItems.length){
						getItemsToCheck(res)
					}
			}
		})
	})


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
        res.json(bests); // return all todos in JSON format
    });
};

//db.sequelize.sync().then(function(){
app.get('/*', function (req,res){
	getItems(res)
})

		app.listen(PORT, function(){

		console.log("Express server listening on port " + PORT +"!")

	})
//})
function updateTime(){
	timeUpdated = String(Date()).substring(16,25)
}
function modHistory (newHistoryItem,oldHistory,totalHistoryRecords){

oldHistory.unshift(newHistoryItem)

	if (oldHistory.length!<totalHistoryRecords){
		oldHistory.slice(0,totalHistoryRecords)
	}

return oldHistory
}

function arrayAverage(array){
	var total = 0

	for (var i = 0, len = array.length; i < len; i++) {
	
		total = total + array[i]
	}
	var average = total/array.length

	return average
	
}

function track(allData){
return new Promise(function(resolve,reject){

	allData.forEach(function(eachItem){
		item.findOne({itemId:eachItem},function (err, doc){
			if (err){return err}

			if (doc){
				doc.currentPrices.unshift(parseInt(allData[eachItem].costToBuy,10))
				
				if (doc.currentPrices.length==60){
					var averageHour = arrayAverage(doc.currentPrices)
					doc.lastHour.unshift(averageHour)
					if (doc.lastHour.length==24){
						var averageDay = arrayAverage(doc.lastHour)
						doc.lastDay.unshift(averageDay)
						if(doc.lastDay.length=5){
							var averageThirtyDay = arrayAverage(doc.lastDay)
							doc.lastThirtyDay.unshift(averageThirtyDay)
							if (doc.lastThirtyDay.length == 31){
								doc.lastThirtyDay.slice(0,30)
							}
							doc.lastDay = []

						}
						doc.lastHour = []
					}
					doc.currentPrices = [doc.currentPrices[0]]
				}
				doc.save()
				console.log(doc)

			} else {

					record.create({
						'itemId' : eachItem,
						'itemName' : allData[eachItem].itemName,
						'currentPrices':[allData[eachItem].costToBuy]
						'lastHour' : []
						'lastDay' : []
						'lastFiveDays' : []
					})
			}
		})
	})


	
})

}




function update() {

		pullData.pullData().then(function(out){
updateTime()
var outString = util.inspect(out.bestChoice, {showHidden: false, depth: null})

		var allData = out.allData
		savedOut = outString + ' This information was updated at: ' + timeUpdated
console.log("Success! Updating Database: " + String(Date()).substring(16,25))



		allItems.forEach(function(eachItem){

			item.findOne({itemId:eachItem},function (err, doc){
				if (err){return err}

				if (doc){


					
						if(doc.mats){
							//if(isNaN(allData[eachItem].costToBuy)) {allData[eachItem].costToBuy = 0}
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
        				console.log("Something wrong when updating data for item " + eachItem);
        				console.log(err)
    						}
						})	



					} else {
						//if(isNaN(allData[eachItem].costToBuy)){allData[eachItem].costToBuy = 100000}
						item.findOneAndUpdate({itemId:eachItem}, { $set: {
						'itemId' : eachItem,
						'itemName' : allData[eachItem].itemName,
						'costToBuy' : allData[eachItem].costToBuy
								} },	 
					{new: true},
					function (err, dbItem){
						if(err){
        				console.log("Something wrong when updating the non-mats data!");
        				console.log(err)
    						}
						})
					}




				} else {


					item.create({
						'itemId' : eachItem,
						'itemName' : allData[eachItem].itemName,
						'costToBuy' : allData[eachItem].costToBuy,
						'costToMake' : allData[eachItem].costToMake,
						'profit' : allData[eachItem].profit,
						'roi' : allData[eachItem].roi,
						'mats' : JSON.stringify(allData[eachItem].mats)
								}, function (err, created){
									console.log("created new item")
								})
				}
			})//item.findone
		})
updateTime()
		console.log("Updating Best Choices: " + timeUpdated)

	best.findOne({roiOrProfit:'roi'},function (err,ifRoiFound){
		if(ifRoiFound){
			best.findOneAndUpdate({roiOrProfit:'roi'}, {$set: {'itemId':out.roiBody}}, function (err,roiItem){

				best.findOne({roiOrProfit:'profit'},function (err,ifProfitFound){
					if(ifProfitFound){
						best.findOneAndUpdate({roiOrProfit:'profit'}, {$set: {'itemId':out.profitBody}}, function (err,profitItem){
							
							return savedOut})
					} else {
						best.create({'roiOrProfit':'profit','itemId':out.profitBody},function (err, createdProfit){
							
							return savedOut})
					}
				})

			})

		} else {
			best.create(out.roiBody, function (err, createdRoi){
				console.log(out.roiBody)
					best.findOne({roiOrProfit:'profit'},function (err,ifProfitFound){

					if(ifProfitFound){
						best.findOneAndUpdate({roiOrProfit:'profit'}, {$set: {'itemId':out.profitBody}}, function (err,profitItem){
							
							return savedOut})
					} else {
						best.create(out.profitBody,function (err, createdProfit){
							
							return savedOut})
					}
				})
			})
		}




	})//best.findone
	})//pulled

}

function run() {

update()
	var timeWait = 60000
	console.log("Waiting "+timeWait/1000+" seconds then pulling data again...")
	    if(running) {
        setTimeout(run, timeWait);
    }



}

function startLoop() {
    running = true;
    run();
}

function stopLoop() {
    running = false;
}
