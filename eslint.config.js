import js from "@eslint/js"
import globals from "globals"
import prettier from "eslint-config-prettier"
import tseslint from "typescript-eslint"

const sharedRules = {
    semi: ["error", "never"],
    eqeqeq: ["error", "always"],
    indent: ["error", 4],
    curly: ["error", "multi-or-nest"],
    "nonblock-statement-body-position": ["error", "below"],
    "prefer-const": "error",
    "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: "return" },
        {
            blankLine: "always",
            prev: "*",
            next: ["if", "for", "while", "do", "switch", "try"],
        },
        {
            blankLine: "always",
            prev: ["if", "for", "while", "do", "switch", "try"],
            next: "*",
        },
    ],
}

export default tseslint.config(
    { ignores: ["dist", "node_modules", "coverage"] },
    js.configs.recommended,
    prettier,
    {
        files: ["src/**/*.ts"],
        extends: [tseslint.configs.recommended],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.browser,
        },
        rules: sharedRules,
    },
    {
        files: ["tests/**/*.ts"],
        extends: [tseslint.configs.recommended],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.jest,
                ...globals.browser,
            },
        },
        rules: {
            ...sharedRules,
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-explicit-any": "off",
        },
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
)
