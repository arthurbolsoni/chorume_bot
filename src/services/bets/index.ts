import { database } from "../../database";
import { userService } from "../user";
import { TAddUserToBetDTO, TGetBetDataDTO, TGetUserBetsDTO } from "./types";

class BetService {
  async addUserToBet({
    betId,
    userId,
    betAmount,
    betOption,
  }: TAddUserToBetDTO) {
    const userData = await userService.getUserData(userId);

    if (!betAmount){
      throw new Error("Você precisa apostar uma quantia!");
    }
    
    if (betAmount <= 0) {
      throw new Error("Você não pode apostar uma quantia negativa!");
    }

    const betData = await this.getBetData({ betId });

    if (!betData) {
      throw new Error("Esta bet não é válida!");
    }

    if (userData.coins < betAmount) {
      throw new Error("Você não tem dinheiro suficiente!");
    }

    if (betData.createdAt.getTime() + 1 * 60 * 1000 < Date.now()) {
      throw new Error("Essa bet não está mais aceitando apostas.");
    }

    await database.usersOnBets
      .findFirst({
        where: {
          userId,
          AND: {
            betId,
          },
        },
      })
      .then(async (alreadyBetted) => {
        if (alreadyBetted) {
          throw new Error("Você já apostou nesta bet.");
        }
      });

    await database.bets
      .update({
        where: {
          id: betId,
        },
        data: {
          deposit: {
            increment: betAmount,
          },
        },
      })
      .catch((err) => {
        throw new Error("Não foi possível atualizar os dados desta bet.");
      });

    await database.usersOnBets
      .create({
        data: {
          betId,
          amount: betAmount,
          option: betOption,
          userId,
        },
      })
      .catch((err) => {
        throw new Error("Não foi possível criar a sua aposta.");
      });

    return true;
  }

  async getBetData({ betId }: TGetBetDataDTO) {
    return await database.bets.findFirst({
      where: {
        id: betId,
      },
    });
  }

  async getAvailableBets() {
    return await database.bets.findMany();
  }

  async getUserBets({ userId }: TGetUserBetsDTO) {
    return await database.usersOnBets.findMany();
  }

  async createBet(optionA: string, optionB: string) {
    return await database.bets.create({
      data: {
        optionA,
        optionB,
        deposit: 0,
      },
    });
  }

  async deleteBet(betId: number) {
    console.log(betId);

    await database.usersOnBets.deleteMany({
      where: {
        betId,
      },
    });

    await database.bets.delete({
      where: {
        id: betId,
      },
    });
  }

  private async isBetOpen(betId: number) {
    const betData = await database.bets.findFirst({
      where: {
        id: betId,
      },
    });

    if (!betData) return false;

    if (betData.createdAt.getTime() + 60 * 5 * 1000 < Date.now()) return false;

    return true;
  }
}

export const betService = new BetService();
