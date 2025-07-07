"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var CONST_1 = require("@src/CONST");
function NetSuiteCustomListSelectorModal(_a) {
    var _b, _c, _d, _e;
    var isVisible = _a.isVisible, currentCustomListValue = _a.currentCustomListValue, onCustomListSelected = _a.onCustomListSelected, onClose = _a.onClose, label = _a.label, policy = _a.policy, onBackdropPress = _a.onBackdropPress;
    var translate = (0, useLocalize_1.default)().translate;
    var _f = (0, useDebouncedState_1.default)(''), searchValue = _f[0], debouncedSearchValue = _f[1], setSearchValue = _f[2];
    var _g = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e;
        var customLists = (_e = (_d = (_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.netsuite) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.customLists) !== null && _e !== void 0 ? _e : [];
        var customListData = customLists.map(function (customListRecord) { return ({
            text: customListRecord.name,
            value: customListRecord.name,
            isSelected: customListRecord.name === currentCustomListValue,
            keyForList: customListRecord.name,
            id: customListRecord.id,
        }); });
        var searchRegex = new RegExp(expensify_common_1.Str.escapeForRegExp(debouncedSearchValue.trim()), 'i');
        var filteredCustomLists = customListData.filter(function (customListRecord) { var _a; return searchRegex.test((_a = customListRecord.text) !== null && _a !== void 0 ? _a : ''); });
        var isEmpty = debouncedSearchValue.trim() && !filteredCustomLists.length;
        return {
            sections: isEmpty
                ? []
                : [
                    {
                        data: filteredCustomLists,
                    },
                ],
            headerMessage: isEmpty ? translate('common.noResultsFound') : '',
            showTextInput: customListData.length > CONST_1.default.STANDARD_LIST_ITEM_LIMIT,
        };
    }, [debouncedSearchValue, (_e = (_d = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.netsuite) === null || _c === void 0 ? void 0 : _c.options) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.customLists, translate, currentCustomListValue]), sections = _g.sections, headerMessage = _g.headerMessage, showTextInput = _g.showTextInput;
    return (<Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={isVisible} onClose={onClose} onModalHide={onClose} hideModalContentWhileAnimating useNativeDriver onBackdropPress={onBackdropPress} enableEdgeToEdgeBottomSafeAreaPadding>
            <ScreenWrapper_1.default includePaddingTop={false} enableEdgeToEdgeBottomSafeAreaPadding testID={NetSuiteCustomListSelectorModal.displayName}>
                <HeaderWithBackButton_1.default title={label} shouldShowBackButton onBackButtonPress={onClose}/>
                <SelectionList_1.default sections={sections} textInputValue={searchValue} textInputLabel={showTextInput ? translate('common.search') : undefined} onChangeText={setSearchValue} onSelectRow={onCustomListSelected} headerMessage={headerMessage} ListItem={RadioListItem_1.default} isRowMultilineSupported initiallyFocusedOptionKey={currentCustomListValue} shouldSingleExecuteRowSelect shouldStopPropagation shouldUseDynamicMaxToRenderPerBatch addBottomSafeAreaPadding/>
            </ScreenWrapper_1.default>
        </Modal_1.default>);
}
NetSuiteCustomListSelectorModal.displayName = 'NetSuiteCustomListSelectorModal';
exports.default = NetSuiteCustomListSelectorModal;
