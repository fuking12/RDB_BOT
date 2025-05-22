module.exports = {
  // ප්‍රධාන Commands
  ping: {
    description: "පින්ග් පණිවිඩයකට පිළිතුරු දෙයි",
    execute: async (client, message) => {
      await client.sendText(message.from, "🏓 Pong!");
    }
  },
  
  // Group Commands
  groupinfo: {
    description: "Group තොරතුරු",
    execute: async (client, message) => {
      if (!message.isGroupMsg) return;
      const groupData = await client.getGroupInfo(message.from);
      await client.sendText(message.from, 
        `👥 Group Name: ${groupData.name}\n` +
        `👥 Members: ${groupData.size}`
      );
    }
  }
};
