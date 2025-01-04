// eslint.config.js
const globals = require("globals");

module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        CONFIG: "readonly",
        cocoSsd: "readonly"
      }
    },
    files: ["src/**/*.js"],
    rules: {
      "no-unused-vars": "warn",
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "quotes": ["error", "single"],
      "semi": ["error", "always"]
    },
    ignores: ["dist/**/*", "node_modules/**/*"]
  }
];