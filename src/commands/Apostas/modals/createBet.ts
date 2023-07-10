import { betService } from "../../../services/bets";
import { ELogTypes, logsService } from "../../../services/logs";

const CreateBetModal: IModal = {
  customId: "createBetModal",
  execute: async (interaction) => {
    if (!interaction.guild || !interaction.guildId) return;

    const optionA = interaction.fields.getTextInputValue("optionA");
    const optionB = interaction.fields.getTextInputValue("optionB");

    const createdBetData = await betService.createBet(
      String(optionA),
      String(optionB)
    );

    if (!createdBetData) {
      await logsService.sendLog({
        type: ELogTypes.ERROR,
        guildId: interaction.guildId,
        message: `${interaction.user} tentou criar uma aposta, mas algum erro inesperado occoreu.`,
      });

      await interaction.reply({
        content: "**Oops! Não foi possível criar esta aposta.",
        ephemeral: true,
      });

      return;
    }

    await logsService.sendLog({
      type: ELogTypes.INFO,
      guildId: interaction.guildId,
      message: `${interaction.user} criou uma aposta.`,
    });

    await interaction.reply({
      content: `**OK!** Aposta criada com sucesso!`,
      ephemeral: true,
    });
  },
};

export = CreateBetModal;
