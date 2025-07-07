"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sanitizeJSONStringValues;
function sanitizeJSONStringValues(inputString) {
    function replacer(str) {
        var _a;
        return ((_a = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '\\': '\\\\',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '\t': '\\t',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '\n': '\\n',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '\r': '\\r',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '\f': '\\f',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '"': '\\"',
        }[str]) !== null && _a !== void 0 ? _a : '');
    }
    try {
        var parsed = JSON.parse(inputString);
        // Function to recursively sanitize string values in an object
        var sanitizeValues_1 = function (obj) {
            if (typeof obj === 'string') {
                return obj.replace(/\\|\t|\n|\r|\f|"/g, replacer);
            }
            if (Array.isArray(obj)) {
                return obj.map(function (item) { return sanitizeValues_1(item); });
            }
            if (obj && typeof obj === 'object') {
                var result = {};
                for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
                    var key = _a[_i];
                    result[key] = sanitizeValues_1(obj[key]);
                }
                return result;
            }
            return obj;
        };
        return JSON.stringify(sanitizeValues_1(parsed));
    }
    catch (e) {
        throw new Error('Invalid JSON input.');
    }
}
