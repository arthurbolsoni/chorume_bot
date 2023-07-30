import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { database } from "../../database";
import { betService } from "../../services/bets";
import { userService } from "../../services/user";
import { ELogTypes, logsService } from "../../services/logs";
import { EBetOption } from "../../services/bets/types";

const ApostasCommand: ICommand = {
  cooldown: 30 * 1000,
  data: new SlashCommandBuilder()
    .setName("aposta")
    .setDescription("Comando para apostar suas chorume coins.")
    .addSubcommand((input) =>
      input.setName("lista").setDescription("Ver lista de apostas abertas")
    )
    .addSubcommand((input) =>
      input.setName("criar").setDescription("(Moderadores) Criar uma aposta")
    )
    .addSubcommand((input) =>
      input
        .setName("fechar")
        .setDescription("(Moderadores) Fecha uma aposta")
        .addIntegerOption((input) =>
          input
            .setName("número")
            .setDescription("Bet que você quer fechar")
            .setRequired(true)
        )
        .addStringOption((input) =>
          input
            .setName("opção")
            .setDescription("Opção que venceu.")
            .addChoices(
              {
                name: "Opção A",
                value: "option_a",
              },
              {
                name: "Opção B",
                value: "option_b",
              }
            )
            .setRequired(true)
        )
    )
    .addSubcommand((input) =>
      input
        .setName("entrar")
        .setDescription("Entrar em uma aposta")
        .addIntegerOption((input) =>
          input
            .setName("número")
            .setDescription("Bet que você quer entrar")
            .setRequired(true)
        )
        .addStringOption((input) =>
          input
            .setName("opção")
            .setDescription("Opção que você quer apostar")
            .addChoices(
              {
                name: "Opção A",
                value: "option_a",
              },
              {
                name: "Opção B",
                value: "option_b",
              }
            )
            .setRequired(true)
        )
        .addIntegerOption((input) =>
          input
            .setName("coins")
            .setDescription("Valor para apostar")
            .setMinValue(1)
            .setRequired(true)
        )
    )
    .toJSON(),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild || !interaction.guildId) return;

    switch (interaction.options.getSubcommand()) {
      case "lista":
        const availableBets = await betService.getAvailableBets();

        const availableBetsEmbed = new EmbedBuilder()
          .setDescription("Confira a lista de bets abertas.")
          .setColor("DarkRed");

        availableBets.length > 0
          ? availableBets.map((bet) => {
            availableBetsEmbed.addFields({
              name: `Número ${bet.id}`,
              value: `**OPÇÃO A:** ${bet.optionA}\n **OPÇÃO B:** ${bet.optionB
                }\nACUMULADO: **${new Intl.NumberFormat(undefined, {
                  notation: "compact",
                }).format(bet.deposit)}**`,
            });
          })
          : availableBetsEmbed.addFields({
            name: "Oops",
            value: "Nenhuma bet aberta no momento",
          });

        await interaction.reply({
          embeds: [availableBetsEmbed],
        });

        break;

      case "entrar":
        const betAmount = interaction.options.getInteger("coins", true);
        const betOption = interaction.options.getString("opção", true);
        const betId = interaction.options.getInteger("número", true);

        const userData = await userService.getUserData(interaction.user.id);

        await betService
          .addUserToBet({
            betId,
            betAmount,
            betOption:
              betOption == "option_a"
                ? EBetOption.OPTION_A
                : EBetOption.OPTION_B,
            userId: interaction.user.id,
          })
          .then(async (newBetData) => {
            if (!newBetData) {
              return await interaction.reply({
                content: `**Oops!** Não foi possível realizar a sua aposta.`,
                ephemeral: true,
              });
            }

            userService.removeCoins(interaction.user.id, Number(betAmount));

            return await interaction.reply({
              content: `**OK!** Você apostou **${betAmount}** chorume coins na **${betOption == "option_a" ? "Opção A" : "Opção B"
                }**`,
              ephemeral: true,
            });
          })
          .catch(async (err) => {
            console.log(err);
            return await interaction.reply({
              content: `**Oops!** ${err.message}`,
              ephemeral: true,
            });
          });
        break;

      case "criar":
        if (
          !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
        ) {
          await interaction.reply({
            content: `**Oops!** Você não pode executar este comando.`,
            ephemeral: true,
          });
          return;
        }

        const createBetModal = new ModalBuilder()
          .setTitle("Criar aposta")
          .setCustomId("createBetModal");

        const primaryActionRow =
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("optionA")
              .setRequired(true)
              .setLabel("Opção A")
              .setStyle(TextInputStyle.Short)
          );

        const secondaryActionRow =
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("optionB")
              .setRequired(true)
              .setLabel("Opção B")
              .setStyle(TextInputStyle.Short)
          );

        createBetModal.addComponents(primaryActionRow, secondaryActionRow);

        await interaction.showModal(createBetModal);
        break;

      case "fechar":
        if (
          !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
        ) {
          await interaction.reply({
            content: `**Oops!** Você não pode executar este comando.`,
            ephemeral: true,
          });
          return;
        }

        const betToCloseWinner = interaction.options.getString("opção", true);
        const betToCloseId = interaction.options.getInteger("número", true);

        const targetBetData = await betService.getBetData({
          betId: betToCloseId,
        });

        if (!targetBetData) {
          return await interaction.reply({
            content: `**Oops!** A Aposta número **${betToCloseId}** não existe.`,
            ephemeral: true,
          });
        }

        const targetBetParticipants = await database.usersOnBets.findMany({
          where: {
            betId: targetBetData.id,
          },
        });

        const betWinners = await targetBetParticipants.filter(
          (x) => x.option === betToCloseWinner
        );

        const betLossers = await targetBetParticipants.filter(
          (x) => x.option !== betToCloseWinner
        );

        // quantidade total apostada pelos perdedores
        const soma_apostas_grupo_perdedor = betLossers.reduce((acc, curr) => acc + curr.amount, 0); // 50

        // quantidade total apostada pelos vencedores
        const soma_apostas_grupo_vencedor = betWinners.reduce((acc, curr) => acc + curr.amount, 0); // 100

        // porcentagem de cada vencedor
        const betWinnersPercentage = betWinners.map((x) => {
          const quantidade_apostado = x.amount; // 10

          const porcentagem_pessoal = quantidade_apostado / soma_apostas_grupo_vencedor; // 10 / 100 = 0.1
          const quantidade_a_receber = soma_apostas_grupo_perdedor * porcentagem_pessoal; // 50 * 0.1 = 5

          // soma da aposta do grupo vendedor
          return {
            userId: x.userId,
            quantidade_ganha: quantidade_a_receber + x.amount // adiciona o valor que a pessoa apostou e ganhou
          }
        });

        console.log("porcentagem de cada vencedor", betWinnersPercentage)

        for (const winner of betWinnersPercentage) {
          await userService.addCoins(
            winner.userId,
            winner.quantidade_ganha
          );
        });

        await interaction.reply(
          `**BET ENCERRADA!** \nNúmero ${targetBetData.id}\n**A:** ${targetBetData.optionA
          } vs **B:** ${targetBetData.optionB}\n**Apostas:** ${targetBetParticipants.length
          }\n**Ganhadores:** ${betWinners.length
          }\n**Acumulado**: ${Intl.NumberFormat(undefined, {
            notation: "compact",
          }).format(soma_apostas_grupo_perdedor)}`
        );


        await betService.deleteBet(targetBetData.id);

        await logsService.sendLog({
          type: ELogTypes.INFO,
          guildId: interaction.guildId,
          message: `${interaction.user} fechou uma aposta.`,
        });

        break;
    }
  },
};

export = ApostasCommand;
