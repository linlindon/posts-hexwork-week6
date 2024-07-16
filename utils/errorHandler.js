const errorHandler = ({res, err = {}, customMessage = ''}) => {
	let message = customMessage || err.message;
	res.status(400).send({
		"status": false,
		message
	});
};

// next(appError()) 會到 app.use 那邊的錯誤處理
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
				next(err);
			}
		);
	}
};

const notFoundPageError = (req, res, next) => {
	res.status(404).send('Page not found');
};

const generalErrorHandler = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;

	if (process.env.NODE_ENV === 'dev') {
		return resErrorDev(err, res);
	}

	if (err.isOperational) {
		return resErrorProd(err, res);
	}

	// 專門處理 prod 環境 mongoose 的錯誤
	// 不可以直接把套件提供的錯誤訊息做轉拋，會很容易被別人猜到你是用什麼套件
	switch (err.name) {
		//如果沒有定義 message，就會是 Schema 當初定義的訊息直接被轉拋
		case 'ValidationError':
			err.message = '資料欄位填寫不完整或錯誤，請檢查';
			err.statusCode = 400;
			err.isOperational = true;
			break;
		case 'DocumentNotFoundError':
			err.message = '找不到對應的資料';
			err.statusCode = 400;
			err.isOperational = true;
			break;
		case 'CastError':
			err.message = '資料欄位填寫不正確，請重新輸入';
			err.statusCode = 400;
			err.isOperational = true;
			break;
		default:
			err.message = '發生錯誤，請稍候嘗試';
			err.isOperational = true;
	}

	resErrorProd(err, res);
};

module.exports = {
	errorHandler,
	appError,
	resErrorDev,
	resErrorProd,
	handleErrorAsync,
	notFoundPageError,
	generalErrorHandler
};
