const mongoose = require('mongoose');

const postsSchema = new mongoose.Schema(
	{
		title: { type: String, required: [true, '文章標題未填寫'] },
		content: { type: String, required: [true, '文章內容未填寫'] },
		author: String,
		likes: { type: Number, default: 0 },
		isShown: { type: Boolean, default: true },
		createdAt: { type: Date, default: Date.now, select: false },
		tags: [{ type: String, required: [true, '文章標籤未填寫'] }],
	},
	{
		versionKey: false
	}
 );

 const Post = mongoose.model('Post', postsSchema);

 module.exports = Post;