"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var SearchContext_1 = require("@components/Search/SearchContext");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var SearchSelectedNarrow_1 = require("@pages/Search/SearchSelectedNarrow");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SearchPageHeaderInput_1 = require("./SearchPageHeaderInput");
function SearchPageHeader(_a) {
    var queryJSON = _a.queryJSON, searchRouterListVisible = _a.searchRouterListVisible, hideSearchRouterList = _a.hideSearchRouterList, onSearchRouterFocus = _a.onSearchRouterFocus, headerButtonsOptions = _a.headerButtonsOptions, handleSearch = _a.handleSearch;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var selectedTransactions = (0, SearchContext_1.useSearchContext)().selectedTransactions;
    var selectionMode = (0, useOnyx_1.default)(ONYXKEYS_1.default.MOBILE_SELECTION_MODE, { canBeMissing: true })[0];
    var selectedTransactionsKeys = Object.keys(selectedTransactions !== null && selectedTransactions !== void 0 ? selectedTransactions : {});
    if (shouldUseNarrowLayout && (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled)) {
        return (<react_native_1.View>
                <SearchSelectedNarrow_1.default options={headerButtonsOptions} itemsLength={selectedTransactionsKeys.length}/>
            </react_native_1.View>);
    }
    return (<SearchPageHeaderInput_1.default searchRouterListVisible={searchRouterListVisible} onSearchRouterFocus={onSearchRouterFocus} queryJSON={queryJSON} hideSearchRouterList={hideSearchRouterList} handleSearch={handleSearch}/>);
}
SearchPageHeader.displayName = 'SearchPageHeader';
exports.default = SearchPageHeader;
