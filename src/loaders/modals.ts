import { Collection } from "discord.js";
import { readdirSync } from "fs";
import path from "path";

export class ModalsLoader implements ILoader<IModal> {
  collection = new Collection<string, IModal>();

  constructor() {
    const allCommandsFolder = readdirSync(
      path.resolve(path.join(__dirname, "..", "commands"))
    );

    allCommandsFolder.forEach((commandFolder) => {
      try {
        const modalsFolder = readdirSync(
          path.resolve(
            path.join(__dirname, "..", "commands", commandFolder, "modals")
          )
        );

        modalsFolder.forEach((modalFileName) => {
          const modalFile: IModal = require(path.resolve(
            path.join(
              __dirname,
              "..",
              "commands",
              commandFolder,
              "modals",
              modalFileName
            )
          ));

          this.load(modalFile);
        });
      } catch (error) {
        console.log(
          `[LOADER - MODALS] Couldn't load the ${commandFolder} modal.`
        );
      }
    });

    console.log(`[LOADER - MODALS] ${this.collection.size} modals loaded.`);
  }

  load(file: IModal) {
    console.log(file.customId)
    if (this.get(file.customId)) {
      return console.log(
        `[LOADER - MODALS] The ${file.customId} modal already exists.`
      );
    }

    this.collection.set(file.customId, file);
  }
  get(key: string): IModal | undefined {
    return this.collection.get(key);
  }
}
