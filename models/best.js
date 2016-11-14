module.exports = function (sequelize,DataTypes) {


return sequelize.define('best', {
	roiOrProfit: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			len:[1,250]
		}
	},

	itemId: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			len:[1,250]
		}
	}

})

}