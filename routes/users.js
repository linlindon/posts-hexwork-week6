const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users');
const { handleErrorAsync } = require('../utils/errorHandler');

router.get('/', handleErrorAsync(async function(req, res, next) {
	await usersController.getUsers({ res, next });
}));

router.post('/sign-up', handleErrorAsync(async function(req, res, next) {
	await usersController.createUser({ req, res, next });
}));

module.exports = router;
