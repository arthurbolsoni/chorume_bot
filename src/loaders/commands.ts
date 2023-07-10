import { Collection, REST, Routes } from "discord.js";
import { readdirSync } from "fs";
import path from "path";

export class CommandsLoader implements ILoader<ICommand> {
  readonly collection: Collection<string, ICommand> = new Collection();

  constructor() {
    const AllCommandsFolder = readdirSync(
      path.resolve(path.join(__dirname, "..", "commands"))
    );

    AllCommandsFolder.forEach((CommandFolder) => {
      try {
        const CommandFile: ICommand = require(path.resolve(
          path.join(__dirname, "..", "commands", CommandFolder)
        ));

        this.load(CommandFile);
      } catch (error) {
        console.log(
          `[LOADER - COMMANDS] Couldn't load the ${CommandFolder} command.`
        );
      }
    });

    const rest = new REST().setToken(process.env.CLIENT_TOKEN as string);

    rest.put(Routes.applicationCommands(process.env.CLIENT_ID as string), {
      body: this.collection.map((x) => x.data),
    });
  }

  load(command: ICommand) {
    if (this.get(command.data.name)) {
      return console.log(
        `[LOADER - COMMANDS] Tried to load a command that already exists, please look for duplicates.`
      );
    }
    this.collection.set(command.data.name, command);
    console.log(`[LOADER - COMMANDS] Loaded command: ${command.data.name}.`);
  }

  get(name: string) {
    return this.collection.get(name);
  }
}
