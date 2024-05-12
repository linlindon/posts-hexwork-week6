const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema(
	{
		title: { type: String, required: [true, '文章標題未填寫'] },
		content: { type: String, required: [true, '文章內容未填寫'] },
		user: { 
			type: mongoose.Schema.ObjectId,
			//對應的是要關聯的 model 名稱，也就是當初創建時的命名，要注意大小寫
			ref: 'User',
			required: [true, '文章作者未填寫'],
		},
		likes: { type: Number, default: 0 },
		isShown: { type: Boolean, default: true },
		createdAt: { type: Date, default: Date.now, select: false },
		tags: [{ type: String, required: [true, '文章標籤未填寫'] }],
		photo: String,
	},
	{
		versionKey: false
	}
 );

 const Post = mongoose.model('Post', postsSchema);

 module.exports = Post;