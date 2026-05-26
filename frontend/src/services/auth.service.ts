import type { LoginPayload, RegisterPayload } from "../types/auth.type";
import axiosClient from "./axiosClient";




export const AuthService = {
  login: async (data: LoginPayload) => {
    return await axiosClient.post('/auth/login', data);
  },
  register: async (data: RegisterPayload) => {
    return await axiosClient.post('/auth/register', data);
  }
};