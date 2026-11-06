// The eslint-config-expensify presets the App lints with, in the order the App's ESLint config used them. They stay
// in ESLint format because that is what the package ships and what @oxlint/migrate converts (derive.mjs). The App's
// own rules are in oxlint.config.mts, in oxlint format. eslint-config-prettier comes last, as it did in ESLint: it
// turns off the presets' formatting rules, because oxfmt formats the App.
import browserConfig from 'eslint-config-expensify/browser';
import expensifyConfig from 'eslint-config-expensify/expensify';
import jestConfig from 'eslint-config-expensify/jest';
import reactConfig from 'eslint-config-expensify/react';
import scriptsConfig from 'eslint-config-expensify/scripts';
import typescriptConfig from 'eslint-config-expensify/typescript';
import prettierConfig from 'eslint-config-prettier';

export default [...browserConfig, ...reactConfig, ...expensifyConfig, ...typescriptConfig, ...scriptsConfig, ...jestConfig, prettierConfig];
