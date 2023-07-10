import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { guildService } from "../../services/guild";
import { ETicketType, ticketService } from "../../services/ticket";

const TicketCommand: ICommand = {
  cooldown: 5 * 1000 * 60,
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("ticket command")
    .addSubcommand((input) =>
      input
        .setName("criar")
        .setDescription("Cria um novo ticket.")
        .addStringOption((option) =>
          option
            .setName("categoria")
            .setDescription("Categoria deste ticket.")
            .setRequired(true)
            .addChoices(
              {
                name: "Denúncia",
                value: ETicketType.REPORT,
              },
              {
                name: "Solicitar cargo",
                value: ETicketType.ROLE_REQUEST,
              }
            )
        )
    )
    .addSubcommand((input) =>
      input
        .setName("fechar")
        .setDescription("(Moderadores) Fechar ticket atual.")
    )
    .toJSON(),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild || !interaction.guildId) return;

    switch (interaction.options.getSubcommand()) {
      case "criar":
        const selectedTicketCategory =
          interaction.options.getString("categoria");

        if (!selectedTicketCategory) return;

        await ticketService
          .createTicketChannel({
            type: selectedTicketCategory as ETicketType,
            author: interaction.user,
            guild: interaction.guild,
          })
          .then(async () => {
            await interaction.reply({
              content: "Ticket criado.",
              ephemeral: true,
            });
          });
        break;

      case "fechar":
        if (!interaction.channel) {
          await interaction.reply({
            content: "**Oops!** Interação não suportada.",
            ephemeral: true,
          });
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

        const guildData = await guildService.getGuildData(interaction.guildId);
        const channelParentId = await interaction.guild.channels.cache.get(
          interaction.channelId
        )?.parentId;

        if (channelParentId !== guildData?.ticketCategory) {
          await interaction.reply({
            content: "**Oops!** Esta categoria não é a categoria de tickets.",
            ephemeral: true,
          });
          return;
        }

        await interaction.channel.delete();
        break;
    }
  },
};

export = TicketCommand;
