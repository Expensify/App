// Fixture for the two import/* rules production scopes to plain JS (`.oxlintrc.json`: import/named is in the
// **/*.js|jsx|mjs|cjs override, import/no-named-as-default-member is root-on and switched off for TS) and the
// ESLint config mirrors. Kept out of the .ts fixture so the probe does not run either rule where production
// never runs it.
//
// Two exports at the bottom on purpose: the probe's base config enables prefer-default-export for every
// file, and a single-export file would draw an extra finding from oxlint that ESLint does not see there.

// Control: the named export exists, and reading it directly is not what no-named-as-default-member is about.
import {sharedConfigValue} from './importNativeBatchHelper';

// import/named: no such export.
import {nameThatDoesNotExist} from './importNativeBatchHelper';

// no-named-as-default-member: `sharedConfigValue` is a named export, read off the default import --
// exactly the `import Config from 'react-native-config'` / `Config.SOMETHING` shape from production.
import helperDefault from './importNativeBatchHelper';

const memberRead = helperDefault.sharedConfigValue;

export const jsBatchMarker = [memberRead, nameThatDoesNotExist, sharedConfigValue];
export const jsBatchDefault = helperDefault;
