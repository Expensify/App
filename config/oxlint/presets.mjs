// The eslint-config-expensify presets the App uses, in ESLint format, which derive.mjs converts with @oxlint/migrate.
// eslint-config-prettier goes last to turn off formatting rules, since oxfmt formats the App.
import browserConfig from 'eslint-config-expensify/browser';
import expensifyConfig from 'eslint-config-expensify/expensify';
import jestConfig from 'eslint-config-expensify/jest';
import reactConfig from 'eslint-config-expensify/react';
import scriptsConfig from 'eslint-config-expensify/scripts';
import typescriptConfig from 'eslint-config-expensify/typescript';
import prettierConfig from 'eslint-config-prettier';

export default [...browserConfig, ...reactConfig, ...expensifyConfig, ...typescriptConfig, ...scriptsConfig, ...jestConfig, prettierConfig];
