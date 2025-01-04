const globals = require("globals");

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    "eslint:recommended",
    "prettier"
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  globals: {
    AudioWorkletGlobalScope: "readonly",
    tf: "readonly",
    cocoSsd: "readonly"
  },
  rules: {
    "no-unused-vars": "warn",
    "no-console": ["warn", { allow: ["error", "warn"] }],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
};