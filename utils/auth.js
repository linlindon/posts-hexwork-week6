const jwt = require('jsonwebtoken');

const { appError } = require('../utils/errorHandler');
const Users = require('../models/users');

async function isAuth(req, res, next) {
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
};

const generateSendJWT = (user) => {
	const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_DAY });
	return token;
};

module.exports = {
	isAuth,
	generateSendJWT
};