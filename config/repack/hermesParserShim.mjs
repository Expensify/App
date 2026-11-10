/**
 * Parser for Re.Pack's babel lane, mirroring what `babel-plugin-syntax-hermes-parser` does for
 * Metro: hermes-parser only for files that opt into Flow with an `@flow` pragma, @babel/parser for
 * everything else. Re.Pack calls hermes-parser unconditionally, which is 4x slower across this
 * lane and pathological (95s) on prebuilt minified single-line bundles.
 *
 * Wired in via the babel-swc-loader's `hermesParserPath` option, which Re.Pack imports with
 * `importDefaultESM` and then calls as `parser.parse(source, options)`.
 */

import {parse as babelParse} from '@babel/parser';
import * as hermesParser from 'hermes-parser';

// Matches @react-native/babel-preset's `parseLangTypes: 'flow'` gate.
const FLOW_PRAGMA = /@flow/;

const BABEL_PARSER_PLUGINS = ['flow', 'jsx'];

export default {
    parse(code, options) {
        if (FLOW_PRAGMA.test(code)) {
            return hermesParser.parse(code, options);
        }
        return babelParse(code, {sourceType: options?.sourceType ?? 'unambiguous', plugins: BABEL_PARSER_PLUGINS});
    },
};
