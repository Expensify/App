"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createCollection;
function createCollection(createKey, createItem, length) {
    if (length === void 0) { length = 500; }
    var map = {};
    for (var i = 0; i < length; i++) {
        var item = createItem(i);
        var itemKey = createKey(item, i);
        map[itemKey] = item;
    }
    return map;
}
