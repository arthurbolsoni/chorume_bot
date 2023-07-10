import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { client } from "../..";
import { guildService } from "../guild";

export enum ELogTypes {
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

type TSendLogDTO = {
  type: ELogTypes;
  message: string;
  guildId: string;
};

class LogsService {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async sendLog(logData: TSendLogDTO) {
    const guild = await this.client.guilds.fetch(logData.guildId);
    let guildData = await guildService.getGuildData(guild.id);

    const channel = (await this.client.channels
      .fetch(guildData.logsChannel)
      .catch((err) => {
        return console.log(
          `[LOG - ${logData.type.toUpperCase()}] ${logData.message}`
        );
      })) as TextChannel;

    if (!channel) return;

    const baseEmbed = new EmbedBuilder().setDescription(logData.message);

    switch (logData.type) {
      case ELogTypes.INFO:
        baseEmbed.setColor("Blue");
        channel.send({
          embeds: [baseEmbed],
        });
        break;

      case ELogTypes.ERROR:
        baseEmbed.setColor("Red");
        channel.send({
          embeds: [baseEmbed],
        });
        break;

      case ELogTypes.WARN:
        baseEmbed.setColor("Yellow");
        channel.send({
          embeds: [baseEmbed],
        });
        break;
    }
  }
}

export const logsService = new LogsService(client);
