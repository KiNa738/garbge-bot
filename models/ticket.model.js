module.exports = (sequelize, Sequelize) => {
  const Ticket = sequelize.define("tickets", {
    discord_id: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "0",
    },
    discord_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("pending", "active", "resolved", "closed"),
      defaultValue: "pending",
    },
    type: {
      type: Sequelize.STRING,
      defaultValue: "1. BILLING ISSUES",
    },
    subject: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    links: {
      type: Sequelize.TEXT,
    },
  })
  return Ticket
}
