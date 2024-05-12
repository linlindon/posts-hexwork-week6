const errorHandler = ({res, err = {}, customMessage = ''}) => {
	let message = customMessage || err.message;
	console.log('進到 errorHandler', res.status, err.message);
	res.status(400).send({
		"status": false,
		message
	});
};

module.exports = errorHandler;