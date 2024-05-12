var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	console.log('users page');
	res.json({ title: 'users page' });
	
});

module.exports = router;
