'use strict';

const { MongoClient } = require('mongodb');
const mquery = require('mquery');
const CE = require('../Exceptions');
const util = require('../../lib/util');
const _ = require('lodash');
const mongoUriBuilder = require('mongo-uri-builder');

mquery.Promise = global.Promise;

class Database {
  constructor(config) {
    if (config.client !== 'mongodb') {
      throw new CE.RuntimeException('invalid connection type');
    }

    this.connectionString = config.connectionString || mongoUriBuilder(config.connection);
    this.databaseName = new URL(this.connectionString).pathname.slice(1) || config.connection.database;
    
    this.connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...config.connectionOptions,
    };

    this.connection = null;
    this.db = null;
  }

  async connect() {
    if (!this.db) {
      this.connection = await MongoClient.connect(this.connectionString, this.connectionOptions);
      this.db = this.connection.db(this.databaseName);
    }
    return this.db;
  }

  async getCollection(collectionName) {
    const db = await this.connect();
    return db.collection(collectionName);
  }

  async find(collectionName, query = {}) {
    const collection = await this.getCollection(collectionName);
    return collection.find(query).toArray();
  }

  async findOne(collectionName, query = {}) {
    const collection = await this.getCollection(collectionName);
    return collection.findOne(query);
  }

  async insert(collectionName, document) {
    const collection = await this.getCollection(collectionName);
    return collection.insertOne(document);
  }

  async update(collectionName, filter, update) {
    const collection = await this.getCollection(collectionName);
    return collection.updateOne(filter, { $set: update });
  }

  async delete(collectionName, filter) {
    const collection = await this.getCollection(collectionName);
    return collection.deleteOne(filter);
  }

  async close() {
    await this.connection.close();
  }

  // Outros métodos...
}

// Exemplo de uso
(async () => {
  const db = new Database({ client: 'mongodb', connection: { database: 'mydb' } });
  await db.connect();
  const docs = await db.find('myCollection', { active: true });
  console.log(docs);
  await db.close();
})();
