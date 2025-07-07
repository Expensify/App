"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportFieldTypePicker_1 = require("@pages/workspace/reportFields/ReportFieldTypePicker");
var CONST_1 = require("@src/CONST");
function TypeSelectorModal(_a) {
    var isVisible = _a.isVisible, currentType = _a.currentType, label = _a.label, subtitle = _a.subtitle, onTypeSelected = _a.onTypeSelected, onClose = _a.onClose;
    var styles = (0, useThemeStyles_1.default)();
    return (<Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={isVisible} onClose={onClose} onModalHide={onClose} hideModalContentWhileAnimating useNativeDriver enableEdgeToEdgeBottomSafeAreaPadding>
            <ScreenWrapper_1.default style={styles.pb0} includePaddingTop={false} enableEdgeToEdgeBottomSafeAreaPadding testID={TypeSelectorModal.displayName}>
                <HeaderWithBackButton_1.default title={label} shouldShowBackButton onBackButtonPress={onClose}/>
                <react_native_1.View style={[styles.ph5, styles.pb4]}>
                    <Text_1.default style={[styles.sidebarLinkText, styles.optionAlternateText]}>{subtitle}</Text_1.default>
                </react_native_1.View>
                <ReportFieldTypePicker_1.default defaultValue={currentType} onOptionSelected={onTypeSelected}/>
            </ScreenWrapper_1.default>
        </Modal_1.default>);
}
TypeSelectorModal.displayName = 'TypeSelectorModal';
exports.default = TypeSelectorModal;
