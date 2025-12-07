import Axios, { AxiosRequestConfig } from "axios";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: process.env.AI_ENDPOINT,
  auth: {
    username: process.env.AI_USERNAME || "",
    password: process.env.AI_PASSWORD || "",
  },
});

export const customInstance = <T>(
  config: AxiosRequestConfig,

  options?: AxiosRequestConfig,
): Promise<T> => {
  const promise = AXIOS_INSTANCE({
    ...config,

    ...options,
  }).then(({ data }) => data);

  return promise;
};
