"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var CONST_1 = require("@src/CONST");
var ValueSelectionList_1 = require("./ValueSelectionList");
function ValueSelectorModal(_a) {
    var _b = _a.items, items = _b === void 0 ? [] : _b, selectedItem = _a.selectedItem, _c = _a.label, label = _c === void 0 ? '' : _c, isVisible = _a.isVisible, onClose = _a.onClose, onItemSelected = _a.onItemSelected, _d = _a.shouldShowTooltips, shouldShowTooltips = _d === void 0 ? true : _d, onBackdropPress = _a.onBackdropPress, _e = _a.shouldEnableKeyboardAvoidingView, shouldEnableKeyboardAvoidingView = _e === void 0 ? true : _e;
    return (<Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={isVisible} onClose={function () { return onClose === null || onClose === void 0 ? void 0 : onClose(); }} onModalHide={onClose} hideModalContentWhileAnimating useNativeDriver onBackdropPress={onBackdropPress} shouldHandleNavigationBack enableEdgeToEdgeBottomSafeAreaPadding>
            <ScreenWrapper_1.default includePaddingTop={false} enableEdgeToEdgeBottomSafeAreaPadding testID={ValueSelectorModal.displayName} shouldEnableKeyboardAvoidingView={shouldEnableKeyboardAvoidingView}>
                <HeaderWithBackButton_1.default title={label} onBackButtonPress={onClose}/>
                <ValueSelectionList_1.default items={items} selectedItem={selectedItem} onItemSelected={onItemSelected} shouldShowTooltips={shouldShowTooltips}/>
            </ScreenWrapper_1.default>
        </Modal_1.default>);
}
ValueSelectorModal.displayName = 'ValueSelectorModal';
exports.default = ValueSelectorModal;
