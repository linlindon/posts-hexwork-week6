const errorHandler = ({res, err = {}, customMessage = ''}) => {
	let message = customMessage || err.message;
	console.log('進到 errorHandler', res.status, err.message);
	res.status(400).send({
		"status": false,
		message
	});
};

const appError = (httpStatus, errMessage, next) => {
	const err = new Error(errMessage);
	err.statusCode = httpStatus;
	// 這是一個自訂的屬性，用來判斷這個錯誤是不是我們預期的錯誤
	err.isOperational = true;
	return err;
};

// 處理 develop 環境的錯誤訊息，可以顯示較詳細的資訊
const resErrorDev = (err, res) => {
	res.status(err.statusCode).send({
		error: err,
		message: err.message,
		stack: err.stack
	})
};

// 處理 production 環境的錯誤訊息，只顯示簡單的訊息
const resErrorProd = (err, res) => {
	//isOperational 是我們自己定義的屬性，用來判斷這個錯誤是不是我們預期的錯誤
	if (err.isOperational) {
		res.status(err.statusCode).send({
			statusCode: err.statusCode,
			message: err.message
		});
	} else {
		console.log('出現重大錯誤', err);
		// 統一的罐頭訊息
		res.status(500).send({
			status: 'error',
			message: '系統錯誤，請洽管理員'
		})
	}
};

// 在每次專案被啟動的時候，都會執行 handleErrorAsync，因為是高階函示，而 express 註冊到路由的函示是它回傳的函式 (加上了 catch 的 middleware)
const handleErrorAsync = (fn) => {
	return function (req, res, next) {
		fn(req, res, next).catch(
			err => {
				console.log('進到 handleErrorAsync catch', err.message);
				next(err);
			}
		);
	}
};

module.exports = {
	errorHandler,
	appError,
	resErrorDev,
	resErrorProd,
	handleErrorAsync
};
