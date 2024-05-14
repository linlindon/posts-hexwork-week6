const mongoose = require('mongoose');

const errorHandler = require('../utils/errorHandler');
const successHandler = require('../utils/successHandler');
const Users = require('../models/users');

const users = {
	async getUsers({res}) {
		const data = await Users.find();
		successHandler({ res, customMessage: '取得所有 users 成功', data });
	},
	async createUser({ req, res }) {
		const { body } = req;
		try {
			const newUser = await Users.create({
				name: body.name,
				email: body.email,
				password: body.password,
				gender: body.gender,
				photo: body.photo || 'https://api.dicebear.com/8.x/pixel-art/svg?seed=John&radius=50&size=40',
			});
			// newUser 會包含密碼，所以把他排除
			newUser.password = undefined;
			successHandler({ res, customMessage: '新增 user 成功', data: newUser });

		} catch(err) {
			errorHandler({ res, err });
		}
	}
};

module.exports = users;