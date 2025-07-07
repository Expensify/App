"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FlatList_1 = require("@components/FlatList");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var DuplicateTransactionItem_1 = require("./DuplicateTransactionItem");
var keyExtractor = function (item, index) { return "".concat(item === null || item === void 0 ? void 0 : item.transactionID, "+").concat(index); };
var maintainVisibleContentPosition = {
    minIndexForVisible: 1,
};
function DuplicateTransactionsList(_a) {
    var transactions = _a.transactions;
    var styles = (0, useThemeStyles_1.default)();
    var allReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: false })[0];
    var renderItem = (0, react_1.useCallback)(function (_a) {
        var item = _a.item, index = _a.index;
        return (<DuplicateTransactionItem_1.default transaction={item} index={index} allReports={allReports}/>);
    }, [allReports]);
    return (<FlatList_1.default data={transactions} renderItem={renderItem} keyExtractor={keyExtractor} maintainVisibleContentPosition={maintainVisibleContentPosition} contentContainerStyle={styles.pt5}/>);
}
DuplicateTransactionsList.displayName = 'DuplicateTransactionsList';
exports.default = DuplicateTransactionsList;
