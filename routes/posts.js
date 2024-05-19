var express = require('express');
var router = express.Router();

const postsController = require('../controllers/posts');
const { handleErrorAsync } = require('../utils/errorHandler');

router.get('/', function (req, res) {
	postsController.getPosts({ req, res });
});

router.post('/', handleErrorAsync(async function (req, res, next) {
	await postsController.createPosts({ req, res, next });
}));

router.delete('/', handleErrorAsync(async function (req, res) {
	await postsController.deleteAllPosts({ req, res });
}));

router.delete('/:postId', handleErrorAsync(async function (req, res) {
	await postsController.deletePost({ req, res });
}));

router.patch('/:postId', handleErrorAsync(async function (req, res) {
	await postsController.updatePost({ req, res });
}));

module.exports = router;
