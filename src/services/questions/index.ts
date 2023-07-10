import { Message, User } from "discord.js";
import { database } from "../../database";

type TCreateTicketDTO = {
  content: string;
  author: User;
  message: Message;
};

type TDeleteTicketDTO = {
  message: Message;
};

class QuestionService {
  async createQuestion({ content, author, message }: TCreateTicketDTO) {
    return await database.questions.create({
      data: {
        content,
        messageId: message.id,
        author: {
          connectOrCreate: {
            where: {
              id: author.id,
            },
            create: {
              id: author.id,
            },
          },
        },
      },
    });
  }

  async deleteQuestion({ message }: TDeleteTicketDTO) {
    const questionData = await this.getQuestionFromMessage(message.id);

    return await database.questions.delete({
      where: {
        id: questionData?.id,
      },
    });
  }

  async getQuestionFromMessage(messageId: string) {
    return await database.questions.findFirst({
      where: {
        messageId,
      },
    });
  }
}

export const questionService = new QuestionService();
