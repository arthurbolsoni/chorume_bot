export enum EBetOption {
  OPTION_A = "option_a",
  OPTION_B = "option_b",
}

export type TAddUserToBetDTO = {
  userId: string;
  betId: number;
  betAmount: number;
  betOption: EBetOption;
};

export type TGetBetDataDTO = {
  betId: number;
};

export type TGetUserBetsDTO = {
  userId: string;
};
