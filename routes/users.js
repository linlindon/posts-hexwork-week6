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

router.post('/sign-in', handleErrorAsync(async function(req, res, next) {
	await usersController.signInUser({ req, res, next });
}));

router.get('/profile', usersController.isAuth, handleErrorAsync(async function(req, res, next) {
	await usersController.getProfile({ req, res, next });
}));

module.exports = router;
