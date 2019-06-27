import express from 'express';
import {Mongo} from 'mongodb-pool';
import {ObjectID} from 'mongodb';
import {dbTables} from '../core/config';
import strings from '../core/strings';
import sprintfJs from 'sprintf-js';

const router = express.Router();

const listProc = (req, res, next) => {
    const params = req.query;

    const client = Mongo.getDb();
    const db = client.db('mukesh_elastic');
    const collection = db.collection(dbTables.forms);
    collection.aggregate([
        {
            $lookup:{
                from: dbTables.reports,
                localField : "_id",
                foreignField : "formId",
                as : "reports"
            }
        }
    ]).toArray().then((value) => {
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
    });;
    // collection.find({}).toArray().then((value) => {
    //     // console.log(value);
    //     res.status(200).send({
    //         result: strings.success,
    //         data: value,
    //     })
    // }).catch((reason) => {
    //     console.warn(reason);
    //
    //     res.status(200).send({
    //         result: strings.error,
    //         message: strings.unknownServerError,
    //     });
    // });
};

const listByFormProc = (req, res, next) => {
    const params = req.query;
    const formId = params.formId;

    const client = Mongo.getDb();
    const db = client.db('mukesh_elastic');
    const collection = db.collection(dbTables.reports);
    collection.find({formId: ObjectID(formId)}).toArray().then((value) => {
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
    let params = req.body;

    const client = Mongo.getDb();
    const db = client.db('mukesh_elastic');
    const collection = db.collection(dbTables.reports);
    let today = new Date();
    today = sprintfJs.sprintf("%02d/%02d/%04d", today.getMonth() + 1, today.getDate(), today.getFullYear());

    let newData = {};
    Object.entries(params).forEach((entry) => {
        let key = entry[0];
        let value = entry[1];
        if (key != '_id') {
            newData[key] = value;
        }
    });

    newData['formId'] = ObjectID(params.formId);
    newData['createdDate'] = today;
    newData['lastModifiedDate'] = today;
    collection.insertOne(newData, (err, result) => {
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
    let params = req.body;
    const _id = params._id;

    const client = Mongo.getDb();
    const db = client.db('mukesh_elastic');
    const collection = db.collection(dbTables.reports);
    let today = new Date();
    today = sprintfJs.sprintf("%02d/%02d/%04d", today.getMonth() + 1, today.getDate(), today.getFullYear());

    let newData = {};
    Object.entries(params).forEach((entry) => {
        let key = entry[0];
        let value = entry[1];
        if (key != '_id') {
            newData[key] = value;
        }
    });

    newData['formId'] = ObjectID(params.formId);
    newData['lastModifiedDate'] = today;
    collection.updateOne({_id: ObjectID(_id)}, {$set: newData}, (err, result) => {
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
    const collection = db.collection(dbTables.reports);
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
router.get('/listByForm', listByFormProc);
router.post('/add', addProc);
router.put('/edit', editProc);
router.delete('/delete', deleteProc);

module.exports = router;
