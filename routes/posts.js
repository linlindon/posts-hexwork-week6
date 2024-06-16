const express = require('express');
const router = express.Router();

const postsController = require('../controllers/posts');
const { handleErrorAsync } = require('../utils/errorHandler');
const { isAuth } = require('../utils/auth');

router.get('/', isAuth, handleErrorAsync(async function (req, res, next) {
	postsController.getPosts({ req, res, next });
}));

router.post('/', isAuth, handleErrorAsync(async function (req, res, next) {
	await postsController.createPosts({ req, res, next });
}));

router.delete('/', handleErrorAsync(async function (req, res, next) {
	await postsController.deleteAllPosts({ req, res, next });
}));

router.delete('/:postId', handleErrorAsync(async function (req, res, next) {
	await postsController.deletePost({ req, res, next });
}));

router.patch('/:postId', handleErrorAsync(async function (req, res, next) {
	await postsController.updatePost({ req, res, next });
}));

module.exports = router;
