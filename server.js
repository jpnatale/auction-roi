var express = require('express')
var app = express()
var PORT = 8080
var pullData = require('./app.js')
//var db = require('./db.js')
var itemsOG = require('./resources/items.js')()
var allItems = Object.keys(itemsOG)
var mongoose = require('mongoose')
var async = require('async')
var morgan = require('morgan')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')
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

mongoose.connect(database.remoteUrl)
//mongoose.connect(database.localUrl)

//Creating Web Server

app.use(express.static(__dirname + '/public'))
app.use(morgan('dev'));  
app.use(bodyParser.urlencoded({'extended':'true'})); 
app.use(bodyParser.json()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
app.use(methodOverride());

//End Web Server

startLoop()
//myCount()

var item = require('./models/item.js');
var best = require('./models/best.js')
var itemsToCheck = require('./models/itemsToCheck.js')
var record = require('./models/record.js')

app.get('/api/', function (req,res){
	getItems().then(function(items){
		res.json(items)
	})

})


app.get('/api/track', function (req, res){

	record.find(function(err,records){
				console.log("Sending back records.")
				if (err) {
		            res.json(err);
		        } else {
		        	res.json(records)
		        }
			})



})

app.get('/api/recipes', function (req,res){
	recipes(res)
})

app.get('/api/best', function (req,res){
	if(running){
		updateTime()
			console.log("Pulling Best Choices: " + timeUpdated)
	
				res.json(savedOut.obj)
		
	
	} else {
		res.json("Server is not currently running")
	}

})

app.get('/api/start', function(req,res){
	startLoop()
	res.json("Server has been started.")
})
app.get('/api/stop', function(req,res){
	stopLoop()
	res.json("Server has been stopped.")
})

app.get('/api/update', function (req, res){
	update()
	running = true
	res.json("Server manually updated.")
})

app.get('/api/test', function (req,res){

	pullData.pullData().then(function(out){
		res.json('done')
	})

	
})

app.get('/api/*', function (req,res){
	res.json(getItems())
})

app.get('/*', function (req,res){
	res.sendfile('./public/index.html');
})

//Starting Server
app.listen(PORT, function(){

		console.log("Express server listening on port " + PORT +"!")

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
			if(checkedItem.length<1){
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
function getItems() {

return new Promise(function(resolve,reject){


    item.find(function (err, items) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            resolve(err);
        } else {

        	resolve(items)
        } // return all todos in JSON format
    });

})

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
//})
function updateTime(){
	timeUpdated = String(Date()).substring(16,25)
}

function modHistory (newHistoryItem,oldHistory,totalHistoryRecords){

oldHistory.unshift(newHistoryItem)

	if (oldHistory.length>=totalHistoryRecords){
		oldHistory.slice(0,totalHistoryRecords)
	}

return oldHistory
}

function arrayAverage(array){
	var total = 0

	for (var i = 1, len = array.length; i < len; i++) {
	
		total = total + array[i]
	}
	var average = Math.round(total/(array.length-1))

	return average
	
}

function track(currentData){
return new Promise(function(resolve,reject){
counter = 1
	currentData.forEach(function(eachItem){
		
		record.findOne({itemId:eachItem.itemId},function (err, doc){
			if (err){return err}
			
			if (doc){
				doc.currentPrices.unshift(parseInt(eachItem.costToBuy,10))
				
				if (doc.currentPrices.length==61){
					var averageHour = arrayAverage(doc.currentPrices)
					doc.lastHour.unshift(averageHour)
					if (doc.lastHour.length==25){
						var averageDay = arrayAverage(doc.lastHour)
						doc.lastDay.unshift(averageDay)
						if(doc.lastDay.length=6){
							var averageThirtyDays = arrayAverage(doc.lastDay)
							doc.lastThirtyDays.unshift(averageThirtyDays)
							if (doc.lastThirtyDays.length == 31){
								doc.lastThirtyDays.slice(0,30)
							}
							doc.lastDay = [doc.lastDay[0]]

						}
						doc.lastHour = [doc.lastHour[0]]
					}
					doc.currentPrices = [doc.currentPrices[0]]
				}
				doc.markModified('currentPrices')
				doc.markModified('lastHour')
				doc.markModified('lastDay')
				doc.markModified('lastThirtyDays')
				doc.save()
				
				if (counter == currentData.length){
		
					resolve('Finished creating records.')
				} else {
					counter++
				}

			} else {
				
					record.create({
						'itemId' : eachItem.itemId,
						'itemName' : eachItem.itemName,
						'currentPrices': [eachItem.costToBuy],
						'lastHour' : [],
						'lastDay' : [],
						'lastThirtyDays' : []
					}, function (err, created){
									console.log("Created new record for " + eachItem.itemId + " - " + eacItem.itemName + ".")
						if (counter == currentData.length){
		
					resolve('Finished creating records.')
				} else {
					counter++
				}

								})



			}


		})


	})
	


	
})

}




function update() {

return new Promise(function(resolve,reject){

		pullData.pullData().then(function(out){
updateTime()
var outString = {'string':util.inspect(out.bestChoice, {showHidden: false, depth: null}) + ' This information was updated at: ' + timeUpdated,'obj':out.bestChoice}

		var allData = out.allData
		savedOut = outString
console.log("Success! Updating Database: " + String(Date()).substring(16,25))



		allItems.forEach(function(eachItem){

			item.findOne({itemId:eachItem},function (err, doc){
				if (err){resolve(err)}

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
							
							resolve(savedOut)})
					} else {
						best.create({'roiOrProfit':'profit','itemId':out.profitBody},function (err, createdProfit){
							
							resolve(savedOut)})
					}
				})

			})

		} else {
			best.create(out.roiBody, function (err, createdRoi){
				console.log(out.roiBody)
					best.findOne({roiOrProfit:'profit'},function (err,ifProfitFound){

					if(ifProfitFound){
						best.findOneAndUpdate({roiOrProfit:'profit'}, {$set: {'itemId':out.profitBody}}, function (err,profitItem){
							
							resolve(savedOut)})
					} else {
						best.create(out.profitBody,function (err, createdProfit){
							
							resolve(savedOut)})
					}
				})
			})
		}




	})//best.findone
	})//pulled
})
}

function run() {

update().then(function(){
	getItems().then(function(currentItems){
		track(currentItems).then(function(){
			console.log("Records have been updated.")
		})
	})
})
	var timeWait = 60000
	console.log("Will pull data again in "+timeWait/1000+" seconds.")
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
