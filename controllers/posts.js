const mongoose = require('mongoose');

const { appError } = require('../utils/errorHandler');
const successHandler = require('../utils/successHandler');
const Post = require('../models/posts');
//User 雖然沒有直接被使用，但因為在 Post model 中有關聯到，所以需要引入
const User = require('../models/users');

const posts = {
	async getPosts({ req, res, next }) {
		const { timeSort, search } = req.query;
		const q = search !== undefined ? { "content": new RegExp(search) } : {};
		const sort = timeSort !== undefined ? { createdAt: timeSort } : {};

		// asc 或 1 遞增(由小到大，由舊到新)，desc 或 -1 遞減(由大到小、由新到舊)
		// 也可以寫成 .sort(-createdAt)
		const data = await Post.find(q).sort(sort).populate({
			//對應的是 model 的"欄位"名稱
			path: 'user',
			select: 'name photo'
		});
		successHandler({ res, customMessage: '取得所有 posts 成功', data});
	},
	async createPosts({ req, res, next }) {
		const { body } = req;

		// 自定義的錯誤檢查
		if (body.content === undefined) {
			return next(appError(400, '未提供文章內容'))
		}
		
		const newPost = await Post.create({
			content: body.content.trim(),
			tags: body.tags,
			user: body.userId,
			// 如果沒有提供 photo，則使用預設圖片
			photo: body.photo || 'https://source.unsplash.com/random/300x200',
		});
		successHandler({ res, customMessage: '新增 post 成功', data: newPost});
	},
	async deleteAllPosts({req, res, next}) {
		// 避免前端忘記提供 post id 而刪除所有 posts
		// 因為沒有 postId 所以會被判斷為刪除所有 posts 的路徑
		if (req.originalUrl === '/posts/') {
			return next(appError(400, '未提供要刪除的 post id'));
		}
		const deletePosts = await Post.deleteMany();
		successHandler({ res, customMessage: '刪除所有 posts 成功', deletePosts});
	},
	async deletePost({ req, res, next }) {
		const { postId } = req.params;
		//mongoose.isValidObjectId() 只會檢查 id 的格式是否正確，不會檢查 id 是否存在
		if (!mongoose.isValidObjectId(postId)){
			return next(appError(400, '無效的 post id'));
		}

		const deletePost = await Post.findByIdAndDelete(postId);

		// 如果找不到對應的 post，deletePost 會是 null
		if (!deletePost) {
			return next(appError(400, '找不到對應的 post，刪除失敗'));
		}
		successHandler({ res, customMessage: '刪除單筆 post 成功', deletePost});
	},
	async updatePost({ req, res, next }) {
		const { postId } = req.params;
		const { body } = req;

		if (!mongoose.isValidObjectId(postId)) {
			return next(appError(400, '無效的 post id'));
		}

		if (body.content) {
			body.content = body.content.trim();
		}

		if (!body.content) {
			return next(appError(400, '未提供文章內容'));
		}

		const updatePost = await Post.findByIdAndUpdate(postId, body, { runValidators: true, new: true });

		if (!updatePost) {
			return next(appError(400, '找不到對應的 post，更新失敗'));
		}

		successHandler({ res, customMessage: '更新 post 成功', data: updatePost});
	}
};

module.exports = posts;