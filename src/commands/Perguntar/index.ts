import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { guildService } from "../../services/guild";
import { ELogTypes, logsService } from "../../services/logs";
import { questionService } from "../../services/questions";

const PerguntarCommand: ICommand = {
  cooldown: 5 * 1000 * 60,
  data: new SlashCommandBuilder()
    .setName("perguntar")
    .setDescription("Comando para fazer uma pergunta relacionada a aula ativa.")
    .addStringOption((input) =>
      input
        .setName("pergunta")
        .setDescription("Envie sua pergunta ")
        .setMinLength(10)
        .setMaxLength(250)
        .setRequired(true)
    )
    .toJSON(),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild || !interaction.guildId) return;

    if (interaction.channelId !== "1123304309455593603") {
      await interaction.reply({
        content: "**Oops!** Você não pode usar este comando aqui.",
        ephemeral: true,
      });

      return;
    }

    const guildData = await guildService.getGuildData(interaction.guildId);

    const questionChannel = (await interaction.guild.channels
      .fetch(guildData.questionsChannel)
      .catch(async (err) => {
        await logsService.sendLog({
          type: ELogTypes.WARN,
          guildId: interaction.guildId as string,
          message: `${interaction.user} tentou enviar uma pergunta mas o canal de perguntas não foi configurado`,
        });

        await interaction.reply({
          content: `**Oops** Não foi possível enviar a sua pergunta.`,
          ephemeral: true,
        });
      })) as TextChannel;

    if (!questionChannel) return;

    const questionActionRow =
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("questionTimeout")
          .setLabel("Timeout")
          .setStyle(ButtonStyle.Danger)
      );

    const question = interaction.options.getString("pergunta");

    await questionChannel
      .send({
        content: `**Enviado por:** ${interaction.user}\n**Pergunta:** ${question}`,
        components: [questionActionRow],
      })
      .then(async (questionMessage) => {
        await questionService.createQuestion({
          author: interaction.user,
          content: question as string,
          message: questionMessage,
        });
      })
      .catch(async (err) => {
        await logsService.sendLog({
          type: ELogTypes.ERROR,
          guildId: interaction.guildId as string,
          message: `${interaction.user} não conseguiu enviar uma pergunta pois o canal de perguntas não foi configurado`,
        });
      });

    await interaction.reply({
      content: `**OK!** Pergunta enviada.`,
      ephemeral: true,
    });
  },
};

export = PerguntarCommand;
