"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OldRoutes_1 = require("@navigation/linkingConfig/OldRoutes");
/**
 * Maps an old route path to its corresponding new route based on the `oldRoutes` map.
 * It finds the best matching pattern (with wildcard `*` support) and replaces the matched
 * part of the path with the new route value.
 *
 * @param path - The input URL path to match and transform.
 * @returns The new route path if a match is found, otherwise `undefined`.
 *
 * Related issue: https://github.com/Expensify/App/issues/64968
 */
function getMatchingNewRoute(path) {
    var _a;
    var bestMatch;
    var maxLength = -1;
    for (var _i = 0, _b = Object.keys(OldRoutes_1.default); _i < _b.length; _i++) {
        var pattern = _b[_i];
        var regexStr = "^".concat(pattern.replace('*', '.*'));
        var regex = new RegExp(regexStr);
        if (regex.test(path) && pattern.length > maxLength) {
            bestMatch = pattern;
            maxLength = pattern.length;
        }
    }
    if (!bestMatch) {
        return bestMatch;
    }
    var finalRegexp = (_a = bestMatch === null || bestMatch === void 0 ? void 0 : bestMatch.replace('*', '')) !== null && _a !== void 0 ? _a : '';
    return path.replace(finalRegexp, OldRoutes_1.default[bestMatch]);
}
exports.default = getMatchingNewRoute;
