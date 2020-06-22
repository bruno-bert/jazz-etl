const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig");

module.exports = {
  clearMocks: true,
  collectCoverageFrom: ["src/core/**/*.ts", "src/helpers/**/*.ts"],
  coverageDirectory: "__tests__/coverage",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/"
  }),
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.spec.ts", "<rootDir>/__tests__/**/*.spec.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest"
  }
};
