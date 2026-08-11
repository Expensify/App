// Fixture for the three eslint-plugin-import rules oxlint has no native port for. All three are
// path rules, so they go in one file: the harness matches on (file, line, rule).

// no-useless-path-segments: './../fixtures/x' is the long way round to './x'
import * as ordering from './../fixtures/importOrder';
// no-relative-packages: reaching into another package by relative path instead of by its name
import uniq from '../../../node_modules/lodash/uniq';

// no-import-module-exports: ESM imports above, CommonJS export below
module.exports = {ordering, uniq};
