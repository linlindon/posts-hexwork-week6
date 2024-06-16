const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users');
const { handleErrorAsync } = require('../utils/errorHandler');
const { isAuth } = require('../utils/auth');

router.get('/', handleErrorAsync(async function(req, res, next) {
	await usersController.getUsers({ res, next });
}));

router.post('/sign-up', handleErrorAsync(async function(req, res, next) {
	await usersController.createUser({ req, res, next });
}));

router.post('/sign-in', handleErrorAsync(async function(req, res, next) {
	await usersController.signInUser({ req, res, next });
}));

router.get('/profile', isAuth, handleErrorAsync(async function(req, res, next) {
	await usersController.getProfile({ req, res, next });
}));

router.patch('/update-password', isAuth, handleErrorAsync(async function(req, res, next) {
	await usersController.updatePassword({ req, res, next });
}));

router.patch('/update-profile', isAuth, handleErrorAsync(async function(req, res, next) {
	await usersController.updateProfile({ req, res, next });
}));

module.exports = router;
