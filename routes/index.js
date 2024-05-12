var express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
	res.render('index', { title: 'home page' });
});

module.exports = router;