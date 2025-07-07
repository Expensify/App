"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CARD_LAYOUT = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var ImageSVG_1 = require("@components/ImageSVG");
var Lottie_1 = require("@components/Lottie");
var MenuItemList_1 = require("@components/MenuItemList");
var Text_1 = require("@components/Text");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var isIllustrationLottieAnimation_1 = require("@libs/isIllustrationLottieAnimation");
var IconSection_1 = require("./IconSection");
var CARD_LAYOUT = {
    ICON_ON_TOP: 'iconOnTop',
    ICON_ON_LEFT: 'iconOnLeft',
    ICON_ON_RIGHT: 'iconOnRight',
};
exports.CARD_LAYOUT = CARD_LAYOUT;
function Section(_a) {
    var _b;
    var children = _a.children, childrenStyles = _a.childrenStyles, containerStyles = _a.containerStyles, icon = _a.icon, _c = _a.cardLayout, cardLayout = _c === void 0 ? CARD_LAYOUT.ICON_ON_RIGHT : _c, iconContainerStyles = _a.iconContainerStyles, menuItems = _a.menuItems, subtitle = _a.subtitle, subtitleStyles = _a.subtitleStyles, _d = _a.subtitleMuted, subtitleMuted = _d === void 0 ? false : _d, title = _a.title, renderTitle = _a.renderTitle, titleStyles = _a.titleStyles, _e = _a.isCentralPane, isCentralPane = _e === void 0 ? false : _e, illustration = _a.illustration, illustrationBackgroundColor = _a.illustrationBackgroundColor, illustrationContainerStyle = _a.illustrationContainerStyle, illustrationStyle = _a.illustrationStyle, contentPaddingOnLargeScreens = _a.contentPaddingOnLargeScreens, overlayContent = _a.overlayContent, iconWidth = _a.iconWidth, iconHeight = _a.iconHeight, renderSubtitle = _a.renderSubtitle, _f = _a.banner, banner = _f === void 0 ? null : _f;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var isLottie = (0, isIllustrationLottieAnimation_1.default)(illustration);
    var lottieIllustration = isLottie ? illustration : undefined;
    return (<react_native_1.View style={[styles.pageWrapper, styles.cardSectionContainer, containerStyles, (isCentralPane || !!illustration) && styles.p0]}>
            {banner}
            {cardLayout === CARD_LAYOUT.ICON_ON_TOP && (<IconSection_1.default width={iconWidth} height={iconHeight} icon={icon} iconContainerStyles={[iconContainerStyles, styles.alignSelfStart, styles.mb3]}/>)}
            {!!illustration && (<react_native_1.View style={[
                styles.w100,
                styles.dFlex,
                styles.alignItemsCenter,
                styles.justifyContentCenter,
                StyleUtils.getBackgroundColorStyle((_b = illustrationBackgroundColor !== null && illustrationBackgroundColor !== void 0 ? illustrationBackgroundColor : lottieIllustration === null || lottieIllustration === void 0 ? void 0 : lottieIllustration.backgroundColor) !== null && _b !== void 0 ? _b : theme.appBG),
                illustrationContainerStyle,
            ]}>
                    <react_native_1.View style={[styles.cardSectionIllustration, illustrationStyle]}>
                        {isLottie ? (<Lottie_1.default source={illustration} style={styles.h100} webStyle={styles.h100} autoPlay loop shouldLoadAfterInteractions={shouldUseNarrowLayout}/>) : (<ImageSVG_1.default src={illustration} contentFit="contain"/>)}
                    </react_native_1.View>
                    {overlayContent === null || overlayContent === void 0 ? void 0 : overlayContent()}
                </react_native_1.View>)}
            <react_native_1.View style={[styles.w100, isCentralPane && (shouldUseNarrowLayout ? styles.p5 : (contentPaddingOnLargeScreens !== null && contentPaddingOnLargeScreens !== void 0 ? contentPaddingOnLargeScreens : styles.p8))]}>
                <react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.w100, cardLayout === CARD_LAYOUT.ICON_ON_TOP && styles.mh1]}>
                    {cardLayout === CARD_LAYOUT.ICON_ON_LEFT && (<IconSection_1.default width={iconWidth} height={iconHeight} icon={icon} iconContainerStyles={[styles.flexGrow0, styles.justifyContentStart, iconContainerStyles]}/>)}
                    <react_native_1.View style={[styles.flexShrink1, styles.w100]}>
                        {renderTitle ? renderTitle() : <Text_1.default style={[styles.textHeadline, styles.cardSectionTitle, titleStyles]}>{title}</Text_1.default>}
                    </react_native_1.View>
                    {cardLayout === CARD_LAYOUT.ICON_ON_RIGHT && (<IconSection_1.default width={iconWidth} height={iconHeight} icon={icon} iconContainerStyles={iconContainerStyles}/>)}
                </react_native_1.View>

                {renderSubtitle
            ? renderSubtitle === null || renderSubtitle === void 0 ? void 0 : renderSubtitle()
            : !!subtitle && (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.w100, cardLayout === CARD_LAYOUT.ICON_ON_TOP ? [styles.mt1, styles.mh1] : styles.mt2, subtitleStyles]}>
                              <Text_1.default style={[styles.textNormal, subtitleMuted && styles.colorMuted]}>{subtitle}</Text_1.default>
                          </react_native_1.View>)}

                <react_native_1.View style={[styles.w100, childrenStyles]}>{children}</react_native_1.View>

                <react_native_1.View style={[styles.w100]}>{!!menuItems && <MenuItemList_1.default menuItems={menuItems}/>}</react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
}
Section.displayName = 'Section';
exports.default = Section;
