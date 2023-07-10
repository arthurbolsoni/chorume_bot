import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { guildService } from "../../services/guild";
import { ELogTypes, logsService } from "../../services/logs";

const ConfigCommand: ICommand = {
  cooldown: 15 * 1000,
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription(
      "(Moderadores) Comando usado para configurar algumas funções do bot"
    )
    .addSubcommandGroup((group) =>
      group
        .setName("canal")
        .setDescription("(Moderadores) Configura canais para alguma ação.")
        .addSubcommand((input) =>
          input
            .setName("image-only")
            .setDescription(
              "(Moderadores) Troca a categoria que novos tickets serão criados."
            )
            .addChannelOption((channel) =>
              channel
                .setName("canal")
                .setDescription(
                  "canal que será usada para armazenar novos tickets."
                )
                .setRequired(true)
            )
        )
        .addSubcommand((input) =>
          input
            .setName("logs")
            .setDescription(
              "(Moderadores) Troca o canal que novos logs serão criados."
            )
            .addChannelOption((channel) =>
              channel
                .setName("canal")
                .setDescription("canal que será usada para enviar logs do bot.")
                .setRequired(true)
            )
        )
        .addSubcommand((input) =>
          input
            .setName("perguntas")
            .setDescription(
              "(Moderadores) Troca o canal que novas perguntas de aulas serão enviadas."
            )
            .addChannelOption((channel) =>
              channel
                .setName("canal")
                .setDescription("canal que será usada para enviar perguntas.")
                .setRequired(true)
            )
        )
    )
    .addSubcommandGroup((group) =>
      group
        .setName("categoria")
        .setDescription("(Moderadores) Configura categorias para alguma ação.")
        .addSubcommand((input) =>
          input
            .setName("ticket")
            .setDescription(
              "(Moderadores) Configura a categoria onde será criado novos tickets."
            )
            .addChannelOption((channel) =>
              channel
                .setName("categoria")
                .setDescription(
                  "categoria que será usada para criar novos tickets."
                )
                .setRequired(true)
            )
        )
    )
    .toJSON(),
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.guildId) {
      return;
    }

    if (
      !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
    ) {
      await interaction.reply({
        content: `**Oops!** Você não pode executar este comando.`,
        ephemeral: true,
      });
      return;
    }

    switch (interaction.options.getSubcommandGroup()) {
      case "canal":
        switch (interaction.options.getSubcommand()) {
          case "image-only":
            const imageOnlyChannel = await interaction.options.getChannel(
              "canal",
              true,
              [ChannelType.GuildText]
            );

            try {
              await guildService.setImageOnlyChannel({
                guildId: interaction.guildId,
                channelId: imageOnlyChannel.id,
              });

              logsService.sendLog({
                type: ELogTypes.INFO,
                message: `O Canal image-only foi atualizado para ${imageOnlyChannel} por ${interaction.user}.`,
                guildId: interaction.guildId,
              });

              await interaction.reply({
                content: `**OK!** Canal atualizado com sucesso!`,
                ephemeral: true,
              });
            } catch (err) {
              logsService.sendLog({
                type: ELogTypes.INFO,
                message: `Ocorreu um erro ao tentar atualizar o canal image-only.`,
                guildId: interaction.guildId,
              });

              await interaction.reply({
                content: `**Oops!** Ocorreu um erro ao tentar salvar canal.`,
                ephemeral: true,
              });
            }
            break;
          case "logs":
            const logsChannel = await interaction.options.getChannel(
              "canal",
              true,
              [ChannelType.GuildText]
            );

            try {
              await guildService.setLogChannel({
                guildId: interaction.guildId,
                channelId: logsChannel.id,
              });

              logsService.sendLog({
                type: ELogTypes.INFO,
                message: `O Canal de logs foi atualizado para ${logsChannel} por ${interaction.user}.`,
                guildId: interaction.guildId,
              });

              await interaction.reply({
                content: `**OK!** Canal atualizado com sucesso!`,
                ephemeral: true,
              });
            } catch (err) {
              logsService.sendLog({
                type: ELogTypes.ERROR,
                message: `Erro ao tentar salvar o novo canal de logs no banco de dados.`,
                guildId: interaction.guildId,
              });

              await interaction.reply({
                content: `**Oops!** Ocorreu um erro ao tentar atualizar o canal.`,
                ephemeral: true,
              });
            }
            break;
          case "perguntas":
            const questionChannel = await interaction.options.getChannel(
              "canal",
              true,
              [ChannelType.GuildText]
            );

            try {
              await guildService.setQuestionChannel({
                guildId: interaction.guildId,
                channelId: questionChannel.id,
              });

              logsService.sendLog({
                type: ELogTypes.INFO,
                message: `O Canal de perguntas foi atualizado para ${questionChannel} por ${interaction.user}.`,
                guildId: interaction.guildId,
              });

              await interaction.reply({
                content: `**OK!** Canal atualizado com sucesso!`,
                ephemeral: true,
              });
            } catch (err) {
              logsService.sendLog({
                type: ELogTypes.ERROR,
                message: `Erro ao tentar salvar o novo canal de perguntas no banco de dados.`,
                guildId: interaction.guildId,
              });

              await interaction.reply({
                content: `**Oops!** Ocorreu um erro ao tentar atualizar o canal.`,
                ephemeral: true,
              });
            }
            break;
        }
        break;

      case "categoria":
        switch (interaction.options.getSubcommand()) {
          case "ticket":
            const ticketsCategory = await interaction.options.getChannel(
              "categoria",
              true,
              [ChannelType.GuildCategory]
            );

            try {
              await guildService.setTicketCategory({
                guildId: interaction.guildId,
                categoryId: ticketsCategory.id,
              });

              logsService.sendLog({
                type: ELogTypes.INFO,
                message: `A Categoria de tickets foi atualizada para ${ticketsCategory} por ${interaction.user}.`,
                guildId: interaction.guildId,
              });

              await interaction.reply({
                content: `**OK!** Canal atualizado com sucesso!`,
                ephemeral: true,
              });
            } catch (err) {
              logsService.sendLog({
                type: ELogTypes.ERROR,
                message: `Erro ao tentar salvar a nova categoria de tickets no banco de dados.`,
                guildId: interaction.guildId,
              });

              await interaction.reply({
                content: `**Oops!** Ocorreu um erro ao tentar atualizar a categoria.`,
                ephemeral: true,
              });
            }
            break;
        }
        break;
    }
  },
};

export = ConfigCommand;
