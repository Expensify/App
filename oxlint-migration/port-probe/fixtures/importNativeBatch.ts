// Fixture for the import/* rules oxlint implements natively and production enables for TypeScript.
// One violation per rule, each on its own line, because the harness matches on (file, line, rule).
// Every import here is a relative path inside the fixtures tree, so both resolvers see a real file.
// import/no-absolute-path is the one rule that cannot live here: importNativeBatchAbsolute.ts says why.

// no-webpack-loader-syntax: an inline loader prefix, spelled `raw-loader!./x` and not `!raw-loader!./x`.
// The leading `!` makes the specifier unresolvable to eslint-plugin-import's node resolver, and its
// extensions rule adds a "Missing file extension" finding on top for unresolvable specifiers. It comes
// first because the probe's base config also runs import/order, which reads a loader specifier as an
// external package and so wants it ahead of every sibling import below.
import webpackLoaderChain from 'raw-loader!./importNativeBatchHelper';

// no-self-import: this file, by relative path. The file has a default export (see the bottom) so that the
// self-import is a plain default import: oxlint's import plugin comes with default-on rules of its own
// (import/default), which production switches off with categories.correctness but this probe does not.
import selfImportedModule from './importNativeBatch';
// Control: the correct shape, reported by nothing.
import {sharedConfigValue} from './importNativeBatchHelper';
// consistent-type-specifier-style prefer-top-level: an inline `type` specifier.
import {type HelperOptions} from './importNativeBatchHelper';
// no-named-default: `default` pulled in as a named specifier.
import {default as renamedDefault} from './importNativeBatchHelper';
// newline-after-import: the statement below has no blank line above it.
import {helperSum} from './importNativeBatchHelper';
// extensions (ignorePackages + never for ts): the extension is spelled out.
import extensionfulHelper from './importNativeBatchHelper.ts';
const noBlankLineAbove = helperSum(sharedConfigValue, 1);

// import/first: the statement above is the first non-import, so this import is out of order.
const somethingElse = [extensionfulHelper, webpackLoaderChain, selfImportedModule, renamedDefault, noBlankLineAbove] as HelperOptions[];
import {helperSum as lateSum} from './importNativeBatchHelper';

// no-amd: a factory call that looks like AMD.
define([], () => lateSum(1, 2));

// no-mutable-exports: a live binding that can be reassigned.
export let mutableCounter = 0;

export const batchMarker = 'importNativeBatch';
export const batchContents = somethingElse;
export default batchMarker;
