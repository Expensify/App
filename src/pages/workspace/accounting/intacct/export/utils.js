"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultVendorName = getDefaultVendorName;
function getDefaultVendorName(defaultVendor, vendors) {
    var _a, _b;
    return (_b = (_a = (vendors !== null && vendors !== void 0 ? vendors : []).find(function (vendor) { return vendor.id === defaultVendor; })) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : defaultVendor;
}
