"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var CategoryPicker_1 = require("@components/CategoryPicker");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function CategorySelectorModal(_a) {
    var policyID = _a.policyID, isVisible = _a.isVisible, currentCategory = _a.currentCategory, onCategorySelected = _a.onCategorySelected, onClose = _a.onClose, label = _a.label;
    var styles = (0, useThemeStyles_1.default)();
    return (<Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={isVisible} onClose={onClose} onModalHide={onClose} hideModalContentWhileAnimating useNativeDriver enableEdgeToEdgeBottomSafeAreaPadding>
            <ScreenWrapper_1.default style={[styles.pb0]} includePaddingTop={false} enableEdgeToEdgeBottomSafeAreaPadding shouldEnableKeyboardAvoidingView={false} testID={CategorySelectorModal.displayName}>
                <HeaderWithBackButton_1.default title={label} shouldShowBackButton onBackButtonPress={onClose}/>
                <CategoryPicker_1.default policyID={policyID} selectedCategory={currentCategory} onSubmit={onCategorySelected} addBottomSafeAreaPadding/>
            </ScreenWrapper_1.default>
        </Modal_1.default>);
}
CategorySelectorModal.displayName = 'CategorySelectorModal';
exports.default = CategorySelectorModal;
