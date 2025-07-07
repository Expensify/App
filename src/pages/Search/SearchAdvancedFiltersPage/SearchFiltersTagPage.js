"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SearchMultipleSelectionPicker_1 = require("@components/Search/SearchMultipleSelectionPicker");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Search_1 = require("@libs/actions/Search");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function SearchFiltersTagPage() {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var searchAdvancedFiltersForm = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.SEARCH_ADVANCED_FILTERS_FORM, { canBeMissing: true })[0];
    var selectedTagsItems = (_a = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.tag) === null || _a === void 0 ? void 0 : _a.map(function (tag) {
        if (tag === CONST_1.default.SEARCH.TAG_EMPTY_VALUE) {
            return { name: translate('search.noTag'), value: tag };
        }
        return { name: (0, PolicyUtils_1.getCleanedTagName)(tag), value: tag };
    });
    var policyID = searchAdvancedFiltersForm === null || searchAdvancedFiltersForm === void 0 ? void 0 : searchAdvancedFiltersForm.policyID;
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS, { canBeMissing: true })[0], allPolicyTagLists = _b === void 0 ? {} : _b;
    var singlePolicyTagLists = allPolicyTagLists["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID)];
    var tagItems = (0, react_1.useMemo)(function () {
        var items = [{ name: translate('search.noTag'), value: CONST_1.default.SEARCH.TAG_EMPTY_VALUE }];
        if (!singlePolicyTagLists) {
            var uniqueTagNames_1 = new Set();
            var tagListsUnpacked = Object.values(allPolicyTagLists !== null && allPolicyTagLists !== void 0 ? allPolicyTagLists : {}).filter(function (item) { return !!item; });
            tagListsUnpacked
                .map(PolicyUtils_1.getTagNamesFromTagsLists)
                .flat()
                .forEach(function (tag) { return uniqueTagNames_1.add(tag); });
            items.push.apply(items, Array.from(uniqueTagNames_1).map(function (tagName) { return ({ name: (0, PolicyUtils_1.getCleanedTagName)(tagName), value: tagName }); }));
        }
        else {
            items.push.apply(items, (0, PolicyUtils_1.getTagNamesFromTagsLists)(singlePolicyTagLists).map(function (name) { return ({ name: (0, PolicyUtils_1.getCleanedTagName)(name), value: name }); }));
        }
        return items;
    }, [allPolicyTagLists, singlePolicyTagLists, translate]);
    var updateTagFilter = (0, react_1.useCallback)(function (values) { return (0, Search_1.updateAdvancedFilters)({ tag: values }); }, []);
    return (<ScreenWrapper_1.default testID={SearchFiltersTagPage.displayName} shouldShowOfflineIndicatorInWideScreen offlineIndicatorStyle={styles.mtAuto} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('common.tag')} onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ADVANCED_FILTERS);
        }}/>
            <react_native_1.View style={[styles.flex1]}>
                <SearchMultipleSelectionPicker_1.default items={tagItems} initiallySelectedItems={selectedTagsItems} onSaveSelection={updateTagFilter}/>
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
SearchFiltersTagPage.displayName = 'SearchFiltersTagPage';
exports.default = SearchFiltersTagPage;
