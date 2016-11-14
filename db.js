var Sequelize = require('sequelize')
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect':'sqlite',
	'storage': __dirname +'/data/dev-items-api.sqlite'
})

var db = {}

db.items = sequelize.import(__dirname + "/models/item.js")
db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db