var express = require('express')
var app = express()
var PORT = process.env.PORT || 3000
var pullData = require('./app.js')
var db = require('./db.js')
var itemsOG = require('./items.js')()
var allItems = Object.keys(itemsOG)



app.get('/', function (req,res){
	console.log("Pulling Best Choices:")
	var maxRoiItem = {}
	var maxProfitItem = {}

	var maxRoiKey = ""

	var maxProfitKey = ""

	db.best.findOne({
		where: {
			roiOrProfit:'roi'
		}
	}).then(function(foundRoi){
		maxRoiKey = foundRoi.dataValues.itemId
	
	
	}).then(function(){
			db.items.findOne({
			where: {
				itemId : maxRoiKey
			}
		}).then(function(foundRoi){

			maxRoiItem = foundRoi.dataValues

		}).then(function(){

			db.best.findOne({
					where: {
						roiOrProfit:'profit'
					}
				}).then(function(foundProfit){
					maxProfitKey = foundProfit.dataValues.itemId
				}).then(function(){
						db.items.findOne({
								where: {
									itemId : maxProfitKey
								}
							}).then(function(foundProfit){
								maxProfitItem = foundProfit.dataValues
							}).then(function(){

								var out = {"ROI":String(maxRoiItem.itemName+ " - "+maxRoiItem.roi),"Profit":String(maxProfitItem.itemName+ " - "+Math.round(maxProfitItem.profit))}

								res.json([out,"Updated at: " + maxRoiItem.updatedAt])
							})
				})
		})

	})





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
console.log("Updating Database:")
		allItems.forEach(function(item){

				db.items.update({
					'itemId' : item,
					'itemName' : allData[item].itemName,
					'costToBuy' : allData[item].costToBuy,
					'costToMake' : allData[item].costToMake,
					'profit' : allData[item].profit,
					'roi' : allData[item].roi,
					'mats' : String(allData[item].mats)
				},
				{where: {
					itemId:item
				}})

				// db.items.findOne({
				// 	where:{
				// 		itemId:item}

				// 	}).then(function(itemFound){





				// 		var body = {
				// 	'itemId' : item,
				// 	'itemName' : allData[item].itemName,
				// 	'costToBuy' : allData[item].costToBuy,
				// 	'costToMake' : allData[item].costToMake,
				// 	'profit' : allData[item].profit,
				// 	'roi' : allData[item].roi,
				// 	'mats' : String(allData[item].mats)
				// }
				// 	return itemFound.updateAttributes(body)

				// 	})




		})

		console.log("Updating Best Choices:")

db.best.findOne({
					where:{
						roiOrProfit:'roi'}

					}).then(function(itemFound){
						if(itemFound){

							db.best.update(out.roiBody,{where:{roiOrProfit:'roi'}})

							//return itemFound.update(out.roiBody)
						} else {
							db.best.create(out.roiBody)
						}
					})

db.best.findOne({
					where:{
						roiOrProfit:'profit'}

					}).then(function(itemFound){
						if(itemFound){

							db.best.update(out.profitBody,{where:{roiOrProfit:'profit'}})

							//return itemFound.update(out.profitBody)
						} else {
							db.best.create(out.profitBody)
						}
					})					


res.json(out.bestChoice)

	})


	




})//

db.sequelize.sync().then(function(){

		app.listen(PORT, function(){

		console.log("Express server listening on port " + PORT +"!")

	})
})
