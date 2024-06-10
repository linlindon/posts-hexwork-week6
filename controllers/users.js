const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const { appError} = require('../utils/errorHandler');
const successHandler = require('../utils/successHandler');
const Users = require('../models/users');

const generateSendJWT = (user) => {
	const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_DAY });
	return token;
};

const users = {
	async getUsers({res}) {
		const data = await Users.find();
		successHandler({ res, customMessage: '取得所有 users 成功', data });
	},
	async createUser({ req, res, next }) {
		let { name, email, password, confirmPassword, photo, gender } = req.body;

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
			return next(appError(400, '查無此帳號'));
		}	
		const auth = await bcrypt.compare(password, user.password);

		if (!auth) {
			return next(appError(400, '密碼錯誤'));
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
	async isAuth( req, res, next ) {
		let token;
		if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
			token = req.headers.authorization.split(' ')[1];
		}
		
		if (!token) {
			return next(appError(401, '請先登入'));
		}

		// 驗證 token
		const decode = await new Promise((resolve, reject) => {
			jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
				if (err) {
					reject(err);
				} else {
					resolve(payload);
				}
			});
		});

		const currentUser = await Users.findById(decode.id);		
		// request 可以自定義屬性上去，這樣在下一個 middleware 就可以取得這個值
		req.user = currentUser;
		next();
	},
	async getProfile({ req, res, next }) {
		if (!req.user) {
			return next(appError(401, '查無此會員'));
		}
		successHandler({ res, customMessage: '取得 user profile 成功', data: req.user});
	}
};

module.exports = users;