const TYPED_REQUIRE = /\b(require|jest\.requireActual|jest\.requireMock)<[\s\S]*?>\((?=\s*['"`])/g;

module.exports = {
    extract: (code, filePath, defaultExtract) => defaultExtract(code.replaceAll(TYPED_REQUIRE, '$1(')),
    getCacheKey: () => require('fs').readFileSync(__filename, 'utf8'),
};
