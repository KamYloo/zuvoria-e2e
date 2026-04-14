import { APIResponse } from "@playwright/test";
import { BaseApi } from "./BaseApi";

export class ChatApi extends BaseApi {
  async createChat(userIds: number[], chatRoomName = ""): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/chats/create`, {
      data: {
        userIds,
        chatRoomName,
      },
    });
  }

  async getUserChats(): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}/chats/user`);
  }

  async deleteChat(chatId: number): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}/chats/delete/${chatId}`);
  }
}
