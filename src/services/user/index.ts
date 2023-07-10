import { database } from "../../database";

class UserService {
  async createUserData(userId: string) {
    return await database.users.create({
      data: {
        id: userId,
      },
    });
  }

  async getUserData(userId: string) {
    let userData = await database.users.findFirst({
      where: {
        id: userId,
      },
    });

    if (!userData) {
      return await this.createUserData(userId);
    }

    return userData;
  }

  async removeCoins(userId: string, amount: number) {
    const userData = await this.getUserData(userId);

    await database.users.update({
      data: {
        coins: userData.coins - amount,
      },
      where: {
        id: userId,
      },
    });
  }

  async addCoins(userId: string, amount: number) {
    await this.getUserData(userId);

    await database.users
      .update({
        data: {
          coins: {
            increment: amount,
          },
        },
        where: {
          id: userId,
        },
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

export const userService = new UserService();
