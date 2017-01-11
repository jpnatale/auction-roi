var ahurl = require("./resources/AHURL.js")
var ahData = require("./resources/AHData.js")
var itemsOG = require("./resources/items.js")()
// var mongoose = require('mongoose')
// var database = {
//     remoteUrl : 'mongodb://oldjpnatale:ginger0923@ec2-184-73-108-253.compute-1.amazonaws.com:27017/dummDB',
//     localUrl: 'mongodb://localhost:27017/dummDB'
// 	};


// mongoose.connect(database.remoteUrl)

var allItems = []
var costKeys = []
var items = itemsOG

var ogKeys = Object.keys(itemsOG)

// rabbitItemsToCheck.find(function (err,doc){

// }

allItems = ogKeys

//Need to add recipe-adding ability/checker here
for (var i = 0, len = allItems.length; i < len; i++){
	if (itemsOG[allItems[i]].hasOwnProperty('mats')){
		costKeys.push(allItems[i])
	}
}

var maxRoiKey = ""
var maxProfitKey = ""

exports.pullData = function(itemsToParse){

return new Promise(function(resolve,reject){
	console.log("Attempting to pull AH data.")

ahurl().then(function(dataURLRes){


	return ahData(dataURLRes.files[0].url)

}).then(function(data){


	for (var i = 0, len = itemsToParse.length; i < len; i++) {

		items[itemsToParse[i]].costToBuy = findUnit(data,itemsToParse[i])

	}

 }).then(function(){

 	 getCost()

 }).then(function(){

 	 bestROI()

 }).then(function(){
 
 	var out = { 'allData':items,'bestChoice':


 		{"ROI":String(items[maxRoiKey].itemName+ " - "+items[maxRoiKey].roi),"ROI Sell for":Math.round(0.95*items[maxRoiKey].costToBuy),"Profit":String(items[maxProfitKey].itemName+ " - "+Math.round(items[maxProfitKey].profit)),"Profit Sell for":Math.round(0.95*items[maxProfitKey].costToBuy)}, roiBody:{roiOrProfit:'roi',itemId:maxRoiKey},profitBody:{roiOrProfit:'profit',itemId:maxProfitKey}}

console.log('AH data being returned now.')
 	resolve(out)

 })

}//end of promise


)}

function findUnit (data,itemID){


var matches = []

for (var i = 0, len = data.auctions.length; i < len; i++) {
  
if(data.auctions[i].item == itemID){

	var unit = data.auctions[i].buyout/data.auctions[i].quantity
	if (unit>0){
		matches.push(unit/10000)}

	}


}
//console.log("Matches length: " + matches.length + " for item " +itemID + " - " +items[itemID].itemName)
if (matches.length>0){
matches = matches.sort( function(a,b) { return a - b; } )
//console.log(matches.length)

} else{
	console.log("ZERO AUCTIONS for Item " + itemID + " - " + items[itemID].itemName)
	return 0
} 		
// console.log(items[itemID].itemName)
// console.log(matches)
// console.log(items[itemID].itemName)

var finalUnit = 1000000
if (matches.length>10){
	finalUnit = Math.round((matches[0]+matches[1]+matches[2])/3)
			if(itemsOG[itemID].itemName == "Felwort"){
		console.log("Aethril final unit is: "+finalUnit)


	}
} else if (matches.length > 3) {
	finalUnit = Math.round((matches[0]+matches[1])/2)
} else {
	finalUnit = Math.round(matches[0])
}

return finalUnit

}

function bestROI(){

var maxRoi = 0


for (var i = 0, len = costKeys.length; i < len; i++) {
			if(items[costKeys[i]].roi > maxRoi){

			maxRoiKey = costKeys[i]
			maxRoi = items[maxRoiKey].roi

		}

	}

var maxProfit = 0

for (var i = 0, len = costKeys.length; i < len; i++) {
			if(items[costKeys[i]].profit> maxProfit){
		
			maxProfitKey = costKeys[i]
			maxProfit = items[maxProfitKey].profit
		}

	}
}

function getCost(){

	for (var i = 0, len = costKeys.length; i < len; i++) {
	
		var craftableID = costKeys[i]
		
		var mats = items[costKeys[i]].mats
		var matKeys = Object.keys(mats)
		var cost = 0

		for (var j = 0, len2 = matKeys.length; j < len2; j++) {
			
			cost = cost + mats[matKeys[j]]*items[matKeys[j]].costToBuy
		}
		items[costKeys[i]].costToMake = cost
		items[costKeys[i]].profit = 0.95*items[costKeys[i]].costToBuy-items[costKeys[i]].costToMake
		
		items[costKeys[i]].roi = Math.round(100*items[costKeys[i]].profit/items[costKeys[i]].costToMake)

		items[costKeys[i]].profit = Math.round(items[costKeys[i]].profit)

	}	

}
