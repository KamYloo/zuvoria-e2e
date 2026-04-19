import { APIResponse } from "@playwright/test";
import fs from "fs";
import path from "path";
import { BaseApi } from "./BaseApi";

export class PostApi extends BaseApi {
  async createPost(description: string, filePath: string): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/posts/create`, {
      multipart: {
        description,
        file: {
          name: path.basename(filePath),
          mimeType: "image/jpeg",
          buffer: fs.readFileSync(filePath),
        },
      },
    });
  }

  async getAllPosts(page = 0, size = 10, sortDir: "ASC" | "DESC" = "DESC"): Promise<APIResponse> {
    return this.request.get(
      `${this.baseUrl}/posts/all?sortDir=${sortDir}&page=${page}&size=${size}`,
    );
  }

  async likePost(postId: number | string): Promise<APIResponse> {
    return this.request.put(`${this.baseUrl}/post/${postId}/like`);
  }
}
