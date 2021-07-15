'use strict'

/*
 * adonis-fold
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/**
 * This file is used when you are not using lucid
 * with adonis framework, since framework will
 * use the providers.
 */

const _ = require('lodash')
const iocResolver = require('./lib/iocResolver')
let config = null

/**
 * The config class for using lucid standalone
 */
class Config {
  constructor(map) {
    this._map = map
  }

  get(connection) {
    return _.get(this._map, connection)
  }
}

class Ioc {
  constructor() {
    this._bindings = {}
  }

  bind(name, implementation) {
    this._bindings[name] = implementation
  }

  use(name) {
    return this._bindings[name]
  }

  make(name) {
    return this._bindings[name]
  }
}

class Resolver {
  forDir() {
  }
}

const ioc = new Ioc()
const resolver = new Resolver()

iocResolver.setFold({ ioc, resolver })

module.exports = function (configMap) {
  config = new Config({ database: configMap })

  const MongoDatabase = require('./src/Database/Manager')
  const MongoModel = require('./src/LucidMongo/Model')
  const MongoSchema = require('./src/Schema')
  const MongoMigration = require('./src/Migration')
  const MongoFactory = require('./src/Factory')
  const db = new MongoDatabase(config)
  ioc.bind('Adonis/Src/MongoDatabase', db)

  return {
    db,
    MongoModel,
    MongoSchema,
    MongoMigration,
    MongoFactory,
    Models: {
      add(name, implementation) {
        implementation._bootIfNotBooted()
        ioc.bind(`model:${name}`, implementation)
        return this
      },

      get(name) {
        return ioc.use(`model:${name}`)
      },

      clear() {
        _.each(ioc._bindings, (value, name) => {
          if (name.startsWith('model:')) {
            delete ioc._bindings[name]
          }
        })
      }
    }
  }
}
