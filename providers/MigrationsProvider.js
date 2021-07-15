'use strict'

/*
 * adonis-lucid
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const { ServiceProvider } = require('@adonisjs/fold')

class MigrationsProvider extends ServiceProvider {
  /**
   * Registering the schema class under
   * Adonis/Src/Schema namespace.
   *
   * @method _registerSchema
   *
   * @return {void}
   *
   * @private
   */
  _registerSchema() {
    this.app.bind('Adonis/Src/MongoSchema', () => require('../src/Schema'))
    this.app.alias('Adonis/Src/MongoSchema', 'MongoSchema')
  }

  /**
   * Registering the factory class under
   * Adonis/Src/Factory namespace.
   *
   * @method _registerFactory
   *
   * @return {void}
   *
   * @private
   */
  _registerFactory() {
    this.app.bind('Adonis/Src/MongoFactory', () => require('../src/Factory'))
    this.app.alias('Adonis/Src/MongoFactory', 'MongoFactory')
  }

  /**
   * Registers providers for all the migration related
   * commands
   *
   * @method _registerCommands
   *
   * @return {void}
   */
  _registerCommands() {
    this.app.bind('Adonis/Commands/MongoMigration:Run', () => require('../commands/MigrationRun'))
    this.app.bind('Adonis/Commands/MongoMigration:Rollback', () => require('../commands/MigrationRollback'))
    this.app.bind('Adonis/Commands/MongoMigration:Refresh', () => require('../commands/MigrationRefresh'))
    this.app.bind('Adonis/Commands/MongoMigration:Reset', () => require('../commands/MigrationReset'))
    this.app.bind('Adonis/Commands/MongoMigration:Status', () => require('../commands/MigrationStatus'))
    this.app.bind('Adonis/Commands/MongoSeed', () => require('../commands/Seed'))
  }

  /**
   * Registering the migration class under
   * Adonis/Src/Migration namespace.
   *
   * @method _registerMigration
   *
   * @return {void}
   *
   * @private
   */
  _registerMigration() {
    this.app.singleton('Adonis/Src/MongoMigration', (app) => {
      const Config = app.use('Adonis/Src/Config')
      const MongoDatabase = app.use('Adonis/Src/MongoDatabase')
      const Migration = require('../src/Migration')
      return new Migration(Config, MongoDatabase)
    })
    this.app.alias('Adonis/Src/MongoMigration', 'MongoMigration')
  }

  /**
   * Register all the required providers
   *
   * @method register
   *
   * @return {void}
   */
  register() {
    this._registerSchema()
    this._registerFactory()
    this._registerMigration()
    this._registerCommands()
  }

  /**
   * On boot add commands with ace
   *
   * @method boot
   *
   * @return {void}
   */
  boot() {
    const ace = require('@adonisjs/ace')
    ace.addCommand('Adonis/Commands/MongoMigration:Run')
    ace.addCommand('Adonis/Commands/MongoMigration:Rollback')
    ace.addCommand('Adonis/Commands/MongoMigration:Refresh')
    ace.addCommand('Adonis/Commands/MongoMigration:Reset')
    ace.addCommand('Adonis/Commands/MongoMigration:Status')
    ace.addCommand('Adonis/Commands/MongoSeed')
  }
}

module.exports = MigrationsProvider
