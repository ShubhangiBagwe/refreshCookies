export interface LoginUserResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
}