var express = require('express');
var router = express.Router();

const postsController = require('../controllers/posts');

router.get('/', function (req, res) {
	postsController.getPosts({ req, res });
});

router.post('/', function (req, res, next) {
	postsController.createPosts({ req, res });
});

router.delete('/', function (req, res) {
	postsController.deleteAllPosts({ req, res });
});

router.delete('/:postId', function (req, res) {
	postsController.deletePost({ req, res });
})

router.patch('/:postId', function (req, res) {
	postsController.updatePost({ req, res });
});

module.exports = router;
