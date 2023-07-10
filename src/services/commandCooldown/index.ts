import { User } from "discord.js";
import humanizeDuration from "humanize-duration";

type TCommandInCooldown = {
  name: string;
  until: number;
};

type TCooldown = {
  userId: User["id"];
  commands: TCommandInCooldown[];
};

type TGetCommandInCooldown = {
  userId: TCooldown["userId"];
  commandName: TCommandInCooldown["name"];
};

class CommandCooldownService {
  cooldowns: Map<string, TCooldown>;

  constructor() {
    this.cooldowns = new Map<string, TCooldown>();
  }

  async setCommandInCooldown(userId: string, cooldownData: TCommandInCooldown) {
    const userCommandCooldownData = this.cooldowns.get(userId);

    if (!userCommandCooldownData) {
      this.cooldowns.set(userId, {
        userId: userId,
        commands: [],
      });

      this.setCommandInCooldown(userId, cooldownData);
      return;
    }

    const commandDataExists = userCommandCooldownData.commands.find(
      (x) => x.name === cooldownData.name
    );

    if (!commandDataExists) {
      return userCommandCooldownData.commands.push(cooldownData);
    }

    if (commandDataExists && commandDataExists.until < Date.now()) {
      commandDataExists.until = cooldownData.until;
      return this.getCommandInCooldown({
        userId,
        commandName: cooldownData.name,
      });
    }

    return this.getCommandInCooldown({
      userId,
      commandName: cooldownData.name,
    });
  }

  async getCommandInCooldown({ commandName, userId }: TGetCommandInCooldown) {
    const userCommandCooldownData = this.cooldowns.get(userId);
    return (
      userCommandCooldownData &&
      userCommandCooldownData.commands.find((x) => x.name === commandName)
    );
  }

  formatCooldownDuration(time: number) {
    return humanizeDuration(time, {
      language: "pt",
      round: true,
      serialComma: false,
      conjunction: " e ",
    });
  }
}

export const commandCooldownService = new CommandCooldownService();
