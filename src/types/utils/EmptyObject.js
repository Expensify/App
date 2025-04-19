
exports.__esModule = true;
exports.isEmptyObject = void 0;
function isEmptyObject(obj) {
    return Object.keys(obj !== null && obj !== void 0 ? obj : {}).length === 0;
}
exports.isEmptyObject = isEmptyObject;
