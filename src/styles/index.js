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
exports.defaultStyles = void 0;
var clamp_1 = require("lodash/clamp");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var styleConst_1 = require("@components/TextInput/styleConst");
var Browser_1 = require("@libs/Browser");
var CONST_1 = require("@src/CONST");
var theme_1 = require("./theme");
var colors_1 = require("./theme/colors");
var addOutlineWidth_1 = require("./utils/addOutlineWidth");
var borders_1 = require("./utils/borders");
var chatContentScrollViewPlatformStyles_1 = require("./utils/chatContentScrollViewPlatformStyles");
var cursor_1 = require("./utils/cursor");
var display_1 = require("./utils/display");
var editedLabelStyles_1 = require("./utils/editedLabelStyles");
var emojiDefaultStyles_1 = require("./utils/emojiDefaultStyles");
var flex_1 = require("./utils/flex");
var FontUtils_1 = require("./utils/FontUtils");
var getPopOverVerticalOffset_1 = require("./utils/getPopOverVerticalOffset");
var objectFit_1 = require("./utils/objectFit");
var optionAlternateTextPlatformStyles_1 = require("./utils/optionAlternateTextPlatformStyles");
var overflow_1 = require("./utils/overflow");
var overflowXHidden_1 = require("./utils/overflowXHidden");
var pointerEventsAuto_1 = require("./utils/pointerEventsAuto");
var pointerEventsBoxNone_1 = require("./utils/pointerEventsBoxNone");
var pointerEventsNone_1 = require("./utils/pointerEventsNone");
var positioning_1 = require("./utils/positioning");
var sizing_1 = require("./utils/sizing");
var spacing_1 = require("./utils/spacing");
var textDecorationLine_1 = require("./utils/textDecorationLine");
var textUnderline_1 = require("./utils/textUnderline");
var translateZ0_1 = require("./utils/translateZ0");
var userSelect_1 = require("./utils/userSelect");
var visibility_1 = require("./utils/visibility");
var whiteSpace_1 = require("./utils/whiteSpace");
var wordBreak_1 = require("./utils/wordBreak");
var writingDirection_1 = require("./utils/writingDirection");
var variables_1 = require("./variables");
// touchCallout is an iOS safari only property that controls the display of the callout information when you touch and hold a target
var touchCalloutNone = (0, Browser_1.isMobileSafari)() ? { WebkitTouchCallout: 'none' } : {};
// to prevent vertical text offset in Safari for badges, new lineHeight values have been added
var lineHeightBadge = (0, Browser_1.isSafari)() ? { lineHeight: variables_1.default.lineHeightXSmall } : { lineHeight: variables_1.default.lineHeightNormal };
var picker = function (theme) {
    return (__assign(__assign({ backgroundColor: theme.transparent, color: theme.text }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeNormal, lineHeight: variables_1.default.fontSizeNormalHeight, paddingBottom: 8, paddingTop: 23, paddingLeft: 0, paddingRight: 25, height: variables_1.default.inputHeight, borderWidth: 0, textAlign: 'left' }));
};
var link = function (theme) {
    return ({
        color: theme.link,
        textDecorationColor: theme.link,
        // We set fontFamily directly in order to avoid overriding fontWeight and fontStyle.
        fontFamily: FontUtils_1.default.fontFamily.platform.EXP_NEUE.fontFamily,
    });
};
var emailLink = function (theme) {
    return ({
        color: theme.link,
        textDecorationColor: theme.link,
        // We set fontFamily directly in order to avoid overriding fontWeight and fontStyle.
        fontFamily: FontUtils_1.default.fontFamily.platform.EXP_NEUE.fontFamily,
        fontWeight: FontUtils_1.default.fontWeight.bold,
    });
};
var baseCodeTagStyles = function (theme) {
    return ({
        borderWidth: 1,
        borderRadius: 5,
        borderColor: theme.border,
        backgroundColor: theme.textBackground,
    });
};
var headlineFont = __assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM);
var headlineItalicFont = __assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM_ITALIC);
var modalNavigatorContainer = function (isSmallScreenWidth) {
    return ({
        position: 'absolute',
        width: isSmallScreenWidth ? '100%' : variables_1.default.sideBarWidth,
        height: '100%',
    });
};
var webViewStyles = function (theme) {
    return ({
        // As of react-native-render-html v6, don't declare distinct styles for
        // custom renderers, the API for custom renderers has changed. Declare the
        // styles in the below "tagStyles" instead. If you need to reuse those
        // styles from the renderer, just pass the "style" prop to the underlying
        // component.
        tagStyles: {
            del: {
                textDecorationLine: 'line-through',
                textDecorationStyle: 'solid',
            },
            a: link(theme),
            ul: {
                maxWidth: '100%',
            },
            ol: {
                maxWidth: '100%',
            },
            li: {
                flexShrink: 1,
            },
            pre: __assign(__assign(__assign(__assign({}, baseCodeTagStyles(theme)), { paddingVertical: 8, paddingHorizontal: 12, fontSize: undefined }), FontUtils_1.default.fontFamily.platform.MONOSPACE), { marginTop: 0, marginBottom: 0 }),
            code: __assign(__assign({}, baseCodeTagStyles(theme)), { paddingLeft: 5, paddingRight: 5, fontFamily: FontUtils_1.default.fontFamily.platform.MONOSPACE.fontFamily }),
            img: __assign({ borderColor: theme.border, borderRadius: variables_1.default.componentBorderRadiusNormal, borderWidth: 1 }, touchCalloutNone),
            video: __assign({ minWidth: CONST_1.default.VIDEO_PLAYER.MIN_WIDTH, minHeight: CONST_1.default.VIDEO_PLAYER.MIN_HEIGHT, borderRadius: variables_1.default.componentBorderRadiusNormal, backgroundColor: theme.highlightBG }, touchCalloutNone),
            p: {
                marginTop: 0,
                marginBottom: 0,
            },
            h1: {
                marginBottom: 8,
            },
        },
        baseFontStyle: __assign(__assign(__assign({ color: theme.text, fontSize: variables_1.default.fontSizeNormal }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { flex: 1, lineHeight: variables_1.default.fontSizeNormalHeight }), writingDirection_1.default.ltr),
    });
};
var styles = function (theme) {
    return (__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, spacing_1.default), borders_1.default), sizing_1.default), flex_1.default), display_1.default), overflow_1.default), positioning_1.default), wordBreak_1.default), translateZ0_1.default), whiteSpace_1.default), writingDirection_1.default), cursor_1.default), userSelect_1.default), textUnderline_1.default), objectFit_1.default), textDecorationLine_1.default), { editedLabelStyles: editedLabelStyles_1.default, emojiDefaultStyles: emojiDefaultStyles_1.default, autoCompleteSuggestionsContainer: {
            backgroundColor: theme.appBG,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: theme.shadow,
            paddingVertical: CONST_1.default.AUTO_COMPLETE_SUGGESTER.SUGGESTER_INNER_PADDING,
        }, blockquote: {
            borderLeftColor: theme.border,
            borderLeftWidth: 4,
            paddingLeft: 12,
            marginTop: 4,
            marginBottom: 4,
            // Overwrite default HTML margin for blockquote
            marginLeft: 0,
        }, h1: {
            fontSize: variables_1.default.fontSizeLarge,
            fontFamily: FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD.fontFamily,
            fontWeight: FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD.fontWeight,
            marginBottom: 8,
        }, strong: {
            fontFamily: FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD.fontFamily,
            fontWeight: FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD.fontWeight,
        }, em: {
            fontFamily: FontUtils_1.default.fontFamily.platform.EXP_NEUE_ITALIC.fontFamily,
            fontStyle: FontUtils_1.default.fontFamily.platform.EXP_NEUE_ITALIC.fontStyle,
        }, autoCompleteSuggestionContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        }, rtlTextRenderForSafari: __assign({ textAlign: 'left' }, writingDirection_1.default.ltr), emojiSuggestionsEmoji: {
            fontSize: variables_1.default.fontSizeMedium,
            width: 51,
            textAlign: 'center',
        }, emojiSuggestionsText: __assign(__assign({ fontSize: variables_1.default.fontSizeMedium, flex: 1 }, wordBreak_1.default.breakWord), spacing_1.default.pr4), emojiTooltipWrapper: __assign(__assign({}, spacing_1.default.p2), { borderRadius: 8 }), mentionSuggestionsAvatarContainer: {
            width: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
        }, mentionSuggestionsText: __assign({ fontSize: variables_1.default.fontSizeMedium }, spacing_1.default.ml2), mentionSuggestionsDisplayName: __assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), textSupporting: {
            color: theme.textSupporting,
        }, navigationTabBarLabel: {
            lineHeight: 14,
        }, webViewStyles: webViewStyles(theme), link: link(theme), emailLink: emailLink(theme), linkMuted: __assign({ color: theme.textSupporting, textDecorationColor: theme.textSupporting }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), linkMutedHovered: {
            color: theme.textMutedReversed,
        }, highlightBG: {
            backgroundColor: theme.highlightBG,
        }, appBG: {
            backgroundColor: theme.appBG,
        }, fontSizeLabel: {
            fontSize: variables_1.default.fontSizeLabel,
        }, h4: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), { fontSize: variables_1.default.fontSizeLabel }), textAlignCenter: {
            textAlign: 'center',
        }, textAlignRight: {
            textAlign: 'right',
        }, textAlignLeft: {
            textAlign: 'left',
        }, textWithMiddleEllipsisContainer: {
            width: '100%',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            display: 'flex',
            flexDirection: 'row',
        }, textWithMiddleEllipsisText: {
            overflow: 'hidden',
            textOverflow: 'clip',
            whiteSpace: 'nowrap',
        }, verticalAlignTopText: {
            verticalAlign: 'text-top',
        }, verticalAlignTop: {
            verticalAlign: 'top',
        }, lineHeightUndefined: {
            lineHeight: undefined,
        }, lineHeightLarge: {
            lineHeight: variables_1.default.lineHeightLarge,
        }, lineHeightXLarge: {
            lineHeight: variables_1.default.lineHeightXLarge,
        }, label: {
            fontSize: variables_1.default.fontSizeLabel,
            lineHeight: variables_1.default.lineHeightLarge,
        }, textLabel: {
            color: theme.text,
            fontSize: variables_1.default.fontSizeLabel,
            lineHeight: variables_1.default.lineHeightLarge,
        }, themeTextColor: {
            color: theme.text,
        }, mutedTextLabel: {
            color: theme.textSupporting,
            fontSize: variables_1.default.fontSizeLabel,
            lineHeight: variables_1.default.lineHeightLarge,
        }, mutedNormalTextLabel: {
            color: theme.textSupporting,
            fontSize: variables_1.default.fontSizeLabel,
            lineHeight: variables_1.default.lineHeightNormal,
        }, textSmall: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeSmall }), textMicro: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeSmall, lineHeight: variables_1.default.lineHeightSmall }), textMicroBold: __assign(__assign({ color: theme.text }, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), { fontSize: variables_1.default.fontSizeSmall, lineHeight: variables_1.default.lineHeightNormal }), textMicroSupporting: __assign(__assign({ color: theme.textSupporting }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeSmall, lineHeight: variables_1.default.lineHeightSmall }), textSupportingNormal: {
            color: theme.textSupporting,
            fontSize: variables_1.default.fontSizeNormal,
            lineHeight: variables_1.default.fontSizeNormalHeight,
        }, textExtraSmallSupporting: __assign(__assign({ color: theme.textSupporting }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeExtraSmall }), textDoubleDecker: {
            fontSize: variables_1.default.fontSizeSmall,
            opacity: 0.8,
            fontWeight: FontUtils_1.default.fontWeight.bold,
            lineHeight: 12,
        }, noPaddingBottom: {
            paddingBottom: 0,
        }, textNormal: {
            fontSize: variables_1.default.fontSizeNormal,
        }, textNormalThemeText: {
            color: theme.text,
            fontSize: variables_1.default.fontSizeNormal,
        }, textLarge: {
            fontSize: variables_1.default.fontSizeLarge,
        }, textXXLarge: {
            fontSize: variables_1.default.fontSizeXXLarge,
        }, textXXXLarge: {
            fontSize: variables_1.default.fontSizeXXXLarge,
        }, textHero: __assign(__assign({ fontSize: variables_1.default.fontSizeHero }, FontUtils_1.default.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM), { lineHeight: variables_1.default.lineHeightHero }), textStrong: __assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), fontWeightNormal: {
            fontWeight: FontUtils_1.default.fontWeight.normal,
        }, textHeadline: __assign(__assign(__assign({}, headlineFont), whiteSpace_1.default.preWrap), { color: theme.heading, fontSize: variables_1.default.fontSizeXLarge, lineHeight: variables_1.default.lineHeightXXXLarge }), textHeadlineH2: __assign(__assign(__assign({}, headlineFont), whiteSpace_1.default.preWrap), { color: theme.heading, fontSize: variables_1.default.fontSizeH2, lineHeight: variables_1.default.lineHeightSizeH2 }), textHeadlineH1: __assign(__assign(__assign({}, headlineFont), whiteSpace_1.default.preWrap), { color: theme.heading, fontSize: variables_1.default.fontSizeXLarge, lineHeight: variables_1.default.lineHeightSizeH1 }), textWhite: {
            color: theme.textLight,
        }, textBlue: {
            color: theme.link,
        }, textBold: {
            fontWeight: FontUtils_1.default.fontWeight.bold,
        }, textItalic: __assign({}, FontUtils_1.default.fontFamily.platform.MONOSPACE_ITALIC), textVersion: __assign(__assign({ color: theme.iconColorfulBackground, fontSize: variables_1.default.fontSizeNormal, lineHeight: variables_1.default.lineHeightNormal }, FontUtils_1.default.fontFamily.platform.MONOSPACE), { textAlign: 'center' }), textWrap: __assign({}, whiteSpace_1.default.preWrap), textNoWrap: __assign({}, whiteSpace_1.default.noWrap), textLineHeightNormal: {
            lineHeight: variables_1.default.lineHeightNormal,
        }, colorMutedReversed: {
            color: theme.textMutedReversed,
        }, colorMuted: {
            color: theme.textSupporting,
        }, bgTransparent: {
            backgroundColor: 'transparent',
        }, opacity0: {
            opacity: 0,
        }, opacitySemiTransparent: {
            opacity: 0.5,
        }, opacity1: {
            opacity: 1,
        }, textDanger: {
            color: theme.danger,
        }, borderRadiusNormal: {
            borderRadius: variables_1.default.buttonBorderRadius,
        }, borderRadiusComponentLarge: {
            borderRadius: variables_1.default.componentBorderRadiusLarge,
        }, borderRadiusComponentNormal: {
            borderRadius: variables_1.default.componentBorderRadiusNormal,
        }, topLevelNavigationTabBar: function (shouldDisplayTopLevelNavigationTabBar, shouldUseNarrowLayout, bottomSafeAreaOffset) { return ({
            // We have to use position fixed to make sure web on safari displays the bottom tab bar correctly.
            // On natives we can use absolute positioning.
            position: react_native_1.Platform.OS === 'web' ? 'fixed' : 'absolute',
            opacity: shouldDisplayTopLevelNavigationTabBar ? 1 : 0,
            pointerEvents: shouldDisplayTopLevelNavigationTabBar ? 'auto' : 'none',
            width: shouldUseNarrowLayout ? '100%' : variables_1.default.sideBarWithLHBWidth,
            paddingBottom: bottomSafeAreaOffset,
            // There is a missing border right on the wide layout
            borderRightWidth: shouldUseNarrowLayout ? 0 : 1,
            borderColor: theme.border,
        }); }, navigationTabBarContainer: {
            flexDirection: 'row',
            height: variables_1.default.bottomTabHeight,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            backgroundColor: theme.appBG,
        }, navigationTabBarItem: {
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
        }, leftNavigationTabBarContainer: {
            height: '100%',
            width: variables_1.default.navigationTabBarSize,
            position: 'fixed',
            left: 0,
            justifyContent: 'space-between',
            borderRightWidth: 1,
            borderRightColor: theme.border,
            backgroundColor: theme.appBG,
        }, leftNavigationTabBarItem: {
            height: variables_1.default.navigationTabBarSize,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
        }, button: __assign(__assign({ backgroundColor: theme.buttonDefaultBG, borderRadius: variables_1.default.buttonBorderRadius, minHeight: variables_1.default.componentSizeNormal, justifyContent: 'center', alignItems: 'center' }, spacing_1.default.ph3), spacing_1.default.pv0), buttonContainer: {
            borderRadius: variables_1.default.buttonBorderRadius,
        }, buttonText: __assign(__assign({ color: theme.text }, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), { fontSize: variables_1.default.fontSizeNormal, textAlign: 'center', flexShrink: 1, 
            // It is needed to unset the line height. We don't need it for buttons as button always contains single line of text.
            // It allows to vertically center the text.
            lineHeight: undefined, 
            // Add 1px to the Button text to give optical vertical alignment.
            paddingBottom: 1 }), testRowContainer: __assign(__assign(__assign(__assign(__assign(__assign({}, flex_1.default.flexRow), flex_1.default.justifyContentBetween), flex_1.default.alignItemsCenter), sizing_1.default.mnw120), spacing_1.default.gap4), { minHeight: 64 }), buttonSmall: {
            borderRadius: variables_1.default.buttonBorderRadius,
            minHeight: variables_1.default.componentSizeSmall,
            minWidth: variables_1.default.componentSizeSmall,
            paddingHorizontal: 12,
            backgroundColor: theme.buttonDefaultBG,
        }, buttonMedium: {
            borderRadius: variables_1.default.buttonBorderRadius,
            minHeight: variables_1.default.componentSizeNormal,
            minWidth: variables_1.default.componentSizeNormal,
            paddingHorizontal: 16,
            backgroundColor: theme.buttonDefaultBG,
        }, buttonLarge: {
            borderRadius: variables_1.default.buttonBorderRadius,
            minHeight: variables_1.default.componentSizeLarge,
            minWidth: variables_1.default.componentSizeLarge,
            paddingHorizontal: 20,
            backgroundColor: theme.buttonDefaultBG,
        }, buttonSmallText: __assign(__assign({ fontSize: variables_1.default.fontSizeSmall }, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), { textAlign: 'center' }), buttonMediumText: __assign(__assign({ fontSize: variables_1.default.fontSizeLabel }, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), { textAlign: 'center' }), buttonLargeText: __assign(__assign({ fontSize: variables_1.default.fontSizeNormal }, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), { textAlign: 'center' }), buttonDefaultHovered: {
            backgroundColor: theme.buttonHoveredBG,
            borderWidth: 0,
        }, buttonDefaultSelected: {
            backgroundColor: theme.buttonPressedBG,
            borderWidth: 0,
        }, buttonSuccess: {
            backgroundColor: theme.success,
            borderWidth: 0,
        }, buttonOpacityDisabled: {
            opacity: 0.5,
        }, buttonSuccessHovered: {
            backgroundColor: theme.successHover,
            borderWidth: 0,
        }, buttonDanger: {
            backgroundColor: theme.danger,
            borderWidth: 0,
        }, buttonDangerHovered: {
            backgroundColor: theme.dangerHover,
            borderWidth: 0,
        }, buttonDisabled: {
            backgroundColor: theme.buttonDefaultBG,
            borderWidth: 0,
        }, buttonDivider: __assign({ borderRightWidth: 1, borderRightColor: theme.buttonHoveredBG }, sizing_1.default.h100), buttonSuccessDivider: __assign({ borderRightWidth: 1, borderRightColor: theme.successHover }, sizing_1.default.h100), buttonDangerDivider: __assign({ borderRightWidth: 1, borderRightColor: theme.dangerHover }, sizing_1.default.h100), noBorderRadius: {
            borderRadius: 0,
        }, noRightBorderRadius: {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
        }, noLeftBorderRadius: {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
        }, buttonCTA: __assign({}, spacing_1.default.mh4), buttonCTAIcon: {
            marginRight: 22,
            marginLeft: 8,
            // Align vertically with the Button text
            paddingBottom: 1,
            paddingTop: 1,
        }, buttonConfirm: {
            margin: 20,
        }, attachmentButtonBigScreen: {
            minWidth: 300,
            alignSelf: 'center',
        }, buttonConfirmText: {
            paddingLeft: 20,
            paddingRight: 20,
        }, buttonSuccessText: {
            color: theme.buttonSuccessText,
        }, buttonDangerText: {
            color: theme.textLight,
        }, buttonBlendContainer: {
            backgroundColor: theme.appBG,
            opacity: 1,
            position: 'relative',
            overflow: 'hidden',
        }, hoveredComponentBG: {
            backgroundColor: theme.hoverComponentBG,
        }, hoveredComponentBG2: {
            backgroundColor: 'black',
        }, activeComponentBG: {
            backgroundColor: theme.activeComponentBG,
        }, touchableButtonImage: {
            alignItems: 'center',
            height: variables_1.default.componentSizeNormal,
            justifyContent: 'center',
            width: variables_1.default.componentSizeNormal,
        }, visuallyHidden: __assign(__assign({}, visibility_1.default.hidden), { overflow: 'hidden', width: 0, height: 0 }), visibilityHidden: __assign({}, visibility_1.default.hidden), loadingVBAAnimation: {
            width: 140,
            height: 140,
        }, loadingVBAAnimationWeb: {
            width: 140,
            height: 140,
        }, pickerSmall: function (disabled, backgroundColor) {
            if (disabled === void 0) { disabled = false; }
            if (backgroundColor === void 0) { backgroundColor = theme.highlightBG; }
            return ({
                inputIOS: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeSmall, paddingLeft: 0, paddingRight: 17, paddingTop: 6, paddingBottom: 6, borderWidth: 0, color: theme.text, height: 26, opacity: 1, backgroundColor: 'transparent' }),
                done: {
                    color: theme.text,
                },
                doneDepressed: {
                    // Extracted from react-native-picker-select, src/styles.js
                    fontSize: 17,
                },
                modalViewMiddle: {
                    position: 'relative',
                    backgroundColor: theme.border,
                    borderTopWidth: 0,
                },
                modalViewBottom: {
                    backgroundColor: theme.highlightBG,
                },
                inputWeb: __assign(__assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeSmall, paddingLeft: 0, paddingRight: 17, paddingTop: 6, paddingBottom: 6, borderWidth: 0, color: theme.text, appearance: 'none', height: 26, opacity: 1, backgroundColor: backgroundColor }), (disabled ? cursor_1.default.cursorDisabled : cursor_1.default.cursorPointer)),
                inputAndroid: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeSmall, paddingLeft: 0, paddingRight: 17, paddingTop: 6, paddingBottom: 6, borderWidth: 0, color: theme.text, height: 26, opacity: 1, backgroundColor: 'transparent' }),
                iconContainer: __assign({ top: 7 }, pointerEventsNone_1.default),
                icon: {
                    width: variables_1.default.iconSizeExtraSmall,
                    height: variables_1.default.iconSizeExtraSmall,
                },
                chevronContainer: {
                    pointerEvents: 'none',
                    opacity: 0,
                },
            });
        }, badge: {
            backgroundColor: theme.border,
            borderRadius: 14,
            height: variables_1.default.iconSizeNormal,
            flexDirection: 'row',
            paddingHorizontal: 7,
            alignItems: 'center',
        }, defaultBadge: {
            backgroundColor: theme.transparent,
            borderWidth: 1,
            borderRadius: variables_1.default.componentBorderRadiusSmall,
            borderColor: theme.buttonHoveredBG,
            paddingHorizontal: 12,
            minHeight: 28,
            height: variables_1.default.iconSizeNormal,
            flexDirection: 'row',
            alignItems: 'center',
        }, cardBadge: {
            position: 'absolute',
            top: 20,
            left: 16,
            marginLeft: 0,
            paddingHorizontal: 8,
            minHeight: 20,
            borderColor: colors_1.default.productDark500,
        }, environmentBadge: {
            minHeight: 12,
            borderRadius: 14,
            paddingHorizontal: 7,
            minWidth: 22,
            borderWidth: 0,
        }, badgeSuccess: {
            borderColor: theme.success,
        }, badgeEnvironmentSuccess: {
            backgroundColor: theme.success,
        }, badgeSuccessPressed: {
            borderColor: theme.successHover,
        }, badgeAdHocSuccess: {
            backgroundColor: theme.badgeAdHoc,
            minWidth: 28,
        }, badgeAdHocSuccessPressed: {
            backgroundColor: theme.badgeAdHocHover,
        }, badgeDanger: {
            borderColor: theme.danger,
        }, badgeEnvironmentDanger: {
            backgroundColor: theme.danger,
        }, badgeDangerPressed: {
            borderColor: theme.dangerPressed,
        }, badgeBordered: {
            backgroundColor: theme.transparent,
            borderWidth: 1,
            borderRadius: variables_1.default.componentBorderRadiusSmall,
            borderColor: theme.border,
            paddingHorizontal: 12,
            minHeight: 28,
        }, badgeSmall: {
            backgroundColor: theme.border,
            borderRadius: variables_1.default.componentBorderRadiusSmall,
            borderColor: theme.border,
            paddingHorizontal: 6,
            minHeight: 20,
        }, badgeText: __assign(__assign({ color: theme.text, fontSize: variables_1.default.fontSizeSmall }, lineHeightBadge), whiteSpace_1.default.noWrap), cardBadgeText: {
            color: colors_1.default.white,
            fontSize: variables_1.default.fontSizeExtraSmall,
        }, activeItemBadge: {
            borderColor: theme.buttonHoveredBG,
        }, border: {
            borderWidth: 1,
            borderRadius: variables_1.default.componentBorderRadius,
            borderColor: theme.border,
        }, borderColorFocus: {
            borderColor: theme.borderFocus,
        }, borderColorDanger: {
            borderColor: theme.danger,
        }, textInputDisabledContainer: {
            // Adding disabled color theme to indicate user that the field is not editable.
            backgroundColor: theme.highlightBG,
            borderColor: theme.borderLighter,
        }, textInputDisabled: __assign(__assign({}, ((0, Browser_1.getBrowser)()
            ? {
                WebkitTextFillColor: theme.textSupporting,
                WebkitOpacity: 1,
            }
            : {})), { color: theme.textSupporting }), uploadFileView: function (isSmallScreenWidth) {
            return ({
                borderRadius: variables_1.default.componentBorderRadiusLarge,
                borderWidth: isSmallScreenWidth ? 0 : 2,
                borderColor: theme.borderFocus,
                borderStyle: 'dotted',
                marginBottom: variables_1.default.uploadViewMargin,
                marginLeft: variables_1.default.uploadViewMargin,
                marginRight: variables_1.default.uploadViewMargin,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 40,
                gap: 4,
                flex: 1,
            });
        }, uploadFileViewTextContainer: __assign({ paddingHorizontal: 40 }, sizing_1.default.w100), cameraView: {
            flex: 1,
            overflow: 'hidden',
            borderRadius: variables_1.default.componentBorderRadiusXLarge,
            borderStyle: 'solid',
            borderWidth: variables_1.default.componentBorderWidth,
            backgroundColor: theme.highlightBG,
            borderColor: theme.appBG,
            display: 'flex',
            justifyContent: 'center',
            justifyItems: 'center',
        }, cameraFocusIndicator: {
            position: 'absolute',
            left: -32,
            top: -32,
            width: 64,
            height: 64,
            borderRadius: 32,
            borderWidth: 2,
            borderColor: theme.white,
            pointerEvents: 'none',
        }, permissionView: {
            paddingVertical: 108,
            paddingHorizontal: 61,
            alignItems: 'center',
            justifyContent: 'center',
        }, invisiblePDF: {
            position: 'absolute',
            opacity: 0,
            width: 1,
            height: 1,
        }, headerAnonymousFooter: __assign(__assign({ color: theme.heading }, FontUtils_1.default.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM), { fontSize: variables_1.default.fontSizeXLarge, lineHeight: variables_1.default.lineHeightXXLarge }), headerText: __assign(__assign({ color: theme.heading }, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), { fontSize: variables_1.default.fontSizeNormal }), headerGap: {
            height: CONST_1.default.DESKTOP_HEADER_PADDING,
        }, searchHeaderGap: {
            zIndex: variables_1.default.searchTopBarZIndex + 2,
            backgroundColor: theme.appBG,
        }, reportOptions: {
            marginLeft: 8,
        }, chatItemComposeSecondaryRow: {
            height: CONST_1.default.CHAT_FOOTER_SECONDARY_ROW_HEIGHT,
            marginBottom: CONST_1.default.CHAT_FOOTER_SECONDARY_ROW_PADDING,
            marginTop: CONST_1.default.CHAT_FOOTER_SECONDARY_ROW_PADDING,
        }, chatItemComposeSecondaryRowSubText: __assign(__assign({ color: theme.textSupporting }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeSmall, lineHeight: variables_1.default.lineHeightSmall }), chatItemComposeSecondaryRowOffset: {
            marginLeft: variables_1.default.chatInputSpacing,
        }, offlineIndicatorChat: {
            marginLeft: variables_1.default.chatInputSpacing,
        }, offlineIndicatorContainer: {
            height: CONST_1.default.OFFLINE_INDICATOR_HEIGHT,
        }, deletedAttachmentIndicator: {
            zIndex: 20,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
        }, deletedIndicatorOverlay: {
            opacity: 0.8,
        }, 
        // Actions
        actionAvatar: {
            borderRadius: 20,
        }, componentHeightLarge: {
            height: variables_1.default.inputHeight,
        }, calendarHeader: __assign({ height: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, userSelect_1.default.userSelectNone), calendarDayRoot: __assign({ flex: 1, height: CONST_1.default.CALENDAR_PICKER_DAY_HEIGHT, justifyContent: 'center', alignItems: 'center' }, userSelect_1.default.userSelectNone), calendarBodyContainer: {
            height: CONST_1.default.CALENDAR_PICKER_DAY_HEIGHT * CONST_1.default.MAX_CALENDAR_PICKER_ROWS,
        }, calendarWeekContainer: {
            height: CONST_1.default.CALENDAR_PICKER_DAY_HEIGHT,
        }, calendarDayContainer: {
            width: 30,
            height: 30,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 15,
            overflow: 'hidden',
        }, buttonDefaultBG: {
            backgroundColor: theme.buttonDefaultBG,
        }, buttonHoveredBG: {
            backgroundColor: theme.buttonHoveredBG,
        }, autoGrowHeightInputContainer: function (textInputHeight, minHeight, maxHeight) {
            return ({
                height: (0, clamp_1.default)(textInputHeight, minHeight, maxHeight),
                minHeight: minHeight,
            });
        }, autoGrowHeightHiddenInput: function (maxWidth, maxHeight) {
            return ({
                maxWidth: maxWidth,
                maxHeight: maxHeight && maxHeight + 1,
                overflow: 'hidden',
            });
        }, textInputContainer: {
            flex: 1,
            justifyContent: 'center',
            height: '100%',
            backgroundColor: 'transparent',
            overflow: 'hidden',
            borderWidth: 1,
            padding: 8,
            paddingBottom: 0,
            borderRadius: 8,
            borderColor: theme.border,
        }, outlinedButton: {
            backgroundColor: 'transparent',
            borderColor: theme.border,
            borderWidth: 1,
        }, optionRowAmountInput: {
            textAlign: 'right',
        }, textInputLabelContainer: {
            position: 'absolute',
            left: 8,
            paddingRight: 16,
            top: 0,
            width: '100%',
            zIndex: 1,
            transformOrigin: 'left center',
        }, textInputLabel: __assign({ fontSize: variables_1.default.fontSizeNormal, color: theme.textSupporting }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), textInputLabelBackground: {
            position: 'absolute',
            top: 0,
            width: '100%',
            height: 23,
            backgroundColor: theme.componentBG,
        }, textInputLabelTransformation: function (translateY, scale, isForTextComponent) {
            'worklet';
            if (isForTextComponent) {
                return {
                    fontSize: (0, react_native_reanimated_1.interpolate)(scale.get(), [0, styleConst_1.ACTIVE_LABEL_SCALE], [0, variables_1.default.fontSizeLabel]),
                };
            }
            return {
                transform: [{ translateY: translateY.get() }],
                fontSize: (0, react_native_reanimated_1.interpolate)(scale.get(), [0, styleConst_1.ACTIVE_LABEL_SCALE], [0, variables_1.default.fontSizeLabel]),
            };
        }, baseTextInput: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeNormal, lineHeight: variables_1.default.lineHeightXLarge, color: theme.text, paddingTop: 15, paddingBottom: 8, paddingLeft: 0, borderWidth: 0 }), textInputMultiline: {
            scrollPadding: '23px 0 0 0',
        }, textInputMultilineContainer: {
            height: '100%',
            paddingTop: 15,
        }, textInputAndIconContainer: function (isMarkdownEnabled) {
            if (isMarkdownEnabled) {
                return { zIndex: -1, flexDirection: 'row' };
            }
            return {
                flex: 1,
                zIndex: -1,
                flexDirection: 'row',
            };
        }, textInputDesktop: (0, addOutlineWidth_1.default)(theme, {}, 0), textInputLeftIconContainer: {
            justifyContent: 'center',
            paddingRight: 8,
        }, secureInput: {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
        }, textInput: __assign(__assign({ backgroundColor: 'transparent', borderRadius: variables_1.default.componentBorderRadiusNormal, height: variables_1.default.inputComponentSizeNormal, borderColor: theme.border, borderWidth: 1, color: theme.text }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeNormal, paddingLeft: 12, paddingRight: 12, paddingTop: 10, paddingBottom: 10, verticalAlign: 'middle' }), textInputPrefixWrapper: {
            position: 'absolute',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 15,
            paddingBottom: 8,
            height: '100%',
        }, textInputSuffixWrapper: {
            position: 'absolute',
            right: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 15,
            paddingBottom: 8,
        }, textInputPrefix: __assign(__assign({ color: theme.text }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeNormal, verticalAlign: 'middle' }), textInputSuffix: __assign(__assign({ color: theme.text }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeNormal, verticalAlign: 'middle' }), pickerContainer: {
            borderBottomWidth: 2,
            paddingLeft: 0,
            borderStyle: 'solid',
            borderColor: theme.border,
            justifyContent: 'center',
            backgroundColor: 'transparent',
            height: variables_1.default.inputHeight,
            overflow: 'hidden',
        }, pickerContainerSmall: {
            height: variables_1.default.inputHeightSmall,
        }, pickerLabel: {
            position: 'absolute',
            left: 0,
            top: 6,
            zIndex: 1,
        }, picker: function (disabled, backgroundColor) {
            if (disabled === void 0) { disabled = false; }
            if (backgroundColor === void 0) { backgroundColor = theme.appBG; }
            return ({
                iconContainer: __assign({ top: Math.round(variables_1.default.inputHeight * 0.5) - 11, right: 0 }, pointerEventsNone_1.default),
                inputWeb: __assign(__assign(__assign({ appearance: 'none' }, (disabled ? cursor_1.default.cursorDisabled : cursor_1.default.cursorPointer)), picker(theme)), { backgroundColor: backgroundColor }),
                inputIOS: __assign({}, picker(theme)),
                done: {
                    color: theme.text,
                },
                doneDepressed: {
                    // Extracted from react-native-picker-select, src/styles.js
                    fontSize: 17,
                },
                modalViewMiddle: {
                    backgroundColor: theme.border,
                    borderTopWidth: 0,
                },
                modalViewBottom: {
                    backgroundColor: theme.highlightBG,
                },
                inputAndroid: __assign({}, picker(theme)),
            });
        }, disabledText: {
            color: theme.icon,
        }, inputDisabled: {
            backgroundColor: theme.highlightBG,
            color: theme.icon,
        }, noOutline: (0, addOutlineWidth_1.default)(theme, {}, 0), labelStrong: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), { fontSize: variables_1.default.fontSizeLabel, lineHeight: variables_1.default.lineHeightNormal }), textLabelSupporting: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeLabel, color: theme.textSupporting }), textLabelSupportingEmptyValue: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeNormal, color: theme.textSupporting }), textLabelSupportingNormal: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeLabel, color: theme.textSupporting }), textLabelError: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeLabel, color: theme.textError }), textFileUpload: __assign(__assign({}, headlineFont), { fontSize: variables_1.default.fontSizeXLarge, color: theme.text, textAlign: 'center' }), textDropZone: __assign(__assign({}, headlineFont), { fontSize: variables_1.default.fontSizeXLarge, textAlign: 'center' }), subTextFileUpload: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { lineHeight: variables_1.default.lineHeightLarge, textAlign: 'center', color: theme.text }), furtherDetailsText: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeSmall, color: theme.textSupporting }), lh14: {
            lineHeight: variables_1.default.lineHeightSmall,
        }, lh16: {
            lineHeight: 16,
        }, lh20: {
            lineHeight: 20,
        }, lh140Percent: {
            lineHeight: '140%',
        }, formHelp: {
            color: theme.textSupporting,
            fontSize: variables_1.default.fontSizeLabel,
            lineHeight: variables_1.default.lineHeightNormal,
            marginBottom: 4,
        }, formError: {
            color: theme.textError,
            fontSize: variables_1.default.fontSizeLabel,
            lineHeight: variables_1.default.lineHeightNormal,
            marginBottom: 4,
        }, formSuccess: {
            color: theme.success,
            fontSize: variables_1.default.fontSizeLabel,
            lineHeight: 18,
            marginBottom: 4,
        }, signInPage: {
            backgroundColor: theme.highlightBG,
            minHeight: '100%',
            flex: 1,
        }, lhnSuccessText: {
            color: theme.success,
            fontWeight: FontUtils_1.default.fontWeight.bold,
        }, signInPageHeroCenter: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
        }, signInPageGradient: {
            height: '100%',
            width: 540,
            position: 'absolute',
            top: 0,
            left: 0,
        }, signInPageGradientMobile: {
            height: 300,
            width: 800,
            position: 'absolute',
            top: 0,
            left: 0,
        }, signInBackground: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            minHeight: 700,
        }, signInPageInner: {
            marginLeft: 'auto',
            marginRight: 'auto',
            height: '100%',
            width: '100%',
        }, signInPageContentTopSpacer: {
            maxHeight: 132,
            minHeight: 24,
        }, signInPageContentTopSpacerSmallScreens: {
            maxHeight: 132,
            minHeight: 45,
        }, signInPageLeftContainer: {
            paddingLeft: 40,
            paddingRight: 40,
        }, signInPageLeftContainerWide: {
            maxWidth: variables_1.default.sideBarWidth,
        }, signInPageWelcomeFormContainer: {
            maxWidth: CONST_1.default.SIGN_IN_FORM_WIDTH,
        }, signInPageWelcomeTextContainer: {
            width: CONST_1.default.SIGN_IN_FORM_WIDTH,
        }, changeExpensifyLoginLinkContainer: __assign({ flexDirection: 'row', flexWrap: 'wrap' }, wordBreak_1.default.breakWord), searchSplitContainer: {
            flex: 1,
            flexDirection: 'row',
            marginLeft: variables_1.default.navigationTabBarSize + variables_1.default.sideBarWithLHBWidth,
        }, searchSidebar: {
            width: variables_1.default.sideBarWithLHBWidth,
            height: '100%',
            justifyContent: 'space-between',
            borderRightWidth: 1,
            borderColor: theme.border,
            marginLeft: variables_1.default.navigationTabBarSize,
        }, 
        // Sidebar Styles
        sidebar: {
            backgroundColor: theme.sidebar,
            height: '100%',
        }, canvasContainer: {
            // Adding border to prevent a bug with the appearance of lines during gesture events for MultiGestureCanvas
            borderWidth: 1,
            borderColor: theme.appBG,
        }, sidebarHeaderContainer: {
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingVertical: 19,
            justifyContent: 'space-between',
            alignItems: 'center',
        }, subNavigationContainer: {
            backgroundColor: theme.sidebar,
            flex: 1,
            borderTopLeftRadius: variables_1.default.componentBorderRadiusRounded,
        }, sidebarAnimatedWrapperContainer: {
            height: '100%',
            position: 'absolute',
        }, sidebarFooter: {
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            paddingLeft: 20,
        }, sidebarAvatar: {
            borderRadius: variables_1.default.sidebarAvatarSize,
            height: variables_1.default.sidebarAvatarSize,
            width: variables_1.default.sidebarAvatarSize,
        }, selectedAvatarBorder: {
            padding: 1,
            borderWidth: 2,
            borderRadius: 20,
            height: variables_1.default.sidebarAvatarSize + 6,
            width: variables_1.default.sidebarAvatarSize + 6,
            borderColor: theme.success,
            right: -3,
            top: -3,
        }, statusIndicator: function (backgroundColor) {
            if (backgroundColor === void 0) { backgroundColor = theme.danger; }
            return ({
                borderColor: theme.sidebar,
                backgroundColor: backgroundColor,
                borderRadius: 8,
                borderWidth: 2,
                position: 'absolute',
                right: -4,
                top: -3,
                height: 12,
                width: 12,
                zIndex: 10,
            });
        }, navigationTabBarStatusIndicator: function (backgroundColor) {
            if (backgroundColor === void 0) { backgroundColor = theme.danger; }
            return ({
                borderColor: theme.sidebar,
                backgroundColor: backgroundColor,
                borderRadius: 8,
                borderWidth: 2,
                position: 'absolute',
                right: -2,
                top: -3,
                height: 12,
                width: 12,
                zIndex: 10,
            });
        }, floatingActionButton: {
            backgroundColor: theme.success,
            height: variables_1.default.componentSizeLarge,
            width: variables_1.default.componentSizeLarge,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
        }, floatingActionButtonSmall: {
            width: variables_1.default.componentSizeNormal,
            height: variables_1.default.componentSizeNormal,
        }, sidebarFooterUsername: __assign({ color: theme.heading, fontSize: variables_1.default.fontSizeLabel, fontWeight: FontUtils_1.default.fontWeight.bold, width: 200, textOverflow: 'ellipsis', overflow: 'hidden' }, whiteSpace_1.default.noWrap), sidebarFooterLink: __assign(__assign({ color: theme.textSupporting, fontSize: variables_1.default.fontSizeSmall, textDecorationLine: 'none' }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { lineHeight: 20 }), sidebarListItem: {
            justifyContent: 'center',
            textDecorationLine: 'none',
        }, topBarLabel: __assign({ color: theme.text, fontSize: variables_1.default.fontSizeXLarge }, headlineFont), breadcrumbsContainer: {
            minHeight: 24,
        }, breadcrumb: __assign({ color: theme.textSupporting, fontSize: variables_1.default.breadcrumbsFontSize }, headlineFont), breadcrumbStrong: {
            color: theme.text,
            fontSize: variables_1.default.breadcrumbsFontSize,
        }, breadcrumbSeparator: __assign({ color: theme.icon, fontSize: variables_1.default.breadcrumbsFontSize }, headlineFont), breadcrumbLogo: {
            top: 1.66, // Pixel-perfect alignment due to a small difference between logo height and breadcrumb text height
        }, RHPNavigatorContainer: function (isSmallScreenWidth) {
            return (__assign(__assign({}, modalNavigatorContainer(isSmallScreenWidth)), { right: 0 }));
        }, onboardingNavigatorOuterView: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }, OnboardingNavigatorInnerView: function (shouldUseNarrowLayout) {
            return ({
                width: shouldUseNarrowLayout ? variables_1.default.onboardingModalWidth : '100%',
                height: shouldUseNarrowLayout ? 732 : '100%',
                maxHeight: '100%',
                borderRadius: shouldUseNarrowLayout ? 16 : 0,
                overflow: 'hidden',
            });
        }, onlyEmojisText: {
            fontSize: variables_1.default.fontSizeOnlyEmojis,
            lineHeight: variables_1.default.fontSizeOnlyEmojisHeight,
        }, onlyEmojisTextLineHeight: {
            lineHeight: variables_1.default.fontSizeOnlyEmojisHeight,
        }, emojisWithTextFontSizeAligned: {
            fontSize: variables_1.default.fontSizeEmojisWithinText,
            marginVertical: -7,
        }, emojisFontFamily: {
            fontFamily: FontUtils_1.default.fontFamily.platform.SYSTEM.fontFamily,
        }, emojisWithTextFontSize: {
            fontSize: variables_1.default.fontSizeEmojisWithinText,
        }, emojisWithTextFontFamily: {
            fontFamily: FontUtils_1.default.fontFamily.platform.SYSTEM.fontFamily,
        }, emojisWithTextLineHeight: {
            lineHeight: variables_1.default.lineHeightXLarge,
        }, createMenuPositionSidebar: function (windowHeight) {
            return ({
                horizontal: 18,
                // Menu should be displayed 12px above the floating action button.
                // To achieve that sidebar must be moved by: distance from the bottom of the sidebar to the fab (variables.fabBottom) + fab height on a wide layout (variables.componentSizeNormal) + distance above the fab (12px)
                vertical: windowHeight - (variables_1.default.fabBottom + variables_1.default.componentSizeNormal + 12),
            });
        }, createAccountMenuPositionProfile: function () {
            return (__assign({ horizontal: 18 }, (0, getPopOverVerticalOffset_1.default)(202 + 40)));
        }, createMenuPositionReportActionCompose: function (shouldUseNarrowLayout, windowHeight, windowWidth) {
            return ({
                // On a narrow layout the menu is displayed in ReportScreen in RHP, so it must be moved from the right side of the screen
                horizontal: (shouldUseNarrowLayout ? windowWidth - variables_1.default.sideBarWithLHBWidth : variables_1.default.sideBarWithLHBWidth + variables_1.default.navigationTabBarSize) + 18,
                vertical: windowHeight - CONST_1.default.MENU_POSITION_REPORT_ACTION_COMPOSE_BOTTOM,
            });
        }, createMenuContainer: {
            width: variables_1.default.sideBarWidth - 40,
            paddingVertical: variables_1.default.componentBorderRadiusLarge,
        }, createMenuHeaderText: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeLabel, color: theme.textSupporting }), popoverMenuItem: {
            flexDirection: 'row',
            borderRadius: 0,
            paddingHorizontal: 20,
            paddingVertical: 12,
            justifyContent: 'space-between',
            width: '100%',
        }, popoverMenuIcon: {
            width: variables_1.default.componentSizeNormal,
            justifyContent: 'center',
            alignItems: 'center',
        }, popoverIconCircle: {
            backgroundColor: theme.buttonDefaultBG,
            borderRadius: variables_1.default.buttonBorderRadius,
            height: variables_1.default.h40,
            width: variables_1.default.w46,
        }, rightLabelMenuItem: {
            fontSize: variables_1.default.fontSizeLabel,
            color: theme.textSupporting,
        }, popoverMenuText: {
            fontSize: variables_1.default.fontSizeNormal,
            color: theme.heading,
        }, popoverInnerContainer: {
            paddingTop: 0, // adjusting this because the mobile modal adds additional padding that we don't need for our layout
            backgroundColor: theme.modalBackground,
        }, menuItemTextContainer: {
            minHeight: variables_1.default.componentSizeNormal,
        }, chatLinkRowPressable: {
            minWidth: 0,
            textDecorationLine: 'none',
            flex: 1,
        }, sidebarLink: {
            textDecorationLine: 'none',
        }, sidebarLinkLHN: {
            textDecorationLine: 'none',
            marginLeft: 12,
            marginRight: 12,
            borderRadius: 8,
        }, sidebarLinkInner: {
            alignItems: 'center',
            flexDirection: 'row',
            paddingLeft: 20,
            paddingRight: 20,
        }, sidebarLinkInnerLHN: {
            alignItems: 'center',
            flexDirection: 'row',
            paddingLeft: 8,
            paddingRight: 8,
            marginHorizontal: 12,
            borderRadius: variables_1.default.componentBorderRadiusNormal,
        }, sidebarLinkText: {
            color: theme.textSupporting,
            fontSize: variables_1.default.fontSizeNormal,
            textDecorationLine: 'none',
            overflow: 'hidden',
        }, sidebarLinkHover: {
            backgroundColor: theme.sidebarHover,
        }, sidebarLinkHoverLHN: {
            backgroundColor: theme.highlightBG,
        }, sidebarLinkActive: {
            backgroundColor: theme.activeComponentBG,
            textDecorationLine: 'none',
        }, sidebarLinkActiveLHN: {
            backgroundColor: theme.highlightBG,
            textDecorationLine: 'none',
        }, sidebarLinkTextBold: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), { color: theme.heading }), sidebarLinkActiveText: {
            color: theme.textSupporting,
            fontSize: variables_1.default.fontSizeNormal,
            textDecorationLine: 'none',
            overflow: 'hidden',
        }, optionItemAvatarNameWrapper: {
            minWidth: 0,
            flex: 1,
        }, optionDisplayName: __assign(__assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { minHeight: variables_1.default.alternateTextHeight, lineHeight: variables_1.default.lineHeightXLarge }), whiteSpace_1.default.noWrap), optionDisplayNameCompact: {
            minWidth: 'auto',
            flexBasis: 'auto',
            flexGrow: 0,
            flexShrink: 1,
        }, displayNameTooltipEllipsis: {
            position: 'absolute',
            opacity: 0,
            right: 0,
            bottom: 0,
        }, optionAlternateText: {
            minHeight: variables_1.default.alternateTextHeight,
            lineHeight: variables_1.default.lineHeightXLarge,
        }, optionAlternateTextCompact: __assign({ flexShrink: 1, flexGrow: 1, flexBasis: 'auto' }, optionAlternateTextPlatformStyles_1.default), optionRow: {
            minHeight: variables_1.default.optionRowHeight,
            paddingTop: 12,
            paddingBottom: 12,
        }, optionRowSelected: {
            backgroundColor: theme.activeComponentBG,
        }, optionRowDisabled: {
            color: theme.textSupporting,
        }, optionRowCompact: {
            height: variables_1.default.optionRowHeightCompact,
            minHeight: variables_1.default.optionRowHeightCompact,
            paddingTop: 12,
            paddingBottom: 12,
        }, optionsListSectionHeader: {
            marginTop: 8,
            marginBottom: 4,
        }, emptyWorkspaceIllustrationStyle: {
            marginTop: 12,
            marginBottom: -20,
        }, travelIllustrationStyle: {
            marginTop: 16,
            marginBottom: -16,
        }, overlayStyles: function (current, isModalOnTheLeft) {
            return (__assign(__assign({}, positioning_1.default.pFixed), { 
                // We need to stretch the overlay to cover the sidebar and the translate animation distance.
                left: isModalOnTheLeft ? 0 : -2 * variables_1.default.sideBarWidth, top: 0, bottom: 0, right: isModalOnTheLeft ? -2 * variables_1.default.sideBarWidth : 0, backgroundColor: theme.overlay, opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, variables_1.default.overlayOpacity],
                    extrapolate: 'clamp',
                }) }));
        }, appContent: {
            backgroundColor: theme.appBG,
            overflow: 'hidden',
        }, appContentHeader: {
            height: variables_1.default.contentHeaderHeight,
            justifyContent: 'center',
            display: 'flex',
            paddingRight: 20,
        }, appContentHeaderTitle: {
            alignItems: 'center',
            flexDirection: 'row',
        }, LHNToggle: {
            alignItems: 'center',
            height: variables_1.default.contentHeaderHeight,
            justifyContent: 'center',
            paddingRight: 10,
            paddingLeft: 20,
        }, LHNToggleIcon: {
            height: 15,
            width: 18,
        }, chatContentScrollViewWithHeaderLoader: {
            paddingTop: CONST_1.default.CHAT_HEADER_LOADER_HEIGHT,
        }, chatContentScrollView: __assign({ flexGrow: 1, justifyContent: 'flex-start', paddingBottom: 16 }, chatContentScrollViewPlatformStyles_1.default), 
        // Chat Item
        chatItem: {
            display: 'flex',
            flexDirection: 'row',
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 20,
            paddingRight: 20,
        }, chatItemRightGrouped: {
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 0,
            position: 'relative',
            marginLeft: variables_1.default.chatInputSpacing,
        }, chatItemRight: {
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 'auto',
            position: 'relative',
        }, chatItemMessageHeader: {
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
        }, chatItemMessageHeaderSender: __assign(__assign(__assign({ color: theme.heading }, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), { fontSize: variables_1.default.fontSizeNormal, lineHeight: variables_1.default.lineHeightXLarge }), wordBreak_1.default.breakWord), chatItemMessageHeaderTimestamp: {
            flexShrink: 0,
            color: theme.textSupporting,
            fontSize: variables_1.default.fontSizeSmall,
            paddingTop: 2,
        }, chatItemMessageHeaderPolicy: {
            color: theme.textSupporting,
            fontSize: variables_1.default.fontSizeSmall,
        }, chatItemMessage: __assign(__assign(__assign(__assign({ color: theme.text, fontSize: variables_1.default.fontSizeNormal }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { lineHeight: variables_1.default.lineHeightXLarge, maxWidth: '100%' }), whiteSpace_1.default.preWrap), wordBreak_1.default.breakWord), chatDelegateMessage: __assign(__assign(__assign(__assign({ color: theme.textSupporting, fontSize: 11 }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { lineHeight: variables_1.default.lineHeightXLarge, maxWidth: '100%' }), whiteSpace_1.default.preWrap), wordBreak_1.default.breakWord), renderHTMLTitle: __assign(__assign(__assign(__assign({ color: theme.text, fontSize: variables_1.default.fontSizeNormal }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { lineHeight: variables_1.default.lineHeightXLarge, maxWidth: '100%' }), whiteSpace_1.default.preWrap), wordBreak_1.default.breakWord), renderHTML: __assign(__assign({ maxWidth: '100%' }, whiteSpace_1.default.preWrap), wordBreak_1.default.breakWord), chatItemComposeWithFirstRow: {
            minHeight: 90,
        }, chatItemFullComposeRow: __assign({}, sizing_1.default.h100), chatItemComposeBoxColor: {
            borderColor: theme.border,
        }, chatItemComposeBoxFocusedColor: {
            borderColor: theme.borderFocus,
        }, chatItemComposeBox: {
            backgroundColor: theme.componentBG,
            borderWidth: 1,
            borderRadius: variables_1.default.componentBorderRadiusRounded,
            minHeight: variables_1.default.componentSizeMedium,
        }, chatItemFullComposeBox: __assign(__assign({}, flex_1.default.flex1), sizing_1.default.h100), chatFooter: {
            paddingLeft: 20,
            paddingRight: 20,
            display: 'flex',
            backgroundColor: theme.appBG,
        }, chatFooterFullCompose: {
            height: '100%',
            paddingTop: 20,
        }, chatItemDraft: {
            display: 'flex',
            flexDirection: 'row',
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 20,
            paddingRight: 20,
        }, chatItemReactionsDraftRight: {
            marginLeft: 52,
        }, chatFooterAtTheTop: {
            flexGrow: 1,
            justifyContent: 'flex-start',
        }, 
        // Be extremely careful when editing the compose styles, as it is easy to introduce regressions.
        // Make sure you run the following tests against any changes: #12669
        textInputCompose: (0, addOutlineWidth_1.default)(theme, __assign(__assign(__assign(__assign({ backgroundColor: theme.componentBG, borderColor: theme.border, color: theme.text }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeNormal, borderWidth: 0, height: 'auto', lineHeight: variables_1.default.lineHeightXLarge }), overflowXHidden_1.default), { 
            // On Android, multiline TextInput with height: 'auto' will show extra padding unless they are configured with
            // paddingVertical: 0, alignSelf: 'center', and verticalAlign: 'middle'
            paddingHorizontal: variables_1.default.avatarChatSpacing, paddingTop: 0, paddingBottom: 0, alignSelf: 'center', verticalAlign: 'middle' }), 0), textInputFullCompose: {
            alignSelf: 'stretch',
            flex: 1,
            maxHeight: '100%',
            verticalAlign: 'top',
        }, textInputCollapseCompose: {
            maxHeight: '100%',
            flex: 4,
        }, 
        // composer padding should not be modified unless thoroughly tested against the cases in this PR: #12669
        textInputComposeSpacing: __assign(__assign({ paddingVertical: 5 }, flex_1.default.flexRow), { flex: 1 }), textInputComposeBorder: {
            borderLeftWidth: 1,
            borderColor: theme.border,
        }, chatItemSubmitButton: {
            alignSelf: 'flex-end',
            borderRadius: variables_1.default.componentBorderRadiusRounded,
            backgroundColor: theme.transparent,
            height: 40,
            padding: 10,
            margin: 3,
            justifyContent: 'center',
        }, emojiPickerContainer: {
            backgroundColor: theme.componentBG,
        }, emojiHeaderContainer: {
            backgroundColor: theme.componentBG,
            display: 'flex',
            height: CONST_1.default.EMOJI_PICKER_HEADER_HEIGHT,
            justifyContent: 'center',
        }, emojiSkinToneTitle: __assign(__assign(__assign({}, spacing_1.default.pv1), FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), { color: theme.heading, fontSize: variables_1.default.fontSizeSmall }), 
        // Emoji Picker Styles
        emojiText: __assign(__assign(__assign({ textAlign: 'center', fontSize: variables_1.default.emojiSize }, spacing_1.default.pv0), spacing_1.default.ph0), { lineHeight: variables_1.default.emojiLineHeight }), emojiItem: __assign({ width: '100%', textAlign: 'center', borderRadius: 8, paddingTop: 2, paddingBottom: 2, height: CONST_1.default.EMOJI_PICKER_ITEM_HEIGHT, flexShrink: 1 }, userSelect_1.default.userSelectNone), emojiItemHighlighted: {
            transition: '0.2s ease',
            backgroundColor: theme.buttonDefaultBG,
        }, emojiItemKeyboardHighlighted: {
            transition: '0.2s ease',
            borderWidth: 1,
            borderColor: theme.link,
            borderRadius: variables_1.default.buttonBorderRadius,
        }, categoryShortcutButton: {
            flex: 1,
            borderRadius: 8,
            height: CONST_1.default.EMOJI_PICKER_ITEM_HEIGHT,
            alignItems: 'center',
            justifyContent: 'center',
        }, chatItemEmojiButton: {
            alignSelf: 'flex-end',
            borderRadius: variables_1.default.buttonBorderRadius,
            height: 40,
            marginVertical: 3,
            paddingHorizontal: 10,
            justifyContent: 'center',
        }, editChatItemEmojiWrapper: {
            marginRight: 3,
            alignSelf: 'flex-end',
        }, composerSizeButton: {
            alignSelf: 'center',
            height: 32,
            width: 32,
            padding: 6,
            marginHorizontal: 3,
            borderRadius: variables_1.default.componentBorderRadiusRounded,
            backgroundColor: theme.transparent,
            justifyContent: 'center',
        }, chatItemAttachmentPlaceholder: {
            backgroundColor: theme.sidebar,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: variables_1.default.componentBorderRadiusNormal,
            height: 150,
            textAlign: 'center',
            verticalAlign: 'middle',
            width: 200,
        }, chatItemPDFAttachmentLoading: __assign(__assign({ backgroundColor: 'transparent', borderColor: theme.border, borderWidth: 1, borderRadius: variables_1.default.componentBorderRadiusNormal }, flex_1.default.alignItemsCenter), flex_1.default.justifyContentCenter), sidebarVisible: {
            borderRightWidth: 1,
        }, sidebarHidden: {
            width: 0,
            borderRightWidth: 0,
        }, exampleCheckImage: {
            width: '100%',
            height: 80,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: variables_1.default.componentBorderRadiusNormal,
        }, singleAvatar: {
            height: 24,
            width: 24,
            backgroundColor: theme.icon,
            borderRadius: 12,
        }, singleAvatarSmall: {
            height: 16,
            width: 16,
            backgroundColor: theme.icon,
            borderRadius: 8,
        }, singleAvatarMedium: {
            height: 52,
            width: 52,
            backgroundColor: theme.icon,
            borderRadius: 52,
        }, secondAvatar: {
            position: 'absolute',
            right: -18,
            bottom: -18,
            borderWidth: 2,
            borderRadius: 14,
            borderColor: 'transparent',
        }, secondAvatarSmall: {
            position: 'absolute',
            right: -14,
            bottom: -14,
            borderWidth: 2,
            borderRadius: 10,
            borderColor: 'transparent',
        }, secondAvatarMedium: {
            position: 'absolute',
            right: -36,
            bottom: -36,
            borderWidth: 3,
            borderRadius: 52,
            borderColor: 'transparent',
        }, secondAvatarSubscript: {
            position: 'absolute',
            right: -6,
            bottom: -6,
        }, secondAvatarSubscriptCompact: {
            position: 'absolute',
            bottom: -4,
            right: -4,
        }, secondAvatarSubscriptSmallNormal: {
            position: 'absolute',
            bottom: 0,
            right: 0,
        }, secondAvatarInline: {
            bottom: -3,
            right: -25,
            borderWidth: 3,
            borderRadius: 18,
            borderColor: theme.cardBorder,
            backgroundColor: theme.appBG,
        }, avatarXLarge: {
            width: variables_1.default.avatarSizeXLarge,
            height: variables_1.default.avatarSizeXLarge,
        }, avatarInnerText: {
            color: theme.text,
            fontSize: variables_1.default.fontSizeSmall,
            lineHeight: undefined,
            marginLeft: -3,
            textAlign: 'center',
        }, avatarInnerTextSmall: {
            color: theme.text,
            fontSize: variables_1.default.fontSizeExtraSmall,
            lineHeight: undefined,
            marginLeft: -2,
            textAlign: 'center',
            zIndex: 10,
        }, emptyAvatar: {
            height: variables_1.default.avatarSizeNormal,
            width: variables_1.default.avatarSizeNormal,
        }, emptyAvatarSmallNormal: {
            height: variables_1.default.avatarSizeSmallNormal,
            width: variables_1.default.avatarSizeSmallNormal,
        }, emptyAvatarSmall: {
            height: variables_1.default.avatarSizeSmall,
            width: variables_1.default.avatarSizeSmall,
        }, emptyAvatarSmaller: {
            height: variables_1.default.avatarSizeSmaller,
            width: variables_1.default.avatarSizeSmaller,
        }, emptyAvatarMedium: {
            height: variables_1.default.avatarSizeMedium,
            width: variables_1.default.avatarSizeMedium,
        }, emptyAvatarLarge: {
            height: variables_1.default.avatarSizeLarge,
            width: variables_1.default.avatarSizeLarge,
        }, emptyAvatarMargin: {
            marginRight: variables_1.default.avatarChatSpacing,
        }, emptyAvatarMarginChat: {
            marginRight: variables_1.default.avatarChatSpacing - 12,
        }, emptyAvatarMarginSmall: {
            marginRight: variables_1.default.avatarChatSpacing - 4,
        }, emptyAvatarMarginSmaller: {
            marginRight: variables_1.default.avatarChatSpacing - 4,
        }, borderTop: {
            borderTopWidth: variables_1.default.borderTopWidth,
            borderColor: theme.border,
        }, borderTopRounded: {
            borderTopWidth: 1,
            borderColor: theme.border,
            borderTopLeftRadius: variables_1.default.componentBorderRadiusNormal,
            borderTopRightRadius: variables_1.default.componentBorderRadiusNormal,
        }, borderBottomRounded: {
            borderBottomWidth: 1,
            borderColor: theme.border,
            borderBottomLeftRadius: variables_1.default.componentBorderRadiusNormal,
            borderBottomRightRadius: variables_1.default.componentBorderRadiusNormal,
        }, borderBottom: {
            borderBottomWidth: 1,
            borderColor: theme.border,
        }, borderNone: {
            borderWidth: 0,
            borderBottomWidth: 0,
        }, borderRight: {
            borderRightWidth: 1,
            borderColor: theme.border,
        }, borderLeft: {
            borderLeftWidth: 1,
            borderColor: theme.border,
        }, pointerEventsNone: pointerEventsNone_1.default, pointerEventsAuto: pointerEventsAuto_1.default, pointerEventsBoxNone: pointerEventsBoxNone_1.default, headerBar: {
            overflow: 'hidden',
            justifyContent: 'center',
            display: 'flex',
            paddingLeft: 20,
            height: variables_1.default.contentHeaderHeight,
            width: '100%',
        }, reportSearchHeaderBar: {
            overflow: 'hidden',
            justifyContent: 'center',
            display: 'flex',
            width: '100%',
            height: 52,
        }, searchResultsHeaderBar: {
            display: 'flex',
            height: variables_1.default.contentHeaderDesktopHeight,
            zIndex: variables_1.default.popoverZIndex,
            position: 'relative',
            paddingLeft: 20,
            paddingRight: 12,
        }, headerBarHeight: {
            height: variables_1.default.contentHeaderHeight,
        }, imageViewContainer: {
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        }, imageModalPDF: {
            flex: 1,
            backgroundColor: theme.modalBackground,
        }, getPDFPasswordFormStyle: function (isSmallScreenWidth) {
            return ({
                width: isSmallScreenWidth ? '100%' : 350,
                flexBasis: isSmallScreenWidth ? '100%' : 350,
                flexGrow: 0,
                alignSelf: 'flex-start',
            });
        }, centeredModalStyles: function (isSmallScreenWidth, isFullScreenWhenSmall) {
            return ({
                borderWidth: isSmallScreenWidth && !isFullScreenWhenSmall ? 1 : 0,
                marginHorizontal: isSmallScreenWidth ? 0 : 20,
            });
        }, imageModalImageCenterContainer: {
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            width: '100%',
        }, defaultAttachmentView: {
            backgroundColor: theme.sidebar,
            borderRadius: variables_1.default.componentBorderRadiusNormal,
            borderWidth: 1,
            borderColor: theme.border,
            flexDirection: 'row',
            padding: 20,
            alignItems: 'center',
        }, notFoundTextHeader: __assign(__assign({}, headlineFont), { color: theme.heading, fontSize: variables_1.default.fontSizeXLarge, lineHeight: variables_1.default.lineHeightXXLarge, marginTop: 20, marginBottom: 8, textAlign: 'center' }), blockingViewContainer: {
            paddingBottom: variables_1.default.contentHeaderHeight,
            maxWidth: 400,
            alignSelf: 'center',
        }, blockingErrorViewContainer: {
            paddingBottom: variables_1.default.contentHeaderHeight,
            maxWidth: 475,
            alignSelf: 'center',
        }, forcedBlockingViewContainer: __assign(__assign({}, positioning_1.default.pFixed), { top: 0, left: 0, right: 0, bottom: 0, backgroundColor: theme.appBG }), defaultModalContainer: {
            backgroundColor: theme.componentBG,
            borderColor: theme.transparent,
        }, modalContainer: { height: '100%' }, modalAnimatedContainer: { width: '100%' }, modalContainerBox: {
            zIndex: 2,
            opacity: 1,
            backgroundColor: 'transparent',
        }, modalBackdrop: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'black',
        }, reportActionContextMenuMiniButton: __assign(__assign(__assign({ height: 28, width: 28 }, flex_1.default.alignItemsCenter), flex_1.default.justifyContentCenter), { borderRadius: variables_1.default.buttonBorderRadius }), reportActionSystemMessageContainer: {
            marginLeft: 42,
        }, reportDetailsTitleContainer: __assign(__assign(__assign(__assign({}, display_1.default.dFlex), flex_1.default.flexColumn), flex_1.default.alignItemsCenter), { paddingHorizontal: 20 }), reportDetailsRoomInfo: __assign(__assign(__assign(__assign({}, flex_1.default.flex1), display_1.default.dFlex), flex_1.default.flexColumn), flex_1.default.alignItemsCenter), reportSettingsVisibilityText: {
            textTransform: 'capitalize',
        }, settingsPageBackground: {
            flexDirection: 'column',
            width: '100%',
            flexGrow: 1,
        }, settingsPageBody: {
            width: '100%',
            justifyContent: 'space-around',
        }, twoFactorAuthSection: {
            backgroundColor: theme.appBG,
            padding: 0,
        }, twoFactorAuthCodesBox: function (_a) {
            var isExtraSmallScreenWidth = _a.isExtraSmallScreenWidth, isSmallScreenWidth = _a.isSmallScreenWidth;
            var paddingHorizontal = spacing_1.default.ph9;
            if (isSmallScreenWidth) {
                paddingHorizontal = spacing_1.default.ph4;
            }
            if (isExtraSmallScreenWidth) {
                paddingHorizontal = spacing_1.default.ph2;
            }
            return __assign({ alignItems: 'center', justifyContent: 'center', backgroundColor: theme.highlightBG, paddingVertical: 28, borderRadius: 16, marginTop: 32 }, paddingHorizontal);
        }, twoFactorLoadingContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            height: 210,
        }, twoFactorAuthCodesContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
        }, twoFactorAuthCode: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.MONOSPACE), { width: 112, textAlign: 'center' }), twoFactorAuthCodesButtonsContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 12,
            marginTop: 20,
            flexWrap: 'wrap',
        }, twoFactorAuthCodesButton: {
            minWidth: 112,
        }, twoFactorAuthCopyCodeButton: {
            minWidth: 110,
        }, anonymousRoomFooter: function (isSmallSizeLayout) {
            return (__assign(__assign({ flexDirection: isSmallSizeLayout ? 'column' : 'row' }, (!isSmallSizeLayout && {
                alignItems: 'center',
                justifyContent: 'space-between',
            })), { padding: 20, backgroundColor: theme.cardBG, borderRadius: variables_1.default.componentBorderRadiusLarge, overflow: 'hidden' }));
        }, anonymousRoomFooterWordmarkAndLogoContainer: function (isSmallSizeLayout) {
            return (__assign({ flexDirection: 'row', alignItems: 'center' }, (isSmallSizeLayout && {
                justifyContent: 'space-between',
                marginTop: 16,
            })));
        }, anonymousRoomFooterLogo: {
            width: 88,
            marginLeft: 0,
            height: 20,
        }, anonymousRoomFooterLogoTaglineText: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeMedium, color: theme.text }), signInButtonAvatar: {
            width: 80,
        }, anonymousRoomFooterSignInButton: {
            width: 110,
        }, workspaceUpgradeIntroBox: function (_a) {
            var isExtraSmallScreenWidth = _a.isExtraSmallScreenWidth;
            var paddingHorizontal = spacing_1.default.ph5;
            var paddingVertical = spacing_1.default.pv5;
            if (isExtraSmallScreenWidth) {
                paddingHorizontal = spacing_1.default.ph2;
                paddingVertical = spacing_1.default.pv2;
            }
            return __assign(__assign({ backgroundColor: theme.highlightBG, borderRadius: 16 }, paddingVertical), paddingHorizontal);
        }, roomHeaderAvatarSize: {
            height: variables_1.default.componentSizeLarge,
            width: variables_1.default.componentSizeLarge,
        }, roomHeaderAvatar: {
            backgroundColor: theme.appBG,
            borderRadius: 100,
            borderColor: theme.componentBG,
            borderWidth: 4,
        }, roomHeaderAvatarOverlay: {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: theme.overlay,
            opacity: variables_1.default.overlayOpacity,
            borderRadius: 88,
        }, rootNavigatorContainerStyles: function (isSmallScreenWidth) {
            return ({ marginLeft: isSmallScreenWidth ? 0 : variables_1.default.sideBarWithLHBWidth + variables_1.default.navigationTabBarSize, flex: 1 });
        }, RHPNavigatorContainerNavigatorContainerStyles: function (isSmallScreenWidth) { return ({ marginLeft: isSmallScreenWidth ? 0 : variables_1.default.sideBarWidth, flex: 1 }); }, avatarInnerTextChat: __assign(__assign({ color: theme.text, fontSize: variables_1.default.fontSizeXLarge }, FontUtils_1.default.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM), { textAlign: 'center', position: 'absolute', width: 88, left: -16 }), pageWrapper: {
            width: '100%',
            alignItems: 'center',
            padding: 20,
        }, numberPadWrapper: {
            width: '100%',
            alignItems: 'center',
            paddingHorizontal: 20,
        }, avatarSectionWrapper: {
            width: '100%',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingBottom: 20,
        }, avatarSectionWrapperSkeleton: {
            width: '100%',
        }, avatarSectionWrapperSettings: {
            width: '100%',
            alignItems: 'center',
        }, accountSettingsSectionContainer: __assign(__assign(__assign({ borderBottomWidth: 1, borderBottomColor: theme.border }, spacing_1.default.mt0), spacing_1.default.mb0), spacing_1.default.pt0), centralPaneAnimation: {
            height: CONST_1.default.CENTRAL_PANE_ANIMATION_HEIGHT,
        }, sectionTitle: __assign(__assign(__assign(__assign(__assign({}, spacing_1.default.pv2), spacing_1.default.ph2), { fontSize: 13 }), FontUtils_1.default.fontFamily.platform.EXP_NEUE), { lineHeight: 16, color: theme.textSupporting }), accountSettingsSectionTitle: __assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), borderedContentCard: {
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: variables_1.default.componentBorderRadiusNormal,
        }, borderedContentCardLarge: {
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: variables_1.default.componentBorderRadiusLarge,
        }, sectionMenuItem: {
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            height: 52,
            alignItems: 'center',
        }, sectionSelectCircle: {
            backgroundColor: theme.cardBG,
        }, qrShareSection: {
            width: 264,
        }, sectionMenuItemTopDescription: __assign(__assign(__assign({}, spacing_1.default.ph8), spacing_1.default.mhn8), { width: 'auto' }), sectionMenuItemIcon: __assign(__assign(__assign({}, spacing_1.default.ph8), spacing_1.default.mhn5), { width: 'auto' }), subscriptionCardIcon: {
            padding: 10,
            backgroundColor: theme.border,
            borderRadius: variables_1.default.componentBorderRadius,
            height: variables_1.default.iconSizeExtraLarge,
            width: variables_1.default.iconSizeExtraLarge,
        }, subscriptionAddedCardIcon: {
            padding: 10,
            backgroundColor: theme.buttonDefaultBG,
            borderRadius: variables_1.default.componentBorderRadius,
            height: variables_1.default.iconSizeExtraLarge,
            width: variables_1.default.iconSizeExtraLarge,
        }, trialBannerBackgroundColor: {
            backgroundColor: theme.trialBannerBackgroundColor,
        }, selectCircle: {
            width: variables_1.default.componentSizeSmall,
            height: variables_1.default.componentSizeSmall,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: variables_1.default.componentSizeSmall / 2,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.componentBG,
            marginLeft: 8,
        }, optionSelectCircle: {
            borderRadius: variables_1.default.componentSizeSmall / 2 + 1,
            padding: 1,
        }, unreadIndicatorContainer: __assign({ position: 'absolute', top: -10, left: 0, width: '100%', height: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', zIndex: 1 }, cursor_1.default.cursorDefault), topUnreadIndicatorContainer: __assign({ position: 'relative', width: '100%', 
            /** 17 = height of the indicator 1px + 8px top and bottom */
            height: 17, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', zIndex: 1 }, cursor_1.default.cursorDefault), unreadIndicatorLine: {
            height: 1,
            backgroundColor: theme.unreadIndicator,
            flexGrow: 1,
            marginRight: 8,
            opacity: 0.5,
        }, threadDividerLine: {
            height: 1,
            backgroundColor: theme.border,
            flexGrow: 1,
            marginLeft: 8,
            marginRight: 20,
        }, dividerLine: __assign(__assign({ height: 1, maxHeight: 1, backgroundColor: theme.border, flexGrow: 1 }, spacing_1.default.mh5), spacing_1.default.mv3), sectionDividerLine: {
            height: 1,
            backgroundColor: theme.border,
        }, unreadIndicatorText: __assign(__assign({ color: theme.unreadIndicator }, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), { fontSize: variables_1.default.fontSizeSmall, textTransform: 'capitalize' }), threadDividerText: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeSmall, textTransform: 'capitalize' }), flipUpsideDown: {
            transform: "rotate(180deg)",
        }, mirror: {
            transform: "scaleX(-1)",
        }, navigationScreenCardStyle: {
            backgroundColor: theme.appBG,
            height: '100%',
        }, invisible: {
            position: 'absolute',
            opacity: 0,
        }, invisiblePopover: {
            position: 'absolute',
            opacity: 0,
            left: -9999,
            top: -9999,
        }, containerWithSpaceBetween: {
            justifyContent: 'space-between',
            width: '100%',
            flex: 1,
        }, detailsPageSectionContainer: {
            alignSelf: 'flex-start',
        }, attachmentCarouselContainer: __assign({ height: '100%', width: '100%', display: 'flex', justifyContent: 'center' }, cursor_1.default.cursorUnset), attachmentArrow: {
            zIndex: 23,
            position: 'absolute',
        }, attachmentRevealButtonContainer: __assign({ flex: 1, alignItems: 'center', justifyContent: 'center' }, spacing_1.default.ph4), arrowIcon: {
            height: 40,
            width: 40,
            alignItems: 'center',
            paddingHorizontal: 0,
            paddingTop: 0,
            paddingBottom: 0,
        }, switchTrack: {
            width: 50,
            height: 28,
            justifyContent: 'center',
            borderRadius: 20,
            padding: 15,
        }, switchInactive: {
            backgroundColor: theme.icon,
        }, switchThumb: {
            width: 22,
            height: 22,
            borderRadius: 11,
            position: 'absolute',
            left: 4,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.appBG,
        }, radioButtonContainer: {
            backgroundColor: theme.componentBG,
            borderRadius: 14,
            height: 28,
            width: 28,
            borderColor: theme.border,
            borderWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }, toggleSwitchLockIcon: {
            width: variables_1.default.iconSizeExtraSmall,
            height: variables_1.default.iconSizeExtraSmall,
        }, checkedContainer: {
            backgroundColor: theme.checkBox,
        }, magicCodeInputContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            height: variables_1.default.inputHeight,
        }, magicCodeInput: {
            fontSize: variables_1.default.fontSizeXLarge,
            color: theme.heading,
            lineHeight: variables_1.default.inputHeight,
        }, 
        // Manually style transparent, in iOS Safari, an input in a container with its opacity set to
        // 0 (completely transparent) cannot handle user interaction, hence the Paste option is never shown
        inputTransparent: __assign({ color: 'transparent' }, ((0, Browser_1.getBrowser)()
            ? {
                caretColor: 'transparent',
                WebkitTextFillColor: 'transparent',
                // After setting the input text color to transparent, it acquires the background-color.
                // However, it is not possible to override the background-color directly as explained in this resource: https://developer.mozilla.org/en-US/docs/Web/CSS/:autofill
                // Therefore, the transition effect needs to be delayed.
                transitionDelay: '99999s',
                transitionProperty: 'background-color',
            }
            : {})), iouAmountText: __assign(__assign({}, headlineFont), { fontSize: variables_1.default.iouAmountTextSize, color: theme.heading, lineHeight: variables_1.default.inputHeight }), iouAmountTextInput: (0, addOutlineWidth_1.default)(theme, __assign(__assign({}, headlineFont), { fontSize: variables_1.default.iouAmountTextSize, color: theme.heading, lineHeight: undefined, paddingHorizontal: 0, paddingVertical: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }), 0), iouAmountTextInputContainer: {
            borderWidth: 0,
            borderBottomWidth: 0,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
        }, moneyRequestConfirmationAmount: __assign(__assign({}, headlineFont), { fontSize: variables_1.default.fontSizeH1 }), moneyRequestMenuItem: {
            flexDirection: 'row',
            borderRadius: 0,
            justifyContent: 'space-between',
            width: '100%',
            paddingHorizontal: 20,
            paddingVertical: 12,
        }, moneyRequestAmountContainer: { minHeight: variables_1.default.inputHeight + 2 * (variables_1.default.formErrorLineHeight + 8) }, requestPreviewBox: {
            marginTop: 12,
            maxWidth: variables_1.default.reportPreviewMaxWidth,
        }, moneyRequestPreviewBox: {
            backgroundColor: theme.cardBG,
            borderRadius: variables_1.default.componentBorderRadiusLarge,
            maxWidth: variables_1.default.reportPreviewMaxWidth,
            width: '100%',
        }, moneyRequestPreviewBoxText: {
            padding: 16,
        }, amountSplitPadding: {
            paddingTop: 2,
        }, moneyRequestPreviewBoxLoading: {
            // When a new IOU request arrives it is very briefly in a loading state, so set the minimum height of the container to 94 to match the rendered height after loading.
            // Otherwise, the IOU request pay button will not be fully visible and the user will have to scroll up to reveal the entire IOU request container.
            // See https://github.com/Expensify/App/issues/10283.
            minHeight: 94,
            width: '100%',
        }, moneyRequestPreviewBoxAvatar: {
            // This should "hide" the right border of the last avatar
            marginRight: -2,
            marginBottom: 0,
        }, moneyRequestPreviewAmount: __assign(__assign(__assign({}, headlineFont), whiteSpace_1.default.preWrap), { color: theme.heading }), moneyRequestLoadingHeight: {
            height: 27,
        }, defaultCheckmarkWrapper: {
            marginLeft: 8,
            alignSelf: 'center',
        }, codeWordStyle: {
            borderLeftWidth: 0,
            borderRightWidth: 0,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            paddingLeft: 0,
            paddingRight: 0,
            justifyContent: 'center',
        }, codeFirstWordStyle: {
            borderLeftWidth: 1,
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
            paddingLeft: 5,
        }, codeLastWordStyle: {
            borderRightWidth: 1,
            borderTopRightRadius: 4,
            borderBottomRightRadius: 4,
            paddingRight: 5,
        }, fullScreenLoading: {
            backgroundColor: theme.componentBG,
            opacity: 0.8,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
        }, reimbursementAccountFullScreenLoading: {
            backgroundColor: theme.componentBG,
            opacity: 0.8,
            justifyContent: 'flex-start',
            alignItems: 'center',
            zIndex: 10,
        }, hiddenElementOutsideOfWindow: {
            position: 'absolute',
            top: -10000,
            left: 0,
            opacity: 0,
        }, growlNotificationWrapper: {
            zIndex: 2,
        }, growlNotificationContainer: __assign(__assign({ flex: 1, justifyContent: 'flex-start', position: 'absolute', width: '100%', top: 20 }, spacing_1.default.pl5), spacing_1.default.pr5), growlNotificationDesktopContainer: __assign({ maxWidth: variables_1.default.sideBarWidth, right: 0 }, positioning_1.default.pFixed), growlNotificationTranslateY: function (translateY) {
            'worklet';
            return {
                transform: [{ translateY: translateY.get() }],
            };
        }, growlNotificationBox: __assign({ backgroundColor: theme.inverse, borderRadius: variables_1.default.componentBorderRadiusNormal, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', boxShadow: "".concat(theme.shadow) }, spacing_1.default.p5), growlNotificationText: __assign(__assign(__assign({ fontSize: variables_1.default.fontSizeNormal }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { width: '90%', lineHeight: variables_1.default.fontSizeNormalHeight, color: theme.textReversed }), spacing_1.default.ml4), noSelect: {
            boxShadow: 'none',
            // After https://github.com/facebook/react-native/pull/46284 RN accepts only 3 options and undefined
            outlineStyle: undefined,
        }, boxShadowNone: {
            boxShadow: 'none',
        }, cardStyleNavigator: {
            overflow: 'hidden',
            height: '100%',
        }, smallEditIcon: {
            alignItems: 'center',
            backgroundColor: theme.buttonDefaultBG,
            borderRadius: 20,
            borderWidth: 3,
            color: theme.textReversed,
            height: 40,
            width: 40,
            justifyContent: 'center',
        }, smallEditIconWorkspace: {
            borderColor: theme.cardBG,
        }, smallEditIconAccount: {
            borderColor: theme.appBG,
        }, smallAvatarEditIcon: {
            position: 'absolute',
            right: -8,
            bottom: -8,
        }, primaryMediumIcon: {
            alignItems: 'center',
            backgroundColor: theme.buttonDefaultBG,
            borderRadius: 20,
            color: theme.textReversed,
            height: 40,
            width: 40,
            justifyContent: 'center',
        }, primaryMediumText: {
            fontSize: variables_1.default.iconSizeNormal,
        }, workspaceOwnerAvatarWrapper: {
            margin: 6,
        }, workspaceOwnerSectionTitle: {
            marginLeft: 6,
        }, workspaceOwnerSectionMinWidth: {
            minWidth: 180,
        }, workspaceTypeWrapper: {
            margin: 3,
        }, workspaceTypeSectionTitle: {
            marginLeft: 3,
        }, workspaceRightColumn: {
            marginLeft: 124,
        }, workspaceThreeDotMenu: {
            justifyContent: 'flex-end',
            width: 124,
        }, workspaceListRBR: {
            flexDirection: 'column',
            justifyContent: 'flex-start',
            marginTop: 10,
        }, peopleRow: __assign({ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, spacing_1.default.ph5), peopleRowBorderBottom: __assign({ borderColor: theme.border, borderBottomWidth: 1 }, spacing_1.default.pb2), offlineFeedback: {
            deleted: {
                textDecorationLine: 'line-through',
                textDecorationStyle: 'solid',
            },
            pending: {
                opacity: 0.5,
            },
            default: {
                // fixes a crash on iOS when we attempt to remove already unmounted children
                // see https://github.com/Expensify/App/issues/48197 for more details
                // it's a temporary solution while we are working on a permanent fix
                opacity: react_native_1.Platform.OS === 'ios' ? 0.99 : undefined,
            },
            error: {
                flexDirection: 'row',
                alignItems: 'center',
            },
            container: __assign({}, spacing_1.default.pv2),
            textContainer: {
                flexDirection: 'column',
                flex: 1,
            },
            text: {
                color: theme.textSupporting,
                verticalAlign: 'middle',
                fontSize: variables_1.default.fontSizeLabel,
            },
            errorDot: {
                marginRight: 12,
            },
        }, dotIndicatorMessage: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        }, emptyLHNWrapper: {
            marginBottom: variables_1.default.bottomTabHeight,
        }, emptyLHNAnimation: {
            width: 180,
            height: 180,
        }, locationErrorLinkText: {
            textAlignVertical: 'center',
            fontSize: variables_1.default.fontSizeLabel,
        }, sidebarPopover: {
            width: variables_1.default.sideBarWidth - 68,
        }, sidebarWithLHBPopover: {
            width: variables_1.default.sideBarWidth - 68,
        }, shortTermsBorder: {
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: variables_1.default.componentBorderRadius,
        }, shortTermsHorizontalRule: __assign({ borderBottomWidth: 1, borderColor: theme.border }, spacing_1.default.mh3), shortTermsLargeHorizontalRule: __assign({ borderWidth: 1, borderColor: theme.border }, spacing_1.default.mh3), shortTermsRow: {
            flexDirection: 'row',
            padding: 12,
        }, termsCenterRight: {
            marginTop: 'auto',
            marginBottom: 'auto',
        }, shortTermsBoldHeadingSection: {
            paddingRight: 12,
            paddingLeft: 12,
            marginTop: 12,
        }, shortTermsHeadline: __assign(__assign(__assign({}, headlineFont), whiteSpace_1.default.preWrap), { color: theme.heading, fontSize: variables_1.default.fontSizeXLarge, lineHeight: variables_1.default.lineHeightXXLarge }), longTermsRow: {
            flexDirection: 'row',
            marginTop: 20,
        }, collapsibleSectionBorder: {
            borderBottomWidth: 2,
            borderBottomColor: theme.border,
        }, communicationsLinkHeight: {
            height: variables_1.default.communicationsLinkHeight,
        }, floatingMessageCounterWrapper: __assign({ position: 'absolute', left: '50%', top: 0, zIndex: 100 }, visibility_1.default.hidden), floatingMessageCounter: __assign({ left: '-50%' }, visibility_1.default.visible), confirmationAnimation: {
            height: 180,
            width: 180,
            marginBottom: 20,
        }, googleSearchTextInputContainer: {
            flexDirection: 'column',
        }, googleSearchSeparator: {
            height: 1,
            backgroundColor: theme.border,
        }, googleSearchText: __assign(__assign({ color: theme.text, fontSize: variables_1.default.fontSizeNormal, lineHeight: variables_1.default.fontSizeNormalHeight }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { flex: 1 }), searchRouterTextInputContainer: {
            borderRadius: variables_1.default.componentBorderRadiusSmall,
            borderWidth: 1,
            borderBottomWidth: 1,
            paddingHorizontal: 8,
        }, searchAutocompleteInputResults: {
            borderWidth: 1,
            borderColor: theme.border,
        }, searchAutocompleteInputResultsFocused: {
            borderWidth: 1,
            borderColor: theme.success,
        }, searchTableHeaderActive: {
            fontWeight: FontUtils_1.default.fontWeight.bold,
        }, zIndex10: {
            zIndex: 10,
        }, searchListContentContainerStyles: {
            paddingTop: variables_1.default.searchListContentMarginTop,
        }, searchListHeaderContainerStyle: __assign(__assign({ width: '100%', flexDirection: 'row', alignItems: 'center' }, userSelect_1.default.userSelectNone), { paddingBottom: 12, backgroundColor: theme.appBG, justifyContent: 'flex-start' }), narrowSearchRouterInactiveStyle: {
            left: 0,
            right: 0,
            position: 'absolute',
            zIndex: variables_1.default.searchTopBarZIndex,
            backgroundColor: theme.appBG,
        }, threeDotsPopoverOffset: function (windowWidth) {
            return (__assign(__assign({}, (0, getPopOverVerticalOffset_1.default)(60)), { horizontal: windowWidth - 60 }));
        }, threeDotsPopoverOffsetNoCloseButton: function (windowWidth) {
            return (__assign(__assign({}, (0, getPopOverVerticalOffset_1.default)(60)), { horizontal: windowWidth - 10 }));
        }, threeDotsPopoverOffsetAttachmentModal: function (windowWidth) {
            return (__assign(__assign({}, (0, getPopOverVerticalOffset_1.default)(80)), { horizontal: windowWidth - 140 }));
        }, popoverMenuOffset: function (windowWidth) {
            return (__assign(__assign({}, (0, getPopOverVerticalOffset_1.default)(180)), { horizontal: windowWidth - 355 }));
        }, popoverButtonDropdownMenuOffset: function (windowWidth) {
            return (__assign(__assign({}, (0, getPopOverVerticalOffset_1.default)(70)), { horizontal: windowWidth - 20 }));
        }, iPhoneXSafeArea: {
            backgroundColor: theme.appBG,
            flex: 1,
        }, transferBalancePayment: {
            borderWidth: 1,
            borderRadius: variables_1.default.componentBorderRadiusNormal,
            borderColor: theme.border,
        }, transferBalanceSelectedPayment: {
            borderColor: theme.iconSuccessFill,
        }, transferBalanceBalance: {
            fontSize: 48,
        }, imageCropContainer: __assign({ overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.imageCropBackgroundColor }, cursor_1.default.cursorMove), sliderKnobTooltipView: {
            height: variables_1.default.sliderKnobSize,
            width: variables_1.default.sliderKnobSize,
            borderRadius: variables_1.default.sliderKnobSize / 2,
        }, sliderKnob: __assign({ backgroundColor: theme.success, position: 'absolute', height: variables_1.default.sliderKnobSize, width: variables_1.default.sliderKnobSize, borderRadius: variables_1.default.sliderKnobSize / 2, left: -(variables_1.default.sliderKnobSize / 2) }, cursor_1.default.cursorPointer), sliderBar: {
            backgroundColor: theme.border,
            height: variables_1.default.sliderBarHeight,
            borderRadius: variables_1.default.sliderBarHeight / 2,
            alignSelf: 'stretch',
            justifyContent: 'center',
        }, screenCenteredContainer: {
            flex: 1,
            justifyContent: 'center',
            marginBottom: 40,
            padding: 16,
        }, inlineSystemMessage: __assign(__assign({ color: theme.textSupporting, fontSize: variables_1.default.fontSizeLabel }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { marginLeft: 6 }), fullScreen: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        }, invisibleOverlay: {
            backgroundColor: theme.transparent,
            zIndex: 1000,
        }, invisibleImage: {
            opacity: 0,
            width: 200,
            height: 200,
        }, dropWrapper: {
            zIndex: 2,
        }, dropInnerWrapper: {
            borderWidth: 2,
            borderStyle: 'dashed',
        }, reportDropOverlay: {
            backgroundColor: theme.dropUIBG,
            zIndex: 2,
        }, fileDropOverlay: {
            backgroundColor: theme.fileDropUIBG,
        }, attachmentDropOverlay: function (isActive) { return ({
            backgroundColor: isActive ? theme.attachmentDropUIBGActive : theme.attachmentDropUIBG,
            transition: 'background-color 0.2s ease-in',
        }); }, attachmentDropText: {
            color: theme.textAttachmentDropZone,
        }, attachmentDropInnerWrapper: function (isActive) { return ({
            borderColor: isActive ? theme.attachmentDropBorderColorActive : theme.attachmentDropBorderColor,
            transition: '0.2s ease-in',
        }); }, receiptDropOverlay: function (isActive) { return ({
            backgroundColor: isActive ? theme.receiptDropUIBGActive : theme.receiptDropUIBG,
            transition: 'background-color 0.2s ease-in',
        }); }, receiptDropText: {
            color: theme.textReceiptDropZone,
        }, receiptDropInnerWrapper: function (isActive) { return ({
            borderColor: isActive ? theme.receiptDropBorderColorActive : theme.receiptDropBorderColor,
            transition: '0.2s ease-in',
        }); }, flashButtonContainer: {
            position: 'absolute',
            top: 20,
            right: 20,
        }, bgGreenSuccess: {
            backgroundColor: colors_1.default.green400,
        }, webButtonShadow: {
            boxShadow: "0px 0px 24px 16px ".concat(theme.appBG),
        }, buttonShadow: {
            boxShadow: [
                {
                    offsetX: 0,
                    offsetY: 0,
                    blurRadius: '24px',
                    spreadDistance: '16px',
                    color: theme.appBG,
                },
            ],
        }, buttonShadowContainer: {
            height: 52,
            width: 52,
            borderTopLeftRadius: 26,
            borderBottomLeftRadius: 26,
        }, receiptsSubmitButton: {
            position: 'absolute',
            right: 16,
            top: 8,
            backgroundColor: theme.appBG,
        }, receiptPlaceholder: {
            height: 52,
            marginRight: 8,
            width: variables_1.default.w44,
            borderRadius: variables_1.default.componentBorderRadiusSmall,
            backgroundColor: theme.hoverComponentBG,
        }, isDraggingOver: {
            backgroundColor: theme.fileDropUIBG,
        }, fileUploadImageWrapper: function (fileTopPosition) {
            return ({
                position: 'absolute',
                top: fileTopPosition,
            });
        }, cardSectionContainer: {
            backgroundColor: theme.cardBG,
            borderRadius: variables_1.default.componentBorderRadiusLarge,
            width: 'auto',
            textAlign: 'left',
            overflow: 'hidden',
            marginBottom: 20,
            marginHorizontal: variables_1.default.sectionMargin,
        }, cardSectionIllustration: {
            width: 'auto',
            height: variables_1.default.sectionIllustrationHeight,
        }, twoFAIllustration: {
            width: 'auto',
            height: 140,
        }, cardSectionTitle: {
            fontSize: variables_1.default.fontSizeLarge,
            lineHeight: variables_1.default.lineHeightXLarge,
        }, emptyCardSectionTitle: {
            fontSize: variables_1.default.fontSizeXLarge,
            lineHeight: variables_1.default.lineHeightXXLarge,
            textAlign: 'center',
        }, emptyCardSectionSubtitle: {
            fontSize: variables_1.default.fontSizeNormal,
            lineHeight: variables_1.default.lineHeightXLarge,
            color: theme.textSupporting,
            textAlign: 'center',
        }, transferBalance: {
            width: 'auto',
            borderRadius: 0,
            height: 64,
            alignItems: 'center',
        }, paymentMethod: {
            paddingHorizontal: 20,
            minHeight: variables_1.default.optionRowHeight,
        }, chatFooterBanner: __assign({ borderRadius: variables_1.default.componentBorderRadius }, wordBreak_1.default.breakWord), deeplinkWrapperContainer: {
            padding: 20,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.appBG,
        }, deeplinkWrapperMessage: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        }, deeplinkWrapperFooter: {
            paddingTop: 80,
            paddingBottom: 45,
        }, emojiReactionBubble: {
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            alignSelf: 'flex-start',
        }, emojiReactionListHeader: {
            marginTop: 8,
            paddingBottom: 20,
            borderBottomColor: theme.border,
            borderBottomWidth: 1,
            marginHorizontal: 20,
        }, emojiReactionListHeaderBubble: {
            paddingVertical: 2,
            paddingHorizontal: 8,
            borderRadius: 28,
            backgroundColor: theme.border,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            alignSelf: 'flex-start',
            marginRight: 4,
        }, reactionListHeaderText: {
            color: theme.textSupporting,
            marginLeft: 8,
            alignSelf: 'center',
        }, miniQuickEmojiReactionText: {
            fontSize: 18,
            lineHeight: 22,
            verticalAlign: 'middle',
        }, emojiReactionBubbleText: {
            verticalAlign: 'middle',
        }, stickyHeaderEmoji: function (isSmallScreenWidth, windowWidth) {
            return (__assign({ position: 'absolute', width: isSmallScreenWidth ? windowWidth - 32 : CONST_1.default.EMOJI_PICKER_SIZE.WIDTH - 32 }, spacing_1.default.mh4));
        }, reactionCounterText: {
            fontSize: 13,
            marginLeft: 4,
            fontWeight: FontUtils_1.default.fontWeight.bold,
        }, fontColorReactionLabel: {
            color: theme.tooltipSupportingText,
        }, reactionEmojiTitle: {
            fontSize: variables_1.default.iconSizeLarge,
            lineHeight: variables_1.default.iconSizeXLarge,
        }, textReactionSenders: __assign({ color: theme.tooltipPrimaryText }, wordBreak_1.default.breakWord), distanceLabelWrapper: {
            backgroundColor: colors_1.default.green500,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            textAlign: 'center',
        }, distanceLabelText: {
            fontSize: 13,
            fontWeight: FontUtils_1.default.fontWeight.bold,
            color: colors_1.default.productLight100,
        }, productTrainingTooltipWrapper: {
            backgroundColor: theme.tooltipHighlightBG,
            borderRadius: variables_1.default.componentBorderRadiusNormal,
        }, productTrainingTooltipText: {
            fontSize: variables_1.default.fontSizeLabel,
            color: theme.textReversed,
            lineHeight: variables_1.default.lineHeightLarge,
            flexShrink: 1,
        }, quickReactionsContainer: {
            gap: 12,
            flexDirection: 'row',
            paddingHorizontal: 25,
            paddingVertical: 12,
            justifyContent: 'space-between',
        }, reactionListContainer: __assign({ maxHeight: variables_1.default.listItemHeightNormal * 5.75 }, spacing_1.default.pv2), reactionListContainerFixedWidth: {
            maxWidth: variables_1.default.popoverWidth,
        }, validateCodeDigits: __assign(__assign({ color: theme.text }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeXXLarge, letterSpacing: 4 }), footerWrapper: {
            fontSize: variables_1.default.fontSizeNormal,
            paddingTop: 64,
            maxWidth: 1100, // Match footer across all Expensify platforms
        }, footerColumnsContainer: {
            flex: 1,
            flexWrap: 'wrap',
            marginBottom: 40,
            marginHorizontal: -16,
        }, footerTitle: {
            fontSize: variables_1.default.fontSizeLarge,
            color: theme.success,
            marginBottom: 16,
        }, footerRow: {
            paddingVertical: 4,
            marginBottom: 8,
            color: theme.textLight,
            fontSize: variables_1.default.fontSizeMedium,
        }, footerBottomLogo: {
            marginTop: 40,
            width: '100%',
        }, datePickerRoot: {
            position: 'relative',
            zIndex: 99,
        }, datePickerPopover: {
            backgroundColor: theme.appBG,
            width: '100%',
            alignSelf: 'center',
            zIndex: 100,
            marginTop: 8,
        }, loginHeroHeader: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM), { color: theme.success, textAlign: 'center' }), newKansasLarge: __assign(__assign({}, headlineFont), { fontSize: variables_1.default.fontSizeXLarge, lineHeight: variables_1.default.lineHeightXXLarge }), eReceiptAmount: __assign(__assign({}, headlineFont), { fontSize: variables_1.default.fontSizeXXXLarge, color: colors_1.default.green400 }), eReceiptAmountLarge: __assign(__assign({}, headlineFont), { fontSize: variables_1.default.fontSizeEReceiptLarge, textAlign: 'center' }), eReceiptCurrency: __assign(__assign({}, headlineFont), { fontSize: variables_1.default.fontSizeXXLarge }), eReceiptMerchant: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeXLarge, lineHeight: variables_1.default.lineHeightXXLarge, color: theme.textColorfulBackground }), eReceiptWaypointTitle: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeSmall, lineHeight: variables_1.default.lineHeightSmall, color: colors_1.default.green400 }), eReceiptWaypointAddress: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.MONOSPACE), { fontSize: variables_1.default.fontSizeSmall, lineHeight: variables_1.default.lineHeightSmall, color: theme.textColorfulBackground }), eReceiptGuaranteed: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.MONOSPACE), { fontSize: variables_1.default.fontSizeSmall, lineHeight: variables_1.default.lineHeightSmall, color: theme.textColorfulBackground }), eReceiptBackground: __assign(__assign({}, sizing_1.default.w100), { borderRadius: 20, position: 'absolute', top: 0, left: 0, height: 540 }), eReceiptPanel: __assign(__assign(__assign(__assign({}, spacing_1.default.p5), spacing_1.default.pb8), spacing_1.default.m5), { backgroundColor: colors_1.default.green800, borderRadius: 20, width: 335, overflow: 'hidden' }), eReceiptBackgroundThumbnail: __assign(__assign({}, sizing_1.default.w100), { position: 'absolute', aspectRatio: 335 / 540, top: 0 }), eReceiptContainer: {
            width: variables_1.default.eReceiptBGHWidth,
            minHeight: variables_1.default.eReceiptBGHeight,
            overflow: 'hidden',
        }, eReceiptContentContainer: __assign(__assign(__assign({}, sizing_1.default.w100), spacing_1.default.p5), { minWidth: variables_1.default.eReceiptBodyWidth, minHeight: variables_1.default.eReceiptBodyHeight }), eReceiptContentWrapper: __assign(__assign(__assign(__assign(__assign(__assign({}, sizing_1.default.w100), spacing_1.default.ph5), spacing_1.default.pt10), spacing_1.default.pb4), sizing_1.default.h100), { position: 'absolute', left: 0 }), loginHeroBody: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeSignInHeroBody, color: theme.textLight, textAlign: 'center' }), linkPreviewWrapper: {
            marginTop: 16,
            borderLeftWidth: 4,
            borderLeftColor: theme.border,
            paddingLeft: 12,
        }, linkPreviewImage: {
            flex: 1,
            borderRadius: 8,
            marginTop: 8,
        }, linkPreviewLogoImage: {
            height: 16,
            width: 16,
        }, contextMenuItemPopoverMaxWidth: {
            minWidth: 320,
            maxWidth: 375,
        }, formSpaceVertical: {
            height: 20,
            width: 1,
        }, taskTitleMenuItem: __assign(__assign(__assign(__assign(__assign({}, writingDirection_1.default.ltr), headlineFont), { fontSize: variables_1.default.fontSizeXLarge, lineHeight: variables_1.default.lineHeighTaskTitle, maxWidth: '100%' }), wordBreak_1.default.breakWord), { textUnderlineOffset: -1 }), taskTitleMenuItemItalic: __assign(__assign(__assign(__assign(__assign({}, writingDirection_1.default.ltr), headlineItalicFont), { fontSize: variables_1.default.fontSizeXLarge, lineHeight: variables_1.default.lineHeighTaskTitle, maxWidth: '100%' }), wordBreak_1.default.breakWord), { textUnderlineOffset: -1 }), taskDescriptionMenuItem: __assign({ maxWidth: '100%' }, wordBreak_1.default.breakWord), taskTitleDescription: __assign(__assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeLabel, color: theme.textSupporting, lineHeight: variables_1.default.lineHeightNormal }), spacing_1.default.mb1), taskMenuItemCheckbox: __assign({ height: 27 }, spacing_1.default.mr3), reportHorizontalRule: __assign({ borderColor: theme.border }, spacing_1.default.mh5), assigneeTextStyle: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), { minHeight: variables_1.default.avatarSizeSubscript }), taskRightIconContainer: __assign(__assign(__assign(__assign({ width: variables_1.default.componentSizeNormal, marginLeft: 'auto' }, spacing_1.default.mt1), pointerEventsAuto_1.default), display_1.default.dFlex), flex_1.default.alignItemsCenter), shareCodeContainer: {
            width: '100%',
            alignItems: 'center',
            paddingHorizontal: variables_1.default.qrShareHorizontalPadding,
            paddingVertical: 20,
            borderRadius: 20,
            overflow: 'hidden',
            borderColor: theme.borderFocus,
            borderWidth: 2,
        }, shareCodeContainerDownloadPadding: {
            paddingHorizontal: 12,
            paddingVertical: 12,
        }, qrCodeAppDownloadLinksStyles: {
            width: 200,
            height: 200,
            margin: 'auto',
        }, splashScreenHider: {
            backgroundColor: theme.splashBG,
            alignItems: 'center',
            justifyContent: 'center',
        }, headerEnvBadge: {
            position: 'absolute',
            bottom: -8,
            left: -8,
            height: 12,
            width: 22,
            paddingLeft: 4,
            paddingRight: 4,
            alignItems: 'center',
            zIndex: -1,
        }, headerEnvBadgeText: {
            fontSize: 7,
            fontWeight: FontUtils_1.default.fontWeight.bold,
            lineHeight: undefined,
            color: theme.textLight,
        }, expensifyQrLogo: {
            alignSelf: 'stretch',
            height: 27,
            marginBottom: 20,
        }, qrShareTitle: {
            marginTop: 15,
            textAlign: 'center',
        }, loginButtonRow: __assign(__assign({ width: '100%', gap: 12 }, flex_1.default.flexRow), flex_1.default.justifyContentCenter), loginButtonRowSmallScreen: __assign(__assign(__assign({ width: '100%', gap: 12 }, flex_1.default.flexRow), flex_1.default.justifyContentCenter), { marginBottom: 10 }), desktopSignInButtonContainer: {
            width: 40,
            height: 40,
        }, signInIconButton: {
            paddingVertical: 2,
        }, googleButtonContainer: {
            colorScheme: 'light',
            width: 40,
            height: 40,
            alignItems: 'center',
            overflow: 'hidden',
        }, googlePillButtonContainer: {
            colorScheme: 'light',
            height: 40,
            width: 300,
            overflow: 'hidden',
        }, thirdPartyLoadingContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            height: 450,
        }, tabSelectorButton: {
            height: variables_1.default.tabSelectorButtonHeight,
            padding: variables_1.default.tabSelectorButtonPadding,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: variables_1.default.buttonBorderRadius,
        }, tabSelector: {
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingBottom: 12,
        }, tabText: function (isSelected) {
            return (__assign(__assign({ marginLeft: 8 }, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), { color: isSelected ? theme.text : theme.textSupporting, lineHeight: variables_1.default.lineHeightLarge, fontSize: variables_1.default.fontSizeLabel }));
        }, tabBackground: function (hovered, isFocused, background) { return ({
            backgroundColor: hovered && !isFocused ? theme.highlightBG : background,
        }); }, tabOpacity: function (hovered, isFocused, activeOpacityValue, inactiveOpacityValue) { return ({
            opacity: hovered && !isFocused ? inactiveOpacityValue : activeOpacityValue,
        }); }, overscrollSpacer: function (backgroundColor, height) {
            return ({
                backgroundColor: backgroundColor,
                height: height,
                width: '100%',
                position: 'absolute',
                top: -height,
                left: 0,
                right: 0,
            });
        }, dualColorOverscrollSpacer: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
        }, purposeMenuItem: {
            backgroundColor: theme.cardBG,
            borderRadius: 8,
            paddingHorizontal: 8,
            alignItems: 'center',
            marginBottom: 8,
        }, willChangeTransform: {
            willChange: 'transform',
        }, dropDownButtonCartIconContainerPadding: {
            paddingRight: 0,
            paddingLeft: 0,
        }, dropDownMediumButtonArrowContain: {
            marginLeft: 12,
            marginRight: 16,
        }, dropDownLargeButtonArrowContain: {
            marginLeft: 16,
            marginRight: 20,
        }, dropDownButtonCartIconView: __assign(__assign({ borderTopRightRadius: variables_1.default.buttonBorderRadius, borderBottomRightRadius: variables_1.default.buttonBorderRadius }, flex_1.default.flexRow), flex_1.default.alignItemsCenter), emojiPickerButtonDropdown: __assign({ justifyContent: 'center', backgroundColor: theme.activeComponentBG, width: 86, height: 52, borderRadius: 26, alignItems: 'center', paddingLeft: 10, paddingRight: 4, alignSelf: 'flex-start' }, userSelect_1.default.userSelectNone), emojiPickerButtonDropdownIcon: {
            fontSize: 30,
        }, moneyRequestImage: {
            height: 200,
            borderRadius: 16,
            marginHorizontal: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.border,
        }, reportPreviewBox: {
            backgroundColor: theme.cardBG,
            borderRadius: variables_1.default.componentBorderRadiusLarge,
            maxWidth: variables_1.default.reportPreviewMaxWidth,
            width: '100%',
        }, reportPreviewBoxHoverBorder: {
            borderColor: theme.cardBG,
            backgroundColor: theme.cardBG,
        }, reportContainerBorderRadius: {
            borderRadius: variables_1.default.componentBorderRadiusLarge,
        }, expenseAndReportPreviewBoxBody: {
            padding: 16,
        }, expenseAndReportPreviewTextContainer: {
            gap: 8,
        }, reportPreviewAmountSubtitleContainer: {
            gap: 4,
        }, expenseAndReportPreviewTextButtonContainer: {
            gap: 16,
        }, reportActionItemImagesContainer: {
            margin: 4,
        }, receiptPreviewAspectRatio: {
            aspectRatio: 16 / 9,
        }, reportActionItemImages: {
            flexDirection: 'row',
            borderRadius: 12,
            overflow: 'hidden',
        }, reportActionItemImage: {
            flex: 1,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }, reportActionItemImageBorder: {
            borderRightWidth: 4,
            borderColor: theme.cardBG,
        }, reportActionItemImagesMoreContainer: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            display: 'flex',
        }, reportActionItemImagesMore: {
            borderTopLeftRadius: 12,
            backgroundColor: theme.border,
            width: 40,
            height: 40,
        }, reportActionItemImagesMoreHovered: {
            backgroundColor: theme.cardBG,
        }, reportActionItemImagesMoreText: {
            position: 'absolute',
            marginLeft: 20,
            marginTop: 16,
            color: theme.textSupporting,
        }, reportActionItemImagesMoreCornerTriangle: {
            position: 'absolute',
        }, bankIconContainer: {
            height: variables_1.default.cardIconWidth,
            width: variables_1.default.cardIconWidth,
            borderRadius: 8,
            overflow: 'hidden',
            alignSelf: 'center',
        }, staticHeaderImage: {
            minHeight: 240,
        }, emojiPickerButtonDropdownContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        }, rotate90: {
            transform: 'rotate(90deg)',
        }, emojiStatusLHN: __assign(__assign({ fontSize: 9 }, ((0, Browser_1.getBrowser)() && !(0, Browser_1.isMobile)() && { transform: 'scale(.5)', fontSize: 22, overflow: 'visible' })), ((0, Browser_1.getBrowser)() &&
            (0, Browser_1.isSafari)() &&
            !(0, Browser_1.isMobile)() && {
            transform: 'scale(0.7)',
            fontSize: 13,
            lineHeight: 15,
            overflow: 'visible',
        })), onboardingVideoPlayer: {
            borderRadius: 12,
            backgroundColor: theme.highlightBG,
        }, onboardingSmallIcon: {
            padding: 10,
        }, sidebarStatusAvatarContainer: {
            height: 40,
            width: 40,
            backgroundColor: theme.componentBG,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
        }, sidebarStatusAvatarWithEmojiContainer: {
            height: 28,
            width: 28,
            top: -2,
        }, sidebarStatusAvatar: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.border,
            height: 20,
            width: 20,
            borderRadius: 10,
            position: 'absolute',
            right: -6,
            bottom: -6,
            borderColor: theme.appBG,
            borderWidth: 2,
            overflow: 'hidden',
        }, profilePageAvatar: {
            borderColor: theme.highlightBG,
        }, justSignedInModalAnimation: function (is2FARequired) { return ({
            height: is2FARequired ? variables_1.default.modalTopIconHeight : variables_1.default.modalTopBigIconHeight,
        }); }, moneyRequestViewImage: __assign(__assign({}, spacing_1.default.mh5), { overflow: 'hidden', borderWidth: 1, borderColor: theme.border, borderRadius: variables_1.default.componentBorderRadiusLarge, height: 180, maxWidth: '100%' }), expenseViewImage: {
            maxWidth: 360,
            aspectRatio: 16 / 9,
            height: 'auto',
        }, expenseViewImageSmall: {
            maxWidth: 440,
            aspectRatio: 16 / 9,
            height: 'auto',
        }, pdfErrorPlaceholder: {
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: theme.cardBG,
            borderRadius: variables_1.default.componentBorderRadiusLarge,
            maxWidth: 400,
            height: '100%',
            backgroundColor: theme.highlightBG,
        }, moneyRequestAttachReceipt: {
            backgroundColor: theme.highlightBG,
            borderColor: theme.border,
            borderWidth: 1,
        }, moneyRequestAttachReceiptThumbnail: {
            backgroundColor: theme.hoverComponentBG,
            borderWidth: 0,
            width: '100%',
        }, receiptEmptyStateFullHeight: { height: '100%', borderRadius: 12 }, moneyRequestAttachReceiptThumbnailIcon: {
            position: 'absolute',
            bottom: -4,
            right: -4,
            borderColor: theme.highlightBG,
            borderWidth: 2,
            borderRadius: '50%',
        }, mapViewContainer: __assign(__assign({}, flex_1.default.flex1), { minHeight: 300 }), mapView: __assign(__assign({}, flex_1.default.flex1), { overflow: 'hidden', backgroundColor: theme.highlightBG }), mapEditView: {
            borderRadius: variables_1.default.componentBorderRadiusXLarge,
            borderWidth: variables_1.default.componentBorderWidth,
            borderColor: theme.appBG,
        }, currentPositionDot: { backgroundColor: colors_1.default.blue400, width: 16, height: 16, borderRadius: 16 }, mapViewOverlay: __assign(__assign({ flex: 1, position: 'absolute', left: 0, top: 0, borderRadius: variables_1.default.componentBorderRadiusLarge, overflow: 'hidden', backgroundColor: theme.highlightBG }, sizing_1.default.w100), sizing_1.default.h100), confirmationListMapItem: __assign(__assign(__assign({}, spacing_1.default.mv2), spacing_1.default.mh5), { height: 200 }), mapDirection: {
            lineColor: theme.success,
            lineWidth: 7,
        }, mapDirectionLayer: {
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': theme.success, 'line-width': 7 },
        }, mapPendingView: __assign(__assign({ backgroundColor: theme.hoverComponentBG }, flex_1.default.flex1), { borderRadius: variables_1.default.componentBorderRadiusLarge }), userReportStatusEmoji: {
            flexShrink: 0,
            fontSize: variables_1.default.fontSizeNormal,
            marginRight: 4,
        }, timePickerInput: {
            fontSize: 69,
            minWidth: 56,
            alignSelf: 'center',
        }, timePickerWidth72: {
            width: 72,
        }, timePickerHeight100: {
            height: 100,
        }, timePickerSemiDot: {
            fontSize: 69,
            height: 84,
            alignSelf: 'center',
        }, timePickerSwitcherContainer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'center',
            marginBottom: 8,
        }, selectionListRadioSeparator: {
            height: react_native_1.StyleSheet.hairlineWidth,
            backgroundColor: theme.border,
            marginHorizontal: 20,
        }, selectionListPressableItemWrapper: {
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingVertical: 16,
            marginHorizontal: 20,
            backgroundColor: theme.highlightBG,
            borderRadius: 8,
            minHeight: variables_1.default.optionRowHeight,
        }, searchQueryListItemStyle: {
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderRadius: 8,
        }, listTableHeader: {
            paddingVertical: 12,
            paddingHorizontal: 32,
        }, cardItemSecondaryIconStyle: {
            position: 'absolute',
            bottom: -4,
            right: -4,
            borderWidth: 2,
            borderRadius: 2,
            backgroundColor: theme.componentBG,
        }, selectionListStickyHeader: {
            backgroundColor: theme.appBG,
        }, draggableTopBar: {
            height: 30,
            width: '100%',
        }, menuItemError: {
            marginTop: 4,
            marginBottom: 0,
        }, formHelperMessage: {
            height: 32,
            marginTop: 0,
            marginBottom: 0,
        }, timePickerInputExtraSmall: {
            fontSize: 50,
        }, setTimeFormButtonContainer: {
            minHeight: 54,
        }, timePickerInputsContainer: {
            maxHeight: 100,
        }, timePickerButtonErrorText: {
            position: 'absolute',
            top: -36,
        }, listBoundaryLoader: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            height: CONST_1.default.CHAT_HEADER_LOADER_HEIGHT,
        }, listBoundaryError: {
            paddingVertical: 15,
            paddingHorizontal: 20,
        }, listBoundaryErrorText: {
            color: theme.textSupporting,
            fontSize: variables_1.default.fontSizeLabel,
            marginBottom: 10,
        }, videoContainer: __assign(__assign(__assign(__assign({}, flex_1.default.flex1), flex_1.default.alignItemsCenter), flex_1.default.justifyContentCenter), objectFit_1.default.oFCover), singleOptionSelectorRow: __assign(__assign(__assign({}, flex_1.default.flexRow), flex_1.default.alignItemsCenter), { gap: 12, marginBottom: 16 }), holdRequestInline: __assign(__assign(__assign({}, headlineFont), whiteSpace_1.default.preWrap), { color: theme.textLight, fontSize: variables_1.default.fontSizeXLarge, lineHeight: variables_1.default.lineHeightXXLarge, backgroundColor: colors_1.default.red, borderRadius: variables_1.default.componentBorderRadiusMedium, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4 }), headerStatusBarContainer: {
            minHeight: variables_1.default.componentSizeSmall,
        }, searchFiltersBarContainer: {
            marginTop: 8,
            flexDirection: 'row',
            alignItems: 'center',
        }, walletIllustration: {
            height: 180,
        }, walletCardLimit: {
            color: theme.text,
            fontSize: variables_1.default.fontSizeNormal,
        }, walletCard: {
            borderRadius: variables_1.default.componentBorderRadiusLarge,
            position: 'relative',
            alignSelf: 'center',
            overflow: 'hidden',
        }, plaidIcon: {
            height: variables_1.default.iconSizeMegaLarge,
            width: variables_1.default.iconSizeMegaLarge,
            position: 'absolute',
            right: 24,
            top: 20,
            zIndex: 1,
        }, plaidIconSmall: {
            height: variables_1.default.iconSizeMedium,
            width: variables_1.default.iconSizeMedium,
            position: 'absolute',
            right: 4,
            zIndex: 1,
            top: 4,
        }, walletCardNumber: {
            color: theme.text,
            fontSize: variables_1.default.fontSizeNormal,
        }, walletCardMenuItem: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), { color: theme.text, fontSize: variables_1.default.fontSizeNormal, lineHeight: variables_1.default.lineHeightXLarge }), walletCardHolder: {
            position: 'absolute',
            left: 16,
            bottom: 16,
            width: variables_1.default.cardNameWidth,
            color: theme.textLight,
            fontSize: variables_1.default.fontSizeSmall,
            lineHeight: variables_1.default.lineHeightLarge,
        }, walletRedDotSectionTitle: {
            color: theme.text,
            fontWeight: FontUtils_1.default.fontWeight.bold,
            fontSize: variables_1.default.fontSizeNormal,
            lineHeight: variables_1.default.lineHeightXLarge,
        }, walletRedDotSectionText: {
            color: theme.textSupporting,
            fontSize: variables_1.default.fontSizeLabel,
            lineHeight: variables_1.default.lineHeightNormal,
        }, walletLockedMessage: {
            color: theme.text,
            fontSize: variables_1.default.fontSizeNormal,
            lineHeight: variables_1.default.lineHeightXLarge,
        }, workspaceSection: {
            maxWidth: variables_1.default.workspaceSectionMaxWidth + variables_1.default.sectionMargin * 2,
        }, workspaceSectionMobile: {
            width: '100%',
            alignSelf: 'center',
        }, workspaceSectionMoreFeaturesItem: {
            backgroundColor: theme.cardBG,
            borderRadius: variables_1.default.componentBorderRadiusNormal,
            paddingHorizontal: 16,
            paddingVertical: 20,
            minWidth: 350,
            flexGrow: 1,
            flexShrink: 1,
            // Choosing a lowest value just above the threshold for the items to adjust width against the various screens. Only 2 items are shown 35 * 2 = 70 thus third item of 35% width can't fit forcing a two column layout.
            flexBasis: '35%',
            marginTop: 12,
        }, onboardingAccountingItem: {
            backgroundColor: theme.cardBG,
            borderRadius: variables_1.default.componentBorderRadiusNormal,
            paddingHorizontal: 16,
            paddingVertical: 20,
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: '35%',
        }, aspectRatioLottie: function (animation) { return ({ aspectRatio: animation.w / animation.h }); }, receiptDropHeaderGap: {
            backgroundColor: theme.fileDropUIBG,
        }, checkboxWithLabelCheckboxStyle: {
            marginLeft: -2,
        }, singleOptionSelectorCircle: {
            borderColor: theme.icon,
        }, headerProgressBarContainer: {
            position: 'absolute',
            width: '100%',
            zIndex: -1,
        }, headerProgressBar: {
            width: variables_1.default.componentSizeMedium,
            height: variables_1.default.iconSizeXXXSmall,
            borderRadius: variables_1.default.componentBorderRadiusRounded,
            backgroundColor: theme.border,
            alignSelf: 'center',
        }, headerProgressBarFill: {
            borderRadius: variables_1.default.componentBorderRadiusRounded,
            height: '100%',
            backgroundColor: theme.success,
        }, interactiveStepHeaderContainer: {
            flex: 1,
            alignSelf: 'center',
            flexDirection: 'row',
        }, interactiveStepHeaderStepContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        }, interactiveStepHeaderStepButton: {
            width: 40,
            height: 40,
            borderWidth: 2,
            borderRadius: 20,
            borderColor: theme.borderFocus,
            justifyContent: 'center',
            alignItems: 'center',
            color: theme.white,
        }, interactiveStepHeaderLockedStepButton: {
            borderColor: theme.borderLighter,
        }, interactiveStepHeaderStepText: __assign({ fontSize: variables_1.default.fontSizeLabel }, FontUtils_1.default.fontFamily.platform.EXP_NEUE_BOLD), interactiveStepHeaderCompletedStepButton: {
            backgroundColor: theme.iconSuccessFill,
        }, interactiveStepHeaderStepLine: {
            height: 1,
            flexGrow: 1,
            backgroundColor: theme.iconSuccessFill,
        }, interactiveStepHeaderLockedStepLine: {
            backgroundColor: theme.activeComponentBG,
        }, confirmBankInfoCard: {
            backgroundColor: colors_1.default.green800,
            borderRadius: variables_1.default.componentBorderRadiusCard,
            marginBottom: 20,
            marginHorizontal: 16,
            padding: 20,
            width: 'auto',
            textAlign: 'left',
        }, confirmBankInfoText: __assign(__assign({ fontSize: variables_1.default.fontSizeNormal }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { color: theme.text }), confirmBankInfoCompanyIcon: {
            height: 40,
            width: 40,
            backgroundColor: colors_1.default.darkIcons,
            borderRadius: 50,
            justifyContent: 'center',
            alignItems: 'center',
        }, confirmBankInfoBankIcon: {
            height: 40,
            width: 40,
            borderRadius: 50,
        }, confirmBankInfoNumber: __assign(__assign({}, FontUtils_1.default.fontFamily.platform.MONOSPACE), { fontSize: variables_1.default.fontSizeNormal, lineHeight: variables_1.default.lineHeightXLarge, color: theme.text, textAlignVertical: 'center' }), textHeadlineLineHeightXXL: __assign(__assign(__assign({}, headlineFont), whiteSpace_1.default.preWrap), { color: theme.heading, fontSize: variables_1.default.fontSizeXLarge, lineHeight: variables_1.default.lineHeightXXLarge }), videoPlayerPreview: {
            width: '100%',
            height: '100%',
            borderRadius: variables_1.default.componentBorderRadiusNormal,
        }, videoPlayerControlsContainer: {
            position: 'absolute',
            bottom: CONST_1.default.VIDEO_PLAYER.CONTROLS_POSITION.NORMAL,
            left: CONST_1.default.VIDEO_PLAYER.CONTROLS_POSITION.NORMAL,
            right: CONST_1.default.VIDEO_PLAYER.CONTROLS_POSITION.NORMAL,
            backgroundColor: theme.videoPlayerBG,
            borderRadius: 8,
            flexDirection: 'column',
            overflow: 'visible',
            zIndex: 9000,
        }, videoPlayerControlsButtonContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        }, progressBarOutline: {
            width: '100%',
            height: 4,
            borderRadius: 8,
            backgroundColor: theme.transparentWhite,
        }, progressBarFill: {
            height: '100%',
            backgroundColor: colors_1.default.white,
            borderRadius: 8,
        }, videoPlayerControlsRow: {
            flexDirection: 'row',
            alignItems: 'center',
        }, videoPlayerText: {
            textAlign: 'center',
            fontSize: variables_1.default.fontSizeLabel,
            fontWeight: FontUtils_1.default.fontWeight.bold,
            lineHeight: 16,
            color: theme.white,
            userSelect: 'none',
            WebkitUserSelect: 'none',
        }, volumeSliderContainer: {
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            height: 100,
            alignItems: 'center',
            borderRadius: 4,
            backgroundColor: colors_1.default.green700,
        }, splitItemBottomContent: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 12,
            justifyContent: 'space-between',
            minHeight: 16,
        }, volumeSliderOverlay: {
            width: 4,
            height: 60,
            backgroundColor: theme.transparentWhite,
            borderRadius: 8,
            marginTop: 8,
            alignItems: 'center',
            justifyContent: 'flex-end',
        }, volumeSliderThumb: {
            width: 8,
            height: 8,
            borderRadius: 8,
            backgroundColor: colors_1.default.white,
            marginBottom: -2,
        }, volumeSliderFill: {
            width: 4,
            height: 20,
            backgroundColor: colors_1.default.white,
            borderRadius: 8,
        }, videoIconButton: {
            padding: 4,
            borderRadius: 4,
        }, videoIconButtonHovered: {
            backgroundColor: colors_1.default.green700,
        }, videoThumbnailContainer: {
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
        }, videoThumbnailPlayButton: {
            backgroundColor: theme.videoPlayerBG,
            borderRadius: 100,
            width: 72,
            height: 72,
            alignItems: 'center',
            justifyContent: 'center',
        }, videoExpandButton: {
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: theme.videoPlayerBG,
            borderRadius: 8,
            padding: 8,
        }, videoPlayerTimeComponentWidth: {
            width: 40,
        }, colorSchemeStyle: function (colorScheme) { return ({ colorScheme: colorScheme }); }, updateAnimation: {
            width: variables_1.default.updateAnimationW,
            height: variables_1.default.updateAnimationH,
        }, updateRequiredViewHeader: {
            height: variables_1.default.updateViewHeaderHeight,
        }, updateRequiredViewTextContainer: {
            width: variables_1.default.updateTextViewContainerWidth,
        }, twoFARequiredContainer: {
            maxWidth: 520,
            margin: 'auto',
        }, widthAuto: {
            width: 'auto',
        }, workspaceTitleStyle: __assign(__assign({}, headlineFont), { fontSize: variables_1.default.fontSizeXLarge, flex: 1 }), expensifyCardIllustrationContainer: {
            width: 680,
            height: 220,
        }, emptyStateCardIllustrationContainer: __assign(__assign({ height: 220 }, flex_1.default.alignItemsCenter), flex_1.default.justifyContentCenter), emptyStateCardIllustration: {
            width: 164,
            height: 190,
        }, emptyStateMoneyRequestReport: __assign(__assign({ maxHeight: 85, minHeight: 85 }, flex_1.default.alignItemsCenter), flex_1.default.justifyContentCenter), emptyStateMoneyRequestPreviewReport: __assign(__assign(__assign({ borderWidth: 1, borderColor: theme.border, height: 168, width: '100%', boxSizing: 'border-box' }, borders_1.default.br4), flex_1.default.alignItemsCenter), flex_1.default.justifyContentCenter), pendingStateCardIllustration: {
            width: 233,
            height: 162,
        }, computerIllustrationContainer: {
            width: 272,
            height: 188,
        }, pendingBankCardIllustration: {
            width: 217,
            height: 150,
        }, cardIcon: {
            overflow: 'hidden',
            borderRadius: variables_1.default.cardBorderRadius,
            alignSelf: 'center',
        }, cardMiniature: {
            overflow: 'hidden',
            borderRadius: variables_1.default.cardMiniatureBorderRadius,
            alignSelf: 'center',
        }, tripReservationIconContainer: {
            width: variables_1.default.avatarSizeNormal,
            height: variables_1.default.avatarSizeNormal,
            backgroundColor: theme.border,
            borderRadius: variables_1.default.componentBorderRadiusXLarge,
            alignItems: 'center',
            justifyContent: 'center',
        }, tripReservationRow: {
            flexDirection: 'row',
            alignItems: 'center',
            maxWidth: '50%',
            flexShrink: 1,
        }, iconWrapper: {
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'flex-start', // Keeps icon from dropping below
            paddingTop: 2, // Adjust slightly for vertical centering
        }, textLineThrough: {
            textDecorationLine: 'line-through',
        }, reportListItemTitle: {
            color: theme.text,
            fontSize: variables_1.default.fontSizeNormal,
        }, skeletonBackground: {
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
        }, emptyStateForeground: {
            margin: 32,
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
        }, emptyStateContent: {
            backgroundColor: theme.cardBG,
            borderRadius: variables_1.default.componentBorderRadiusLarge,
            maxWidth: 400,
            width: '100%',
        }, emptyStateHeader: function (isIllustration) { return ({
            borderTopLeftRadius: variables_1.default.componentBorderRadiusLarge,
            borderTopRightRadius: variables_1.default.componentBorderRadiusLarge,
            minHeight: 200,
            alignItems: isIllustration ? 'center' : undefined,
            justifyContent: isIllustration ? 'center' : undefined,
        }); }, emptyFolderBG: {
            backgroundColor: theme.emptyFolderBG,
        }, emptyFolderDarkBG: {
            backgroundColor: '#782c04',
            height: 220,
        }, emptyStateVideo: {
            borderTopLeftRadius: variables_1.default.componentBorderRadiusLarge,
            borderTopRightRadius: variables_1.default.componentBorderRadiusLarge,
        }, emptyStateFolderWithPaperIconSize: {
            width: 160,
            height: 100,
        }, emptyStateFolderWebStyles: __assign(__assign(__assign(__assign(__assign({}, sizing_1.default.w100), { minWidth: 400 }), flex_1.default.alignItemsCenter), flex_1.default.justifyContentCenter), display_1.default.dFlex), emptyStateFireworksWebStyles: __assign(__assign(__assign({ width: 250 }, flex_1.default.alignItemsCenter), flex_1.default.justifyContentCenter), display_1.default.dFlex), tripEmptyStateLottieWebView: {
            width: 335,
            height: 220,
        }, workflowApprovalVerticalLine: {
            height: 16,
            width: 1,
            marginLeft: 19,
            backgroundColor: theme.border,
        }, integrationIcon: {
            overflow: 'hidden',
            borderRadius: variables_1.default.buttonBorderRadius,
        }, colorGreenSuccess: {
            color: colors_1.default.green400,
        }, bgPaleGreen: {
            backgroundColor: colors_1.default.green100,
        }, importColumnCard: {
            backgroundColor: theme.cardBG,
            borderRadius: variables_1.default.componentBorderRadiusNormal,
            padding: 16,
            flexWrap: 'wrap',
        }, accountSwitcherPopover: {
            width: variables_1.default.sideBarWidth - 19,
        }, accountSwitcherPopoverWithLHB: {
            width: variables_1.default.sideBarWithLHBWidth - 19,
        }, progressBarWrapper: {
            height: 2,
            width: '100%',
            backgroundColor: theme.transparent,
            overflow: 'hidden',
            position: 'absolute',
            bottom: -1,
        }, progressBar: {
            height: '100%',
            backgroundColor: theme.success,
            width: '100%',
        }, accountSwitcherAnchorPosition: {
            top: 80,
            left: 12,
        }, qbdSetupLinkBox: {
            backgroundColor: theme.hoverComponentBG,
            borderRadius: variables_1.default.componentBorderRadiusMedium,
            borderColor: theme.border,
            padding: 16,
        }, liDot: {
            width: 4,
            height: 4,
            borderRadius: 4,
            backgroundColor: theme.text,
            marginHorizontal: 8,
            alignSelf: 'center',
        }, 
        // We have to use 10000 here as sidePanel has to be displayed on top of modals which have z-index of 9999
        sidePanelContainer: { zIndex: 10000 }, sidePanelOverlay: function (isOverlayVisible) { return (__assign(__assign({}, positioning_1.default.pFixed), { top: 0, bottom: 0, left: 0, right: -variables_1.default.sideBarWidth, backgroundColor: theme.overlay, opacity: isOverlayVisible ? 0 : variables_1.default.overlayOpacity })); }, sidePanelContent: function (shouldUseNarrowLayout, isExtraLargeScreenWidth) { return ({
            position: react_native_1.Platform.OS === 'web' ? 'fixed' : 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: shouldUseNarrowLayout ? '100%' : variables_1.default.sideBarWidth,
            height: '100%',
            backgroundColor: theme.modalBackground,
            borderLeftWidth: isExtraLargeScreenWidth ? 1 : 0,
            borderLeftColor: theme.border,
        }); }, reportPreviewCarouselDots: {
            borderRadius: 50,
            width: 8,
            height: 8,
            alignItems: 'center',
            justifyContent: 'center',
        }, reportPreviewArrowButton: {
            borderRadius: 50,
            width: variables_1.default.w28,
            height: variables_1.default.h28,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 4,
        }, expenseWidgetRadius: {
            borderRadius: variables_1.default.componentBorderRadiusNormal,
        }, translucentNavigationBarBG: {
            backgroundColor: theme.translucentNavigationBarBackgroundColor,
        }, stickToBottom: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
        }, getSearchBarStyle: function (shouldUseNarrowLayout) { return ({
            maxWidth: shouldUseNarrowLayout ? '100%' : 300,
            marginHorizontal: 20,
            marginBottom: 20,
        }); }, getSelectionListPopoverHeight: function (itemCount) { return (__assign({ height: itemCount * variables_1.default.optionRowHeightCompact }, sizing_1.default.mh65vh)); }, getUserSelectionListPopoverHeight: function (itemCount, windowHeight, shouldUseNarrowLayout) {
            var BUTTON_HEIGHT = 40;
            var SEARCHBAR_HEIGHT = 50;
            var SEARCHBAR_MARGIN = 14;
            var PADDING = 44 - (shouldUseNarrowLayout ? 32 : 0);
            var ESTIMATED_LIST_HEIGHT = itemCount * variables_1.default.optionRowHeightCompact + SEARCHBAR_HEIGHT + SEARCHBAR_MARGIN + BUTTON_HEIGHT + PADDING;
            // Native platforms don't support maxHeight in the way thats expected, so lets manually set the height to either
            // the listHeight, the max height of the popover, or 90% of the window height, such that we never overflow the screen
            // and never expand over the max height
            var height = Math.min(ESTIMATED_LIST_HEIGHT, CONST_1.default.POPOVER_DROPDOWN_MAX_HEIGHT, windowHeight * 0.9);
            var width = shouldUseNarrowLayout ? sizing_1.default.w100 : { width: CONST_1.default.POPOVER_DROPDOWN_WIDTH };
            return __assign({ height: height }, width);
        }, earlyDiscountButton: {
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 'auto',
        }, testDriveModalContainer: function (shouldUseNarrowLayout) { return ({
            // On small/medium screens, we need to remove the top padding
            paddingTop: 0,
            // On larger screens, we need to prevent the modal from becoming too big
            maxWidth: shouldUseNarrowLayout ? undefined : 500,
        }); }, backgroundWhite: {
            backgroundColor: colors_1.default.white,
        }, embeddedDemoIframe: {
            height: '100%',
            width: '100%',
            border: 'none',
        }, featureTrainingModalImage: {
            width: '100%',
            height: '100%',
            borderTopLeftRadius: variables_1.default.componentBorderRadiusLarge,
            borderTopRightRadius: variables_1.default.componentBorderRadiusLarge,
        }, testDriveBannerGap: {
            height: CONST_1.default.DESKTOP_HEADER_PADDING * 2,
        }, twoColumnLayoutCol: {
            flexGrow: 1,
            flexShrink: 1,
            // Choosing a lowest value just above the threshold for the items to adjust width against the various screens. Only 2 items are shown 35 * 2 = 70 thus third item of 35% width can't fit forcing a two column layout.
            flexBasis: '35%',
        }, thumbnailImageContainerHover: {
            backgroundColor: theme.hoverComponentBG,
        }, thumbnailImageContainerHighlight: {
            backgroundColor: theme.highlightBG,
        }, multiScanEducationalPopupImage: {
            backgroundColor: colors_1.default.pink700,
            overflow: 'hidden',
            paddingHorizontal: 0,
            aspectRatio: 1.7,
        }, topBarWrapper: {
            zIndex: 15,
        }, getTestToolsNavigatorOuterView: function (shouldUseNarrowLayout) { return ({
            flex: 1,
            justifyContent: shouldUseNarrowLayout ? 'flex-end' : 'center',
            alignItems: 'center',
        }); }, getTestToolsNavigatorInnerView: function (shouldUseNarrowLayout, isAuthenticated) {
            var borderBottomRadius = shouldUseNarrowLayout ? 0 : variables_1.default.componentBorderRadiusLarge;
            var defaultHeight = shouldUseNarrowLayout ? '78%' : '75%';
            var height = isAuthenticated ? defaultHeight : '55%';
            return {
                width: shouldUseNarrowLayout ? '100%' : '91%',
                height: height,
                borderRadius: variables_1.default.componentBorderRadiusLarge,
                borderBottomRightRadius: borderBottomRadius,
                borderBottomLeftRadius: borderBottomRadius,
                overflow: 'hidden',
            };
        } }));
};
var defaultStyles = styles(theme_1.defaultTheme);
exports.defaultStyles = defaultStyles;
exports.default = styles;
