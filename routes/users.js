var express = require('express');
var router = express.Router();

const usersController = require('../controllers/users');

router.get('/', function(req, res, next) {
	usersController.getUsers({ res });
});

router.post('/', function(req, res, next) {
	usersController.createUser({ req, res });
});

module.exports = router;
