import { APIResponse } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { BaseApi } from "./BaseApi";

export class StoryApi extends BaseApi {
  async createStoryFromFixture(fixtureRelativePath: string): Promise<APIResponse> {
    const filePath = path.resolve(process.cwd(), fixtureRelativePath);
    const fileBuffer = fs.readFileSync(filePath);

    return this.request.post(`${this.baseUrl}/stories/create`, {
      multipart: {
        file: {
          name: path.basename(filePath),
          mimeType: "image/jpeg",
          buffer: fileBuffer,
        },
      },
    });
  }

  async deleteStory(storyId: number): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}/stories/delete/${storyId}`);
  }
}
