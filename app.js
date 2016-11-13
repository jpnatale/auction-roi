var ahurl = require("./AHURL.js")
var ahData = require("./AHData.js")
var items = require("./items.js")()
var schedule = require('node-schedule');
var fs = require('fs')
var jsonfile = require('jsonfile')

var express = require('express')
var app = express()
var PORT = process.env.PORT || 3000




// app.get('/', function (req, res){
// 	res.send("test")
// })//


var costKeys = []
var allItems = Object.keys(items)

for (var i = 0, len = allItems.length; i < len; i++) {
  if (items[allItems[i]].hasOwnProperty("mats")){
  	costKeys.push(allItems[i])
  }
}
var maxRoiKey = ""
var maxProfitKey = ""

exports.pullData = function(){

return new Promise(function(resolve,reject){
//
ahurl().then(function(dataURLRes){
	// console.log(' ')
	// console.log("Got Auction House URL.")
	// console.log(" ")

	return ahData(dataURLRes.files[0].url)

}).then(function(data){


	// console.log('Retrieved Auction House Data.')
	// console.log(' ')
	// console.log('Current Prices on the Auction House:')
	// console.log(' ')
	for (var i = 0, len = allItems.length; i < len; i++) {
		
		// var foundUnit = findUnit(data,Object.keys(items)[i])
		items[allItems[i]].costToBuy = findUnit(data,allItems[i])
		//  itemName = itemsToGet[itemIDs[i]]
		// unitPrices[itemIDs[i]] = foundUnit 
		// console.log(itemName +" - " + foundUnit)
	}

 }).then(function(){

 	 getCost()

 }).then(function(){
 
 	var out = {"ROI":String(items[maxRoiKey].itemName+ " - "+items[maxRoiKey].roi),"Profit":String(items[maxProfitKey].itemName+ " - "+Math.round(items[maxProfitKey].profit))}
console.log("out")
 	resolve(out)

 })


}

//

)}



function findUnit (data,itemID){


var matches = []

for (var i = 0, len = data.auctions.length; i < len; i++) {
  
if(data.auctions[i].item == itemID){
	var unit = data.auctions[i].buyout/data.auctions[i].quantity

	if (unit>0){

		matches.push(Math.round(unit/10000))}

}}

if (matches.length>1){
matches = matches.sort( function(a,b) { return a - b; } )} else{
	matches = "Not enough auctions available"
}

var finalUnit = 0
if(matches.length<6){
	finalUnit = (matches[0]+matches[1])/2
}
else if(matches.length>5){
	finalUnit = Math.round((matches[0]+matches[1]+matches[2]+matches[3])/4)

}

return finalUnit


}

function bestROI(){
	// console.log(' ')
	// console.log('Maximum ROI is for Making:')
	// console.log(' ')
var maxRoi = 0


for (var i = 0, len = costKeys.length; i < len; i++) {
			if(items[costKeys[i]].roi > maxRoi){
			maxRoiKey = costKeys[i]
		}

	}

items[maxRoiKey].isBestRoi = 1

// console.log(items()[0][maxroikey] +", for a profit of " + Math.round(profits[maxroikey]) + " and an ROI of "+ maxroi+".") 
// 	console.log(' ')
// 	console.log('Maximum Profit is for Making:')
// 	console.log(' ')

var maxProfit = 0


for (var i = 0, len = costKeys.length; i < len; i++) {
			if(items[costKeys[i]].profit> maxProfit){
		
			maxProfitKey = costKeys[i]
		}

	}

items[maxProfitKey].isBestProfit = 1

// console.log(items()[0][maxProfitKey] +", for a profit of " + Math.round(profits[maxProfitKey]) + " and an ROI of "+ roi[maxProfitKey]+".") 



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


	}

	return bestROI()


}











// app.listen(PORT, function(){

// 	console.log("Express server listening on port " + PORT +"!")

// })
