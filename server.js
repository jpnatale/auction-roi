var express = require('express')
var app = express()
var PORT = process.env.PORT || 3000
var pullData = require('./app.js')
var db = require('./db.js')
var itemsOG = require('./items.js')()
var allItems = Object.keys(itemsOG)



app.get('/', function (req,res){
	var maxRoiItem = {}
	var maxProfitItem = {}

	var maxRoiKey = db.best.findOne({
		where: {
			roiOrProfit:'roi'
		}
	})

	var maxProfitKey = db.best.findOne({
		where: {
			roiOrProfit:'profit'
		}
	})

	db.items.findOne({
		where: {
			itemId = maxRoiKey.itemId
		}
	}).then(function(foundRoi){
		maxRoiItem = foundRoi
	})

	db.items.findOne({
		where: {
			itemId = maxProfitKey.itemId
		}
	}).then(function(foundProfit){
		maxProfitItem = foundProfit
	})



	{"ROI":String(maxRoiItem.itemName+ " - "+maxRoiItem.roi),"Profit":String(maxProfitItem.itemName+ " - "+Math.round(maxProfitItem.profit))}}

})

app.get('/update', function (req, res){


if (allItems.length>0){
			allItems.forEach(function(item){

				var exists = {}
				db.items.findOne({
							where: {
								itemId:item,
							}
						}).then(function(itemFound){

				if (itemFound){
					console.log('Database already contained item: ' + item + ' - '+ itemsOG[item].itemName)
					
			 	} else {

			 		console.log('Item not yet in database. Creating entry for item: '+ item + ' - '+ itemsOG[item].itemName)

				var body = {
					'itemId' : item,
					'itemName' : itemsOG[item].itemName,
					'costToBuy' : itemsOG[item].costToBuy,
					'costToMake' : itemsOG[item].costToMake,
					'profit' : itemsOG[item].profit,
					'roi' : itemsOG[item].roi,
					'mats' : String(itemsOG[item].mats)
				}

						db.items.create(body).then(function(item){
					//res.json(item.toJSON())

				}, function (e){
					res.status(400).json(e)
				})

			}

		})

			})
			
		} 




	pullData.pullData().then(function(out){

		var allData = out.allData

		allItems.forEach(function(item){

			var body = {
					'itemId' : item,
					'itemName' : allData[item].itemName,
					'costToBuy' : allData[item].costToBuy,
					'costToMake' : allData[item].costToMake,
					'profit' : allData[item].profit,
					'roi' : allData[item].roi,
					'mats' : String(allData[item].mats)
				}
				

				db.items.findOne({
					where:{
						itemId:item}

					}).then(function(itemFound){

					return itemFound.update(body)
					console.log('here1 ' + body.itemId)

				},function (e){
					
					res.status(404).send()
				},function (){
					res.status(500).send()
				}).then(function(itemFound){
					//res.json(itemFound.toJSON())
					//res.json(out.bestChoice)
				}, function (e){
					res.status(400).json(e)

				})




		})


res.json(out.bestChoice)

	})


	




})//

db.sequelize.sync().then(function(){

		app.listen(PORT, function(){

		console.log("Express server listening on port " + PORT +"!")

	})
})
