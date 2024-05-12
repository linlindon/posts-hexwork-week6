const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: [true, '使用者名稱未填寫'] },
		email: { 
			type: String, 
			required: [true, '使用者 email 未填寫'],
			unique: true, //唯一性
			lowercase: true,
		},
		password: { 
			type: String, 
			required: [true, '使用者密碼未填寫'],
			select: false, //不回傳密碼
		},
		createdAt: { type: Date, default: Date.now },
		photo: String,
		gender: { 
			type: String, 
			enum: ['F', 'M'],
			required: [true, '使用者性別未選擇']
		}
	},
	{
		versionKey: false
	}
);

const User = mongoose.model('User', userSchema);

module.exports = User;