var request = require("request")		
var url = "https://us.api.battle.net/wow/auction/data/wyrmrest%20accord?locale=en_US&apikey=q8dt6gqsg2jbmmthevjyjyadncwdk4kj"

module.exports = function(){
	return new Promise(function (resolve,reject){

	//var url = "http://ipinfo.io"
		request({
			url:url,
			json: true
		}, function (error,response,body){
			if (error) {
				reject(error)
			} else {
				resolve(body)
			}
		})
	})
}