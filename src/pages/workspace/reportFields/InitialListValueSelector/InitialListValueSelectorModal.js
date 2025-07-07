"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Modal_1 = require("@components/Modal");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ReportFieldsInitialListValuePicker_1 = require("./ReportFieldsInitialListValuePicker");
function InitialListValueSelectorModal(_a) {
    var _b, _c;
    var isVisible = _a.isVisible, currentValue = _a.currentValue, label = _a.label, subtitle = _a.subtitle, onValueSelected = _a.onValueSelected, onClose = _a.onClose;
    var styles = (0, useThemeStyles_1.default)();
    var formDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, { canBeMissing: true })[0];
    return (<Modal_1.default type={CONST_1.default.MODAL.MODAL_TYPE.RIGHT_DOCKED} isVisible={isVisible} onClose={onClose} onModalHide={onClose} hideModalContentWhileAnimating useNativeDriver enableEdgeToEdgeBottomSafeAreaPadding>
            <ScreenWrapper_1.default style={styles.pb0} includePaddingTop={false} enableEdgeToEdgeBottomSafeAreaPadding testID={InitialListValueSelectorModal.displayName}>
                <HeaderWithBackButton_1.default title={label} shouldShowBackButton onBackButtonPress={onClose}/>
                <react_native_1.View style={[styles.ph5, styles.pb4]}>
                    <Text_1.default style={[styles.sidebarLinkText, styles.optionAlternateText]}>{subtitle}</Text_1.default>
                </react_native_1.View>
                <ReportFieldsInitialListValuePicker_1.default listValues={(_b = formDraft === null || formDraft === void 0 ? void 0 : formDraft.listValues) !== null && _b !== void 0 ? _b : []} disabledOptions={(_c = formDraft === null || formDraft === void 0 ? void 0 : formDraft.disabledListValues) !== null && _c !== void 0 ? _c : []} value={currentValue} onValueChange={onValueSelected}/>
            </ScreenWrapper_1.default>
        </Modal_1.default>);
}
InitialListValueSelectorModal.displayName = 'InitialListValueSelectorModal';
exports.default = InitialListValueSelectorModal;
