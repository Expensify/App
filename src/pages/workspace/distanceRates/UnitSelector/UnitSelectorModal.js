"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var UnitPicker_1 = require("@components/UnitPicker");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function UnitSelectorModal(_a) {
    var isVisible = _a.isVisible, currentUnit = _a.currentUnit, onUnitSelected = _a.onUnitSelected, onClose = _a.onClose, label = _a.label;
    var styles = (0, useThemeStyles_1.default)();
    return (<Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={isVisible} onClose={onClose} onModalHide={onClose} hideModalContentWhileAnimating useNativeDriver>
            <ScreenWrapper_1.default style={[styles.pb0]} includePaddingTop={false} enableEdgeToEdgeBottomSafeAreaPadding testID={UnitSelectorModal.displayName}>
                <HeaderWithBackButton_1.default title={label} shouldShowBackButton onBackButtonPress={onClose}/>
                <UnitPicker_1.default defaultValue={currentUnit} onOptionSelected={onUnitSelected}/>
            </ScreenWrapper_1.default>
        </Modal_1.default>);
}
UnitSelectorModal.displayName = 'UnitSelectorModal';
exports.default = UnitSelectorModal;
