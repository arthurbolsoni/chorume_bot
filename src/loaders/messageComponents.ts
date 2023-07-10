import { Collection } from "discord.js";
import { readdirSync } from "fs";
import path from "path";

export class MessageComponentLoader implements ILoader<IMessageComponent> {
  collection = new Collection<string, IMessageComponent>();

  constructor() {
    const allCommandsFolder = readdirSync(
      path.resolve(path.join(__dirname, "..", "commands"))
    );

    allCommandsFolder.forEach((commandFolder) => {
      try {
        const componentsFolder = readdirSync(
          path.resolve(
            path.join(__dirname, "..", "commands", commandFolder, "components")
          )
        );

        componentsFolder.forEach((componentFileName) => {
          const componentFile: IMessageComponent = require(path.resolve(
            path.join(
              __dirname,
              "..",
              "commands",
              commandFolder,
              "components",
              componentFileName
            )
          ));

          this.load(componentFile);
        });
      } catch (error) {
        console.log(
          `[LOADER - COMPONENTS] Couldn't load a component in the ${commandFolder} command.`
        );
      }
    });

    console.log(
      `[LOADER - COMPONENTS] ${this.collection.size} components loaded.`
    );
  }

  load(file: IMessageComponent) {
    console.log(file.customId);
    if (this.get(file.customId)) {
      return console.log(
        `[LOADER - COMPONENTS] The ${file.customId} component already exists.`
      );
    }

    this.collection.set(file.customId, file);
  }
  get(key: string): IMessageComponent | undefined {
    return this.collection.get(key);
  }
}
