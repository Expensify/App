"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function WorkspaceMemberDetailsRoleSelectionModal(_a) {
    var _b;
    var isVisible = _a.isVisible, items = _a.items, onRoleChange = _a.onRoleChange, onClose = _a.onClose;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    return (<Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={isVisible} onClose={function () { return onClose === null || onClose === void 0 ? void 0 : onClose(); }} onModalHide={onClose} hideModalContentWhileAnimating useNativeDriver enableEdgeToEdgeBottomSafeAreaPadding>
            <ScreenWrapper_1.default testID={WorkspaceMemberDetailsRoleSelectionModal.displayName} includePaddingTop={false} enableEdgeToEdgeBottomSafeAreaPadding>
                <HeaderWithBackButton_1.default title={translate('common.role')} onBackButtonPress={onClose}/>
                <react_native_1.View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    <SelectionList_1.default sections={[{ data: items }]} ListItem={RadioListItem_1.default} onSelectRow={onRoleChange} isAlternateTextMultilineSupported shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_b = items.find(function (item) { return item.isSelected; })) === null || _b === void 0 ? void 0 : _b.keyForList} addBottomSafeAreaPadding/>
                </react_native_1.View>
            </ScreenWrapper_1.default>
        </Modal_1.default>);
}
WorkspaceMemberDetailsRoleSelectionModal.displayName = 'WorkspaceMemberDetailsRoleSelectionModal';
exports.default = WorkspaceMemberDetailsRoleSelectionModal;
