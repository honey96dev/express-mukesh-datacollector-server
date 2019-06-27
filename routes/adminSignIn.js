import express from 'express';
const router = express.Router();
import { Mongo } from 'mongodb-pool';
import {dbTables, server} from '../core/config';
import strings from '../core/strings';
import myCrypto from '../core/myCrypto';

const indexProc = (req, res, next) => {
    res.render('admin/login', {baseUrl: server.baseUrl});
};

const signInProc = (req, res, next) => {
    const params = req.body;
    const email = params.email;
    const password = params.password;
    const hash = myCrypto.hmacHex(password);

    const client = Mongo.getDb();
    const db = client.db('mukesh_elastic');
    const collection = db.collection(dbTables.admins);
    collection.findOne({email}).then((value) => {
        if (value) {
            if (value.hash == hash) {
                if (value.allow == 1) {
                    req.session.user = {
                        id: value._id,
                        email: value.email,
                        name: value.name,
                    };
                    res.status(200).send({
                        result: strings.success,
                        message: strings.successfullySignedIn,
                        data: value,
                    });
                } else {
                    res.status(200).send({
                        result: strings.error,
                        message: strings.accountNowAllowed,
                    });
                }
            } else {
                res.status(200).send({
                    result: strings.error,
                    message: strings.passwordIncorrect,
                });
            }
            // collection.findOne({email, hash}).then((value) => {
            //     if (value) {
            //     } else {
            //         res.status(200).send({
            //             result: strings.error,
            //             message: strings.passwordIncorrect,
            //         });
            //     }
            // }).catch((reason) => {
            //     console.warn(reason);
            //
            //     res.status(200).send({
            //         result: strings.error,
            //         message: strings.unknownServerError,
            //     });
            // });
        } else {
            res.status(200).send({
                result: strings.error,
                message: strings.emailNotRegistered,
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
                    console.warn(reason);

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
    req.session.user = undefined;
    res.redirect('/');
};

router.get('/', indexProc);
router.post('/signin', signInProc);
// router.post('/register', registerProc);
router.get('/signout', signOutProc);

module.exports = router;
