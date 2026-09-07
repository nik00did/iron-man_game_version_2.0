export default {
    testEnvironment: "node",
    transform: {},
    moduleNameMapper: {
        "^@src/(.*)$": "<rootDir>/src/$1",
    },
    testMatch: ["<rootDir>/tests/**/*.test.js"],
    setupFiles: ["<rootDir>/jest.globals.js"],
    collectCoverageFrom: ["src/**/*.js"],
    coverageDirectory: "coverage",
    coverageProvider: "v8",
}
