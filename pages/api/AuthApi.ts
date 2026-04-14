import { APIResponse, expect } from "@playwright/test";
import { BaseApi } from "./BaseApi";
import { AuthCredentials } from "./types";

export class AuthApi extends BaseApi {
  async login(credentials: AuthCredentials): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}/auth/login`, {
      data: credentials,
    });
  }

  async loginAndExpect200(credentials: AuthCredentials): Promise<void> {
    const response = await this.login(credentials);
    expect(response.status(), "Logowanie API powinno zwrocic HTTP 200").toBe(200);
  }
}
