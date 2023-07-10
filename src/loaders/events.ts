import { Collection } from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import { client } from "..";

export class EventsLoader implements ILoader<IEvent> {
  collection = new Collection<string, IEvent>();

  constructor() {
    const AllEventsFolder = readdirSync(
      path.resolve(path.join(__dirname, "..", "events"))
    ).filter((file) => file.endsWith(".ts"));

    for (let i = 0; i < AllEventsFolder.length; i++) {
      const EventFile: IEvent = require(path.resolve(
        path.join(__dirname, "..", "events", AllEventsFolder[i])
      ));

      this.load(EventFile);
    }
  }

  load(event: IEvent) {
    if (this.get(event.name)) {
      return console.log(
        `[LOADER - EVENTS] Tried to load a event that already exists, please look for duplicates.`
      );
    }

    client.on(event.name.toString(), (...args: any[]) =>
      event.execute(client, ...args)
    );

    this.collection.set(event.name, event);
    console.log(`[LOADER - EVENTS] Loaded event: ${event.name}.`);
  }

  get(key: string) {
    return this.collection.get(key);
  }
}
