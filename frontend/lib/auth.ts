import Cookies from "js-cookie";
import { api } from "./api";

export async function login(username: string, password: string) {
  const { data } = await api.post("/auth/login", { username, password });
  Cookies.set("token", data.access_token, { expires: 7 });
  return data;
}

export function logout() {
  Cookies.remove("token");
}

export function getToken() {
  return Cookies.get("token");
}

export function isAuthenticated() {
  return !!Cookies.get("token");
}
