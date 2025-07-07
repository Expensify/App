"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCollectionDataSet = void 0;
var toCollectionDataSet = function (collectionKey, collection, idSelector) {
    var collectionDataSet = collection.reduce(function (result, collectionValue) {
        if (collectionValue) {
            // eslint-disable-next-line no-param-reassign
            result["".concat(collectionKey).concat(idSelector(collectionValue))] = collectionValue;
        }
        return result;
    }, {});
    return collectionDataSet;
};
exports.toCollectionDataSet = toCollectionDataSet;
