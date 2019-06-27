import express from 'express';
const router = express.Router();
import { Mongo } from 'mongodb-pool';
import {dbTables, server} from '../core/config';
import strings from '../core/strings';
import myCrypto from '../core/myCrypto';
import {ObjectID} from "mongodb";

const indexProc = (req, res, next) => {
    const styles = [
        // 'vendors/general/jquery-datatable/css/jquery.dataTables.css',
        'vendors/general/material-design-lite/material.css',
        'vendors/general/jquery-datatable/css/dataTables.material.css',
        'stylesheets/site/users.css',
    ];
    const scripts = [
        'vendors/general/jquery-datatable/js/jquery.dataTables.js',
        'vendors/general/jquery-datatable/js/dataTables.bootstrap4.js',
        'vendors/general/socket.io/socket.io.js',
        'javascripts/site/users.js',
    ];

    res.render('admin/users', {
        baseUrl: server.baseUrl,
        uri: 'admin/users',
        styles: styles,
        scripts: scripts,
        // bitmexAccounts: data,
    });
};

const usersListProc = (req, res, next) => {
    const params = req.query;

    const client = Mongo.getDb();
    const db = client.db('mukesh_elastic');
    const collection = db.collection(dbTables.users);
    collection.find({}).toArray().then((value) => {
        // console.log(value);
        let idx = 0;
        for (let item of value) {
            item['idx'] = idx++;
        }
        res.status(200).send({
            result: strings.success,
            data: value,
        })
    }).catch((reason) => {
        console.warn(reason);

        res.status(200).send({
            result: strings.error,
            message: strings.unknownServerError,
        });
    });
};

const userSaveProc = (req, res, next) => {
    const params = req.body;
    const _id = params.userId;


    const client = Mongo.getDb();
    const db = client.db('mukesh_elastic');
    const collection = db.collection(dbTables.users);
    collection.updateOne({_id: ObjectID(_id)}, {$set: params}, (err, result) => {
        // console.log(value);
        if (err) {
            console.warn(err);

            res.status(200).send({
                result: strings.error,
                message: strings.unknownServerError,
            });
        } else {
            res.status(200).send({
                result: strings.success,
                message: strings.successfullyEdited,
                // data: value,
            });
        }
    });
};

const userDeleteProc = (req, res, next) => {
    const params = req.body;
    const _id = params.userId;
    console.log(params);
    const client = Mongo.getDb();
    const db = client.db('mukesh_elastic');
    const collection = db.collection(dbTables.users);
    collection.deleteOne({_id: ObjectID(_id)}, (err, result) => {
        // console.log(value);
        if (err) {
            console.warn(reason);

            res.status(200).send({
                result: strings.error,
                message: strings.unknownServerError,
            });
        } else {
            res.status(200).send({
                result: strings.success,
            });
        }
    });
};

router.get('/', indexProc);
router.get('/users/list', usersListProc);
router.put('/users/save', userSaveProc);
router.delete('/users/save', userDeleteProc);

module.exports = router;
