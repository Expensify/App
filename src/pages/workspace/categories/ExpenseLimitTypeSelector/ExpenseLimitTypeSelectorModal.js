"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function ExpenseLimitTypeSelectorModal(_a) {
    var isVisible = _a.isVisible, currentExpenseLimitType = _a.currentExpenseLimitType, onExpenseLimitTypeSelected = _a.onExpenseLimitTypeSelected, onClose = _a.onClose, label = _a.label;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var expenseLimitTypes = Object.values(CONST_1.default.POLICY.EXPENSE_LIMIT_TYPES).map(function (value) { return ({
        value: value,
        text: translate("workspace.rules.categoryRules.expenseLimitTypes.".concat(value)),
        alternateText: translate("workspace.rules.categoryRules.expenseLimitTypes.".concat(value, "Subtitle")),
        keyForList: value,
        isSelected: currentExpenseLimitType === value,
    }); });
    return (<Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={isVisible} onClose={onClose} onModalHide={onClose} hideModalContentWhileAnimating useNativeDriver enableEdgeToEdgeBottomSafeAreaPadding>
            <ScreenWrapper_1.default style={[styles.pb0]} includePaddingTop={false} enableEdgeToEdgeBottomSafeAreaPadding testID={ExpenseLimitTypeSelectorModal.displayName}>
                <HeaderWithBackButton_1.default title={label} shouldShowBackButton onBackButtonPress={onClose}/>
                <SelectionList_1.default sections={[{ data: expenseLimitTypes }]} ListItem={RadioListItem_1.default} onSelectRow={function (item) { return onExpenseLimitTypeSelected(item.value); }} shouldSingleExecuteRowSelect containerStyle={[styles.pt3]} initiallyFocusedOptionKey={currentExpenseLimitType} isAlternateTextMultilineSupported alternateTextNumberOfLines={3} addBottomSafeAreaPadding/>
            </ScreenWrapper_1.default>
        </Modal_1.default>);
}
ExpenseLimitTypeSelectorModal.displayName = 'ExpenseLimitTypeSelectorModal';
exports.default = ExpenseLimitTypeSelectorModal;
