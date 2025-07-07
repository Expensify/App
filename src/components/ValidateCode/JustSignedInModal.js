"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Lottie_1 = require("@components/Lottie");
var LottieAnimations_1 = require("@components/LottieAnimations");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
function JustSignedInModal(_a) {
    var is2FARequired = _a.is2FARequired;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.View style={styles.deeplinkWrapperContainer}>
            <react_native_1.View style={styles.deeplinkWrapperMessage}>
                <react_native_1.View style={styles.mb2}>
                    <Lottie_1.default source={is2FARequired ? LottieAnimations_1.default.Safe : LottieAnimations_1.default.Abracadabra} style={styles.justSignedInModalAnimation(is2FARequired)} webStyle={styles.justSignedInModalAnimation(is2FARequired)} autoPlay loop/>
                </react_native_1.View>
                <Text_1.default style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>
                    {translate(is2FARequired ? 'validateCodeModal.tfaRequiredTitle' : 'validateCodeModal.successfulSignInTitle')}
                </Text_1.default>
                <react_native_1.View style={[styles.mt2, styles.mb2]}>
                    <Text_1.default style={styles.textAlignCenter}>{translate(is2FARequired ? 'validateCodeModal.tfaRequiredDescription' : 'validateCodeModal.successfulSignInDescription')}</Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={styles.deeplinkWrapperFooter}>
                <Icon_1.default width={variables_1.default.modalWordmarkWidth} height={variables_1.default.modalWordmarkHeight} fill={theme.success} src={Expensicons.ExpensifyWordmark}/>
            </react_native_1.View>
        </react_native_1.View>);
}
JustSignedInModal.displayName = 'JustSignedInModal';
exports.default = JustSignedInModal;
