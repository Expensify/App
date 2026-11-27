// Jest `require`s this file untransformed, so Node strips the types and loads it as an ES module.
const TYPED_REQUIRE = /\b(require|jest\.requireActual|jest\.requireMock)<[\s\S]*?>\((?=\s*['"`])/g;

function extract(code: string, filePath: string, defaultExtract: (code: string) => Iterable<string>) {
    return defaultExtract(code.replaceAll(TYPED_REQUIRE, '$1('));
}

function getCacheKey() {
    return `${TYPED_REQUIRE.source}${extract.toString()}`;
}

// The haste-map worker reads named exports, while the main process reads the default export.
export {extract, getCacheKey};
export default {extract, getCacheKey};
