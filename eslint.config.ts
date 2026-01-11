import tselint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import functionalPlugin from "eslint-plugin-functional";
import { defineConfig } from "eslint/config";

export default defineConfig({
  extends: [
    prettierConfig,
    tselint.configs.strictTypeChecked,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    // @ts-expect-error
    functionalPlugin.configs.noMutations,
  ],
  linterOptions: {
    noInlineConfig: true,
  },
  languageOptions: {
    parser: tselint.parser,
    parserOptions: {
      project: true,
    },
  },
  files: ["src/**/*.ts"],
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
  rules: {
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
    "@typescript-eslint/consistent-indexed-object-style": [
      "error",
      "index-signature",
    ],
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    "import/order": "error",
    "functional/type-declaration-immutability": "off",
    "functional/prefer-immutable-types": "off",
  },
});
