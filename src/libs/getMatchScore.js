"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getMatchScore;
function getMatchScore(str, query) {
    var lowerStr = str.toLowerCase();
    var lowerQuery = query.toLowerCase();
    if (lowerStr === lowerQuery) {
        return 3;
    }
    if (lowerStr.startsWith(lowerQuery)) {
        return 2;
    }
    if (lowerStr.includes(lowerQuery)) {
        return 1;
    }
    return 0;
}
