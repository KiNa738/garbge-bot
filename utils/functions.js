const log = require("./log")

/**
 * Fetches a DJS channel object by ID. you can use this object to edit channel permissions
 * or read its history etc...
 * @param {DJS Client} bot Discord bot object
 * @param {Int} id Channel ID
 * @returns DJS channel object
 */
exports.getChannelById = async (bot, id) => {
    let channel = await bot.channels.cache.get(id)
    if(channel) return channel
    channel = await bot.channels.fetch(id).catch(err => log(`error fetching channel ${id}. ${err.message}`, "error"))
    return channel
}

/**
 * Fetches a DJS channel object by name. if there are multiple channels with the same name, the first one is chosen 
 * and sent from the bot cache. 
 * @param {DJS Guild} guild DJS guild object
 * @param {String} channelName 
 * @returns DJS channel object
 */
exports.getChannelByName = async (guild, channelName) => {
    const channel = await guild.channels.cache.find(channel => channel.name == channelName)
    return channel
}

/**
 * Fetches a Discord user object by ID.
 * @param {DJS Client} bot 
 * @param {Int} id userId 
 * @returns User object on success, 0 on failure
 */
exports.getUserById = async (bot, id) => {
    try {
        if(!id) return 0
        let user = await bot.users.cache.get(id)
        if(user) return user
        user = await bot.users.fetch(id)
        return user
    } catch(err) {
        log(`getUserById: ${err.message}`, "error")
    }
}

/**
 * Fetches a Discord user object by their username.
 * @param {DJS Guild Object} guild
 * @param {String} name username
 * @returns user object on success
 */
exports.getUserByUsername = async (guild, name) => {
    if(!guild || !name) return 0
    const member = await guild.members.fetch({ query: name })
    return member
}

/**
 * Fetches a Discord user object by their tag.
 * @param {DJS Client} bot 
 * @param {String} tag user tag
 * @returns user object on success
 */
exports.getUserByTag = async (guild, tag) => {
    if(!tag || !guild) return 0
    const member = await this.getMemberByTag(guild, tag)
    return member?.user
}

/**
 * Sends a message to a user or a member
 * @param {User|Member} user DJS user or member object 
 * @param {*} message 
 * @returns a message object
 */
exports.DM = async(user, message) => {
    if(!user) return 0
    // if(typeof user === "string") user = await this.getUserById(user)
    const mes = await user.send(message).catch(err => {
        if(process.env.debug_level > 1) log(`RagnabotAPI: attempting to DM ${user.username} with id ${user.id}: ${err.message}`, "warning")
        return false
    })
    return mes
}

/**
 * Fetches a discord guild object by its ID
 * @param {DJS Client} bot 
 * @param {Int} id Guild ID
 * @returns DJS guild object
 */
exports.getGuildById = async (bot, id) => {
    if(!id) return 0
    let guild = await bot.guilds.cache.get(id)
    if(guild) return guild
    guild = bot.guilds.fetch(id)
    return guild
}

/**
 * Fetches a Discord guild object by its name
 * @param {DJS Client} bot 
 * @param {String} name Guild Name
 * @returns DJS guild object
 */
exports.getGuildByName = async (bot, name) => {
    if(!name) return 0
    let guild = await bot.guilds.cache.find(guild => guild.name == name)
    return guild
}

/**
 * Fetches a discord member from a certain guild by their user ID
 * @param {DJS Guild} guild 
 * @param {String} memberId 
 * @returns DJS member object
 */
exports.getMemberById = async (guild, memberId) => {
    if(!memberId) return 0
    let member = guild.members.cache.get(memberId)
    if(member) return member
    member = guild.members.fetch(memberId, true)
    return member
}

/**
 * Fetches a discord member from a certain guild by their username
 * @param {DJS Guild} guild 
 * @param {String} username 
 * @returns DJS member object
 */
exports.getMemberByUsername = async(guild, username) => {
    if(!username || !guild) return 0
    let member = await guild.members.fetch({ query: username })
    return member.first()
}

exports.getMemberByTag = async (guild, tag) => {
    if(!guild || !tag) return 0
    let members = await guild.members.fetch({ query: tag.split("#")[0] })   // all members with this username
    const member = members.find(m => m.user.discriminator == tag.split("#")[1])
    return member
}