import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { userService } from "../../services/user";

const CoinsCommand: ICommand = {
  cooldown: 1 * 1000 * 60,
  data: new SlashCommandBuilder()
    .setName("coins")
    .setDescription("Comando para ver quantas coins você tem.")
    .toJSON(),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild || !interaction.guildId) return;

    const userData = await userService.getUserData(interaction.user.id);

    return await interaction.reply({
      content: `**OK!** Você tem **${Intl.NumberFormat(undefined, {
        notation: "compact",
      }).format(userData.coins)}** coins.`,
      ephemeral: true
    });
  },
};

export = CoinsCommand;
