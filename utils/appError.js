const appError = (httpStatus, errMessage, next) => {
	const err = new Error(errMessage);
	err.statusCode = httpStatus;
	// 這是一個自訂的屬性，用來判斷這個錯誤是不是我們預期的錯誤
	err.isOperational = true;
	return err;
}

module.exports = appError;