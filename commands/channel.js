const config = require("../config")
const Discord = require("discord.js")
const log = require("../utils/log")
const { getUserById, DM, delay, getChannelByName } = require("../utils/functions")
const makeEmbed = require("../utils/makeEmbed")
const db = require("../models")

//constants
const questions = [
  "1. CHOOSE A REQUEST TYPE",
  "2. SUBJECT",
  "3. DESCRIPTION",
  "4. ANY LINK (OPTINAL)",
]
const emoji = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "❌"]
const types = [
  "BILLING ISSUES",
  "GET TECH HELP",
  "RECOVER MY ACCOUNT",
  "REPORT A PLAYER",
]

module.exports = {
  name: "channel",
  description: "Use this command to report for admins",
  usage: "`" + config.prefix + "report`",
  aliases: "ch",
  execute: async (message, args, bot) => {
    const channelname = message.author.tag
    const exist = await getChannelByName(message.guild, `r-${channelname.replace("#", "").toLowerCase()}`)
    if (exist && !exist.deleted) {
      message.reply(`The r-${channelname.replace("#", "").toLowerCase()} channel already exists in this guild.`)
      return
    }
    const everyoneRole = message.guild.roles.everyone;
    const channel = await message.guild.channels.create(`r-${message.author.tag}`, {
      type: 'text',
      permissionOverwrites: [
        {
          id: bot.user.id,
          deny: 'VIEW_CHANNEL'
        },
        {
          id: message.author.id,
          allow: 'VIEW_CHANNEL'
        },
        {
          id: everyoneRole.id,
          deny: 'VIEW_CHANNEL'
        }
      ]
    })
    let counter = 1
    const embed = await makeEmbed(
      "#7289DA",
      questions[0],
      null,
      types.map((x, i) => ({ name: `${i + 1}.${x}`, value: "\u200B" })),
      null,
      "React to select",
      null,
      null
    )
    message.reply(`<#${channel.id}>`)
    message.guild.channels.cache.get(channel.id).send(`<@${message.author.id}>`)
    const NewMessage = await message.guild.channels.cache.get(channel.id).send(embed)
    if (!NewMessage) {
      log(`main: error executing a command.`, "error")
      return message.reply(`somethin went wrong`)
    }
    message.react("👍")
    emoji.forEach((element) => NewMessage.react(element))
    const react = (reaction, user) => {
      return (
        emoji.includes(reaction.emoji.name) && user.id === message.author.id
      )
    }
    const reactionCollector = new Discord.ReactionCollector(NewMessage, react, { max: 1, time: 1000 * 10 })
    reactionCollector.on("collect", async (collected) => {
      const reaction = collected
      if (emoji.includes(reaction._emoji.name)) {
        if (reaction._emoji.name == emoji[4]) {
          message.guild.channels.cache.get(channel.id).send('Cancelled')
          reactionCollector.stop()
          await delay(15000)
          message.guild.channels.cache.get(channel.id).delete()
          return
        }
        message.guild.channels.cache.get(channel.id).send(questions[counter++])
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
        if (counter < questions.length) message.guild.channels.cache.get(channel.id).send(questions[counter++])
        else collector.stop()
      })
      collector.on("end", async (collected) => {
        let values = []
        if (collected.size < 3) {
          message.guild.channels.cache.get(channel.id).send("report failed!")
          await delay(15000)
          message.guild.channels.cache.get(channel.id).delete()
          return
        }
        collected.forEach((value) => {
          values.push(value.content)
        })
        const newTicket = await db.tickets.create({
          discord_id: message.author.id,
          discord_name: message.author.tag,
          type: types[emoji.indexOf(reaction._emoji.name)],
          subject: values[0],
          description: values[1],
          links: values[2],
        })
        const embed2 = await makeEmbed(
          '#EBCBD0',
          `Report From ${message.author.tag} || id: ${newTicket.id}`,
          null,
          [{ name: questions[0], value: types[emoji.indexOf(reaction._emoji.name)] }, { name: questions[1], value: values[0] }, { name: questions[2], value: values[1] }, { name: questions[3], value: values[2] }],
          message.author.displayAvatarURL(),
          message.author.id,
          null,
          null
        )
        config.admins.forEach(async (admin) =>
          DM(await getUserById(bot, admin), embed2)
        )
        message.guild.channels.cache.get(channel.id).send("Your ticket has been sent successfully!")
        NewMessage.reactions.removeAll().catch(err => { })
        await delay(15000)
        message.guild.channels.cache.get(channel.id).delete()
        return
      })
    })
    reactionCollector.on("end", async (collected) => {
      message.guild.channels.cache.get(channel.id).send("report failed!")
      await delay(15000)
      message.guild.channels.cache.get(channel.id).delete()
      return
    })
  },
}
