import type {AnyMap, HybridObject} from 'react-native-nitro-modules';

/**
 * Synchronously parses JSON using a native C++ parser (Glaze).
 *
 * At runtime the methods are registered as raw JSI methods on the C++ side
 * (see HybridJsonParser.cpp), which return raw jsi::Value and bypass the
 * AnyMap marshalling layer entirely. The AnyMap return type below only
 * exists to satisfy nitrogen's typed-method codegen — the public TS API in
 * src/index.ts re-types these as `unknown`.
 */
interface JsonParser extends HybridObject<{ios: 'c++'; android: 'c++'}> {
    parse(json: string): AnyMap;
    parseRows(jsons: string[]): AnyMap[];
}

export type {JsonParser};
