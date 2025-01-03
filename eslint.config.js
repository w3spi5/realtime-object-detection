import eslint from "@eslint/js";
import globals from "globals";

export default [
  eslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        CONFIG: "readonly",
        cocoSsd: "readonly"
      },
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "quotes": ["error", "single"],
      "semi": ["error", "always"]
    },
  },
];