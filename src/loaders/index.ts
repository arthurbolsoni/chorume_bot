import { CommandsLoader } from "./commands";
import { EventsLoader } from "./events";
import { MessageComponentLoader } from "./messageComponents";
import { ModalsLoader } from "./modals";

export const Commands = new CommandsLoader();
export const Events = new EventsLoader();
export const Modals = new ModalsLoader();
export const MessageComponents = new MessageComponentLoader();
