const config = require("../config")
const Discord = require("discord.js")
const log = require("../utils/log")
const { getUserById, DM } = require("../utils/functions")
const makeEmbed = require("../utils/makeEmbed")
const db = require("../models")

//constants
const questions = [
  "1. CHOOSE A REQUEST TYPE",
  "2. SUBJECT",
  "3. DESCRIPTION",
  "4. ANY LINK (OPTINAL)",
]
const emoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"]
const types = [
  "1. BILLING ISSUES",
  "2. GET TECH HELP",
  "3. RECOVER MY ACCOUNT",
  "4. REPORT A PLAYER",
]

module.exports = {
  name: "report",
  description: "Use this command to report for admins",
  usage: "`" + config.prefix + "report`",
  aliases: "rep",
  execute: async (message, args, bot) => {
    let counter = 1
    const embed = await makeEmbed(
      "#7289DA",
      questions[0],
      null,
      types.map((x) => ({ name: x, value: "\u200B" })),
      null,
      "React to select",
      null,
      null
    )
    const NewMessage = await DM(message.author, embed)
    if (!NewMessage) {
      log(`main: error executing a command.`, "error")
      return message.reply(`DM me with the command!`)
    }
    message.react("👍")
    emoji.forEach((element) => NewMessage.react(element))
    const react = (reaction, user) => {
      return (
        emoji.includes(reaction.emoji.name) && user.id === message.author.id
      )
    }
    NewMessage.awaitReactions(react, { max: 1, time: 1000 * 180 }).then(
      (collected) => {
        const reaction = collected.first()
        if (emoji.includes(reaction._emoji.name)) {
          DM(message.author, questions[counter++])
        }
        const filter = (m) => {
          return m.author.id === message.author.id
        }
        const collector = new Discord.MessageCollector(
          NewMessage.channel,
          filter,
          { time: 1000 * 180 }
        )
        collector.on("collect", async (m) => {
          if (counter < questions.length) DM(m.author, questions[counter++])
          else collector.stop()
        })
        collector.on("end", async (collected) => {
          let values = []
          collected.forEach((value) => {
            values.push(value.content)
          })
          const embed2 = new Discord.MessageEmbed()
            .setColor("#EBCBD0")
            .setTitle(`Report From ${message.author.tag}`)
            .addFields(
              {
                name: questions[0],
                value: types[emoji.indexOf(reaction._emoji.name)],
                inline: true,
              },
              { name: questions[1], value: values[0], inline: false },
              { name: questions[2], value: values[1], inline: false },
              { name: questions[3], value: values[2], inline: false },
              { name: `Status`, value: `New`, inline: false }
            )
            .setFooter(message.author.id, message.author.displayAvatarURL())
          await db.tickets.create({
            discord_id: message.author.id,
            discord_name: message.author.tag,
            type: types[emoji.indexOf(reaction._emoji.name)],
            subject: values[0],
            description: values[1],
            links: values[2],
          })
          config.admins.forEach(async (admin) =>
            DM(await getUserById(bot, admin), embed2)
          )
          DM(message.author, "Your ticket was sent successfully!")
        })
      }
    )
  },
}
