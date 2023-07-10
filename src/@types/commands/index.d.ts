declare global {
  enum EAvailableCommands {
    TicketCommand = "ticket",
  }

  interface ICommandWithSubcommands {
    name: string;
    description: string;
  }
}

export {};
