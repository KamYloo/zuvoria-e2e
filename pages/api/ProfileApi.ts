// Gracjan Czyżewski

import { APIResponse } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { BaseApi } from "./BaseApi";

export type ProfileUpdatePayload = {
    fullName: string;
    description: string;
};

export class ProfileApi extends BaseApi {
    async getCurrentUser(): Promise<APIResponse> {
        return this.request.get(`${this.baseUrl}/auth/check`);
    }

    async editProfile(
        userDetails: ProfileUpdatePayload,
        profilePicturePath?: string | null,
    ): Promise<APIResponse> {
        const multipart: Record<string, any> = {
            userDetails: {
                name: "userDetails.json",
                mimeType: "application/json",
                buffer: Buffer.from(JSON.stringify(userDetails), "utf-8"),
            },
        };

        if (profilePicturePath) {
            const filePath = path.resolve(process.cwd(), profilePicturePath);
            multipart.profilePicture = {
                name: path.basename(filePath),
                mimeType: this.getMimeType(filePath),
                buffer: fs.readFileSync(filePath),
            };
        }

        return this.request.put(`${this.baseUrl}/user/profile/edit`, {
            multipart,
        });
    }

    private getMimeType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();

        if (ext === ".png") {
            return "image/png";
        }

        return "image/jpeg";
    }
}