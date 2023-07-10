import {
  ChatInputCommandInteraction,
  Client,
  Collection,
  CommandInteraction,
  Events,
  MessageComponentInteraction,
  ModalSubmitInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";

declare global {
  interface ICommand {
    cooldown: number;
    data: RESTPostAPIChatInputApplicationCommandsJSONBody;
    execute: (interaction: ChatInputCommandInteraction) => void;
  }

  interface ISubCommand {
    name: string;
    parentCommandName: string;
    options: [SlashCommandSubcommandBuilder];
    execute: (interaction: CommandInteraction) => void;
  }

  interface ILoader<T> {
    readonly collection: Collection<string, T>;
    load: (file: T) => void;
    get: (key: string) => T | undefined;
  }

  interface IEvent {
    name: Events;
    execute: (client: Client, ...args: any[]) => void;
  }

  interface IModal {
    customId: string;
    execute: (args: ModalSubmitInteraction) => Promise<void>;
  }

  interface IComponentInteraction<T> {
    customId: string;
    execute: (interaction: T) => Promise<void>;
  }

  namespace NodeJS {
    interface ProcessEnv {
      CLIENT_TOKEN: string;
      CLIENT_ID: string;
      DATABASE_AUTH_TOKEN: string;
      DATABASE_URL: string;
      DEVELOPMENT: boolean;
    }
  }
}

export {};
