"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var Button_1 = require("./Button");
var Lottie_1 = require("./Lottie");
var LottieAnimations_1 = require("./LottieAnimations");
var Modal_1 = require("./Modal");
var Text_1 = require("./Text");
function RequireTwoFactorAuthenticationModal(_a) {
    var _b = _a.onCancel, onCancel = _b === void 0 ? function () { } : _b, description = _a.description, isVisible = _a.isVisible, onSubmit = _a.onSubmit, shouldEnableNewFocusManagement = _a.shouldEnableNewFocusManagement;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var StyleUtils = (0, useStyleUtils_1.default)();
    return (<Modal_1.default onClose={onCancel} isVisible={isVisible} type={shouldUseNarrowLayout ? CONST_1.default.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST_1.default.MODAL.MODAL_TYPE.CONFIRM} innerContainerStyle={__assign(__assign(__assign({}, styles.pb5), styles.pt0), styles.boxShadowNone)} shouldEnableNewFocusManagement={shouldEnableNewFocusManagement}>
            <react_native_1.View>
                <react_native_1.View style={[styles.cardSectionIllustration, styles.alignItemsCenter, StyleUtils.getBackgroundColorStyle(LottieAnimations_1.default.Safe.backgroundColor)]}>
                    <Lottie_1.default source={LottieAnimations_1.default.Safe} style={styles.h100} webStyle={styles.h100} autoPlay loop/>
                </react_native_1.View>
                <react_native_1.View style={[styles.mt5, styles.mh5]}>
                    <react_native_1.View style={[styles.gap2, styles.mb10]}>
                        <Text_1.default style={[styles.textHeadlineH1]}>{translate('twoFactorAuth.pleaseEnableTwoFactorAuth')}</Text_1.default>
                        <Text_1.default style={styles.textSupporting}>{description}</Text_1.default>
                    </react_native_1.View>
                    <Button_1.default large success pressOnEnter onPress={onSubmit} text={translate('twoFactorAuth.enableTwoFactorAuth')}/>
                </react_native_1.View>
            </react_native_1.View>
        </Modal_1.default>);
}
RequireTwoFactorAuthenticationModal.displayName = 'RequireTwoFactorAuthenticationModal';
exports.default = RequireTwoFactorAuthenticationModal;
