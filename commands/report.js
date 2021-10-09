const config = require("../config")
const Discord = require("discord.js")
const { getString } = require("../utils/lang")
const { getUserById, DM, log, insert } = require("../utils/functions")
const makeEmbed = require("../utils/makeEmbed")

//constants
const questions = [
    '1. CHOOSE A REQUEST TYPE',
    '2. SUBJECT',
    '3. DESCRIPTION',
    '4. ANY LINK (OPTINAL)'
]
const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣']
const types = ["1. BILLING ISSUES", "2. GET TECH HELP", "3. RECOVER MY ACCOUNT", "4. REPORT A PLAYER"]

module.exports = {
    name: "report",
    description: "Use this command to report for admins",
    usage: "`" + config.prefix + "report`",
    aliases: 'rep',
    execute: async (message, args, bot) => {
        let counter = 1
        const embed = await makeEmbed("#7289DA", questions[0], null, types.map(x => ({ name: x, value: '\u200B' })), null, 'React to select', null, null)
        const NewMessage = await DM(message.author, embed)
        if (!NewMessage) {
            log(`main: error executing a command.`, "error")
            return message.reply(`DM me with the command!`)
        }
        message.react("👍")
        emoji.forEach(element => NewMessage.react(element))
        const react = (reaction, user) => {
            return emoji.includes(reaction.emoji.name) && user.id === message.author.id
        }
        NewMessage.awaitReactions(react, { max: 1, time: 1000 * 180 })
            .then(collected => {
                const reaction = collected.first();
                if (emoji.includes(reaction._emoji.name)) {
                    DM(message.author, questions[counter++])
                }
                const filter = (m) => {
                    return m.author.id === message.author.id
                }
                const collector = new Discord.MessageCollector(NewMessage.channel, filter, { time: 1000 * 180 })
                collector.on('collect', async (m) => {
                    if (counter < questions.length) DM(m.author, questions[counter++])
                    else collector.stop()
                })
                collector.on('end', async (collected) => {
                    let counter = 0
                    let values = [];
                    collected.forEach((value) => {
                        values.push(value.content);
                    })
                    var today = new Date();
                    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                    var dateTime = date + ' ' + time;
                    const embed2 = new Discord.MessageEmbed().setColor("#EBCBD0").setTitle(`Report From ${message.author.tag}`).addFields({ name: questions[0], value: types[emoji.indexOf(reaction._emoji.name)], inline: true }, { name: questions[1], value: values[0], inline: false }, { name: questions[2], value: values[1], inline: false }, { name: questions[3], value: values[2], inline: false }, { name: `Status`, value: `New`, inline: false }).setFooter(message.author.id, message.author.displayAvatarURL())
                    insert(`tickets`, [`time`,`discord_id`, `discord_name`, `status`, `type`, `subject`, `desc`, `links`],[`'${dateTime}'`, `'${message.author.id}'`, `'${message.author.tag}'`, `'New'`, `'${types[emoji.indexOf(reaction._emoji.name)]}'`, `'${values[0]}'`, `'${values[1]}'`, `'${values[2]}'`])
                    config.admins.forEach(async admin => DM(await getUserById(bot, admin), embed2))
                    DM(message.author, "Your ticket was sent successfully!")
                })
            })
    }
}