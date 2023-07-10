import { Events, Client } from "discord.js";

class ReadyEvent implements IEvent {
  name: Events = Events.ClientReady;
  async execute(_client: Client<boolean>) {
    console.log("[EVENTS - READY] Bot ready to use.");
  }
}

module.exports = new ReadyEvent();
