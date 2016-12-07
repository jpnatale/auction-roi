function func (){
	return new Promise(function(resolve,reject){
		resolve('x')
	})
}

func().then(function(out){
	console.log(out)
})