import express from 'express';
const router = express.Router();
import { Mongo } from 'mongodb-pool';
import {dbTables} from '../core/config';
import strings from '../core/strings';
import myCrypto from '../core/myCrypto';

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
    collection.insertOne({name, columns}, (err, result) => {
        if (err) {
            console.warn(err);

            res.status(200).send({
                result: strings.error,
                message: strings.unknownServerError,
            });
        } else {
            res.status(200).send({
                result: strings.success,
                message: strings.successfullySignedUp,
            });
        }
    });
};

const registerProc = (req, res, next) => {
    const params = req.body;
    const email = params.email;
    const name = params.name;
    const password = params.password;
    const role = params.role;
    const hash = myCrypto.hmacHex(password);

    const client = Mongo.getDb();
    const db = client.db('mukesh_elastic');
    const collection = db.collection(dbTables.users);

    collection.findOne({email}).then((value) => {
        if (value) {
            res.status(200).send({
                result: strings.error,
                message: strings.emailAlreadyRegistered,
            });
        } else {
            let document = {
                email,
                name,
                hash,
                role,
                allow: 0,
            };
            collection.insertOne(document, (err, result) => {
                if (err) {
                    console.warn(err);

                    res.status(200).send({
                        result: strings.error,
                        message: strings.unknownServerError,
                    });
                } else {
                    res.status(200).send({
                        result: strings.success,
                        message: strings.successfullySignedUp,
                    });
                }
            }).catch((reason) => {
                console.warn(reason);

                res.status(200).send({
                    result: strings.error,
                    message: strings.unknownServerError,
                });
            });
        }
    }).catch((reason) => {
        console.warn(reason);

        res.status(200).send({
            result: strings.error,
            message: strings.unknownServerError,
        });
    });
};

const signOutProc = (req, res, next) => {
    res.status(200).send({
        result: strings.success,
        message: strings.successfullySignedOut,
    });
};

router.get('/', listProc);
router.get('/list', listProc);
router.post('/add', addProc);
router.post('/register', registerProc);
router.post('/signout', signOutProc);

module.exports = router;
