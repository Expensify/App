"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var AutoEmailLink_1 = require("@components/AutoEmailLink");
var Icon_1 = require("@components/Icon");
var Lottie_1 = require("@components/Lottie");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useBottomSafeSafeAreaPaddingStyle_1 = require("@hooks/useBottomSafeSafeAreaPaddingStyle");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var variables_1 = require("@styles/variables");
function BlockingView(_a) {
    var animation = _a.animation, icon = _a.icon, iconColor = _a.iconColor, title = _a.title, _b = _a.subtitle, subtitle = _b === void 0 ? '' : _b, subtitleStyle = _a.subtitleStyle, _c = _a.linkKey, linkKey = _c === void 0 ? 'notFound.goBackHome' : _c, _d = _a.shouldShowLink, shouldShowLink = _d === void 0 ? false : _d, _e = _a.iconWidth, iconWidth = _e === void 0 ? variables_1.default.iconSizeSuperLarge : _e, _f = _a.iconHeight, iconHeight = _f === void 0 ? variables_1.default.iconSizeSuperLarge : _f, _g = _a.onLinkPress, onLinkPress = _g === void 0 ? function () { return Navigation_1.default.dismissModal(); } : _g, _h = _a.shouldEmbedLinkWithSubtitle, shouldEmbedLinkWithSubtitle = _h === void 0 ? false : _h, _j = _a.animationStyles, animationStyles = _j === void 0 ? [] : _j, _k = _a.animationWebStyle, animationWebStyle = _k === void 0 ? {} : _k, _l = _a.accessibilityLabel, accessibilityLabel = _l === void 0 ? '' : _l, CustomSubtitle = _a.CustomSubtitle, contentFitImage = _a.contentFitImage, containerStyleProp = _a.containerStyle, addBottomSafeAreaPadding = _a.addBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding = _a.addOfflineIndicatorBottomSafeAreaPadding, testID = _a.testID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var subtitleText = (0, react_1.useMemo)(function () { return (<>
                {!!subtitle && (<AutoEmailLink_1.default style={[styles.textAlignCenter, subtitleStyle]} text={subtitle}/>)}
                {shouldShowLink ? (<TextLink_1.default onPress={onLinkPress} style={[styles.link, styles.mt2]}>
                        {translate(linkKey)}
                    </TextLink_1.default>) : null}
            </>); }, [styles, subtitle, shouldShowLink, linkKey, onLinkPress, translate, subtitleStyle]);
    var subtitleContent = (0, react_1.useMemo)(function () {
        if (CustomSubtitle) {
            return CustomSubtitle;
        }
        return shouldEmbedLinkWithSubtitle ? (<Text_1.default style={[styles.textAlignCenter]}>{subtitleText}</Text_1.default>) : (<react_native_1.View style={[styles.alignItemsCenter, styles.justifyContentCenter]}>{subtitleText}</react_native_1.View>);
    }, [styles, subtitleText, shouldEmbedLinkWithSubtitle, CustomSubtitle]);
    var containerStyle = (0, useBottomSafeSafeAreaPaddingStyle_1.default)({ addBottomSafeAreaPadding: addBottomSafeAreaPadding, addOfflineIndicatorBottomSafeAreaPadding: addOfflineIndicatorBottomSafeAreaPadding, style: containerStyleProp });
    return (<react_native_1.View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter, styles.ph10, containerStyle]} accessibilityLabel={accessibilityLabel} testID={testID}>
            {!!animation && (<Lottie_1.default source={animation} loop autoPlay style={animationStyles} webStyle={animationWebStyle}/>)}
            {!!icon && (<Icon_1.default src={icon} fill={iconColor} width={iconWidth} height={iconHeight} contentFit={contentFitImage}/>)}
            <react_native_1.View>
                <Text_1.default style={[styles.notFoundTextHeader]}>{title}</Text_1.default>

                {subtitleContent}
            </react_native_1.View>
        </react_native_1.View>);
}
BlockingView.displayName = 'BlockingView';
exports.default = BlockingView;
