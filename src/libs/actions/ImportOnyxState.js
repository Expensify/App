"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearOnyxStateBeforeImport = clearOnyxStateBeforeImport;
exports.importOnyxCollectionState = importOnyxCollectionState;
exports.importOnyxRegularState = importOnyxRegularState;
var react_native_onyx_1 = require("react-native-onyx");
var App_1 = require("./App");
function clearOnyxStateBeforeImport() {
    return react_native_onyx_1.default.clear(App_1.KEYS_TO_PRESERVE);
}
function importOnyxCollectionState(collectionsMap) {
    var collectionPromises = Array.from(collectionsMap.entries()).map(function (_a) {
        var baseKey = _a[0], items = _a[1];
        return items ? react_native_onyx_1.default.setCollection(baseKey, items) : Promise.resolve();
    });
    return Promise.all(collectionPromises);
}
function importOnyxRegularState(state) {
    if (Object.keys(state).length > 0) {
        return react_native_onyx_1.default.multiSet(state);
    }
    return Promise.resolve();
}
