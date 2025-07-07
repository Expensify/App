"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DistanceRequestUtils_1 = require("@libs/DistanceRequestUtils");
// Get the distance in meters from the transaction.
// This function is placed in a separate file to avoid circular dependencies.
function getDistanceInMeters(transaction, unit) {
    var _a, _b, _c, _d;
    // If we are creating a new distance request, the distance is available in routes.route0.distance and it's already in meters.
    if ((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.routes) === null || _a === void 0 ? void 0 : _a.route0) === null || _b === void 0 ? void 0 : _b.distance) {
        return transaction.routes.route0.distance;
    }
    // If the request is completed, transaction.routes is cleared and comment.customUnit.quantity holds the new distance in the selected unit.
    // We need to convert it from the selected distance unit to meters.
    if (((_d = (_c = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _c === void 0 ? void 0 : _c.customUnit) === null || _d === void 0 ? void 0 : _d.quantity) && unit) {
        return DistanceRequestUtils_1.default.convertToDistanceInMeters(transaction.comment.customUnit.quantity, unit);
    }
    return 0;
}
exports.default = getDistanceInMeters;
