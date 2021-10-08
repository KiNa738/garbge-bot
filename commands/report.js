const config = require("../config")
const Discord = require("discord.js")
const { getString } = require("../utils/lang")
const {getUserById, DM} = require("../utils/functions")
module.exports = {
    name: "report",
    description: "Use this command to report for admins",
    usage: "`"+config.prefix+"report`",
    aliases: 'rep',
    execute: async (message, args, bot) => {
        message.react("👍")
        const questions = [
            '1. CHOOSE A REQUEST TYPE',
            '2. SUBJECT',
            '3. DESCRIPTION',
            '4. ANY LINK (OPTINAL)'
        ]
        let type = ""
        let counter = 1
        const emoji = ['1️⃣','2️⃣','3️⃣','4️⃣']
        const types = ["BILLING ISSUES","GET TECH HELP","RECOVER MY ACCOUNT","REPORT A PLAYER"]
        const embed = new Discord.MessageEmbed().setColor("#7289DA").setTitle(questions[0]).addFields({ name: '1- BILLING ISSUES', value:'\u200B' , inline: true }, { name: '2- GET TECH HELP', value:'\u200B' , inline: false } , { name: '3- RECOVER MY ACCOUNT', value:'\u200B' , inline: false } , { name: '4- REPORT A PLAYER', value:'\u200B' , inline: false } ).setFooter("react to select")
        const NewMessage = await message.author.send(embed)
        emoji.forEach(element => NewMessage.react(element))
        const react = (reaction, user) => {
            return emoji.includes(reaction.emoji.name) && user.id === message.author.id;
        };
        NewMessage.awaitReactions(react, { max: 1, time: 1000 * 180})
        .then(collected => {
            const reaction = collected.first();
            if(emoji.includes(reaction._emoji.name)){
                type = types[emoji.indexOf(reaction._emoji.name)];
                message.author.send(questions[counter++])
            }
        })
        const filter = (m) => {
            return m.author.id === message.author.id
        }
        const collector = new Discord.MessageCollector(NewMessage.channel, filter, {
            time: 1000 * 180, //3m
        })
        collector.on('collect', async (m) => {
        if (counter < questions.length)  m.author.send(questions[counter++])
        else collector.stop()
        })
        collector.on('end', async (collected) => {
            let counter = 0
            let values = [];
            collected.forEach((value) => {
              values.push(value.content);
            })
            const embed2 =  new Discord.MessageEmbed().setColor("#EBCBD0").setTitle(`Report From ${message.author.tag}`).addFields({ name: questions[0], value: type , inline: true }, { name: questions[1], value: values[0] , inline: false } , { name: questions[2], value: values[1] , inline: false } , { name: questions[3], value: values[2] , inline: false } ).setFooter(message.author.id, message.author.displayAvatarURL())
            config.admins.forEach(async admin => DM( await getUserById(bot, admin), embed2))
            message.author.send("Your ticket was sent successfully!")
        })
    }
}