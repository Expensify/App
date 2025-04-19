
exports.__esModule = true;
exports.toCollectionDataSet = void 0;
const toCollectionDataSet = function (collectionKey, collection, idSelector) {
    const collectionDataSet = collection.reduce(function (result, collectionValue) {
        if (collectionValue) {
            // eslint-disable-next-line no-param-reassign
            result[`${  collectionKey  }${idSelector(collectionValue)}`] = collectionValue;
        }
        return result;
    }, {});
    return collectionDataSet;
};
exports.toCollectionDataSet = toCollectionDataSet;
