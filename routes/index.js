const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
	res.send('<html><head></head><body><h1>home page</h1></body></html>');
});

module.exports = router;