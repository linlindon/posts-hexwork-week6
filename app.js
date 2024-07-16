const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

// 註冊監聽非預期的重大錯誤處理，server 還是會掛掉但至少會有錯誤訊息
// 通常會放在最上面，因為這個錯誤處理是全域的，所以要在其他程式碼之前被註冊
process.on('uncaughtException', err => {
	console.error('uncaughtException', err);
	console.error(err.message);
	console.error(err.stack);
	process.exit(1);
})

require('./connections');
const { notFoundPageError, generalErrorHandler } = require('./utils/errorHandler');

const indexRouter = require('./routes/index');
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');


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
app.use(notFoundPageError);

// 500 錯誤處理
// next 參數就算沒用到也要寫上去，Express 会通过检查 middleware 函数的参数数量来區分普通的還是錯誤處理的 middleware。因此如果沒有寫完整，就不会被调用
// 所有套件的錯誤也會被轉拋到這裡，通常要去看他們的文件來辨別錯誤的訊息
app.use(generalErrorHandler);

//以下是 express 預設的靜態首頁，必須要移到最後或刪除，才不會影響到自己設定的路由
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
