import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

const sharedRules = {
    semi: ["error", "never"],
    eqeqeq: ["error", "always"],
    indent: ["error", 4],
    curly: ["error", "multi-or-nest"],
    "nonblock-statement-body-position": ["error", "below"],
    "prefer-const": "error",
}

export default [
    { ignores: ["dist", "node_modules", "coverage"] },
    js.configs.recommended,
    prettier,
    {
        files: ["src/**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.browser,
        },
        rules: sharedRules,
    },
    {
        files: ["tests/**/*.js", "jest.config.js", "jest.globals.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.jest,
                ...globals.browser,
            },
        },
        rules: sharedRules,
    },
]
