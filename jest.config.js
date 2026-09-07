export default {
    testEnvironment: "node",
    extensionsToTreatAsEsm: [".ts"],
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                useESM: true,
                tsconfig: "tsconfig.json",
            },
        ],
    },
    moduleNameMapper: {
        "^@src/(.*)\\.js$": "<rootDir>/src/$1.ts",
        "^@src/(.*)$": "<rootDir>/src/$1",
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    testMatch: ["<rootDir>/tests/**/*.test.ts"],
    setupFiles: ["<rootDir>/jest.globals.js"],
    collectCoverageFrom: ["src/**/*.ts", "!src/vite-env.d.ts"],
    coverageDirectory: "coverage",
    coverageProvider: "v8",
}
