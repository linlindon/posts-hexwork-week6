const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const bcrypt = require('bcrypt');

bcrypt.hash("12345", 12).then(hash => {
	console.log(hash);
}).catch(err => {
	console.error(err);
});

// bcrypt.compare('使用者在前台輸入的密碼', '資料庫裡面儲存的密碼').then((result) => { result 是 true 或 false })

// 註冊監聽非預期的重大錯誤處理，server 還是會掛掉但至少會有錯誤訊息
// 通常會放在最上面，因為這個錯誤處理是全域的，所以要在其他程式碼之前被註冊
process.on('uncaughtException', err => {
	console.error('uncaughtException', err);
	console.error(err.message);
	console.error(err.stack);
	process.exit(1);
})

require('./connections');

const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');
const { resErrorDev, resErrorProd } = require('./utils/errorHandler');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);

// 全域捕捉 promise 的 rejection，避免 handleErrorAsync 沒有包裝到的地方出錯
process.on('unhandledRejection', (err, promise) => {
	console.error('未捕捉到的 rejection', promise, '原因：', err);
})

// 404 錯誤處理
app.use((req, res, next) => {
	res.status(404).send('Page not found');
});

// 500 錯誤處理
// next 參數就算沒用到也要寫上去，Express 会通过检查 middleware 函数的参数数量来區分普通的還是錯誤處理的 middleware。因此如果沒有寫完整，就不会被调用
// 所有套件的錯誤也會被轉拋到這裡，通常要去看他們的文件來辨別錯誤的訊息
app.use((err, req, res, next) => {
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
});

//以下是 express 預設的靜態首頁，必須要移到最後或刪除，才不會影響到自己設定的路由
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
