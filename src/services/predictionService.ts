import { getFastAPI } from "../ai/client";

class AiService {
  apiClient = getFastAPI();

  constructor(
    private aiServerUrl: string,
    private aiServerUsername: string,
    private aiServerPassword: string,
  ) {}

  async predict(file: Blob) {
    return this.apiClient.predictPredictPost({ input: file });
  }
}

