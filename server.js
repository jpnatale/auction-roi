var express = require('express')
var app = express()
var PORT = process.env.PORT || 3000
var pullData = require('./app.js')
var db = require('./db.js')
var itemsOG = require('./items.js')
var allItems = Object.keys(items)





app.get('/', function (req, res){
var body = {'itemId':'124105','itemName':'Starlight Rose','costToBuy':0}

if (allItems){
			allItems.forEach(function(item){

				var exists = Items.findAll({
							where: {
								itemId:item,
							}
						})

				if (exists){

				} else {





				var body = {
					'itemId' : item,
					'itemName' : allItems[item].itemName,
					'costToBuy' : allItems[item].costToBuy,
					'costToMake' : allItems[item].costToMake,
					'profit' : allItems[item].profit,
					'roi' : allItems[item].roi,
					'mats' : String(allItems[item].mats)
				}

				Items.create(body)

			}

			})
			
		}

	pullData.pullData().then(function(out){

		
		res.json(out)
	}).then(function(){


	})


	db.items.create(body).then(function(item){
		res.json(item.toJSON())

	}, function (e){
		res.status(400).json(e)
	})





})//

db.sequelize.sync().then(function(){

		app.listen(PORT, function(){

		console.log("Express server listening on port " + PORT +"!")

	})
})
