const config = require("../config")
const Discord = require("discord.js")
const bot = new Discord.Client()
const { getString } = require("../utils/lang")
const {getUserById, DM} = require("../utils/functions")
//admins = ["252100217959219200"]
module.exports = {
    name: "report",
    description: "Use this command to report for admins",
    usage: "`"+config.prefix+"report`",
    aliases: 'rep',
    execute: async (message, args) => {
        message.react("👍")
        const questions = [
            '1. CHOOSE A REQUEST TYPE',
            '2. SUBJECT',
            '3. DESCRIPTION',
            '4. ANY LINK (OPTINAL)'
        ]
        let counter = 1
        const emoji = ['1️⃣','2️⃣','3️⃣','4️⃣']
        const types = ["BILLING ISSUES","GET TECH HELP","RECOVER MY ACCOUNT","REPORT A PLAYER"]
        const embed = new Discord.MessageEmbed().setColor("#EBCBD0").setTitle(questions[0]).addFields({ name: '1- BILLING ISSUES', value:'\u200B' , inline: true }, { name: '2- GET TECH HELP', value:'\u200B' , inline: false } , { name: '3- RECOVER MY ACCOUNT', value:'\u200B' , inline: false } , { name: '4- REPORT A PLAYER', value:'\u200B' , inline: false } ).setFooter("send the number of type")
        const NewMessage = await message.author.send(embed)
        //emoji.forEach(element => NewMessage.react(element))
        //
        //const filter2 = (reaction, user) => {
        //    return emoji.includes(reaction.emoji.name) && user.id === message.author.id;
        //};
        //NewMessage.awaitReactions(filter2, { max: 1, time: 60000, errors: ['time'] })
        //.then(collected => {
        //    const reaction = collected.first();
        //    if(emoji.includes(reaction._emoji.name)){
        //        let type = types[emoji.indexOf(reaction._emoji.name)];
        //        console.log(type)
        //        message.author.send(questions[1])
        //        
        //        if (counter < questions.length) {
        //            m.author.send(questions[counter++])
        //          }
        //    }
        //})
        const filter = (m) => {
            return m.author.id === message.author.id
        }

        const collector = new Discord.MessageCollector(message.channel, filter, {
            time: 1000 * 10, //1m
        })
        // message.author.send(questions[counter++])
        collector.on('collect', (m) => {
          if (counter < questions.length) {
            m.author.send(questions[counter++])
          }
        })
        collector.on('end', async (collected) => {
            console.log(`Collected ${collected.size} messages`)
      
             if (collected.size < questions.length) {
               message.reply('You did not answer the questions in time')
               return
             }
      
            let counter = 0
            let values = [];
            collected.forEach((value) => {
              //console.log(questions[counter++] ,value.content)
              values.push(value.content);
            })
            const embed2 =  new Discord.MessageEmbed().setColor("#EBCBD0").setTitle(`Report From ${message.author.id}`).addFields({ name: questions[0], value: types[values[0]] , inline: true }, { name: questions[1], value: values[1] , inline: false } , { name: questions[2], value: values[2] , inline: false } , { name: questions[3], value: values[3] , inline: false } )
            const user = await getUserById(bot,"252100217959219200")
            console.log(user)
            await DM(user,embed2);
        })
    }
}