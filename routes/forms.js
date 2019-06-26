import express from 'express';
import {Mongo} from 'mongodb-pool';
import {ObjectID} from 'mongodb';
import {dbTables} from '../core/config';
import strings from '../core/strings';
import sprintfJs from 'sprintf-js';

const router = express.Router();

const listProc = (req, res, next) => {
    const params = req.qeury;

    const client = Mongo.getDb();
    const db = client.db('mukesh_elastic');
    const collection = db.collection(dbTables.forms);
    collection.find({}).toArray().then((value) => {
        // console.log(value);
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

const addProc = (req, res, next) => {
    const params = req.body;
    const name = params.name;
    const columns = params.columns;
    // console.log(name, columns);
    // res.send('');
    // return;

    const client = Mongo.getDb();
    const db = client.db('mukesh_elastic');
    const collection = db.collection(dbTables.forms);
    let today = new Date();
    today = sprintfJs.sprintf("%02d/%02d/%04d", today.getMonth() + 1, today.getDate(), today.getFullYear());
    collection.insertOne({name, columns, createdDate: today, lastModifiedDate: today}, (err, result) => {
        if (err) {
            console.warn(err);

            res.status(200).send({
                result: strings.error,
                message: strings.unknownServerError,
            });
        } else {
            res.status(200).send({
                result: strings.success,
                message: strings.successfullyRegistered,
            });
        }
    });
};

const editProc = (req, res, next) => {
    const params = req.body;
    const _id = params._id;
    const name = params.name;
    const columns = params.columns;

    const client = Mongo.getDb();
    const db = client.db('mukesh_elastic');
    const collection = db.collection(dbTables.forms);
    let today = new Date();
    today = sprintfJs.sprintf("%02d/%02d/%04d", today.getMonth() + 1, today.getDate(), today.getFullYear());
    collection.updateOne({_id: ObjectID(_id)}, {$set: {name, columns, lastModifiedDate: today}}, (err, result) => {
        if (err) {
            console.warn(err);

            res.status(200).send({
                result: strings.error,
                message: strings.unknownServerError,
            });
        } else {
            // console.log(result);

            res.status(200).send({
                result: strings.success,
                message: strings.successfullyEdited,
            });
        }
    });
};

const deleteProc = (req, res, next) => {
    const params = req.query;
    const _id = params._id;

    const client = Mongo.getDb();
    const db = client.db('mukesh_elastic');
    const collection = db.collection(dbTables.forms);
    collection.deleteOne({_id: ObjectID(_id)}, (err, result) => {
        if (err) {
            console.warn(err);

            res.status(200).send({
                result: strings.error,
                message: strings.unknownServerError,
            });
        } else {
            // console.log(result);

            res.status(200).send({
                result: strings.success,
                message: strings.successfullyDeleted,
            });
        }
    });
};

router.get('/', listProc);
router.post('/', addProc);
router.put('/', editProc);
router.delete('/', deleteProc);
router.get('/list', listProc);
router.post('/add', addProc);
router.put('/edit', editProc);
router.delete('/delete', deleteProc);

module.exports = router;
