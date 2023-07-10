import { database } from "../../database";

type TSetLogChannelDTO = {
  channelId: string;
  guildId: string;
};

type TSetImageOnlyChannelDTO = TSetLogChannelDTO;
type TSetQuestionChannelDTO = TSetLogChannelDTO;

type TSetTicketCategoryDTO = {
  categoryId: string;
  guildId: string;
};

class GuildService {
  async createGuildData(guildId: string) {
    return await database.guilds.create({
      data: {
        id: guildId,
      },
    });
  }

  async getGuildData(guildId: string) {
    let guildData = await database.guilds.findFirst({
      where: {
        id: guildId,
      },
    });

    if (!guildData) {
      return await this.createGuildData(guildId);
    }

    return guildData;
  }

  async setLogChannel({ guildId, channelId }: TSetLogChannelDTO) {
    return await database.guilds.update({
      where: {
        id: guildId,
      },
      data: {
        logsChannel: channelId,
      },
    });
  }

  async setImageOnlyChannel({ guildId, channelId }: TSetImageOnlyChannelDTO) {
    return await database.guilds.update({
      where: {
        id: guildId,
      },
      data: {
        imageOnlyChannel: channelId,
      },
    });
  }

  async setTicketCategory({ categoryId, guildId }: TSetTicketCategoryDTO) {
    return await database.guilds.update({
      where: {
        id: guildId,
      },
      data: {
        ticketCategory: categoryId,
      },
    });
  }

  async setQuestionChannel({ channelId, guildId }: TSetLogChannelDTO) {
    return await database.guilds.update({
      where: {
        id: guildId,
      },
      data: {
        questionsChannel: channelId,
      },
    });
  }
}

export const guildService = new GuildService();
