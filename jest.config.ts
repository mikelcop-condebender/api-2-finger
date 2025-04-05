import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testMatch: ["**/*.step.ts"],
  testEnvironment: "node",
};

export default config;
