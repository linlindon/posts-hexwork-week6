const successHandler = ({ res, customMessage = '', data = null}) => {
	res.send({
		status: true,
		"message": customMessage || '',
		data
	});
};

module.exports = successHandler;