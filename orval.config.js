import { defineConfig } from "orval";

export default defineConfig({
  "ai-spec": {
    input: "./spec/openapi.json",
    output: {
      target: "./src/ai/client.ts",
      client: "axios",
      override: {
        mutator: {
          path: "./src/ai/axios-client.ts",
          name: "customInstance",
        },
      },
    },
  },
});
