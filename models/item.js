module.exports = function (sequelize,DataTypes) {


return sequelize.define('item', {
	itemId: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			len:[1,250]
		}
	},

	itemName: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			len:[1,250]
		}
	},

	costToBuy: {
		type: DataTypes.DOUBLE,
		allowNull: true,
		validate: {
			len:[1,250]
		}

	},

	costToMake: {
		type: DataTypes.DOUBLE,
		allowNull: true,
		validate: {
			len:[1,250]
		}
	},

	profit: {
		type: DataTypes.DOUBLE,
		allowNull: true,
		validate: {
			len:[1,250]
		}
	},

	roi: {
		type: DataTypes.DOUBLE,
		allowNull: true,
		validate: {
			len:[1,250]
		}
	},

	mats: {
		type: DataTypes.STRING,
		allowNull: true,
		validate: {
			len:[1,250]
		}
	}

})

}