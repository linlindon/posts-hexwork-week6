const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const { appError} = require('../utils/errorHandler');
const successHandler = require('../utils/successHandler');
const Users = require('../models/users');

const users = {
	async getUsers({res}) {
		const data = await Users.find();
		successHandler({ res, customMessage: '取得所有 users 成功', data });
	},
	async createUser({ req, res, next }) {
		const { name, email, password, confirmPassword, photo, gender } = req.body;

		if (!name || !email || !password || !confirmPassword) {
			return next(appError(400, '請填寫完整資料'));
		}

		if (password !== confirmPassword) {
			return next(appError(400, '密碼不一致'));
		}

		if (!validator.isLength(password, { min: 8 })) {
			return next(appError(400, '密碼至少要有 8 個字元'));
		}

		if (!validator.isEmail(email)) {
			return next(appError(400, 'email 格式錯誤'));
		}
		const newUser = await Users.create({
			name: name,
			email: email,
			password: password,
			gender: gender,
			photo: photo || 'https://api.dicebear.com/8.x/pixel-art/svg?seed=John&radius=50&size=40',
		});
		// newUser 會包含密碼，所以把他排除
		newUser.password = undefined;
		successHandler({ res, customMessage: '新增 user 成功', data: newUser });
	}
};

module.exports = users;