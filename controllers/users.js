const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const { appError } = require('../utils/errorHandler');
const successHandler = require('../utils/successHandler');
const { generateSendJWT } = require('../utils/auth');
const Users = require('../models/users');



const users = {
	async getUsers({res}) {
		const data = await Users.find();
		successHandler({ res, customMessage: '取得所有 users 成功', data });
	},
	async createUser({ req, res, next }) {
		let { name, email, password, confirmPassword, photo, gender } = req.body;

		if (!name || !email || !password || !confirmPassword || !gender) {
			return next(appError(400, '請填寫完整資料'));
		}

		if (!validator.isLength(name, { min: 2 })) {
			return next(appError(400, '名字至少要有 2 個字元'));
		}

		if (password !== confirmPassword) {
			return next(appError(400, '密碼不一致'));
		}

		const passwordRegex = /(?=.*[A-Za-z])(?=.*\d)/;
		if (!passwordRegex.test(password)) {
			return next(appError(400, '密碼至少要有 8 個字元，且字母與數字混合'));
		}

		if (!validator.isEmail(email)) {
			return next(appError(400, 'email 格式錯誤'));
		}

		// 先檢查 email 是否已經被註冊過
		const user = await Users.findOne({email});
		if (user) {
			return next(appError(400, '此 email 已被註冊'));
		}

		// 這邊要用 bcrypt 來 hash 密碼
		password = await bcrypt.hash(password, 12);

		const newUser = await Users.create({
			name,
			email,
			password,
			gender,
			photo: photo || 'https://api.dicebear.com/8.x/pixel-art/svg?seed=John&radius=50&size=40',
		});
		// newUser 會包含密碼，所以把他排除
		newUser.password = undefined;

		//比較安全的做法是先不給 token，在他註冊成功後導去登入頁，登入成功後再給 token
		const token = generateSendJWT(newUser);
		successHandler({ res, customMessage: '新增 user 成功', data: { token, name: newUser.name } });
	},
	async signInUser({ req, res, next }) {
		const { email, password } = req.body;

		if (!email || !password) {
			return next(appError(400, '帳號或密碼未填寫'));
		};

		// 在 User model 密碼預設為不顯示，所以這邊要用 select('+password') 來讓它顯示
		const user = await Users.findOne({ email }).select('+password');
		if (!user) {
			return next(appError(400, '帳號或密碼錯誤，請重試'));
		}	
		const auth = await bcrypt.compare(password, user.password);

		if (!auth) {
			return next(appError(400, '帳號或密碼錯誤，請重試'));
		}
		user.password = undefined;
		const token = generateSendJWT(user);
		successHandler({ res, customMessage: 'user 登入成功', data: { 
			token, 
			name: user.name,
			photo: user.photo,
			gender: user.gender
		}});
	},
	async getProfile({ req, res, next }) {
		if (!req.user) {
			return next(appError(401, '查無此會員'));
		}
		successHandler({ res, customMessage: '取得 user profile 成功', data: req.user});
	},
	async updatePassword({ req, res, next }) {
		const { newPassword, confirmNewPassword } = req.body;
		if (newPassword !== confirmNewPassword) {
			return next(appError(400, '密碼不一致，請重新填寫'));
		}
		const password = await bcrypt.hash(newPassword, 12);
		const user = await Users.findByIdAndUpdate(req.user.id, { password });

		if(!user) {
			return next(appError(400, '更新密碼失敗'));
		}

		const token = generateSendJWT(user);
		successHandler({ res, customMessage: '更新密碼成功', data: { token, name: user.name } });
	},
	async updateProfile({ req, res, next }) {
		const { name, gender, photo } = req.body;

		if (!name) {
			return next(appError(400, '請填寫名字'));
		}

		if (!validator.isLength(name, { min: 2 })) {
			return next(appError(400, '名字至少要有 2 個字元'));
		}

		const user = await Users.findByIdAndUpdate(req.user.id, { name, gender, photo }, { new: true });

		if (!user) {
			return next(appError(400, '更新 profile 失敗'));
		}
		successHandler({ res, customMessage: '更新 profile 成功', data: user });
	}
};

module.exports = users;