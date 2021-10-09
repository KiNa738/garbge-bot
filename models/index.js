const Sequelize = require("sequelize")
const dbConfig = require("../config").db_config


const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  logging: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
})

const db = {}

db.sequelize = sequelize

db.tickets = require("./ticket.model")(sequelize, Sequelize)

module.exports = db