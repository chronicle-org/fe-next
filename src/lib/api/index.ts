import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { deleteCookie } from "../utils";

const instance = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await deleteCookie()
      window.location.href = "/auth"
    }
    return Promise.reject(error);
  }
);

export type TApiResponse<T = unknown> = {
  content?: T | null
  message: string
  error: string
  statusCode: number
};

export type TApiErrorResponse = AxiosError<TApiResponse>

export function getMethod<TData>(endpoint:string, config?: AxiosRequestConfig): Promise<AxiosResponse<TData>> {
  return instance.get(endpoint, config);
}

export function postMethod<TPayloadPost, TData>(endpoint:string, payload?:TPayloadPost, config?: AxiosRequestConfig): Promise<AxiosResponse<TData>>{
  return instance.post(endpoint, payload, config);
}

export function putMethod<TPayloadPut, TData>(endpoint:string, payload?:TPayloadPut, config?:AxiosRequestConfig): Promise<AxiosResponse<TData>> {
  return instance.put(endpoint, payload, config);
}

export function deleteMethod<TData>(endpoint:string, config?:AxiosRequestConfig): Promise<AxiosResponse<TData>> {
  return instance.delete(endpoint, config);
}