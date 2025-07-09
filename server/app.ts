import createError from "http-errors";
import express, {Request, Response, NextFunction} from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import path from "path";
import cors from "cors";

import dotenv from 'dotenv';
import indexRouter from "./routes";
import postsRouter from "./routes/posts";
import categoriesRouter from "./routes/categories";
import tagsRouter from "./routes/tags";
import authRouter from "./routes/auth";
import commentsRouter from "./routes/comments";
import uploadRouter from "./routes/upload";
import usersRouter from "./routes/users";
import statsRouter from "./routes/stats";
import likesRouter from "./routes/likes";
import aboutRouter from "./routes/about";

const app = express();
dotenv.config();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json({ limit: '10mb' })); // 增加JSON请求体大小限制到10MB
app.use(express.urlencoded({ extended: false, limit: '10mb' })); // 增加URL编码请求体大小限制到10MB
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 为上传的文件提供 /api/uploads 路径的静态文件服务
app.use('/api/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/', indexRouter);
app.use('/api/posts', postsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/auth', authRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/users', usersRouter);
app.use('/api/stats', statsRouter);
app.use('/api/likes', likesRouter);
app.use('/api/about', aboutRouter);
app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err: { message: any; status: any; }, req: { app: { get: (arg0: string) => string; }; }, res: {
    locals: { message: any; error: any; };
    status: (arg0: any) => void;
    render: (arg0: string) => void;
}, next: any) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

export = app;
