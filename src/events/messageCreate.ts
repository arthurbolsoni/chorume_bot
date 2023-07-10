import { Client, Events, Message } from "discord.js";
import { guildService } from "../services/guild";
import { userService } from "../services/user";

class MessageCreateEvent implements IEvent {
  name: Events = Events.MessageCreate;
  async execute(client: Client<boolean>, message: Message) {
    if (!message.guild || !message.guildId) return;
    if (message.author.bot) return;

    const guildData = await guildService.getGuildData(message.guildId);
    const _userData = await userService.getUserData(message.author.id);

    if (message.channel.id == guildData.imageOnlyChannel) {
      if (message.content && message.attachments.size == 0) {
        return message.delete();
      }
    }
  }
}

module.exports = new MessageCreateEvent();
