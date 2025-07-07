"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var isIllustrationLottieAnimation_1 = require("@libs/isIllustrationLottieAnimation");
var Button_1 = require("./Button");
var FixedFooter_1 = require("./FixedFooter");
var ImageSVG_1 = require("./ImageSVG");
var Lottie_1 = require("./Lottie");
var LottieAnimations_1 = require("./LottieAnimations");
var Text_1 = require("./Text");
function ConfirmationPage(_a) {
    var _b, _c, _d, _e;
    var _f = _a.illustration, illustration = _f === void 0 ? LottieAnimations_1.default.Fireworks : _f, heading = _a.heading, description = _a.description, cta = _a.cta, _g = _a.buttonText, buttonText = _g === void 0 ? '' : _g, _h = _a.onButtonPress, onButtonPress = _h === void 0 ? function () { } : _h, _j = _a.shouldShowButton, shouldShowButton = _j === void 0 ? false : _j, _k = _a.secondaryButtonText, secondaryButtonText = _k === void 0 ? '' : _k, _l = _a.onSecondaryButtonPress, onSecondaryButtonPress = _l === void 0 ? function () { } : _l, _m = _a.shouldShowSecondaryButton, shouldShowSecondaryButton = _m === void 0 ? false : _m, headingStyle = _a.headingStyle, illustrationStyle = _a.illustrationStyle, descriptionStyle = _a.descriptionStyle, ctaStyle = _a.ctaStyle, footerStyle = _a.footerStyle, containerStyle = _a.containerStyle, innerContainerStyle = _a.innerContainerStyle;
    var styles = (0, useThemeStyles_1.default)();
    var isLottie = (0, isIllustrationLottieAnimation_1.default)(illustration);
    return (<react_native_1.View style={[styles.flex1, containerStyle]}>
            <react_native_1.View style={[styles.screenCenteredContainer, styles.alignItemsCenter, innerContainerStyle]}>
                {isLottie ? (<Lottie_1.default source={illustration} autoPlay loop style={[styles.confirmationAnimation, illustrationStyle]} webStyle={{
                width: (_c = (_b = react_native_1.StyleSheet.flatten(illustrationStyle)) === null || _b === void 0 ? void 0 : _b.width) !== null && _c !== void 0 ? _c : styles.confirmationAnimation.width,
                height: (_e = (_d = react_native_1.StyleSheet.flatten(illustrationStyle)) === null || _d === void 0 ? void 0 : _d.height) !== null && _e !== void 0 ? _e : styles.confirmationAnimation.height,
            }}/>) : (<react_native_1.View style={[styles.confirmationAnimation, illustrationStyle]}>
                        <ImageSVG_1.default src={illustration} contentFit="contain"/>
                    </react_native_1.View>)}
                <Text_1.default style={[styles.textHeadline, styles.textAlignCenter, styles.mv2, headingStyle]}>{heading}</Text_1.default>
                <Text_1.default style={[styles.textAlignCenter, descriptionStyle, styles.w100]}>{description}</Text_1.default>
                {cta ? <Text_1.default style={[styles.textAlignCenter, ctaStyle]}>{cta}</Text_1.default> : null}
            </react_native_1.View>
            {(shouldShowSecondaryButton || shouldShowButton) && (<FixedFooter_1.default style={footerStyle}>
                    {shouldShowSecondaryButton && (<Button_1.default large text={secondaryButtonText} testID="confirmation-secondary-button" style={styles.mt3} onPress={onSecondaryButtonPress}/>)}
                    {shouldShowButton && (<Button_1.default success large text={buttonText} testID="confirmation-primary-button" style={styles.mt3} pressOnEnter onPress={onButtonPress}/>)}
                </FixedFooter_1.default>)}
        </react_native_1.View>);
}
ConfirmationPage.displayName = 'ConfirmationPage';
exports.default = ConfirmationPage;
