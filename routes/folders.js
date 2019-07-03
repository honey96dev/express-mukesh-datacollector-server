import express from 'express';
import {Mongo} from 'mongodb-pool';
import {ObjectID} from 'mongodb';
import {dbTables, mongoDb} from '../core/config';
import strings from '../core/strings';
import sprintfJs from 'sprintf-js';

const router = express.Router();

const listProc = (req, res, next) => {
    const params = req.query;

    const client = Mongo.getDb();
    const db = client.db(mongoDb.database);
    const collection = db.collection(dbTables.folderDetails);
    collection.aggregate([
        // {
        //     $lookup:{
        //         from: dbTables.users,
        //         localField : "userId",
        //         foreignField : "_id",
        //         as : "user"
        //     }
        // }
        {
            $lookup: {
                from: dbTables.forms,
                localField: "formId",
                foreignField: "_id",
                as: "form"
            }
        },
        {
            $lookup: {
                from: dbTables.users,
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $group: {
                _id: '$folderId',
                data: {
                    $push: "$$ROOT"
                }
            }
        },
        {
            $lookup: {
                from: dbTables.folders,
                localField: "_id",
                foreignField: "_id",
                as: "folder"
            }
        }
    ]).toArray().then((result) => {
        // console.log(value);
        let index = 0;
        let finalResult = [];
        let item;
        for (let row of result) {
            item = row.folder[0];
            item['autoIndex'] = ++index;
            item['forms'] = [];
            item['users'] = [];
            item['userRole'] = strings.folderManager;
            for(let data of row.data) {
                for (let form of data.form) {
                    form.formUse = data.formUse;
                    item.forms.push(form);
                }
                for (let user of data.user) {
                    user.role = data.userRole;
                    item.users.push(user);
                }
            }

            finalResult.push(item);
        }

        // console.log(finalResult);
        res.status(200).send({
            result: strings.success,
            data: finalResult,
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
    const userId = ObjectID(params.userId);
    const name = params.name;
    const forms = params.forms;
    const users = params.users;

    const client = Mongo.getDb();
    const db = client.db(mongoDb.database);
    const collection = db.collection(dbTables.folders);
    let today = new Date();
    today = sprintfJs.sprintf("%02d/%02d/%04d", today.getMonth() + 1, today.getDate(), today.getFullYear());
    collection.insertOne({userId, name, createdDate: today, lastModifiedDate: today}, (err, result) => {
        if (err) {
            console.warn(err);
            res.status(200).send({
                result: strings.error,
                message: strings.unknownServerError,
            });
        } else {
            // console.log(result);
            const folderId = result.insertedId;
            let folderDetails = [];
            for (let form of forms) {
                folderDetails.push({folderId: ObjectID(folderId), formId: ObjectID(form._id), formUse: form.checked});
            }
            for (let user of users) {
                folderDetails.push({folderId: ObjectID(folderId), userId:ObjectID(user._id), userRole: user.role});
            }
            const collection2 = db.collection(dbTables.folderDetails);
            collection2.insertMany(folderDetails);
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
    const userId = ObjectID(params.userId);
    const name = params.name;
    const forms = params.forms;
    const users = params.users;

    const client = Mongo.getDb();
    const db = client.db(mongoDb.database);
    const collection = db.collection(dbTables.folders);
    let today = new Date();
    today = sprintfJs.sprintf("%02d/%02d/%04d", today.getMonth() + 1, today.getDate(), today.getFullYear());
    collection.updateOne({_id: ObjectID(_id)}, {$set: {userId, name, lastModifiedDate: today}}, (err, result) => {
        if (err) {
            console.warn(err);

            res.status(200).send({
                result: strings.error,
                message: strings.unknownServerError,
            });
        } else {
            // console.log(result);
            if (result.matchedCount) {
                const collection2 = db.collection(dbTables.folderDetails);
                collection2.deleteMany({folderId: ObjectID(_id)}).then((result) => {
                    let folderDetails = [];
                    for (let form of forms) {
                        folderDetails.push({folderId: ObjectID(_id), formId: ObjectID(form._id), formUse: form.checked});
                    }
                    for (let user of users) {
                        folderDetails.push({folderId: ObjectID(_id), userId: ObjectID(user._id), userRole: user.role});
                    }
                    collection2.insertMany(folderDetails);
                });
            }

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
    const db = client.db(mongoDb.database);
    const collection = db.collection(dbTables.folders);
    collection.deleteOne({_id: ObjectID(_id)}, (err, result) => {
        if (err) {
            console.warn(err);

            res.status(200).send({
                result: strings.error,
                message: strings.unknownServerError,
            });
        } else {
            // console.log(result);
            const collection2 = db.collection(dbTables.folderDetails);
            collection2.deleteMany({folderId: ObjectID(_id)});

            res.status(200).send({
                result: strings.success,
                message: strings.successfullyDeleted,
            });
        }
    });
};


const userListProc = (req, res, next) => {
    const params = req.query;

    const client = Mongo.getDb();
    const db = client.db(mongoDb.database);
    const collection = db.collection(dbTables.users);
    collection.find().toArray().then((value) => {
        // console.log(value);
        let index = 0;
        for (let item of value) {
            item['autoIndex'] = ++index;
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

// const user2FoldersProc = (req, res, next) => {
//     const params = req.query;
//     const userId = params.userId;
//     const userRoles = params.userRoles.split(',');
//
//     const client = Mongo.getDb();
//     const db = client.db(mongoDb.database);
//     const collection = db.collection(dbTables.folderDetails);
//     collection.aggregate([
//         {
//             $match:
//                 {
//                     'userId': ObjectID(userId),
//                     'userRole': {$in: userRoles},
//                 },
//         },
//         {
//             $lookup: {
//                 from: dbTables.folders,
//                 localField: "folderId",
//                 foreignField: "_id",
//                 as: "folder",
//             },
//         },
//         {
//             $group: {
//                 _id: '$userId',
//                 data: {
//                     $push: "$$ROOT",
//                 },
//             },
//         },
//         {
//             $lookup: {
//                 from: dbTables.users,
//                 localField: "_id",
//                 foreignField: "_id",
//                 as: "user",
//             },
//         }
//     ]).toArray().then((result) => {
//         // console.log(value);
//         let index = 0;
//         let finalResult = [];
//         let item;
//         for (let row of result) {
//             // item = row.user[0];
//             // item['autoIndex'] = ++index;
//             // item['folders'] = [];
//             for(let data of row.data) {
//                 for (let folder of data.folder) {
//                     finalResult.push(folder);
//                 }
//             }
//
//             // finalResult.push(item);
//         }
//
//         // console.log(finalResult);
//         res.status(200).send({
//             result: strings.success,
//             data: finalResult,
//         })
//     }).catch((reason) => {
//         console.warn(reason);
//
//         res.status(200).send({
//             result: strings.error,
//             message: strings.unknownServerError,
//         });
//     });
// };

const user2FoldersProc = (req, res, next) => {
    const params = req.query;
    const userId = params.userId;
    const userRoles = params.userRoles.split(',');

    const client = Mongo.getDb();
    const db = client.db(mongoDb.database);
    // const userCollection = db.collection(dbTables.users);
    // userCollection.findOne({_id: ObjectID(userId), role: 'Admin'}).then((value) => {
    //     if (value) {
    //
    //     } else {
            const collection = db.collection(dbTables.folderDetails);
            collection.aggregate([
                {
                    $match:
                        {
                            'userId': ObjectID(userId),
                            'userRole': {$in: userRoles},
                        },
                },
                {
                    $lookup: {
                        from: dbTables.folders,
                        localField: "folderId",
                        foreignField: "_id",
                        as: "folder",
                    },
                },
                {
                    $group: {
                        _id: '$userId',
                        data: {
                            $push: "$$ROOT",
                        },
                    },
                },
                {
                    $lookup: {
                        from: dbTables.users,
                        localField: "_id",
                        foreignField: "_id",
                        as: "user",
                    },
                }
            ]).toArray().then((result) => {
                // console.log(result);
                let finalResult = [];
                for (let row of result) {
                    for(let data of row.data) {
                        for (let folder of data.folder) {
                            folder['userRole'] = data.userRole;
                            finalResult.push(folder);
                        }
                    }

                    // finalResult.push(item);
                }

                // console.log(finalResult);
                res.status(200).send({
                    result: strings.success,
                    data: finalResult,
                })
            }).catch((reason) => {
                console.warn(reason);

                res.status(200).send({
                    result: strings.error,
                    message: strings.unknownServerError,
                });
            });
    //     }
    // });
};

const folder2Forms = (req, res, next) => {
    const params = req.query;
    const folderId = params.folderId;

    const client = Mongo.getDb();
    const db = client.db(mongoDb.database);
    const collection = db.collection(dbTables.folderDetails);
    collection.aggregate([
        {
            $match:
                {
                    'folderId': ObjectID(folderId),
                    'formUse': true,
                    'userId': null,
                },
        },
        {
            $lookup: {
                from: dbTables.forms,
                localField: "formId",
                foreignField: "_id",
                as: "form",
            },
        },
        {
            $group: {
                _id: '$userId',
                data: {
                    $push: "$$ROOT",
                },
            },
        },
    ]).toArray().then((result) => {
        // console.log(value);
        let finalResult = [];
        for (let row of result) {
            // item = row.user[0];
            // item['autoIndex'] = ++index;
            // item['folders'] = [];
            for(let data of row.data) {
                for (let form of data.form) {
                    finalResult.push(form);
                }
            }

            // finalResult.push(item);
        }

        // console.log(finalResult);
        res.status(200).send({
            result: strings.success,
            data: finalResult,
        })
    }).catch((reason) => {
        console.warn(reason);

        res.status(200).send({
            result: strings.error,
            message: strings.unknownServerError,
        });
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
router.get('/userList', userListProc);
router.get('/user2Folders', user2FoldersProc);
router.get('/folder2Forms', folder2Forms);

module.exports = router;
