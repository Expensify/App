"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = mapOnyxCollectionItems;
function mapOnyxCollectionItems(collection, mapper) {
    return Object.entries(collection !== null && collection !== void 0 ? collection : {}).reduce(function (acc, _a) {
        var key = _a[0], entry = _a[1];
        acc[key] = mapper(entry);
        return acc;
    }, {});
}
