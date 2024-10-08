'use strict'

/*
 * adonis-lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const moment = require('moment')
const _ = require('lodash')
const BaseModel = require('./Base')
const QueryBuilder = require('../QueryBuilder')
// const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

/**
 * Pivot model is used when a pivot relationship
 * instance is created. If user defines a custom
 * `pivotModel` then this model is not used.
 *
 * This model is not compatable with the actual Lucid
 * model, but is somehow similar.
 *
 * @class PivotModel
 * @constructor
 */
class PivotModel extends BaseModel {
  /**
   * Insantiate the model instance
   *
   * @method _instantiate
   *
   * @return {undefined}
   *
   * @private
   */
  _instantiate () {
    super._instantiate()
    this.__setters__.push('$withTimestamps')
    this.__setters__.push('$collection')
    this.__setters__.push('$connection')
    this.$withTimestamps = false
  }

  /**
   * Perform required actions to newUp the model instance. This
   * method does not call setters since it is supposed to be
   * called after `fetch` or `find`.
   *
   * @method newUp
   *
   * @param  {Object} row
   *
   * @return {undefined}
   */
  newUp (row) {
    this.$persisted = true
    this.$attributes = row

    /**
     * Set created at by default
     */
    if (this.$attributes.created_at) {
      this.$attributes.created_at = moment(this.$attributes.created_at)
    }

    /**
     * Set updated at by default
     */
    if (this.$attributes.updated_at) {
      this.$attributes.updated_at = moment(this.$attributes.updated_at)
    }

    /**
     * Making instance frozen, so that no one update it directly.
     *
     * @type {Boolean}
     */
    this.$frozen = true
  }

  /**
   * Converts model to an object. This method will cast dates.
   *
   * @method toObject
   *
   * @return {Object}
   */
  toObject () {
    return _.transform(this.$attributes, (result, value, key) => {
      /**
       * If value is an instance of moment and there is no getter defined
       * for it, then cast it as a date.
       */
      if (value instanceof moment) {
        result[key] = this.constructor.castDates(key, value)
      } else {
        result[key] = value
      }
      return result
    }, {})
  }

  /**
   * Set attribute on model instance. Setting properties
   * manually or calling the `set` function has no
   * difference.
   *
   * Note this method will call the setter
   *
   * @method set
   *
   * @param  {String} name
   * @param  {Mixed} value
   *
   * @return {undefined}
   */
  set (name, value) {
    this.$attributes[name] = value
  }

  /**
   * Returns query builder instance for a given connection
   * and collection
   *
   * @method query
   *
   * @param  {String} collection
   * @param  {Object} connection
   *
   * @return {Object}
   */
  query (collection, connection) {
    const query = new QueryBuilder(this.constructor, connection)
    query.collection = collection
    return query
  }

  /**
   * Save the model instance to the database.
   *
   * @method save
   * @async
   *
   * @return {undefined}
   */
  async save () {
    /**
     * Set timestamps when user has defined them on pivot
     * relationship via `withTimestamps` method.
     */
    if (this.$withTimestamps) {
      this.$attributes.created_at = moment().toISOString()
      this.$attributes.updated_at = moment().toISOString()
    }

    const result = await this
      .query(this.$collection, this.$connection)
      .insert(this.$attributes)

    this.primaryKeyValue = result.insertedId
    this.$persisted = true
    this.$frozen = true
  }
}

module.exports = PivotModel
