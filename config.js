require("dotenv").config()

module.exports = {
  //The Category ID that the private report channels will move to
  reportscategoryid: ['896764640825073715'],
  // A list of Discord IDs that can use admin commands
  admins: ['252100217959219200'],
  // The display name of your bot (can also be set through Discord developer portal.)
  bot_name: "Marwan",
  // Bot activity. Displayed as playing ... in Discord.
  activity: "VALORANT",
  // The prefix used before commands
  prefix: "!",
  // Language setting
  // To add a new language, copy English.js in the languages folder, change its name, and translate the lines on that file.
  // The bot will address users depending on their language role. Make sure to add the role NAME in the language setting below.
  language: [
    {
      name: "English", // Language name
      file_name: "English.js", // Name of the language file
      language_role_name: "", // Users who have a role with this name will be addressed with this language (required if the language is not default)
      default: true, // The default language. Only one language can be default.
    },
  ],
  db_config: {
    HOST: process.env.MYSQL_HOST,
    USER: process.env.MYSQL_USER,
    PASSWORD: process.env.MYSQL_PASSWORD,
    DB: process.env.MYSQL_DATABASE,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
}
