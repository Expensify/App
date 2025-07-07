"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastItem = lastItem;
exports.extractCollectionItemID = extractCollectionItemID;
/**
 * Return the highest item in a numbered collection
 *
 * e.g. {1: '1', 2: '2', 3: '3'} -> '3'
 *
 * Use this only for collections that are numbered in other cases it will return the last item in the object not the highest
 */
function lastItem(object) {
    var _a;
    if (object === void 0) { object = {}; }
    var lastKey = (_a = Object.keys(object).pop()) !== null && _a !== void 0 ? _a : 0;
    return object[lastKey];
}
/**
 * Used to grab the id for a particular collection item's key.
 * e.g. reportActions_1 -> 1
 */
function extractCollectionItemID(key) {
    var _a;
    return (_a = key.split('_').at(1)) !== null && _a !== void 0 ? _a : '';
}
