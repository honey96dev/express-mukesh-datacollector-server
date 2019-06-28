import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cookieSessionLib from 'cookie-session';

import adminRouter from './routes/admin';
import adminSignInRouter from './routes/adminSignIn';
import signInRouter from './routes/signIn';
import formsRouter from './routes/forms';
import reportsRouter from './routes/reports';
import foldersRouter from './routes/folders';
import config from './core/config';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSessionLib({
    name: config.session.name,
    keys: [config.session.key],
    // Cookie Options
    // maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

function requiresLogin(req, res, next) {
    console.log('requiresLogin');
    if (req.session && req.session.user && req.session.user.id) {
        return next();
    } else {
        res.redirect('/admin-signin');
    }
}

function alreadyLogin(req, res, next) {
    console.log('alreadyLogin');
    // console.log('alreadyLogin', req.url);
    if (req.url === '/signout') {
        return next();
    }
    if (req.session && req.session.user && req.session.user.id) {
        res.redirect('/');
    } else {
        return next();
    }
}

app.use('/signin', signInRouter);
app.use('/forms', formsRouter);
app.use('/reports', reportsRouter);
app.use('/folders', foldersRouter);
app.use('/admin-signin', alreadyLogin, adminSignInRouter);
app.use('/', requiresLogin, adminRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        res.render('error/404', {baseUrl: config.server.baseUrl});
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({error: 'Not found'});
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
