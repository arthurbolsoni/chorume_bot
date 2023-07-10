import {
  ChatInputCommandInteraction,
  Client,
  Events,
  Interaction,
  InteractionType,
  PermissionFlagsBits,
} from "discord.js";
import { Commands, MessageComponents, Modals } from "../loaders";
import { commandCooldownService } from "../services/commandCooldown";
import { guildService } from "../services/guild";
import { questionService } from "../services/questions";
import { userService } from "../services/user";

class InteractionCreateEvent implements IEvent {
  name: Events = Events.InteractionCreate;
  async execute(
    _client: Client<boolean>,
    interaction: Interaction
  ): Promise<void> {
    if (!interaction.guild || !interaction.guildId) return;

    let guildData = await guildService.getGuildData(interaction.guildId);

    if (!guildData) {
      guildData = await guildService.createGuildData(interaction.guildId);
    }

    await userService.getUserData(interaction.user.id);

    switch (interaction.type) {
      case InteractionType.ApplicationCommand:
        const command = Commands.get(interaction.commandName);

        if (!command) return;

        if (
          interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
        ) {
          return command.execute(interaction as ChatInputCommandInteraction);
        }

        commandCooldownService
          .getCommandInCooldown({
            userId: interaction.user.id,
            commandName: command.data.name,
          })
          .then(async (commandCooldown) => {
            if (!commandCooldown || commandCooldown.until < Date.now()) {
              commandCooldownService.setCommandInCooldown(interaction.user.id, {
                name: command.data.name,
                until: Date.now() + command.cooldown,
              });

              command.execute(interaction as ChatInputCommandInteraction);
            } else {
              if (Date.now() < commandCooldown.until) {
                await interaction.reply({
                  content: `**Oops!** Este comando está em cooldown! Aguarde **${commandCooldownService.formatCooldownDuration(
                    commandCooldown.until - Date.now()
                  )}** para executar novamente.`,
                  ephemeral: true,
                });

                return;
              }
            }
          });

        break;

      case InteractionType.ModalSubmit:
        const modal = Modals.get(interaction.customId);

        if (!modal) return;

        modal.execute(interaction);
        break;

      case InteractionType.MessageComponent:
        if (interaction.isStringSelectMenu()) {
          const selectMenu = await MessageComponents.get(interaction.customId);

          if (!selectMenu) return;

          return selectMenu.execute(interaction);
        }

        if (interaction.isButton()) {
          switch (interaction.customId) {
            case "questionTimeout":
              if (
                !interaction.memberPermissions?.has(
                  PermissionFlagsBits.Administrator
                )
              ) {
                await interaction.reply({
                  content: `**Oops!** Você não pode executar este comando.`,
                  ephemeral: true,
                });
                return;
              }

              const questionData = await questionService.getQuestionFromMessage(
                interaction.message.id
              );

              if (!questionData) {
                await interaction.message.delete();
                return;
              }

              const questionAuthor = interaction.guild.members.cache.get(
                questionData.authorId
              );

              if (!questionAuthor) {
                await interaction.message.delete();
                return;
              }

              await questionAuthor
                .timeout(1 * 1000 * 60 * 60, "Pergunta merda mermao")
                .then(async () => {
                  await interaction.reply({
                    content: `**OK!** ${questionAuthor} foi punido com sucesso.`,
                    ephemeral: true,
                  });

                  await questionService.deleteQuestion({
                    message: interaction.message,
                  });

                  await interaction.message.delete();
                })
                .catch(async (err) => {
                  await interaction.reply({
                    content: `**Oops!** Não foi possível punir este usuário.`,
                    ephemeral: true,
                  });
                });

              break;
          }
        }
        break;

      default:
        console.log(
          `[EVENT - InteractionCreate] Unhandled interaction type: ${interaction.type}`
        );
        break;
    }
  }
}

module.exports = new InteractionCreateEvent();
