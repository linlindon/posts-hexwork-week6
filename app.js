var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

require('./connections');

const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');
const { resErrorDev, resErrorProd } = require('./utils/errorHandler');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);

// 非預期的重大錯誤處理，server 還是會掛掉但至少會有錯誤訊息
process.on('uncaughtException', err => {
	console.error('uncaughtException', err);
	console.error(err.message);
	console.error(err.stack);
	process.exit(1);
})

// 捕捉 promise 的 catch error
process.on('unhandledRejection', (err, promise) => {
	console.error('未捕捉到的 rejection', promise, '原因：', err);
})

// 404 錯誤處理
app.use((req, res, next) => {
	res.status(404).send('Page not found');
});

// 500 錯誤處理
// next 參數就算沒用到也要寫上去，Express 会通过检查 middleware 函数的参数数量来區分普通的還是錯誤處理的 middleware。因此如果沒有寫完整，就不会被调用
app.use((err, req, res, next) => {
	err.statusCode = err.statusCode || 500;

	if (process.env.NODE_ENV === 'dev') {
		return resErrorDev(err, res);
	}

	// 專門處理 prod 環境 mongoose 的其中一種錯誤
	// 不可以直接把套件提供的錯誤訊息做轉拋，會很容易被別人猜到你是用什麼套件
	if (err.name === 'ValidationError') {
		//如果沒有定義 message，就會是 Schema 當初定義的訊息直接被轉拋
		err.message = "資料欄位填寫不正確，請重新輸入";
		err.isOperational = true;
		return resErrorProd(err, res)
	}

	resErrorProd(err, res);
});

//以下是 express 預設的靜態首頁，必須要移到最後或刪除，才不會影響到自己設定的路由
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
