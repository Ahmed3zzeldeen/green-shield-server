import { getFastAPI } from "../ai/client";

class AiService {
  apiClient = getFastAPI();

  constructor() {}

  async predict(file: Blob) {
    return this.apiClient.predictPredictPost({ input: file });
  }
}

export const aiService = new AiService();