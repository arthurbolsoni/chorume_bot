import {
  CategoryChannel,
  Client,
  Guild,
  PermissionFlagsBits,
  User,
} from "discord.js";
import { client } from "../..";
import { guildService } from "../guild";
import { ELogTypes, logsService } from "../logs";

export enum ETicketType {
  REPORT = "report",
  ROLE_REQUEST = "roleRequest",
}

type TTicketData = {
  guild: Guild;
  author: User;
  type: ETicketType;
};

class TicketService {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async createTicketChannel(ticketData: TTicketData) {
    const guildData = await guildService.getGuildData(ticketData.guild.id);

    const ticketCategory = (await ticketData.guild.channels.cache.get(
      guildData.ticketCategory
    )) as CategoryChannel;

    if (!ticketCategory) {
      await logsService.sendLog({
        type: ELogTypes.WARN,
        message: `Não foi possível criar um ticket pois a categoria de tickets não foi configurada.`,
        guildId: ticketData.guild.id,
      });

      throw new Error("Failed to get the tickets category");
    }

    const ticketChannelEmoji = this.resolveChannelEmoji(ticketData.type);

    try {
      const ticketChannel = await ticketCategory.children.create({
        name: `[${ticketChannelEmoji}]-${ticketData.author.username}`,
        permissionOverwrites: [
          {
            id: ticketData.guild.roles.everyone,
            deny: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
          {
            id: ticketData.author.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
            ],
          },
        ],
      });

      ticketChannel.send({
        content: `${ticketData.author} seu ticket foi criado com sucesso, agora, por favor escreva o que deseja.`,
      });

      logsService.sendLog({
        type: ELogTypes.INFO,
        guildId: ticketData.guild.id,
        message: `${ticketData.author} criou um novo ticket com a categoria de **${ticketData.type}**`,
      });

      return ticketChannel;
    } catch (err) {
      await logsService.sendLog({
        type: ELogTypes.ERROR,
        message: `Não foi possível criar um ticket pois não consegui criar o canal.`,
        guildId: ticketData.guild.id,
      });

      throw new Error("Unable to create ticket channel");
    }
  }

  private resolveChannelEmoji(ticketType: ETicketType) {
    switch (ticketType) {
      case ETicketType.REPORT:
        return "🚨";

      case ETicketType.ROLE_REQUEST:
        return "🎖️";
    }
  }
}

export const ticketService = new TicketService(client);
