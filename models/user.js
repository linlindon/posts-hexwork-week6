const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: [true, '使用者名稱未填寫'] },
		email: { type: String, required: [true, '使用者 email 未填寫'] },
		password: { type: String, required: [true, '使用者密碼未填寫'] },
		phone: String,
		createdAt: { type: Date, default: Date.now },
		intro: String,
	},
	{
		versionKey: false
	}
);

const User = mongoose.model('User', userSchema);

module.exports = User;