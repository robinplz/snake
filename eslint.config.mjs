import js from "@eslint/js";
import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";

export default [
  { ignores: ["node_modules/", "dist/"] },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslintParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": tseslintPlugin
    },
    rules: {
      indent: ["error", 2],
    },
  },
];
