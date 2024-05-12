const mongoose = require('mongoose');

const errorHandler = require('../utils/errorHandler');
const successHandler = require('../utils/successHandler');
const Post = require('../models/posts');

const posts = {
	async getPosts({ req, res}) {
		const { timeSort, search } = req.query;
		const q = search !== undefined ? { "content": new RegExp(search) } : {};

		// asc 或 1 遞增(由小到大，由舊到新)，desc 或 -1 遞減(由大到小、由新到舊)
		// 也可以寫成 .sort(-createdAt)
		const data = await Post.find(q).sort({ createdAt: timeSort });
		successHandler({ res, customMessage: '取得所有 posts 成功', data});
	},
	async createPosts({ req, res }) {
		try {
			const { body } = req;
			if (body.content && body.title) {
				const newPost = await Post.create({
					content: body.content.trim(),
					title: body.title.trim(),
					tags: body.tags,
				});
				successHandler({ res, customMessage: '新增 post 成功', data: newPost});
			} else {
				errorHandler({ res, customMessage: '未提供文章內容或標題' });
			}
		} catch (err) {
			errorHandler({res, err});
		}
	},
	async deleteAllPosts({req, res}) {
		try {
			// 避免前端忘記提供 post id 而刪除所有 posts
			// 因為沒有 postId 所以會被判斷為刪除所有 posts 的路徑
			if (req.originalUrl === '/posts/') {
				return errorHandler({ res, customMessage: '未提供要刪除的 post id' });
			}
			const deletePosts = await Post.deleteMany();
			successHandler({ res, customMessage: '刪除所有 posts 成功', deletePosts});
		} catch (err) {
			errorHandler({res, err});
		}
	},
	async deletePost({ req, res }) {
		const { postId } = req.params;
		try {
			if (!mongoose.isValidObjectId(postId)){
				return errorHandler({ res, customMessage: '無效的 post id'});
			}
			const deletePost = await Post.findByIdAndDelete(postId);
			successHandler({ res, customMessage: '刪除單筆 post 成功', deletePost});
		} catch (err) {
			errorHandler({res, err});
		}
	},
	async updatePost({ req, res }) {
		const { postId } = req.params;
		const { body } = req;

		try {
			if (!mongoose.isValidObjectId(postId)) {
				return errorHandler({ res, customMessage: '無效的 post id' });
			}
			if (body.content) {
				body.content = body.content.trim();
			}
			if (body.title) {
				body.title = body.title.trim();
			}
			const updatePost = await Post.findByIdAndUpdate(postId, body, { runValidators: true, new: true });
			successHandler({ res, customMessage: '更新 post 成功', data: updatePost});
		} catch (err) {
			errorHandler({res, err});
		}
	}
};

module.exports = posts;