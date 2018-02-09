'use strict';

function createRedisClient(options={}) {
    console.log('factory', options)
    const redis = require('redis');
    let client;

    let {
        db = 0,
        port = 6379,
        host = 'localhost',
        path,
        password,
        redisOptions
    } = options;

    if (path) {
        client = redis.createClient(path, redisOptions);
    } else {
        console.log('here', host, port);
        client = redis.createClient(port, host, redisOptions);
    }

    if (password) {
        client.auth(password);
    }

    if (db) {
        client.select(db);
    }

    return client;
}

function createMemoryClient(options){}

function createClient(options={}) {

    const {transport = 'redis'} = options;

    if(transport === 'redis') {
        return createRedisClient(options);
    }

    return createMemoryClient(options);
}

module.exports = createClient;