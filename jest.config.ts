import type { Config } from "jest";

export default {
  preset: "ts-jest",
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "@swc/jest",
  },
} satisfies Config;
