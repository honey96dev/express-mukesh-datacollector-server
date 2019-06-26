import { Mongo } from 'mongodb-pool';
import mongodb from 'mongodb';
import sprintfJs from 'sprintf-js';
import config, {mongoDb} from './config';

let db;

const connect = () => {
    const url = sprintfJs.sprintf('mongodb://%s:%s@%s:%d', encodeURIComponent(mongoDb.username), mongoDb.password, mongoDb.host, mongoDb.port);

    Mongo.getConnection(url, {
        poolSize: 10,
        useNewUrlParser: true,
    });

    // const mongo = mongodb.MongoClient;
    // mongo.connect(url, (err, client) => {
    //     if (err) {
    //         console.error(err);
    //
    //         return;
    //     }
    //     db = client.db(mongoDb.database);
    // })
};

module.exports = {
    connect,
};
