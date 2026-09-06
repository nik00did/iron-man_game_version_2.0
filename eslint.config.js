import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  { ignores: ["dist", "node_modules"] },
  js.configs.recommended,
  prettier,
  {
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    rules: {
      semi: ["error", "never"],
      eqeqeq: ["error", "always"],
      indent: ["error", 4],
      curly: ["error", "multi-or-nest"],
      "nonblock-statement-body-position": ["error", "below"],
    },
  },
];
