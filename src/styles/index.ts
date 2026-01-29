/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/naming-convention */
import type {LineLayerStyleProps} from '@rnmapbox/maps/src/utils/MapboxStyles';
import lodashClamp from 'lodash/clamp';
import type {LineLayer} from 'react-map-gl';
// eslint-disable-next-line no-restricted-imports
import type {Animated, ImageStyle, TextStyle, ViewStyle} from 'react-native';
import {Platform, StyleSheet} from 'react-native';
import type {PickerStyle} from 'react-native-picker-select';
import type {SharedValue} from 'react-native-reanimated';
import {interpolate} from 'react-native-reanimated';
import type {MixedStyleDeclaration, MixedStyleRecord} from 'react-native-render-html';
import type {ValueOf} from 'type-fest';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import {ACTIVE_LABEL_SCALE} from '@components/TextInput/styleConst';
import {animatedReceiptPaneRHPWidth, animatedSuperWideRHPWidth, animatedWideRHPWidth} from '@components/WideRHPContextProvider';
import {getBrowser, isMobile, isMobileSafari, isSafari} from '@libs/Browser';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';
import type {Dimensions} from '@src/types/utils/Layout';
import {defaultTheme} from './theme';
import colors from './theme/colors';
import type {ThemeColors} from './theme/types';
import addOutlineWidth from './utils/addOutlineWidth';
import addToWalletButtonStyles from './utils/addToWalletButtonStyles';
import borders from './utils/borders';
import chatContentScrollViewPlatformStyles from './utils/chatContentScrollViewPlatformStyles';
import cursor from './utils/cursor';
import display from './utils/display';
import editedLabelStyles from './utils/editedLabelStyles';
import emojiDefaultStyles from './utils/emojiDefaultStyles';
import flex from './utils/flex';
import FontUtils from './utils/FontUtils';
import objectFit from './utils/objectFit';
import optionAlternateTextPlatformStyles from './utils/optionAlternateTextPlatformStyles';
import overflow from './utils/overflow';
import overflowMoneyRequestView from './utils/overflowMoneyRequestView';
import overflowXHidden from './utils/overflowXHidden';
import pointerEventsAuto from './utils/pointerEventsAuto';
import pointerEventsBoxNone from './utils/pointerEventsBoxNone';
import pointerEventsNone from './utils/pointerEventsNone';
import positioning from './utils/positioning';
import sizing from './utils/sizing';
import spacing from './utils/spacing';
import textDecorationLine from './utils/textDecorationLine';
import textUnderline from './utils/textUnderline';
import translateZ0 from './utils/translateZ0';
import userSelect from './utils/userSelect';
import visibility from './utils/visibility';
import whiteSpace from './utils/whiteSpace';
import wordBreak from './utils/wordBreak';
import writingDirection from './utils/writingDirection';
import variables from './variables';

type ColorScheme = ValueOf<typeof CONST.COLOR_SCHEME>;
type StatusBarStyle = ValueOf<typeof CONST.STATUS_BAR_STYLE>;

type AnchorDimensions = Dimensions;

type AnchorPosition = {
    horizontal: number;
    vertical: number;
};

const getReceiptDropZoneViewStyle = (theme: ThemeColors, margin: number, paddingVertical: number): ViewStyle => ({
    borderRadius: variables.componentBorderRadiusLarge,
    borderColor: theme.borderFocus,
    borderStyle: 'dotted',
    marginBottom: margin,
    marginLeft: margin,
    marginRight: margin,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical,
    gap: 4,
    flex: 1,
});

type WebViewStyle = {
    tagStyles: MixedStyleRecord;
    baseFontStyle: MixedStyleDeclaration;
};

type CustomPickerStyle = PickerStyle & {icon?: ViewStyle};

type OverlayStylesParams = Animated.AnimatedInterpolation<string | number> | Animated.Value;

type TwoFactorAuthCodesBoxParams = {isExtraSmallScreenWidth: boolean; isSmallScreenWidth: boolean};
type WorkspaceUpgradeIntroBoxParams = {isExtraSmallScreenWidth: boolean};

type OfflineFeedbackStyle = Record<'deleted' | 'pending' | 'default' | 'error' | 'container' | 'textContainer' | 'text' | 'errorDot', ViewStyle | TextStyle>;

type MapDirectionStyle = Pick<LineLayerStyleProps, 'lineColor' | 'lineWidth'>;

type MapDirectionLayerStyle = Pick<LineLayer, 'layout' | 'paint'>;

type StyleObject = ViewStyle | TextStyle | ImageStyle | WebViewStyle | OfflineFeedbackStyle | MapDirectionStyle | MapDirectionLayerStyle | AnchorPosition | CustomPickerStyle;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StyleFunction = (...args: any[]) => StyleObject;

type StaticStyles = Record<string, StyleObject>;
type DynamicStyles = Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    StyleFunction
>;
type Styles = Record<string, StyleObject | StyleFunction>;

// touchCallout is an iOS safari only property that controls the display of the callout information when you touch and hold a target
const touchCalloutNone: Pick<ViewStyle, 'WebkitTouchCallout'> = isMobileSafari() ? {WebkitTouchCallout: 'none'} : {};
// to prevent vertical text offset in Safari for badges, new lineHeight values have been added
const lineHeightBadge: Pick<TextStyle, 'lineHeight'> = isSafari() ? {lineHeight: variables.lineHeightXSmall} : {lineHeight: variables.lineHeightNormal};

const picker = (theme: ThemeColors) =>
    ({
        backgroundColor: theme.transparent,
        color: theme.text,
        ...FontUtils.fontFamily.platform.EXP_NEUE,
        fontSize: variables.fontSizeNormal,
        lineHeight: variables.fontSizeNormalHeight,
        paddingBottom: 8,
        paddingTop: 23,
        paddingLeft: 0,
        paddingRight: 25,
        height: variables.inputHeight,
        borderWidth: 0,
        textAlign: 'left',
    }) satisfies TextStyle;

const link = (theme: ThemeColors) =>
    ({
        color: theme.link,
        textDecorationColor: theme.link,
        // We set fontFamily directly in order to avoid overriding fontWeight and fontStyle.
        fontFamily: FontUtils.fontFamily.platform.EXP_NEUE.fontFamily,
        // We do not want to have underline on links
        textDecorationLine: 'none',
    }) satisfies ViewStyle & MixedStyleDeclaration;

const emailLink = (theme: ThemeColors) =>
    ({
        color: theme.link,
        textDecorationColor: theme.link,
        // We set fontFamily directly in order to avoid overriding fontWeight and fontStyle.
        fontFamily: FontUtils.fontFamily.platform.EXP_NEUE.fontFamily,
        fontWeight: FontUtils.fontWeight.bold,
    }) satisfies ViewStyle & MixedStyleDeclaration;

const baseCodeTagStyles = (theme: ThemeColors) =>
    ({
        borderWidth: 1,
        borderRadius: 5,
        borderColor: theme.border,
        backgroundColor: theme.textBackground,
    }) satisfies ViewStyle & MixedStyleDeclaration;

const headlineFont = {
    ...FontUtils.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM,
} satisfies TextStyle;

const headlineItalicFont = {
    ...FontUtils.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM_ITALIC,
} satisfies TextStyle;

const modalNavigatorContainer = (isSmallScreenWidth: boolean) =>
    ({
        position: 'absolute',
        width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,
        height: '100%',
    }) satisfies ViewStyle;

const webViewStyles = (theme: ThemeColors) =>
    ({
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
                whiteSpace: 'normal',
            },

            ol: {
                maxWidth: '100%',
                whiteSpace: 'normal',
            },

            li: {
                flexShrink: 1,
                whiteSpace: 'pre',
            },

            pre: {
                ...baseCodeTagStyles(theme),
                paddingVertical: 8,
                paddingHorizontal: 12,
                fontSize: undefined,
                ...FontUtils.fontFamily.platform.MONOSPACE,
                marginTop: 0,
                marginBottom: 0,
            },

            code: {
                ...baseCodeTagStyles(theme),
                paddingLeft: 5,
                paddingRight: 5,
                fontFamily: FontUtils.fontFamily.platform.MONOSPACE.fontFamily,
            },

            img: {
                borderColor: theme.border,
                borderRadius: variables.componentBorderRadiusNormal,
                borderWidth: 1,
                ...touchCalloutNone,
            },

            video: {
                minWidth: CONST.VIDEO_PLAYER.MIN_WIDTH,
                minHeight: CONST.VIDEO_PLAYER.MIN_HEIGHT,
                borderRadius: variables.componentBorderRadiusNormal,
                backgroundColor: theme.highlightBG,
                ...touchCalloutNone,
            },

            p: {
                marginTop: 0,
                marginBottom: 0,
            },
            h1: {
                marginBottom: 8,
            },
        },

        baseFontStyle: {
            color: theme.text,
            fontSize: variables.fontSizeNormal,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            flex: 1,
            lineHeight: variables.fontSizeNormalHeight,
            ...writingDirection.ltr,
        },
    }) satisfies WebViewStyle;

const staticStyles = (theme: ThemeColors) =>
    StyleSheet.create({
        ...spacing,
        ...borders,
        ...sizing,
        ...flex,
        ...display,
        ...overflow,
        ...positioning,
        ...wordBreak,
        ...translateZ0,
        ...whiteSpace,
        ...writingDirection,
        ...cursor,
        ...userSelect,
        ...textUnderline,
        ...objectFit,
        ...textDecorationLine,
        editedLabelStyles,
        emojiDefaultStyles,
        addToWalletButtonStyles,
        autoCompleteSuggestionsContainer: {
            backgroundColor: theme.appBG,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: theme.shadow,
            paddingVertical: CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTER_INNER_PADDING,
        },
        blockquote: {
            borderLeftColor: theme.border,
            borderLeftWidth: 4,
            paddingLeft: 12,
            marginTop: 4,
            marginBottom: 4,

            // Overwrite default HTML margin for blockquote
            marginLeft: 0,
        },

        h1: {
            fontSize: variables.fontSizeLarge,
            fontFamily: FontUtils.fontFamily.platform.EXP_NEUE_BOLD.fontFamily,
            fontWeight: FontUtils.fontFamily.platform.EXP_NEUE_BOLD.fontWeight,
            marginBottom: 8,
        },

        strong: {
            fontFamily: FontUtils.fontFamily.platform.EXP_NEUE_BOLD.fontFamily,
            fontWeight: FontUtils.fontFamily.platform.EXP_NEUE_BOLD.fontWeight,
        },

        em: {
            fontFamily: FontUtils.fontFamily.platform.EXP_NEUE_ITALIC.fontFamily,
            fontStyle: FontUtils.fontFamily.platform.EXP_NEUE_ITALIC.fontStyle,
        },

        autoCompleteSuggestionContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },

        rtlTextRenderForSafari: {
            textAlign: 'left',
            ...writingDirection.ltr,
        },

        emojiSuggestionsEmoji: {
            fontSize: variables.fontSizeMedium,
            width: 51,
            textAlign: 'center',
        },
        emojiSuggestionsText: {
            fontSize: variables.fontSizeMedium,
            flex: 1,
            ...wordBreak.breakWord,
            ...spacing.pr4,
        },
        emojiTooltipWrapper: {
            ...spacing.p2,
            borderRadius: 8,
        },
        customEmojiFont: FontUtils.fontFamily.single.CUSTOM_EMOJI_FONT,

        mentionSuggestionsAvatarContainer: {
            width: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
        },

        mentionSuggestionsText: {
            fontSize: variables.fontSizeMedium,
            ...spacing.ml2,
        },

        mentionSuggestionsDisplayName: {
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
        },

        reportStatusContainer: {
            paddingHorizontal: 4,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: variables.componentBorderRadiusSmall,
            height: 16,
        },

        reportStatusText: {
            fontSize: variables.fontSizeSmall,
            fontWeight: FontUtils.fontWeight.normal,
        },

        textSupporting: {
            color: theme.textSupporting,
        },

        navigationTabBarLabel: {
            lineHeight: 14,
        },

        link: link(theme),

        emailLink: emailLink(theme),

        highlightBG: {
            backgroundColor: theme.highlightBG,
        },

        appBG: {
            backgroundColor: theme.appBG,
        },

        reportLayoutGroupHeader: {
            paddingHorizontal: 12,
            marginTop: 16,
            marginBottom: 8,
            backgroundColor: theme.appBG,
            justifyContent: 'center',
        },

        fontSizeLabel: {
            fontSize: variables.fontSizeLabel,
        },

        fontSizeNormal: {
            fontSize: variables.fontSizeNormal,
        },

        h4: {
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            fontSize: variables.fontSizeLabel,
        },

        textAlignCenter: {
            textAlign: 'center',
        },

        textAlignRight: {
            textAlign: 'right',
        },

        textAlignLeft: {
            textAlign: 'left',
        },

        textWithMiddleEllipsisContainer: {
            width: '100%',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            display: 'flex',
            flexDirection: 'row',
        },

        textWithMiddleEllipsisText: {
            overflow: 'hidden',
            textOverflow: 'clip',
            whiteSpace: 'nowrap',
        },

        verticalAlignTopText: {
            verticalAlign: 'text-top',
        },
        verticalAlignTop: {
            verticalAlign: 'top',
        },

        lineHeightUndefined: {
            lineHeight: undefined,
        },

        heightUndefined: {
            height: undefined,
        },

        lineHeightLarge: {
            lineHeight: variables.lineHeightLarge,
        },

        lineHeightXLarge: {
            lineHeight: variables.lineHeightXLarge,
        },

        label: {
            fontSize: variables.fontSizeLabel,
            lineHeight: variables.lineHeightLarge,
        },

        textLabel: {
            color: theme.text,
            fontSize: variables.fontSizeLabel,
            lineHeight: variables.lineHeightLarge,
        },

        themeTextColor: {
            color: theme.text,
        },

        mutedTextLabel: {
            color: theme.textSupporting,
            fontSize: variables.fontSizeLabel,
            lineHeight: variables.lineHeightLarge,
        },

        mutedNormalTextLabel: {
            color: theme.textSupporting,
            fontSize: variables.fontSizeLabel,
            lineHeight: variables.lineHeightNormal,
        },

        textSmall: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeSmall,
        },

        textExtraSmall: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeExtraSmall,
        },

        textMicro: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeSmall,
            lineHeight: variables.lineHeightSmall,
        },

        textMicroBold: {
            color: theme.text,
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            fontSize: variables.fontSizeSmall,
            lineHeight: variables.lineHeightNormal,
        },

        textMicroBoldSupporting: {
            color: theme.textSupporting,
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            fontSize: variables.fontSizeSmall,
            lineHeight: variables.lineHeightNormal,
        },

        textMicroSupporting: {
            color: theme.textSupporting,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeSmall,
            lineHeight: variables.lineHeightSmall,
        },

        textSupportingNormal: {
            color: theme.textSupporting,
            fontSize: variables.fontSizeNormal,
            lineHeight: variables.fontSizeNormalHeight,
        },

        textExtraSmallSupporting: {
            color: theme.textSupporting,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeExtraSmall,
            lineHeight: variables.lineHeightXSmall,
        },
        textDoubleDecker: {
            fontSize: variables.fontSizeSmall,
            opacity: 0.8,
            fontWeight: FontUtils.fontWeight.bold,
            lineHeight: 12,
        },
        noPaddingBottom: {
            paddingBottom: 0,
        },
        textNormal: {
            fontSize: variables.fontSizeNormal,
        },

        textNormalThemeText: {
            color: theme.text,
            fontSize: variables.fontSizeNormal,
        },

        textLarge: {
            fontSize: variables.fontSizeLarge,
        },

        textXXLarge: {
            fontSize: variables.fontSizeXXLarge,
        },

        textXXXLarge: {
            fontSize: variables.fontSizeXXXLarge,
        },

        textHero: {
            fontSize: variables.fontSizeHero,
            ...FontUtils.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM,
            lineHeight: variables.lineHeightHero,
        },

        textStrong: {
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
        },

        fontWeightNormal: {
            fontWeight: FontUtils.fontWeight.normal,
        },

        textHeadline: {
            ...headlineFont,
            ...whiteSpace.preWrap,
            color: theme.heading,
            fontSize: variables.fontSizeXLarge,
            lineHeight: variables.lineHeightXXXLarge,
        },

        textHeadlineH2: {
            ...headlineFont,
            ...whiteSpace.preWrap,
            color: theme.heading,
            fontSize: variables.fontSizeH2,
            lineHeight: variables.lineHeightSizeH2,
        },

        textHeadlineH1: {
            ...headlineFont,
            ...whiteSpace.preWrap,
            color: theme.heading,
            fontSize: variables.fontSizeXLarge,
            lineHeight: variables.lineHeightSizeH1,
        },

        textWhite: {
            color: theme.textLight,
        },

        textBlue: {
            color: theme.link,
        },

        textBold: {
            fontWeight: FontUtils.fontWeight.bold,
        },

        textItalic: {
            ...FontUtils.fontFamily.platform.MONOSPACE_ITALIC,
        },

        textMono: {
            ...FontUtils.fontFamily.platform.MONOSPACE,
        },

        textVersion: {
            color: theme.iconColorfulBackground,
            fontSize: variables.fontSizeNormal,
            lineHeight: variables.lineHeightNormal,
            ...FontUtils.fontFamily.platform.MONOSPACE,
            textAlign: 'center',
        },

        textWrap: {
            ...whiteSpace.preWrap,
        },

        textNoWrap: {
            ...whiteSpace.noWrap,
        },

        textLineHeightNormal: {
            lineHeight: variables.lineHeightNormal,
        },

        colorMuted: {
            color: theme.textSupporting,
        },

        bgTransparent: {
            backgroundColor: 'transparent',
        },

        opacity0: {
            opacity: 0,
        },

        opacitySemiTransparent: {
            opacity: 0.5,
        },

        opacity1: {
            opacity: 1,
        },

        textDanger: {
            color: theme.danger,
        },

        borderRadiusNormal: {
            borderRadius: variables.buttonBorderRadius,
        },

        borderRadiusComponentLarge: {
            borderRadius: variables.componentBorderRadiusLarge,
        },

        borderRadiusComponentNormal: {
            borderRadius: variables.componentBorderRadiusNormal,
        },

        navigationTabBarContainer: {
            flexDirection: 'row',
            height: variables.bottomTabHeight,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            backgroundColor: theme.appBG,
        },

        navigationTabBarItem: {
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
        },

        navigationTabBarFABItem: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
        },

        /**
         * Background style applied to navigation tab bar items when they are hovered.
         * Do not apply for the active/selected state, those already have their own styling.
         */
        navigationTabBarItemHovered: {
            backgroundColor: theme.sidebarHover,
        },

        leftNavigationTabBarContainer: {
            height: '100%',
            width: variables.navigationTabBarSize,
            position: 'fixed',
            left: 0,
            justifyContent: 'space-between',
            borderRightWidth: 1,
            borderRightColor: theme.border,
            backgroundColor: theme.appBG,
        },

        leftNavigationTabBarItem: {
            height: variables.navigationTabBarSize,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
        },

        leftNavigationTabBarFAB: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
        },

        button: {
            backgroundColor: theme.buttonDefaultBG,
            borderRadius: variables.buttonBorderRadius,
            minHeight: variables.componentSizeNormal,
            justifyContent: 'center',
            alignItems: 'center',
            ...spacing.ph3,
            ...spacing.pv0,
        },

        buttonContainer: {
            borderRadius: variables.buttonBorderRadius,
        },

        buttonText: {
            color: theme.text,
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            fontSize: variables.fontSizeNormal,
            textAlign: 'center',
            flexShrink: 1,

            // It is needed to unset the line height. We don't need it for buttons as button always contains single line of text.
            // It allows to vertically center the text.
            lineHeight: undefined,

            // Add 1px to the Button text to give optical vertical alignment.
            paddingBottom: 1,
        },

        testRowContainer: {
            ...flex.flexRow,
            ...flex.justifyContentBetween,
            ...flex.alignItemsCenter,
            ...sizing.mnw120,
            ...spacing.gap4,
            minHeight: 64,
        },

        buttonSmall: {
            borderRadius: variables.buttonBorderRadius,
            minHeight: variables.componentSizeSmall,
            minWidth: variables.componentSizeSmall,
            paddingHorizontal: 12,
            backgroundColor: theme.buttonDefaultBG,
        },

        buttonExtraSmall: {
            borderRadius: variables.buttonBorderRadius,
            minHeight: variables.componentSizeXSmall,
            minWidth: variables.componentSizeXSmall,
            paddingHorizontal: 8,
            backgroundColor: theme.buttonDefaultBG,
        },

        buttonMedium: {
            borderRadius: variables.buttonBorderRadius,
            minHeight: variables.componentSizeNormal,
            minWidth: variables.componentSizeNormal,
            paddingHorizontal: 16,
            backgroundColor: theme.buttonDefaultBG,
        },

        buttonLarge: {
            borderRadius: variables.buttonBorderRadius,
            minHeight: variables.componentSizeLarge,
            minWidth: variables.componentSizeLarge,
            paddingHorizontal: 20,
            backgroundColor: theme.buttonDefaultBG,
        },

        buttonSmallText: {
            fontSize: variables.fontSizeSmall,
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            textAlign: 'center',
        },

        buttonExtraSmallText: {
            fontSize: variables.fontSizeExtraSmall,
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            textAlign: 'center',
        },

        buttonMediumText: {
            fontSize: variables.fontSizeLabel,
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            textAlign: 'center',
        },

        buttonLargeText: {
            fontSize: variables.fontSizeNormal,
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            textAlign: 'center',
        },

        buttonDefaultHovered: {
            backgroundColor: theme.buttonHoveredBG,
            borderWidth: 0,
        },

        buttonDefaultSelected: {
            backgroundColor: theme.buttonPressedBG,
            borderWidth: 0,
        },

        buttonSuccess: {
            backgroundColor: theme.success,
            borderWidth: 0,
        },

        buttonOpacityDisabled: {
            opacity: 0.5,
        },

        buttonSuccessHovered: {
            backgroundColor: theme.successHover,
            borderWidth: 0,
        },

        buttonDanger: {
            backgroundColor: theme.danger,
            borderWidth: 0,
        },

        buttonDangerHovered: {
            backgroundColor: theme.dangerHover,
            borderWidth: 0,
        },

        buttonDisabled: {
            backgroundColor: theme.buttonDefaultBG,
            borderWidth: 0,
        },

        buttonDivider: {
            borderRightWidth: 1,
            borderRightColor: theme.buttonHoveredBG,
            ...sizing.h100,
        },

        buttonSuccessDivider: {
            borderRightWidth: 1,
            borderRightColor: theme.successHover,
            ...sizing.h100,
        },

        noBorderRadius: {
            borderRadius: 0,
        },

        noRightBorderRadius: {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
        },

        noLeftBorderRadius: {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
        },

        buttonCTAIcon: {
            marginRight: 22,
            marginLeft: 8,
            // Align vertically with the Button text
            paddingBottom: 1,
            paddingTop: 1,
        },

        buttonConfirm: {
            margin: 20,
        },

        attachmentButtonBigScreen: {
            minWidth: 300,
            alignSelf: 'center',
        },

        buttonConfirmText: {
            paddingLeft: 20,
            paddingRight: 20,
        },

        buttonSuccessText: {
            color: theme.buttonSuccessText,
        },

        buttonDangerText: {
            color: theme.textLight,
        },

        buttonBlendContainer: {
            backgroundColor: theme.appBG,
            opacity: 1,
            position: 'relative',
            overflow: 'hidden',
        },

        actionableItemButton: {
            paddingTop: 8,
            paddingBottom: 8,
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.border,
            alignItems: 'flex-start',
            borderRadius: variables.componentBorderRadiusMedium,
        },

        actionableItemButtonBackgroundHovered: {
            borderColor: theme.buttonPressedBG,
        },

        actionableItemButtonHovered: {
            borderWidth: 1,
        },

        hoveredComponentBG: {
            backgroundColor: theme.hoverComponentBG,
        },

        activeComponentBG: {
            backgroundColor: theme.activeComponentBG,
        },

        messagesRowHeight: {
            height: variables.componentSizeXSmall,
        },

        touchableButtonImage: {
            alignItems: 'center',
            height: variables.componentSizeNormal,
            justifyContent: 'center',
            width: variables.componentSizeNormal,
        },

        visuallyHidden: {
            ...visibility.hidden,
            overflow: 'hidden',
            width: 0,
            height: 0,
        },

        visibilityHidden: {
            ...visibility.hidden,
        },

        visibilityVisible: {
            ...visibility.visible,
        },

        loadingVBAAnimation: {
            width: 140,
            height: 140,
        },

        loadingVBAAnimationWeb: {
            width: 140,
            height: 140,
        },
        defaultBadge: {
            backgroundColor: theme.transparent,
            borderWidth: 1,
            borderRadius: variables.componentBorderRadiusSmall,
            borderColor: theme.buttonHoveredBG,
            paddingHorizontal: 12,
            minHeight: 28,
            height: variables.iconSizeNormal,
            flexDirection: 'row',
            alignItems: 'center',
        },

        cardBadge: {
            position: 'absolute',
            top: 20,
            left: 16,
            marginLeft: 0,
            paddingHorizontal: 8,
            minHeight: 20,
            borderColor: colors.productDark500,
        },

        environmentBadge: {
            minHeight: 12,
            borderRadius: 14,
            paddingHorizontal: 7,
            minWidth: 22,
            borderWidth: 0,
        },

        badgeSuccess: {
            borderColor: theme.success,
        },

        badgeEnvironmentSuccess: {
            backgroundColor: theme.success,
        },

        badgeSuccessPressed: {
            borderColor: theme.successHover,
        },

        badgeAdHocSuccess: {
            backgroundColor: theme.badgeAdHoc,
            minWidth: 28,
        },

        badgeAdHocSuccessPressed: {
            backgroundColor: theme.badgeAdHocHover,
        },

        badgeDanger: {
            borderColor: theme.danger,
        },

        badgeEnvironmentDanger: {
            backgroundColor: theme.danger,
        },

        badgeDangerPressed: {
            borderColor: theme.dangerPressed,
        },

        badgeBordered: {
            backgroundColor: theme.transparent,
            borderWidth: 1,
            borderRadius: variables.componentBorderRadiusSmall,
            borderColor: theme.border,
            paddingHorizontal: 12,
            minHeight: 28,
        },

        badgeNewFeature: {
            minHeight: 20,
            height: 20,
            paddingHorizontal: 8,
        },

        badgeText: {
            color: theme.text,
            fontSize: variables.fontSizeSmall,
            ...lineHeightBadge,
            ...whiteSpace.noWrap,
        },

        cardBadgeText: {
            color: colors.white,
            fontSize: variables.fontSizeExtraSmall,
        },

        border: {
            borderWidth: 1,
            borderRadius: variables.componentBorderRadius,
            borderColor: theme.border,
        },

        borderColorFocus: {
            borderColor: theme.borderFocus,
        },

        borderColorDanger: {
            borderColor: theme.danger,
        },

        textInputDisabledContainer: {
            // Adding disabled color theme to indicate user that the field is not editable.
            backgroundColor: theme.highlightBG,
            borderColor: theme.borderLighter,
        },

        textInputDisabled: {
            // Adding browser specific style to bring consistency between Safari and other platforms.
            // Applying the Webkit styles only to browsers as it is not available in native.
            ...(getBrowser()
                ? {
                      WebkitTextFillColor: theme.textSupporting,
                      WebkitOpacity: 1,
                  }
                : {}),
            color: theme.textSupporting,
        },

        uploadFileViewTextContainer: {
            paddingHorizontal: 40,
            ...sizing.w100,
        },

        cameraView: {
            flex: 1,
            overflow: 'hidden',
            borderRadius: variables.componentBorderRadiusXLarge,
            borderStyle: 'solid',
            borderWidth: variables.componentBorderWidth,
            backgroundColor: theme.highlightBG,
            borderColor: theme.appBG,
            display: 'flex',
            justifyContent: 'center',
            justifyItems: 'center',
        },

        cameraFocusIndicator: {
            position: 'absolute',
            left: -32,
            top: -32,
            width: 64,
            height: 64,
            borderRadius: 32,
            borderWidth: 2,
            borderColor: theme.white,
            pointerEvents: 'none',
        },

        permissionView: {
            paddingVertical: 108,
            paddingHorizontal: 61,
            alignItems: 'center',
            justifyContent: 'center',
        },

        invisiblePDF: {
            position: 'absolute',
            opacity: 0,
            width: 1,
            height: 1,
        },

        headerAnonymousFooter: {
            color: theme.heading,
            ...FontUtils.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM,
            fontSize: variables.fontSizeXLarge,
            lineHeight: variables.lineHeightXXLarge,
        },

        headerText: {
            color: theme.heading,
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            fontSize: variables.fontSizeNormal,
        },

        reportOptions: {
            marginLeft: 8,
        },

        chatItemComposeSecondaryRow: {
            height: CONST.CHAT_FOOTER_SECONDARY_ROW_HEIGHT,
            marginBottom: CONST.CHAT_FOOTER_SECONDARY_ROW_PADDING,
            marginTop: CONST.CHAT_FOOTER_SECONDARY_ROW_PADDING,
        },

        chatItemComposeSecondaryRowSubText: {
            color: theme.textSupporting,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeSmall,
            lineHeight: variables.lineHeightSmall,
        },

        chatItemComposeSecondaryRowOffset: {
            marginLeft: variables.chatInputSpacing,
        },

        offlineIndicatorContainer: {
            height: CONST.OFFLINE_INDICATOR_HEIGHT,
        },

        deletedAttachmentIndicator: {
            zIndex: 20,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
        },

        deletedIndicatorOverlay: {
            opacity: 0.8,
        },

        // Actions
        actionAvatar: {
            borderRadius: 20,
        },

        componentHeightLarge: {
            height: variables.inputHeight,
        },

        calendarHeader: {
            height: 50,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            ...userSelect.userSelectNone,
        },

        calendarDayRoot: {
            flex: 1,
            height: CONST.CALENDAR_PICKER_DAY_HEIGHT,
            justifyContent: 'center',
            alignItems: 'center',
            ...userSelect.userSelectNone,
        },

        calendarBodyContainer: {
            height: CONST.CALENDAR_PICKER_DAY_HEIGHT * CONST.MAX_CALENDAR_PICKER_ROWS,
        },
        calendarWeekContainer: {
            height: CONST.CALENDAR_PICKER_DAY_HEIGHT,
        },

        calendarDayContainer: {
            width: 30,
            height: 30,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 15,
            overflow: 'hidden',
        },

        buttonDefaultBG: {
            backgroundColor: theme.buttonDefaultBG,
        },

        buttonHoveredBG: {
            backgroundColor: theme.buttonHoveredBG,
        },

        textInputContainer: {
            flex: 1,
            justifyContent: 'center',
            height: '100%',
            backgroundColor: theme.appBG,
            overflow: 'hidden',
            borderWidth: 1,
            padding: 8,
            paddingBottom: 0,
            borderRadius: 8,
            borderColor: theme.border,
        },

        cannotBeEditedSplitInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 4,
            marginVertical: 15,
            borderWidth: 1,
            borderColor: 'transparent',
        },

        removeSpacing: {
            marginVertical: 0,
            paddingHorizontal: 0,
        },

        outlinedButton: {
            backgroundColor: 'transparent',
            borderColor: theme.border,
            borderWidth: 1,
        },

        optionRowAmountInput: {
            textAlign: 'right',
        },

        optionRowPercentInputContainer: {
            width: variables.splitExpensePercentageWidth,
        },

        optionRowPercentInput: {
            marginRight: 2,
        },

        textInputLabelContainer: {
            position: 'absolute',
            left: 8,
            paddingRight: 16,
            top: 0,
            width: '100%',
            zIndex: 1,
            transformOrigin: 'left center',
        },

        textInputLabel: {
            fontSize: variables.fontSizeNormal,
            color: theme.textSupporting,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
        },

        textInputLabelBackground: {
            position: 'absolute',
            top: 0,
            width: '100%',
            height: 23,
            backgroundColor: theme.componentBG,
        },

        baseTextInput: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeNormal,
            lineHeight: variables.lineHeightXLarge,
            color: theme.text,
            paddingTop: variables.inputPaddingTop,
            paddingBottom: variables.inputPaddingBottom,
            paddingLeft: 0,
            borderWidth: 0,
        },

        textInputMultiline: {
            scrollPadding: '23px 0 0 0',
        },

        textInputMultilineContainer: {
            height: '100%',
            paddingTop: variables.inputPaddingTop,
        },

        textInputLeftIconContainer: {
            justifyContent: 'center',
            paddingRight: 8,
        },

        secureInput: {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
        },

        textInput: {
            backgroundColor: 'transparent',
            borderRadius: variables.componentBorderRadiusNormal,
            height: variables.inputComponentSizeNormal,
            borderColor: theme.border,
            borderWidth: 1,
            color: theme.text,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeNormal,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 10,
            paddingBottom: 10,
            verticalAlign: 'middle',
        },

        textInputPrefixWrapper: {
            position: 'absolute',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: variables.inputPaddingTop,
            paddingBottom: variables.inputPaddingBottom,
            height: '100%',
        },

        textInputSuffixWrapper: {
            position: 'absolute',
            right: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: variables.inputPaddingTop,
            paddingBottom: variables.inputPaddingBottom,
        },

        textInputPrefix: {
            color: theme.text,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeNormal,
            verticalAlign: 'middle',
        },

        textInputSuffix: {
            color: theme.text,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeNormal,
            verticalAlign: 'middle',
        },

        pickerContainer: {
            borderBottomWidth: 2,
            paddingLeft: 0,
            borderStyle: 'solid',
            borderColor: theme.border,
            justifyContent: 'center',
            backgroundColor: 'transparent',
            height: variables.inputHeight,
            overflow: 'hidden',
        },

        pickerContainerSmall: {
            height: variables.inputHeightSmall,
        },

        pickerLabel: {
            position: 'absolute',
            left: 0,
            top: 6,
            zIndex: 1,
        },
        inputDisabled: {
            backgroundColor: theme.highlightBG,
            color: theme.icon,
        },

        labelStrong: {
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            fontSize: variables.fontSizeLabel,
            lineHeight: variables.lineHeightNormal,
        },

        textLabelSupporting: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeLabel,
            color: theme.textSupporting,
        },

        textLabelSupportingEmptyValue: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeNormal,
            color: theme.textSupporting,
        },

        textLabelSupportingNormal: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeLabel,
            color: theme.textSupporting,
        },

        textLabelError: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeLabel,
            color: theme.textError,
        },

        textFileUpload: {
            ...headlineFont,
            fontSize: variables.fontSizeXLarge,
            color: theme.text,
            textAlign: 'center',
        },

        textDropZone: {
            ...headlineFont,
            fontSize: variables.fontSizeXLarge,
            textAlign: 'center',
        },

        subTextFileUpload: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            lineHeight: variables.lineHeightLarge,
            textAlign: 'center',
            color: theme.text,
        },

        furtherDetailsText: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeSmall,
            color: theme.textSupporting,
        },

        lh14: {
            lineHeight: variables.lineHeightSmall,
        },

        lh16: {
            lineHeight: 16,
        },

        lh20: {
            lineHeight: 20,
        },

        lh140Percent: {
            lineHeight: '140%',
        },

        formHelp: {
            color: theme.textSupporting,
            fontSize: variables.fontSizeLabel,
            lineHeight: variables.lineHeightNormal,
            marginBottom: 4,
        },

        formError: {
            color: theme.textError,
            fontSize: variables.fontSizeLabel,
            lineHeight: variables.lineHeightNormal,
            marginBottom: 4,
        },

        formSuccess: {
            color: theme.success,
            fontSize: variables.fontSizeLabel,
            lineHeight: 18,
            marginBottom: 4,
        },

        signInPage: {
            backgroundColor: theme.highlightBG,
            minHeight: '100%',
            flex: 1,
        },

        signInPageHeroCenter: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
        },

        signInPageGradient: {
            height: '100%',
            width: 540,
            position: 'absolute',
            top: 0,
            left: 0,
        },

        signInPageGradientMobile: {
            height: 300,
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
        },

        signInBackground: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            minHeight: 700,
        },

        signInPageInner: {
            marginLeft: 'auto',
            marginRight: 'auto',
            height: '100%',
            width: '100%',
        },

        signInPageContentTopSpacer: {
            maxHeight: 132,
            minHeight: 24,
        },

        signInPageContentTopSpacerSmallScreens: {
            maxHeight: 132,
            minHeight: 45,
        },

        signInPageLeftContainer: {
            paddingLeft: 40,
            paddingRight: 40,
        },

        signInPageLeftContainerWide: {
            maxWidth: variables.sideBarWidth,
        },

        signInPageWelcomeFormContainer: {
            maxWidth: CONST.SIGN_IN_FORM_WIDTH,
        },

        signInPageWelcomeTextContainer: {
            width: CONST.SIGN_IN_FORM_WIDTH,
        },

        changeExpensifyLoginLinkContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            ...wordBreak.breakWord,
        },

        searchSplitContainer: {
            flex: 1,
            flexDirection: 'row',
            marginLeft: variables.navigationTabBarSize + variables.sideBarWithLHBWidth,
        },

        searchSidebar: {
            width: variables.sideBarWithLHBWidth,
            height: '100%',
            backgroundColor: theme.sidebar,
            justifyContent: 'space-between',
            borderRightWidth: 1,
            borderColor: theme.border,
            marginLeft: variables.navigationTabBarSize,
        },

        // Sidebar Styles
        sidebar: {
            backgroundColor: theme.sidebar,
            height: '100%',
        },

        canvasContainer: {
            // Adding border to prevent a bug with the appearance of lines during gesture events for MultiGestureCanvas
            borderWidth: 1,
            borderColor: theme.appBG,
        },

        sidebarAvatar: {
            borderRadius: variables.sidebarAvatarSize,
            height: variables.sidebarAvatarSize,
            width: variables.sidebarAvatarSize,
        },

        selectedAvatarBorder: {
            padding: 1,
            borderWidth: 2,
            borderRadius: 20,
            height: variables.sidebarAvatarSize + 6,
            width: variables.sidebarAvatarSize + 6,
            borderColor: theme.success,
            right: -3,
            top: -3,
        },

        floatingActionButton: {
            backgroundColor: theme.success,
            height: variables.componentSizeLarge,
            width: variables.componentSizeLarge,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
        },

        floatingSecondaryActionButton: {
            backgroundColor: theme.buttonDefaultBG,
            height: variables.componentSizeLarge,
            width: variables.componentSizeLarge,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
        },

        floatingActionButtonSmall: {
            width: variables.componentSizeNormal,
            height: variables.componentSizeNormal,
        },

        floatingCameraButton: {
            position: 'absolute',
            top: -variables.componentSizeLarge - 16,
            right: 16,
            zIndex: 10,
        },

        floatingCameraButtonAboveFab: {
            position: 'absolute',
            // floatingActionButton top property value (componentSizeLarge + 16) +
            // + floatingCameraButton height (componentSizeLarge) + gap (12) = 2 * componentSizeLarge + 28
            top: 2 * -variables.componentSizeLarge - 28,
            right: 16,
            zIndex: 10,
        },

        floatingActionButtonPosition: {
            position: 'absolute',
            top: -variables.componentSizeLarge - 16,
            right: 16,
            zIndex: 10,
        },

        floatingGpsButton: {
            position: 'absolute',
            // floatingCameraButton top property value (componentSizeLarge + 16) +
            // + floatingGpsButton height (componentSizeLarge) + gap (12) = 2 * componentSizeLarge + 28
            top: 2 * -variables.componentSizeLarge - 28,
            right: 16,
            zIndex: 10,
        },

        floatingGpsButtonAboveFab: {
            position: 'absolute',
            // floatingActionButton top property value (componentSizeLarge + 16) +
            // + floatingCameraButton height (componentSizeLarge) + gap (12) + floatingGpsButton height (componentSizeLarge) + gap (12) = 3 * variables.componentSizeLarge + 40
            top: 3 * -variables.componentSizeLarge - 40,
            right: 16,
            zIndex: 10,
        },

        topBarLabel: {
            color: theme.text,
            fontSize: variables.fontSizeXLarge,
            ...headlineFont,
        },

        breadcrumbsContainer: {
            minHeight: 24,
        },

        breadcrumb: {
            color: theme.textSupporting,
            fontSize: variables.breadcrumbsFontSize,
            ...headlineFont,
        },

        breadcrumbStrong: {
            color: theme.text,
            fontSize: variables.breadcrumbsFontSize,
        },

        breadcrumbSeparator: {
            color: theme.icon,
            fontSize: variables.breadcrumbsFontSize,
            ...headlineFont,
        },

        breadcrumbLogo: {
            top: 1.66, // Pixel-perfect alignment due to a small difference between logo height and breadcrumb text height
        },

        onboardingNavigatorOuterView: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },

        onlyEmojisText: {
            fontSize: variables.fontSizeOnlyEmojis,
            lineHeight: variables.fontSizeOnlyEmojisHeight,
        },

        onlyEmojisTextLineHeight: {
            lineHeight: variables.fontSizeOnlyEmojisHeight,
        },

        emojisWithTextFontSizeAligned: {
            fontSize: variables.fontSizeEmojisWithinText,
            marginVertical: -7,
        },

        customEmojiFontAlignment: {
            marginTop: -variables.fontSizeNormal,
        },

        emojisFontFamily: {
            fontFamily: FontUtils.fontFamily.platform.SYSTEM.fontFamily,
        },

        emojisWithTextFontSize: {
            fontSize: variables.fontSizeEmojisWithinText,
        },

        emojisWithTextFontFamily: {
            fontFamily: FontUtils.fontFamily.platform.SYSTEM.fontFamily,
        },

        createMenuContainer: {
            width: variables.sideBarWidth - 40,
            paddingVertical: variables.componentBorderRadiusLarge,
        },

        createMenuHeaderText: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeLabel,
            color: theme.textSupporting,
        },

        popoverMenuItem: {
            flexDirection: 'row',
            borderRadius: 0,
            paddingHorizontal: 20,
            paddingVertical: 12,
            justifyContent: 'space-between',
            width: '100%',
        },

        popoverMenuIcon: {
            width: variables.componentSizeNormal,
            justifyContent: 'center',
            alignItems: 'center',
        },

        popoverIconCircle: {
            backgroundColor: theme.buttonDefaultBG,
            borderRadius: variables.buttonBorderRadius,
            height: variables.h40,
            width: variables.w46,
        },

        rightLabelMenuItem: {
            fontSize: variables.fontSizeLabel,
            color: theme.textSupporting,
        },

        popoverMenuText: {
            fontSize: variables.fontSizeNormal,
            color: theme.heading,
        },

        popoverInnerContainer: {
            paddingTop: 0, // adjusting this because the mobile modal adds additional padding that we don't need for our layout
            backgroundColor: theme.modalBackground,
        },

        chatLinkRowPressable: {
            minWidth: 0,
            textDecorationLine: 'none',
            flex: 1,
        },

        sidebarLink: {
            textDecorationLine: 'none',
        },

        sidebarLinkInner: {
            alignItems: 'center',
            flexDirection: 'row',
            paddingLeft: 20,
            paddingRight: 20,
        },

        sidebarLinkInnerLHN: {
            alignItems: 'center',
            flexDirection: 'row',
            paddingLeft: 8,
            paddingRight: 8,
            marginHorizontal: 12,
            borderRadius: variables.componentBorderRadiusNormal,
        },

        sidebarLinkText: {
            color: theme.textSupporting,
            fontSize: variables.fontSizeNormal,
            textDecorationLine: 'none',
            overflow: 'hidden',
        },

        sidebarLinkHover: {
            backgroundColor: theme.sidebarHover,
        },

        sidebarLinkActive: {
            backgroundColor: theme.activeComponentBG,
            textDecorationLine: 'none',
        },

        sidebarLinkTextBold: {
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            color: theme.heading,
        },

        sidebarLinkActiveText: {
            color: theme.textSupporting,
            fontSize: variables.fontSizeNormal,
            textDecorationLine: 'none',
            overflow: 'hidden',
        },

        optionItemAvatarNameWrapper: {
            minWidth: 0,
            flex: 1,
        },

        optionDisplayName: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            minHeight: variables.alternateTextHeight,
            lineHeight: variables.lineHeightXLarge,
            ...whiteSpace.noWrap,
        },

        optionDisplayNameCompact: {
            minWidth: 'auto',
            flexBasis: 'auto',
            flexGrow: 0,
            flexShrink: 1,
        },

        displayNameTooltipEllipsis: {
            position: 'absolute',
            opacity: 0,
            right: 0,
            bottom: 0,
        },

        optionAlternateText: {
            minHeight: variables.alternateTextHeight,
            lineHeight: variables.lineHeightXLarge,
        },

        optionAlternateTextCompact: {
            flexShrink: 1,
            flexGrow: 1,
            flexBasis: 'auto',
            ...optionAlternateTextPlatformStyles,
        },

        optionRow: {
            minHeight: variables.optionRowHeight,
            paddingTop: 12,
            paddingBottom: 12,
        },

        optionRowWithPadding: {
            paddingTop: 12,
            paddingBottom: 12,
        },

        optionRowDisabled: {
            color: theme.textSupporting,
        },

        optionRowCompact: {
            minHeight: variables.optionRowHeightCompact,
            paddingTop: 12,
            paddingBottom: 12,
        },

        optionsListSectionHeader: {
            marginTop: 8,
            marginBottom: 4,
        },

        emptyWorkspaceIllustrationStyle: {
            marginTop: 12,
            marginBottom: -20,
        },

        emptyWorkspaceListLottieIllustrationStyle: {
            marginTop: 12,
            marginBottom: -20,
            height: '100%',
        },
        emptyWorkspaceListStaticIllustrationStyle: {
            width: 203,
            height: 166,
        },

        appContent: {
            backgroundColor: theme.appBG,
            overflow: 'hidden',
        },

        appContentHeader: {
            height: variables.contentHeaderHeight,
            justifyContent: 'center',
            display: 'flex',
            paddingRight: 20,
        },

        appContentHeaderTitle: {
            alignItems: 'center',
            flexDirection: 'row',
        },

        LHNToggle: {
            alignItems: 'center',
            height: variables.contentHeaderHeight,
            justifyContent: 'center',
            paddingRight: 10,
        },

        chatContentScrollView: {
            flexGrow: 1,
            justifyContent: 'flex-start',
            paddingBottom: 16,
            ...chatContentScrollViewPlatformStyles,
        },

        // Chat Item
        chatItem: {
            display: 'flex',
            flexDirection: 'row',
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 20,
            paddingRight: 20,
        },

        chatItemRightGrouped: {
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 0,
            position: 'relative',
            marginLeft: variables.chatInputSpacing,
        },

        chatItemRight: {
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 'auto',
            position: 'relative',
        },

        chatItemMessageHeader: {
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
        },

        chatItemMessageHeaderSender: {
            color: theme.heading,
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            fontSize: variables.fontSizeNormal,
            lineHeight: variables.lineHeightXLarge,
            ...wordBreak.breakWord,
        },

        chatItemMessageHeaderTimestamp: {
            flexShrink: 0,
            color: theme.textSupporting,
            fontSize: variables.fontSizeSmall,
            paddingTop: 2,
        },

        chatItemMessageHeaderPolicy: {
            color: theme.textSupporting,
            fontSize: variables.fontSizeSmall,
        },

        chatItemMessage: {
            color: theme.text,
            fontSize: variables.fontSizeNormal,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            lineHeight: variables.lineHeightXLarge,
            maxWidth: '100%',
            ...whiteSpace.preWrap,
            ...wordBreak.breakWord,
        },

        chatDelegateMessage: {
            color: theme.textSupporting,
            fontSize: 11,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            lineHeight: variables.lineHeightXLarge,
            maxWidth: '100%',
            ...whiteSpace.preWrap,
            ...wordBreak.breakWord,
        },

        renderHTMLTitle: {
            color: theme.text,
            fontSize: variables.fontSizeNormal,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            lineHeight: variables.lineHeightXLarge,
            maxWidth: '100%',
            ...whiteSpace.preWrap,
            ...wordBreak.breakWord,
        },

        renderHTML: {
            maxWidth: '100%',
            ...whiteSpace.preWrap,
            ...wordBreak.breakWord,
        },

        chatItemComposeWithFirstRow: {
            minHeight: 90,
        },

        chatItemFullComposeRow: {
            ...sizing.h100,
        },

        chatItemComposeBoxColor: {
            borderColor: theme.border,
        },

        chatItemComposeBoxFocusedColor: {
            borderColor: theme.borderFocus,
        },

        chatItemComposeBox: {
            backgroundColor: theme.componentBG,
            borderWidth: 1,
            borderRadius: variables.componentBorderRadiusRounded,
            minHeight: variables.componentSizeMedium,
        },

        chatItemFullComposeBox: {
            ...flex.flex1,
            ...sizing.h100,
        },

        chatFooter: {
            paddingLeft: 20,
            paddingRight: 20,
            display: 'flex',
            backgroundColor: theme.appBG,
        },

        chatFooterFullCompose: {
            height: '100%',
            paddingTop: 20,
        },

        chatItemDraft: {
            display: 'flex',
            flexDirection: 'row',
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 20,
            paddingRight: 20,
        },

        chatItemReactionsDraftRight: {
            marginLeft: 52,
        },

        // Be extremely careful when editing the compose styles, as it is easy to introduce regressions.
        // Make sure you run the following tests against any changes: #12669
        textInputCompose: addOutlineWidth(
            theme,
            {
                backgroundColor: theme.componentBG,
                borderColor: theme.border,
                color: theme.text,
                ...FontUtils.fontFamily.platform.EXP_NEUE,
                fontSize: variables.fontSizeNormal,
                borderWidth: 0,
                height: 'auto',
                lineHeight: variables.lineHeightXLarge,
                ...overflowXHidden,

                // On Android, multiline TextInput with height: 'auto' will show extra padding unless they are configured with
                // paddingVertical: 0, alignSelf: 'center', and verticalAlign: 'middle'

                paddingHorizontal: variables.avatarChatSpacing,
                paddingTop: 0,
                paddingBottom: 0,
                alignSelf: 'center',
                verticalAlign: 'middle',
                ...(Platform.OS === 'android' && {
                    height: undefined,
                    lineHeight: undefined,
                    alignSelf: 'stretch',
                    flexGrow: 1,
                    flexShrink: 1,
                }),
            },
            0,
        ),

        textInputFullCompose: {
            alignSelf: 'stretch',
            flex: 1,
            maxHeight: '100%',
            verticalAlign: 'top',
        },

        textInputCollapseCompose: {
            maxHeight: '100%',
            flex: 4,
        },

        // composer padding should not be modified unless thoroughly tested against the cases in this PR: #12669
        textInputComposeSpacing: {
            paddingVertical: 5,
            ...flex.flexRow,
            flex: 1,
        },

        textInputComposeBorder: {
            borderLeftWidth: 1,
            borderColor: theme.border,
        },

        chatItemSubmitButton: {
            alignSelf: 'flex-end',
            borderRadius: variables.componentBorderRadiusRounded,
            backgroundColor: theme.transparent,
            height: 40,
            padding: 10,
            margin: 3,
            justifyContent: 'center',
        },

        emojiPickerContainer: {
            backgroundColor: theme.componentBG,
        },

        emojiHeaderContainer: {
            backgroundColor: theme.componentBG,
            display: 'flex',
            height: CONST.EMOJI_PICKER_HEADER_HEIGHT,
            justifyContent: 'center',
        },

        emojiSkinToneTitle: {
            ...spacing.pv1,
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            color: theme.heading,
            fontSize: variables.fontSizeSmall,
        },

        // Emoji Picker Styles
        emojiText: {
            textAlign: 'center',
            fontSize: variables.emojiSize,
            ...spacing.pv0,
            ...spacing.ph0,
            lineHeight: variables.emojiLineHeight,
        },

        emojiItem: {
            width: '100%',
            textAlign: 'center',
            borderRadius: 8,
            paddingTop: 2,
            paddingBottom: 2,
            height: CONST.EMOJI_PICKER_ITEM_HEIGHT,
            flexShrink: 1,
            ...userSelect.userSelectNone,
        },

        emojiItemHighlighted: {
            transition: '0.2s ease',
            backgroundColor: theme.buttonDefaultBG,
        },

        emojiItemKeyboardHighlighted: {
            transition: '0.2s ease',
            borderWidth: 1,
            borderColor: theme.link,
            borderRadius: variables.buttonBorderRadius,
        },

        categoryShortcutButton: {
            flex: 1,
            borderRadius: 8,
            height: CONST.EMOJI_PICKER_ITEM_HEIGHT,
            alignItems: 'center',
            justifyContent: 'center',
        },

        chatItemEmojiButton: {
            alignSelf: 'flex-end',
            borderRadius: variables.buttonBorderRadius,
            height: 40,
            marginVertical: 3,
            paddingHorizontal: 10,
            justifyContent: 'center',
        },

        editChatItemEmojiWrapper: {
            marginRight: 3,
            alignSelf: 'flex-end',
        },

        composerSizeButton: {
            alignSelf: 'center',
            height: 32,
            width: 32,
            padding: 6,
            marginHorizontal: 3,
            borderRadius: variables.componentBorderRadiusRounded,
            backgroundColor: theme.transparent,
            justifyContent: 'center',
        },

        chatItemPDFAttachmentLoading: {
            backgroundColor: 'transparent',
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: variables.componentBorderRadiusNormal,
            ...flex.alignItemsCenter,
            ...flex.justifyContentCenter,
        },

        exampleCheckImage: {
            width: '100%',
            height: 80,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: variables.componentBorderRadiusNormal,
        },

        singleAvatar: {
            height: 24,
            width: 24,
            backgroundColor: theme.icon,
            borderRadius: 12,
        },

        singleAvatarSmall: {
            height: 16,
            width: 16,
            backgroundColor: theme.icon,
            borderRadius: 8,
        },

        singleAvatarMedium: {
            height: 52,
            width: 52,
            backgroundColor: theme.icon,
            borderRadius: 52,
        },

        singleAvatarMediumLarge: {
            height: 60,
            width: 60,
            backgroundColor: theme.icon,
            borderRadius: 80,
        },

        secondAvatar: {
            position: 'absolute',
            right: -18,
            bottom: -18,
            borderWidth: 2,
            borderRadius: 14,
            borderColor: 'transparent',
        },

        secondAvatarSmall: {
            position: 'absolute',
            right: -14,
            bottom: -14,
            borderWidth: 2,
            borderRadius: 10,
            borderColor: 'transparent',
        },

        secondAvatarMedium: {
            position: 'absolute',
            right: -36,
            bottom: -36,
            borderWidth: 3,
            borderRadius: 52,
            borderColor: 'transparent',
        },

        secondAvatarMediumLarge: {
            position: 'absolute',
            right: -42,
            bottom: -42,
            borderWidth: 3,
            borderRadius: 80,
            borderColor: 'transparent',
        },

        secondAvatarSubscript: {
            position: 'absolute',
            right: -6,
            bottom: -6,
        },

        secondAvatarSubscriptXLarge: {
            position: 'absolute',
            right: -10,
            bottom: -10,
        },

        secondAvatarSubscriptCompact: {
            position: 'absolute',
            bottom: -4,
            right: -4,
        },

        secondAvatarSubscriptSmallNormal: {
            position: 'absolute',
            bottom: 0,
            right: 0,
        },

        secondAvatarInline: {
            bottom: -3,
            right: -25,
            borderWidth: 3,
            borderRadius: 18,
            borderColor: theme.cardBorder,
            backgroundColor: theme.appBG,
        },

        avatarXLarge: {
            width: variables.avatarSizeXLarge,
            height: variables.avatarSizeXLarge,
        },

        avatarInnerText: {
            color: theme.text,
            fontSize: variables.fontSizeSmall,
            lineHeight: undefined,
            marginLeft: -3,
            textAlign: 'center',
        },

        avatarInnerTextSmall: {
            color: theme.text,
            fontSize: variables.fontSizeExtraSmall,
            lineHeight: undefined,
            marginLeft: -2,
            textAlign: 'center',
            zIndex: 10,
        },

        emptyAvatar: {
            height: variables.avatarSizeNormal,
            width: variables.avatarSizeNormal,
        },

        emptyAvatarSmall: {
            height: variables.avatarSizeSmall,
            width: variables.avatarSizeSmall,
        },

        emptyAvatarSmaller: {
            height: variables.avatarSizeSmaller,
            width: variables.avatarSizeSmaller,
        },

        emptyAvatarMedium: {
            height: variables.avatarSizeMedium,
            width: variables.avatarSizeMedium,
        },

        emptyAvatarLarge: {
            height: variables.avatarSizeLarge,
            width: variables.avatarSizeLarge,
        },

        emptyAvatarXLarge: {
            height: variables.avatarSizeXLarge,
            width: variables.avatarSizeXLarge,
        },

        emptyAvatarMargin: {
            marginRight: variables.avatarChatSpacing,
        },

        emptyAvatarMarginChat: {
            marginRight: variables.avatarChatSpacing - 12,
        },

        emptyAvatarMarginSmall: {
            marginRight: variables.avatarChatSpacing - 4,
        },

        emptyAvatarMarginSmaller: {
            marginRight: variables.avatarChatSpacing - 4,
        },

        borderTop: {
            borderTopWidth: variables.borderTopWidth,
            borderColor: theme.border,
        },

        borderTopRounded: {
            borderTopWidth: 1,
            borderColor: theme.border,
            borderTopLeftRadius: variables.componentBorderRadiusNormal,
            borderTopRightRadius: variables.componentBorderRadiusNormal,
        },

        borderBottomRounded: {
            borderBottomWidth: 1,
            borderColor: theme.border,
            borderBottomLeftRadius: variables.componentBorderRadiusNormal,
            borderBottomRightRadius: variables.componentBorderRadiusNormal,
        },

        borderBottom: {
            borderBottomWidth: 1,
            borderColor: theme.border,
        },

        borderBottomHovered: {
            borderBottomWidth: 1,
            borderColor: theme.buttonHoveredBG,
        },

        borderNone: {
            borderWidth: 0,
            borderBottomWidth: 0,
        },
        borderTransparent: {
            borderColor: 'transparent',
        },

        borderRight: {
            borderRightWidth: 1,
            borderColor: theme.border,
        },

        borderLeft: {
            borderLeftWidth: 1,
            borderColor: theme.border,
        },

        pointerEventsNone,

        pointerEventsAuto,

        pointerEventsBoxNone,

        headerBar: {
            overflow: 'hidden',
            justifyContent: 'center',
            display: 'flex',
            paddingLeft: 20,
            height: variables.contentHeaderHeight,
            width: '100%',
        },

        reportSearchHeaderBar: {
            justifyContent: 'center',
            display: 'flex',
            width: '100%',
            height: 40,
        },

        searchResultsHeaderBar: {
            display: 'flex',
            height: variables.contentHeaderDesktopHeight,
            zIndex: variables.popoverZIndex,
            position: 'relative',
            paddingLeft: 20,
            paddingRight: 12,
        },

        headerBarHeight: {
            height: variables.contentHeaderHeight,
        },

        imageViewContainer: {
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        },

        imageModalPDF: {
            flex: 1,
            backgroundColor: theme.modalBackground,
        },

        imageModalImageCenterContainer: {
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            width: '100%',
        },

        defaultAttachmentView: {
            backgroundColor: theme.sidebar,
            borderRadius: variables.componentBorderRadiusNormal,
            borderWidth: 1,
            borderColor: theme.border,
            flexDirection: 'row',
            padding: 20,
            alignItems: 'center',
        },

        notFoundTextHeader: {
            ...headlineFont,
            color: theme.heading,
            fontSize: variables.fontSizeXLarge,
            lineHeight: variables.lineHeightXXLarge,
            marginVertical: 20,
            textAlign: 'center',
        },

        blockingViewContainer: {
            paddingBottom: variables.contentHeaderHeight,
            maxWidth: 400,
            alignSelf: 'center',
        },

        searchBlockingErrorViewContainer: {
            paddingBottom: variables.contentHeaderHeight,
            maxWidth: 475,
            alignSelf: 'center',
        },

        companyCardsBlockingErrorViewContainer: {
            maxWidth: 475,
            alignSelf: 'center',
            flex: undefined,
        },

        forcedBlockingViewContainer: {
            ...positioning.pFixed,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.appBG,
        },

        defaultModalContainer: {
            backgroundColor: theme.componentBG,
            borderColor: theme.transparent,
        },

        modalAnimatedContainer: {width: '100%'},

        modalContainerBox: {
            zIndex: 2,
            opacity: 1,
            backgroundColor: 'transparent',
        },

        modalBackdrop: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'black',
        },

        reportActionContextMenuMiniButton: {
            height: 28,
            width: 28,
            ...flex.alignItemsCenter,
            ...flex.justifyContentCenter,
            ...{borderRadius: variables.buttonBorderRadius},
        },

        reportActionSystemMessageContainer: {
            marginLeft: 42,
        },

        reportDetailsTitleContainer: {
            ...display.dFlex,
            ...flex.flexColumn,
            ...flex.alignItemsCenter,
            paddingHorizontal: 20,
        },

        reportDetailsRoomInfo: {
            ...flex.flex1,
            ...display.dFlex,
            ...flex.flexColumn,
            ...flex.alignItemsCenter,
        },

        reportSettingsVisibilityText: {
            textTransform: 'capitalize',
        },

        settingsPageBackground: {
            flexDirection: 'column',
            width: '100%',
            flexGrow: 1,
        },

        settingsPageBody: {
            width: '100%',
            justifyContent: 'space-around',
        },

        twoFactorAuthSection: {
            backgroundColor: theme.appBG,
            padding: 0,
        },

        twoFactorLoadingContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            height: 210,
        },

        twoFactorAuthCodesContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
        },

        twoFactorAuthCode: {
            ...FontUtils.fontFamily.platform.MONOSPACE,
            width: 112,
            textAlign: 'center',
        },

        twoFactorAuthCodesButtonsContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 12,
            marginTop: 20,
            flexWrap: 'wrap',
        },

        twoFactorAuthCodesButton: {
            minWidth: 112,
        },

        twoFactorAuthCopyCodeButton: {
            minWidth: 110,
        },

        anonymousRoomFooterLogo: {
            width: 88,
            marginLeft: 0,
            height: 20,
        },
        anonymousRoomFooterLogoTaglineText: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeMedium,
            color: theme.text,
        },
        signInButtonAvatar: {
            width: 80,
        },

        anonymousRoomFooterSignInButton: {
            width: 110,
        },

        roomHeaderAvatarSize: {
            height: variables.componentSizeLarge,
            width: variables.componentSizeLarge,
        },

        roomHeaderAvatar: {
            backgroundColor: theme.appBG,
            borderRadius: 100,
            borderColor: theme.componentBG,
            borderWidth: 4,
        },

        roomHeaderAvatarOverlay: {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: theme.overlay,
            opacity: variables.overlayOpacity,
            borderRadius: 88,
        },

        avatarInnerTextChat: {
            color: theme.text,
            fontSize: variables.fontSizeXLarge,
            ...FontUtils.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM,
            textAlign: 'center',
            position: 'absolute',
            width: 88,
            left: -16,
        },

        pageWrapper: {
            width: '100%',
            alignItems: 'center',
            padding: 20,
        },
        numberPadWrapper: {
            width: '100%',
            alignItems: 'center',
            paddingHorizontal: 20,
        },

        avatarSectionWrapper: {
            width: '100%',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingBottom: 20,
        },

        avatarSectionWrapperSkeleton: {
            width: '100%',
        },

        accountSettingsSectionContainer: {
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            ...spacing.mt0,
            ...spacing.mb0,
            ...spacing.pt0,
        },

        centralPaneAnimation: {
            height: CONST.CENTRAL_PANE_ANIMATION_HEIGHT,
        },

        sectionTitle: {
            ...spacing.pv2,
            ...spacing.ph2,
            fontSize: 13,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            lineHeight: 16,
            color: theme.textSupporting,
        },

        accountSettingsSectionTitle: {
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
        },

        borderedContentCard: {
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: variables.componentBorderRadiusNormal,
        },

        borderedContentCardLarge: {
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: variables.componentBorderRadiusLarge,
        },

        sectionMenuItem: {
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            height: 52,
            alignItems: 'center',
        },

        sectionSelectCircle: {
            backgroundColor: theme.cardBG,
        },

        sectionMenuItemTopDescription: {
            ...spacing.ph8,
            ...spacing.mhn8,
            width: 'auto',
        },

        subscriptionCardIcon: {
            padding: 10,
            backgroundColor: theme.border,
            borderRadius: variables.componentBorderRadius,
            height: variables.iconSizeExtraLarge,
            width: variables.iconSizeExtraLarge,
        },

        subscriptionAddedCardIcon: {
            padding: 10,
            backgroundColor: theme.buttonDefaultBG,
            borderRadius: variables.componentBorderRadius,
            height: variables.iconSizeExtraLarge,
            width: variables.iconSizeExtraLarge,
        },

        trialBannerBackgroundColor: {
            backgroundColor: theme.trialBannerBackgroundColor,
        },

        selectCircle: {
            width: variables.componentSizeSmall,
            height: variables.componentSizeSmall,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: variables.componentSizeSmall / 2,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.componentBG,
            marginLeft: 8,
        },

        optionSelectCircle: {
            borderRadius: variables.componentSizeSmall / 2 + 1,
            padding: 1,
        },

        unreadIndicatorContainer: {
            position: 'absolute',
            top: -10,
            left: 0,
            width: '100%',
            height: 20,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            zIndex: 1,
            ...cursor.cursorDefault,
        },

        topUnreadIndicatorContainer: {
            position: 'relative',
            width: '100%',
            /** 17 = height of the indicator 1px + 8px top and bottom */
            height: 17,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            zIndex: 1,
            ...cursor.cursorDefault,
        },

        unreadIndicatorLine: {
            height: 1,
            backgroundColor: theme.unreadIndicator,
            flexGrow: 1,
            marginRight: 8,
            opacity: 0.5,
        },

        threadDividerLine: {
            height: 1,
            backgroundColor: theme.border,
            flexGrow: 1,
            marginLeft: 8,
            marginRight: 20,
        },

        dividerLine: {
            height: 1,
            maxHeight: 1,
            backgroundColor: theme.border,
            flexGrow: 1,
            ...spacing.mh5,
            ...spacing.mv3,
        },

        sectionDividerLine: {
            height: 1,
            backgroundColor: theme.border,
        },

        unreadIndicatorText: {
            color: theme.unreadIndicator,
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            fontSize: variables.fontSizeSmall,
            textTransform: 'capitalize',
        },

        threadDividerText: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeSmall,
            textTransform: 'capitalize',
        },

        flipUpsideDown: {
            transform: `rotate(180deg)`,
        },

        navigationScreenCardStyle: {
            height: '100%',
        },

        invisible: {
            position: 'absolute',
            opacity: 0,
        },

        invisiblePopover: {
            position: 'absolute',
            opacity: 0,
            left: -9999,
            top: -9999,
        },

        containerWithSpaceBetween: {
            justifyContent: 'space-between',
            width: '100%',
            flex: 1,
        },

        detailsPageSectionContainer: {
            alignSelf: 'flex-start',
        },

        attachmentCarouselContainer: {
            height: '100%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            ...cursor.cursorUnset,
        },

        attachmentArrow: {
            zIndex: 23,
            position: 'absolute',
        },

        attachmentRevealButtonContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            ...spacing.ph4,
        },

        arrowIcon: {
            height: 40,
            width: 40,
            alignItems: 'center',
            paddingHorizontal: 0,
            paddingTop: 0,
            paddingBottom: 0,
        },

        switchTrack: {
            width: 50,
            height: 28,
            justifyContent: 'center',
            borderRadius: 20,
            padding: 15,
        },

        switchThumb: {
            width: 22,
            height: 22,
            borderRadius: 11,
            position: 'absolute',
            left: 4,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.appBG,
        },

        radioButtonContainer: {
            backgroundColor: theme.componentBG,
            borderRadius: 14,
            height: 28,
            width: 28,
            borderColor: theme.border,
            borderWidth: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },

        newRadioButtonContainer: {
            backgroundColor: theme.componentBG,
            borderRadius: variables.componentBorderRadiusRounded,
            height: variables.iconSizeNormal,
            width: variables.iconSizeNormal,
            borderColor: theme.border,
            borderWidth: 2,
            justifyContent: 'center',
            alignItems: 'center',
        },

        toggleSwitchLockIcon: {
            width: variables.iconSizeExtraSmall,
            height: variables.iconSizeExtraSmall,
        },

        checkedContainer: {
            backgroundColor: theme.checkBox,
        },

        magicCodeInputContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            height: variables.inputHeight,
        },

        magicCodeInput: {
            fontSize: variables.fontSizeXLarge,
            color: theme.heading,
            lineHeight: variables.lineHeightXXXLarge,
        },

        magicCodeInputValueContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
        },

        magicCodeInputCursorContainer: {
            position: 'absolute',
            textAlign: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            overflow: 'visible',
            width: '100%',
        },

        magicCodeInputCursor: {
            fontSize: 24,
            color: theme.heading,
            fontFamily: FontUtils.fontFamily.platform.EXP_NEUE.fontFamily,
            fontWeight: FontUtils.fontWeight.normal,
        },

        // Manually style transparent, in iOS Safari, an input in a container with its opacity set to
        // 0 (completely transparent) cannot handle user interaction, hence the Paste option is never shown
        inputTransparent: {
            color: 'transparent',
            // These properties are available in browser only
            ...(getBrowser()
                ? {
                      caretColor: 'transparent',
                      WebkitTextFillColor: 'transparent',
                      // After setting the input text color to transparent, it acquires the background-color.
                      // However, it is not possible to override the background-color directly as explained in this resource: https://developer.mozilla.org/en-US/docs/Web/CSS/:autofill
                      // Therefore, the transition effect needs to be delayed.
                      transitionDelay: '99999s',
                      transitionProperty: 'background-color',
                  }
                : {}),
        },

        iouAmountText: {
            ...headlineFont,
            fontSize: variables.iouAmountTextSize,
            color: theme.heading,
            lineHeight: variables.inputHeight,
        },

        iouAmountTextInput: addOutlineWidth(
            theme,
            {
                ...headlineFont,
                fontSize: variables.iouAmountTextSize,
                color: theme.heading,
                lineHeight: undefined,
                paddingHorizontal: 0,
                paddingVertical: 0,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
            },
            0,
        ),

        iouAmountTextInputContainer: {
            borderWidth: 0,
            borderBottomWidth: 0,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
        },

        moneyRequestConfirmationAmount: {
            ...headlineFont,
            fontSize: variables.fontSizeH1,
        },

        moneyRequestMenuItem: {
            flexDirection: 'row',
            borderRadius: 0,
            justifyContent: 'space-between',
            width: '100%',
            paddingHorizontal: 20,
            paddingVertical: 12,
        },

        moneyRequestAmountContainer: {minHeight: variables.inputHeight + 2 * (variables.formErrorLineHeight + 8)},

        requestPreviewBox: {
            marginTop: 12,
            maxWidth: variables.reportPreviewMaxWidth,
        },

        moneyRequestPreviewBox: {
            backgroundColor: theme.cardBG,
            borderRadius: variables.componentBorderRadiusLarge,
            maxWidth: variables.reportPreviewMaxWidth,
            width: '100%',
        },

        amountSplitPadding: {
            paddingTop: 2,
        },

        moneyRequestPreviewBoxAvatar: {
            // This should "hide" the right border of the last avatar
            marginRight: -2,
            marginBottom: 0,
        },

        moneyRequestLoadingHeight: {
            height: 27,
        },

        defaultCheckmarkWrapper: {
            marginLeft: 8,
            alignSelf: 'center',
        },

        fullScreenLoading: {
            backgroundColor: theme.componentBG,
            opacity: 0.8,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
        },

        reimbursementAccountFullScreenLoading: {
            backgroundColor: theme.componentBG,
            opacity: 0.8,
            justifyContent: 'flex-start',
            alignItems: 'center',
            zIndex: 10,
        },

        hiddenElementOutsideOfWindow: {
            position: 'absolute',
            top: -10000,
            left: 0,
            opacity: 0,
        },

        growlNotificationWrapper: {
            zIndex: 2,
        },

        growlNotificationContainer: {
            flex: 1,
            justifyContent: 'flex-start',
            position: 'absolute',
            width: '100%',
            top: 20,
            ...spacing.pl5,
            ...spacing.pr5,
        },

        growlNotificationDesktopContainer: {
            maxWidth: variables.sideBarWidth,
            right: 0,
            ...positioning.pFixed,
        },

        growlNotificationBox: {
            backgroundColor: theme.inverse,
            borderRadius: variables.componentBorderRadiusNormal,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            boxShadow: `${theme.shadow}`,
            ...spacing.p5,
        },

        growlNotificationText: {
            fontSize: variables.fontSizeNormal,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            width: '90%',
            lineHeight: variables.fontSizeNormalHeight,
            color: theme.textReversed,
            ...spacing.ml4,
        },

        noSelect: {
            boxShadow: 'none',
            // After https://github.com/facebook/react-native/pull/46284 RN accepts only 3 options and undefined
            outlineStyle: undefined,
        },

        boxShadowNone: {
            boxShadow: 'none',
        },

        smallEditIcon: {
            alignItems: 'center',
            backgroundColor: theme.buttonDefaultBG,
            borderRadius: 20,
            borderWidth: 3,
            color: theme.textReversed,
            height: 40,
            width: 40,
            justifyContent: 'center',
        },

        smallEditIconWorkspace: {
            borderColor: theme.cardBG,
        },

        smallEditIconAccount: {
            borderColor: theme.appBG,
        },

        smallAvatarEditIcon: {
            position: 'absolute',
            right: -8,
            bottom: -8,
        },

        primaryMediumIcon: {
            alignItems: 'center',
            backgroundColor: theme.buttonDefaultBG,
            borderRadius: 20,
            color: theme.textReversed,
            height: 40,
            width: 40,
            justifyContent: 'center',
        },

        primaryMediumText: {
            fontSize: variables.iconSizeNormal,
        },

        workspaceOwnerAvatarWrapper: {
            margin: 6,
        },

        workspaceOwnerSectionTitle: {
            marginLeft: 6,
        },

        workspaceOwnerSectionMinWidth: {
            minWidth: 180,
        },

        workspaceTypeWrapper: {
            margin: 3,
        },

        workspaceTypeSectionTitle: {
            marginLeft: 3,
        },

        workspaceRightColumn: {
            marginLeft: 124,
        },

        workspaceThreeDotMenu: {
            justifyContent: 'flex-end',
            width: 124,
        },

        workspaceListRBR: {
            flexDirection: 'column',
            justifyContent: 'flex-start',
            marginTop: 10,
        },

        peopleRow: {
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            ...spacing.ph5,
        },

        dotIndicatorMessage: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        },

        emptyLHNWrapper: {
            marginBottom: variables.bottomTabHeight,
        },

        emptyLHNAnimation: {
            width: 180,
            height: 180,
        },

        mfaBlockingViewAnimation: {
            width: 180,
            height: 180,
        },

        locationErrorLinkText: {
            textAlignVertical: 'center',
            fontSize: variables.fontSizeLabel,
        },

        sidebarPopover: {
            width: variables.sideBarWidth - 68,
        },

        shortTermsBorder: {
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: variables.componentBorderRadius,
        },

        shortTermsHorizontalRule: {
            borderBottomWidth: 1,
            borderColor: theme.border,
            ...spacing.mh3,
        },

        shortTermsLargeHorizontalRule: {
            borderWidth: 1,
            borderColor: theme.border,
            ...spacing.mh3,
        },

        shortTermsRow: {
            flexDirection: 'row',
            padding: 12,
        },

        termsCenterRight: {
            marginTop: 'auto',
            marginBottom: 'auto',
        },

        shortTermsBoldHeadingSection: {
            paddingRight: 12,
            paddingLeft: 12,
            marginTop: 12,
        },

        shortTermsHeadline: {
            ...headlineFont,
            ...whiteSpace.preWrap,
            color: theme.heading,
            fontSize: variables.fontSizeXLarge,
            lineHeight: variables.lineHeightXXLarge,
        },

        longTermsRow: {
            flexDirection: 'row',
            marginTop: 20,
        },

        collapsibleSectionBorder: {
            borderBottomWidth: 2,
            borderBottomColor: theme.border,
        },

        floatingMessageCounterWrapper: {
            position: 'absolute',
            left: '50%',
            top: 0,
            zIndex: 100,
            ...visibility.hidden,
        },

        floatingMessageCounter: {
            left: '-50%',
            ...visibility.visible,
        },

        confirmationAnimation: {
            height: 180,
            width: 180,
            marginBottom: 20,
        },

        googleSearchSeparator: {
            height: 1,
            backgroundColor: theme.border,
        },

        googleSearchText: {
            color: theme.text,
            fontSize: variables.fontSizeNormal,
            lineHeight: variables.fontSizeNormalHeight,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            flex: 1,
        },

        searchRouterTextInputContainer: {
            borderRadius: variables.componentBorderRadiusSmall,
            borderWidth: 1,
            borderBottomWidth: 1,
            paddingHorizontal: 8,
        },

        searchAutocompleteInputResults: {
            borderWidth: 1,
            borderColor: theme.border,
            height: 54,
        },

        searchAutocompleteInputResultsFocused: {
            borderWidth: 1,
            borderColor: theme.success,
        },

        searchTableHeaderActive: {
            fontWeight: FontUtils.fontWeight.bold,
        },

        zIndex10: {
            zIndex: 10,
        },

        height4: {
            height: 16,
        },

        searchListContentContainerStyles: {
            paddingTop: variables.searchListContentMarginTop,
        },

        searchListHeaderContainerStyle: {
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            ...userSelect.userSelectNone,
            paddingBottom: 12,
            backgroundColor: theme.appBG,
            justifyContent: 'flex-start',
        },

        groupSearchListTableContainerStyle: {
            minHeight: variables.h28,
            paddingBottom: 0,
        },

        narrowSearchRouterInactiveStyle: {
            left: 0,
            right: 0,
            position: 'absolute',
            zIndex: variables.searchTopBarZIndex,
            backgroundColor: theme.appBG,
        },

        iPhoneXSafeArea: {
            backgroundColor: theme.appBG,
            flex: 1,
        },

        transferBalancePayment: {
            borderWidth: 1,
            borderRadius: variables.componentBorderRadiusNormal,
            borderColor: theme.border,
        },

        transferBalanceSelectedPayment: {
            borderColor: theme.iconSuccessFill,
        },

        transferBalanceBalance: {
            fontSize: 48,
        },

        imageCropContainer: {
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.imageCropBackgroundColor,
            ...cursor.cursorMove,
        },

        sliderKnobTooltipView: {
            height: variables.sliderKnobSize,
            width: variables.sliderKnobSize,
            borderRadius: variables.sliderKnobSize / 2,
        },

        sliderKnob: {
            backgroundColor: theme.success,
            position: 'absolute',
            height: variables.sliderKnobSize,
            width: variables.sliderKnobSize,
            borderRadius: variables.sliderKnobSize / 2,
            left: -(variables.sliderKnobSize / 2),
            ...cursor.cursorPointer,
        },

        sliderBar: {
            backgroundColor: theme.border,
            height: variables.sliderBarHeight,
            borderRadius: variables.sliderBarHeight / 2,
            alignSelf: 'stretch',
            justifyContent: 'center',
        },

        screenCenteredContainer: {
            flex: 1,
            justifyContent: 'center',
            marginBottom: 40,
            padding: 16,
        },

        inlineSystemMessage: {
            color: theme.textSupporting,
            fontSize: variables.fontSizeLabel,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            marginLeft: 6,
        },

        fullScreen: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        },

        overlayBackground: {
            backgroundColor: theme.overlay,
        },

        invisibleOverlay: {
            backgroundColor: theme.transparent,
            zIndex: 1000,
        },

        invisibleImage: {
            opacity: 0,
            width: 200,
            height: 200,
        },

        dropWrapper: {
            zIndex: 2,
        },

        fileDropOverlay: {
            backgroundColor: theme.fileDropUIBG,
        },

        attachmentDropText: {
            color: theme.textAttachmentDropZone,
        },

        receiptDropText: {
            color: theme.textReceiptDropZone,
        },

        flashButtonContainer: {
            position: 'absolute',
            top: 20,
            right: 20,
        },

        bgGreenSuccess: {
            backgroundColor: colors.green400,
        },

        webButtonShadow: {
            boxShadow: `0px 0px 24px 16px ${theme.appBG}`,
        },

        buttonShadow: {
            boxShadow: [
                {
                    offsetX: 0,
                    offsetY: 0,
                    blurRadius: '24px',
                    spreadDistance: '16px',
                    color: theme.appBG,
                },
            ],
        },

        buttonShadowContainer: {
            height: 52,
            width: 52,
            borderTopLeftRadius: 26,
            borderBottomLeftRadius: 26,
        },

        receiptsSubmitButton: {
            position: 'absolute',
            right: 16,
            top: 8,
            backgroundColor: theme.appBG,
        },

        receiptPlaceholder: {
            height: 52,
            marginRight: 8,
            width: variables.w44,
            borderRadius: variables.componentBorderRadiusSmall,
            backgroundColor: theme.hoverComponentBG,
        },

        isDraggingOver: {
            backgroundColor: theme.fileDropUIBG,
        },

        cardSectionContainer: {
            backgroundColor: theme.cardBG,
            borderRadius: variables.componentBorderRadiusLarge,
            width: 'auto',
            textAlign: 'left',
            overflow: 'hidden',
            marginBottom: 20,
            marginHorizontal: variables.sectionMargin,
        },

        widgetContainer: {
            backgroundColor: theme.cardBG,
            borderRadius: variables.componentBorderRadiusLarge,
            overflow: 'hidden',
        },

        widgetItemButton: {
            minWidth: 68,
        },

        widgetItemSubtitle: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeLabel,
            lineHeight: 16,
            color: theme.textSupporting,
        },

        widgetItemTitle: {
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            fontSize: variables.fontSizeNormal,
            lineHeight: variables.fontSizeNormalHeight,
            color: theme.text,
        },

        forYouEmptyStateContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
            marginBottom: 52,
        },

        forYouEmptyStateTitle: {
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            fontSize: variables.fontSizeNormal,
            lineHeight: variables.fontSizeNormalHeight,
            marginTop: 20,
            textAlign: 'center',
            color: theme.text,
        },

        forYouEmptyStateSubtitle: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeLabel,
            lineHeight: 16,
            marginTop: 2,
            textAlign: 'center',
            color: theme.textSupporting,
        },

        homePageContentContainer: {
            flexGrow: 1,
            paddingTop: 0,
            paddingHorizontal: 20,
            paddingBottom: 20,
        },

        cardSectionIllustration: {
            width: 'auto',
            height: variables.sectionIllustrationHeight,
        },

        cardSectionIllustrationContainer: {
            height: variables.sectionIllustrationHeight,
        },

        twoFAIllustration: {
            width: 'auto',
            height: 140,
        },

        cardSectionTitle: {
            fontSize: variables.fontSizeLarge,
            lineHeight: variables.lineHeightXLarge,
        },

        emptyCardSectionTitle: {
            fontSize: variables.fontSizeXLarge,
            lineHeight: variables.lineHeightXXLarge,
            textAlign: 'center',
        },

        emptyCardSectionSubtitle: {
            fontSize: variables.fontSizeNormal,
            lineHeight: variables.lineHeightXLarge,
            color: theme.textSupporting,
            textAlign: 'center',
        },

        transferBalance: {
            width: 'auto',
            borderRadius: 0,
            height: 64,
            alignItems: 'center',
        },

        paymentMethod: {
            paddingHorizontal: 20,
            minHeight: variables.optionRowHeight,
        },

        chatFooterBanner: {
            borderRadius: variables.componentBorderRadius,
            ...wordBreak.breakWord,
        },

        deeplinkWrapperContainer: {
            padding: 20,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.appBG,
        },

        deeplinkWrapperMessage: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },

        deeplinkWrapperFooter: {
            paddingTop: 80,
            paddingBottom: 45,
        },

        emojiReactionBubble: {
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            alignSelf: 'flex-start',
        },

        emojiReactionListHeader: {
            marginTop: 8,
            paddingBottom: 20,
            borderBottomColor: theme.border,
            borderBottomWidth: 1,
            marginHorizontal: 20,
        },
        emojiReactionListHeaderBubble: {
            paddingVertical: 2,
            paddingHorizontal: 8,
            borderRadius: 28,
            backgroundColor: theme.border,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            alignSelf: 'flex-start',
            marginRight: 4,
        },

        reactionListHeaderText: {
            color: theme.textSupporting,
            marginLeft: 8,
            alignSelf: 'center',
        },

        miniQuickEmojiReactionText: {
            fontSize: 18,
            lineHeight: 22,
            verticalAlign: 'middle',
        },

        emojiReactionBubbleText: {
            verticalAlign: 'middle',
        },

        stickyHeaderEmoji: {
            position: 'absolute',
            ...spacing.mh4,
        },

        reactionCounterText: {
            fontSize: 13,
            marginLeft: 4,
            fontWeight: FontUtils.fontWeight.bold,
        },

        fontColorReactionLabel: {
            color: theme.tooltipSupportingText,
        },

        reactionEmojiTitle: {
            fontSize: variables.iconSizeLarge,
            lineHeight: variables.iconSizeXLarge,
        },

        textReactionSenders: {
            color: theme.tooltipPrimaryText,
            ...wordBreak.breakWord,
        },

        distanceLabelWrapper: {
            backgroundColor: colors.green500,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            textAlign: 'center',
        },
        distanceLabelText: {
            fontSize: 13,
            fontWeight: FontUtils.fontWeight.bold,
            color: colors.productLight100,
        },

        productTrainingTooltipWrapper: {
            backgroundColor: theme.tooltipHighlightBG,
            borderRadius: variables.componentBorderRadiusNormal,
        },

        productTrainingTooltipText: {
            fontSize: variables.fontSizeLabel,
            color: theme.textReversed,
            lineHeight: variables.lineHeightLarge,
            flexShrink: 1,
        },

        quickReactionsContainer: {
            gap: 12,
            flexDirection: 'row',
            paddingHorizontal: 25,
            paddingVertical: 12,
            justifyContent: 'space-between',
        },

        reactionListContainer: {
            maxHeight: variables.listItemHeightNormal * 5.75,
            ...spacing.pv2,
        },

        reactionListContainerFixedWidth: {
            maxWidth: variables.popoverWidth,
        },

        validateCodeDigits: {
            color: theme.text,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeXXLarge,
            letterSpacing: 4,
        },

        footerWrapper: {
            fontSize: variables.fontSizeNormal,
            paddingTop: 64,
            maxWidth: 1100, // Match footer across all Expensify platforms
        },

        footerColumnsContainer: {
            flex: 1,
            flexWrap: 'wrap',
            marginBottom: 40,
            marginHorizontal: -16,
        },

        footerTitle: {
            fontSize: variables.fontSizeLarge,
            color: theme.success,
            marginBottom: 16,
        },

        textSuccess: {
            color: theme.success,
        },

        footerRow: {
            paddingVertical: 4,
            marginBottom: 8,
            color: theme.textLight,
            fontSize: variables.fontSizeMedium,
        },

        footerBottomLogo: {
            marginTop: 40,
            width: '100%',
        },

        datePickerPopover: {
            backgroundColor: theme.appBG,
            width: '100%',
            alignSelf: 'center',
            zIndex: 100,
            marginTop: 8,
        },

        loginHeroHeader: {
            ...FontUtils.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM,
            color: theme.success,
            textAlign: 'center',
        },

        newKansasLarge: {
            ...headlineFont,
            fontSize: variables.fontSizeXLarge,
            lineHeight: variables.lineHeightXXLarge,
        },

        eReceiptAmount: {
            ...headlineFont,
            fontSize: variables.fontSizeXXXLarge,
            color: colors.green400,
        },

        eReceiptAmountLarge: {
            ...headlineFont,
            fontSize: variables.fontSizeEReceiptLarge,
            textAlign: 'center',
        },

        eReceiptCurrency: {
            ...headlineFont,
            fontSize: variables.fontSizeXXLarge,
        },

        eReceiptMerchant: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeXLarge,
            lineHeight: variables.lineHeightXXLarge,
            color: theme.textColorfulBackground,
        },

        eReceiptWaypointTitle: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeSmall,
            lineHeight: variables.lineHeightSmall,
            color: colors.green400,
        },

        eReceiptWaypointAddress: {
            ...FontUtils.fontFamily.platform.MONOSPACE,
            fontSize: variables.fontSizeSmall,
            lineHeight: variables.lineHeightSmall,
            color: theme.textColorfulBackground,
        },

        eReceiptGuaranteed: {
            ...FontUtils.fontFamily.platform.MONOSPACE,
            fontSize: variables.fontSizeSmall,
            lineHeight: variables.lineHeightSmall,
            color: theme.textColorfulBackground,
        },

        eReceiptBackground: {
            ...sizing.w100,
            borderRadius: 20,
            position: 'absolute',
            top: 0,
            left: 0,
            height: 540,
        },

        eReceiptPanel: {
            ...spacing.p5,
            ...spacing.pb8,
            ...spacing.m5,
            backgroundColor: colors.green800,
            borderRadius: 20,
            width: 335,
            overflow: 'hidden',
        },

        eReceiptBackgroundThumbnail: {
            ...sizing.w100,
            position: 'absolute',
            aspectRatio: 335 / 540,
            top: 0,
        },

        eReceiptContainer: {
            width: variables.eReceiptBGHWidth,
            minHeight: variables.eReceiptBGHeight,
            overflow: 'hidden',
        },

        eReceiptContentContainer: {
            ...sizing.w100,
            ...spacing.p5,
            minWidth: variables.eReceiptBodyWidth,
            minHeight: variables.eReceiptBodyHeight,
        },

        eReceiptContentWrapper: {
            ...sizing.w100,
            ...spacing.ph5,
            ...spacing.pt10,
            ...spacing.pb4,
            ...sizing.h100,
            position: 'absolute',
            left: 0,
        },

        loginHeroBody: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeSignInHeroBody,
            color: theme.textLight,
            textAlign: 'center',
        },

        linkPreviewWrapper: {
            marginTop: 16,
            borderLeftWidth: 4,
            borderLeftColor: theme.border,
            paddingLeft: 12,
        },

        linkPreviewImage: {
            flex: 1,
            borderRadius: 8,
            marginTop: 8,
        },

        linkPreviewLogoImage: {
            height: 16,
            width: 16,
        },

        contextMenuItemPopoverMaxWidth: {
            minWidth: 320,
            maxWidth: 375,
        },

        formSpaceVertical: {
            height: 20,
            width: 1,
        },

        taskTitleMenuItem: {
            ...writingDirection.ltr,
            ...headlineFont,
            fontSize: variables.fontSizeXLarge,
            lineHeight: variables.lineHeighTaskTitle,
            maxWidth: '100%',
            ...wordBreak.breakWord,
            textUnderlineOffset: -1,
        },

        taskTitleMenuItemItalic: {
            ...writingDirection.ltr,
            ...headlineItalicFont,
            fontSize: variables.fontSizeXLarge,
            lineHeight: variables.lineHeighTaskTitle,
            maxWidth: '100%',
            ...wordBreak.breakWord,
            textUnderlineOffset: -1,
        },

        taskDescriptionMenuItem: {
            maxWidth: '100%',
            ...wordBreak.breakWord,
        },

        taskTitleDescription: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeLabel,
            color: theme.textSupporting,
            lineHeight: variables.lineHeightNormal,
            ...spacing.mb1,
        },

        taskMenuItemCheckbox: {
            height: 27,
            ...spacing.mr3,
        },

        reportHorizontalRule: {
            borderColor: theme.border,
            ...spacing.mh5,
        },

        assigneeTextStyle: {
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            minHeight: variables.avatarSizeSubscript,
        },

        taskRightIconContainer: {
            width: variables.componentSizeNormal,
            marginLeft: 'auto',
            ...spacing.mt1,
            ...pointerEventsAuto,
            ...display.dFlex,
            ...flex.alignItemsCenter,
        },

        shareCodeContainer: {
            width: '100%',
            alignItems: 'center',
            paddingHorizontal: variables.qrShareHorizontalPadding,
            paddingVertical: 20,
            borderRadius: 20,
            overflow: 'hidden',
            borderColor: theme.borderFocus,
            borderWidth: 2,
        },

        shareCodeContainerDownloadPadding: {
            paddingHorizontal: 12,
            paddingVertical: 12,
        },

        qrCodeAppDownloadLinksStyles: {
            width: 200,
            height: 200,
            margin: 'auto',
        },

        splashScreenHider: {
            backgroundColor: theme.splashBG,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
        },

        headerEnvBadge: {
            position: 'absolute',
            bottom: -8,
            left: -8,
            height: 12,
            width: 22,
            paddingLeft: 4,
            paddingRight: 4,
            alignItems: 'center',
            zIndex: -1,
        },

        headerEnvBadgeText: {
            fontSize: 7,
            fontWeight: FontUtils.fontWeight.bold,
            lineHeight: undefined,
            color: theme.textLight,
        },

        expensifyQrLogo: {
            alignSelf: 'stretch',
            height: 27,
            marginBottom: 20,
        },

        qrShareTitle: {
            marginTop: 15,
            textAlign: 'center',
        },

        loginButtonRow: {
            width: '100%',
            gap: 12,
            ...flex.flexRow,
            ...flex.justifyContentCenter,
        },

        loginButtonRowSmallScreen: {
            width: '100%',
            gap: 12,
            ...flex.flexRow,
            ...flex.justifyContentCenter,
            marginBottom: 10,
        },

        signInIconButton: {
            paddingVertical: 2,
        },

        googleButtonContainer: {
            colorScheme: 'light',
            width: 40,
            height: 40,
            alignItems: 'center',
            overflow: 'hidden',
        },

        googlePillButtonContainer: {
            colorScheme: 'light',
            height: 40,
            width: 300,
            overflow: 'hidden',
        },

        thirdPartyLoadingContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            height: 450,
        },

        tabSelectorButton: {
            height: variables.tabSelectorButtonHeight,
            paddingHorizontal: variables.tabSelectorButtonPadding,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: variables.buttonBorderRadius,
        },

        tabSelector: {
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingBottom: 12,
        },

        dualColorOverscrollSpacer: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
        },

        purposeMenuItem: {
            backgroundColor: theme.cardBG,
            borderRadius: 8,
            paddingHorizontal: 8,
            alignItems: 'center',
            marginBottom: 8,
        },

        willChangeTransform: {
            willChange: 'transform',
        },

        dropDownButtonCartIconContainerPadding: {
            paddingRight: 0,
            paddingLeft: 0,
        },

        dropDownButtonCartIcon: {
            minWidth: 22,
        },

        dropDownSmallButtonArrowContain: {
            marginLeft: 3,
            marginRight: 6,
        },

        dropDownMediumButtonArrowContain: {
            marginLeft: 12,
            marginRight: 16,
        },

        dropDownLargeButtonArrowContain: {
            marginLeft: 16,
            marginRight: 20,
        },

        dropDownButtonCartIconView: {
            borderTopRightRadius: variables.buttonBorderRadius,
            borderBottomRightRadius: variables.buttonBorderRadius,
            ...flex.flexRow,
            ...flex.alignItemsCenter,
        },

        emojiPickerButtonDropdown: {
            justifyContent: 'center',
            backgroundColor: theme.activeComponentBG,
            width: 86,
            height: 52,
            borderRadius: 26,
            alignItems: 'center',
            paddingLeft: 10,
            paddingRight: 4,
            alignSelf: 'flex-start',
            ...userSelect.userSelectNone,
        },

        emojiPickerButtonDropdownIcon: {
            fontSize: 30,
            overflow: 'visible',
        },

        moneyRequestImage: {
            height: 200,
            borderRadius: 16,
            marginHorizontal: 20,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.border,
        },

        reportPreviewBox: {
            backgroundColor: theme.cardBG,
            borderRadius: variables.componentBorderRadiusLarge,
            maxWidth: variables.reportPreviewMaxWidth,
            width: '100%',
        },

        reportPreviewBoxHoverBorder: {
            borderColor: theme.cardBG,
            backgroundColor: theme.cardBG,
        },

        reportContainerBorderRadius: {
            borderRadius: variables.componentBorderRadiusLarge,
        },

        expenseAndReportPreviewBoxBody: {
            padding: 16,
        },

        expenseAndReportPreviewTextContainer: {
            gap: 8,
        },

        expenseAndReportPreviewTextButtonContainer: {
            gap: 16,
        },

        reportActionItemImagesContainer: {
            margin: 4,
        },

        receiptPreviewAspectRatio: {
            aspectRatio: 16 / 9,
        },

        reportActionItemImages: {
            flexDirection: 'row',
            borderRadius: 12,
            overflow: 'hidden',
        },

        reportActionItemImage: {
            flex: 1,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },

        reportActionItemImageBorder: {
            borderRightWidth: 4,
            borderColor: theme.cardBG,
        },

        reportActionItemImagesMoreContainer: {
            position: 'absolute',
            bottom: 0,
            right: 0,
            display: 'flex',
        },

        reportActionItemImagesMore: {
            borderTopLeftRadius: 12,
            backgroundColor: theme.border,
            width: 40,
            height: 40,
        },

        reportActionItemImagesMoreHovered: {
            backgroundColor: theme.cardBG,
        },

        reportActionItemImagesMoreText: {
            position: 'absolute',
            marginLeft: 20,
            marginTop: 16,
            color: theme.textSupporting,
        },

        reportActionItemImagesMoreCornerTriangle: {
            position: 'absolute',
        },

        bankIconContainer: {
            height: variables.cardIconWidth,
            width: variables.cardIconWidth,
            borderRadius: 8,
            overflow: 'hidden',
            alignSelf: 'center',
        },

        staticHeaderImage: {
            minHeight: 240,
        },

        emojiPickerButtonDropdownContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },

        rotate90: {
            transform: 'rotate(90deg)',
        },

        emojiStatusLHN: {
            fontSize: 9,
            ...(getBrowser() && !isMobile() && {transform: 'scale(.5)', fontSize: 22, overflow: 'visible'}),
            ...(getBrowser() &&
                isSafari() &&
                !isMobile() && {
                    transform: 'scale(0.7)',
                    fontSize: 13,
                    lineHeight: 15,
                    overflow: 'visible',
                }),
        },

        onboardingVideoPlayer: {
            borderRadius: 12,
            backgroundColor: theme.highlightBG,
        },

        onboardingSmallIcon: {
            padding: 10,
        },

        sidebarStatusAvatarContainer: {
            height: 40,
            width: 40,
            backgroundColor: theme.componentBG,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
        },

        sidebarStatusAvatarWithEmojiContainer: {
            height: 28,
            width: 28,
            top: -2,
        },

        sidebarStatusAvatar: {
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
        },

        profilePageAvatar: {
            borderColor: theme.highlightBG,
        },

        settlementButtonListContainer: {
            maxHeight: 500,
            paddingBottom: 0,
            paddingTop: 0,
        },

        settlementButtonShortFormWidth: {
            minWidth: 90,
        },

        moneyRequestViewImage: {
            ...spacing.mh5,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: variables.componentBorderRadiusLarge,
            height: 180,
            maxWidth: '100%',
        },

        expenseViewImage: {
            maxWidth: 360,
            aspectRatio: 16 / 9,
            height: 'auto',
        },
        expenseViewImageSmall: {
            maxWidth: 440,
            aspectRatio: 16 / 9,
            height: 'auto',
        },

        mergeTransactionReceiptImage: {
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: variables.componentBorderRadiusNormal,
            aspectRatio: 16 / 9,
            height: 180,
            maxWidth: '100%',
        },

        pdfErrorPlaceholder: {
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: theme.cardBG,
            borderRadius: variables.componentBorderRadiusLarge,
            maxWidth: 400,
            height: '100%',
            backgroundColor: theme.highlightBG,
        },

        moneyRequestAttachReceipt: {
            backgroundColor: theme.highlightBG,
            borderColor: theme.border,
            borderWidth: 1,
        },

        moneyRequestAttachReceiptThumbnail: {
            backgroundColor: theme.hoverComponentBG,
            borderWidth: 0,
            width: '100%',
        },

        receiptEmptyStateFullHeight: {height: '100%', borderRadius: 12},

        moneyRequestAttachReceiptThumbnailIcon: {
            position: 'absolute',
            bottom: -4,
            right: -4,
            borderColor: theme.highlightBG,
            borderWidth: 2,
            borderRadius: '50%',
        },

        mergeTransactionReceiptThumbnail: {
            backgroundColor: theme.highlightBG,
            borderRadius: variables.componentBorderRadiusLarge,
            padding: 20,
        },

        mapViewContainer: {
            ...flex.flex1,
            minHeight: 300,
        },

        mapView: {
            ...flex.flex1,
            overflow: 'hidden',
            backgroundColor: theme.highlightBG,
        },

        mapEditView: {
            borderRadius: variables.componentBorderRadiusXLarge,
            borderWidth: variables.componentBorderWidth,
            borderColor: theme.appBG,
        },
        currentPositionDot: {backgroundColor: colors.blue400, width: 16, height: 16, borderRadius: 16},

        mapViewOverlay: {
            flex: 1,
            position: 'absolute',
            left: 0,
            top: 0,
            borderRadius: variables.componentBorderRadiusLarge,
            overflow: 'hidden',
            backgroundColor: theme.highlightBG,
            ...sizing.w100,
            ...sizing.h100,
        },

        confirmationListMapItem: {
            ...spacing.mv2,
            ...spacing.mh5,
            height: 200,
        },

        mapPendingView: {
            backgroundColor: theme.hoverComponentBG,
            ...flex.flex1,
            borderRadius: variables.componentBorderRadiusLarge,
        },
        userReportStatusEmoji: {
            flexShrink: 0,
            fontSize: variables.fontSizeNormal,
            marginRight: 4,
        },
        timePickerInput: {
            fontSize: 69,
            minWidth: 56,
            alignSelf: 'center',
        },
        timePickerWidth72: {
            width: 72,
        },
        timePickerHeight100: {
            height: 100,
        },
        timePickerSemiDot: {
            fontSize: 69,
            height: 84,
            alignSelf: 'center',
        },
        timePickerSwitcherContainer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'center',
            marginBottom: 8,
        },

        selectionListPressableItemWrapper: {
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingVertical: 16,
            marginHorizontal: 20,
            backgroundColor: theme.highlightBG,
            borderRadius: 8,
            minHeight: variables.optionRowHeight,
        },

        transactionListItemStyle: {
            borderRadius: 8,
            minHeight: variables.optionRowHeight,
            backgroundColor: theme.transparent,
            flex: 1,
            userSelect: 'none',
        },

        transactionGroupListItemStyle: {
            borderRadius: 8,
            minHeight: variables.optionRowHeight,
            backgroundColor: theme.transparent,
            flex: 1,
            userSelect: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            overflow: 'hidden',
            flexDirection: 'row',
            paddingVertical: 6,
        },

        searchQueryListItemStyle: {
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderRadius: 8,
        },

        listTableHeader: {
            paddingVertical: 12,
            paddingHorizontal: 32,
        },

        tableHeaderIconSpacing: {
            marginRight: variables.iconSizeExtraSmall,
            marginBottom: 1,
            marginTop: 1,
        },

        cardItemSecondaryIconStyle: {
            position: 'absolute',
            bottom: -4,
            right: -4,
            borderWidth: 2,
            borderRadius: 2,
            backgroundColor: theme.componentBG,
        },

        selectionListStickyHeader: {
            backgroundColor: theme.appBG,
        },

        draggableTopBar: {
            height: 30,
            width: '100%',
        },

        menuItemError: {
            marginTop: 4,
            marginBottom: 0,
        },

        formHelperMessage: {
            height: 32,
            marginTop: 0,
            marginBottom: 0,
        },

        timePickerInputsContainer: {
            maxHeight: 100,
        },

        listBoundaryLoader: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            height: CONST.CHAT_HEADER_LOADER_HEIGHT,
        },
        listBoundaryError: {
            paddingVertical: 15,
            paddingHorizontal: 20,
        },
        listBoundaryErrorText: {
            color: theme.textSupporting,
            fontSize: variables.fontSizeLabel,
            marginBottom: 10,
        },

        videoContainer: {
            ...flex.flex1,
            ...flex.alignItemsCenter,
            ...flex.justifyContentCenter,
            ...objectFit.oFCover,
        },

        singleOptionSelectorRow: {
            ...flex.flexRow,
            ...flex.alignItemsCenter,
            gap: 12,
            marginBottom: 16,
        },

        holdRequestInline: {
            ...headlineFont,
            ...whiteSpace.preWrap,
            color: theme.textLight,
            fontSize: variables.fontSizeXLarge,
            lineHeight: variables.lineHeightXXLarge,

            backgroundColor: colors.red,
            borderRadius: variables.componentBorderRadiusMedium,
            overflow: 'hidden',

            paddingHorizontal: 8,
            paddingVertical: 4,
        },

        headerStatusBarContainer: {
            minHeight: variables.componentSizeSmall,
        },

        searchFiltersBarContainer: {
            marginTop: 8,
            flexDirection: 'row',
            alignItems: 'center',
        },

        walletStaticIllustration: {
            width: 262,
            height: 152,
        },
        walletLottieIllustration: {
            height: 180,
        },

        walletCardLimit: {
            color: theme.text,
            fontSize: variables.fontSizeNormal,
        },

        walletCard: {
            borderRadius: variables.componentBorderRadiusLarge,
            position: 'relative',
            alignSelf: 'center',
            overflow: 'hidden',
        },

        plaidIcon: {
            height: variables.iconSizeMegaLarge,
            width: variables.iconSizeMegaLarge,
            position: 'absolute',
            right: 24,
            top: 20,
            zIndex: 1,
        },

        plaidIconSmall: {
            height: variables.iconSizeMedium,
            width: variables.iconSizeMedium,
            position: 'absolute',
            right: 4,
            zIndex: 1,
            top: 4,
        },

        plaidIconExtraSmall: {
            height: variables.iconSizeXSmall,
            width: variables.iconSizeXSmall,
            position: 'absolute',
            right: 1,
            zIndex: 1,
            top: 1,
        },

        walletCardNumber: {
            color: theme.text,
            fontSize: variables.fontSizeNormal,
        },

        walletCardMenuItem: {
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            color: theme.text,
            fontSize: variables.fontSizeNormal,
            lineHeight: variables.lineHeightXLarge,
        },

        walletCardHolder: {
            position: 'absolute',
            left: 16,
            bottom: 16,
            width: variables.cardNameWidth,
            color: theme.textLight,
            fontSize: variables.fontSizeSmall,
            lineHeight: variables.lineHeightLarge,
        },

        walletRedDotSectionTitle: {
            color: theme.text,
            fontWeight: FontUtils.fontWeight.bold,
            fontSize: variables.fontSizeNormal,
            lineHeight: variables.lineHeightXLarge,
        },

        walletRedDotSectionText: {
            color: theme.textSupporting,
            fontSize: variables.fontSizeLabel,
            lineHeight: variables.lineHeightNormal,
        },

        walletLockedMessage: {
            color: theme.text,
            fontSize: variables.fontSizeNormal,
            lineHeight: variables.lineHeightXLarge,
        },

        workspaceSection: {
            maxWidth: variables.workspaceSectionMaxWidth + variables.sectionMargin * 2,
        },

        workspaceSectionMobile: {
            width: '100%',
            alignSelf: 'center',
        },

        workspaceSectionMoreFeaturesItem: {
            backgroundColor: theme.cardBG,
            borderRadius: variables.componentBorderRadiusNormal,
            paddingHorizontal: 16,
            paddingVertical: 20,
            minWidth: 350,
            flexGrow: 1,
            flexShrink: 1,
            // Choosing a lowest value just above the threshold for the items to adjust width against the various screens. Only 2 items are shown 35 * 2 = 70 thus third item of 35% width can't fit forcing a two column layout.
            flexBasis: '35%',
            marginTop: 12,
        },

        onboardingAccountingItem: {
            backgroundColor: theme.cardBG,
            borderRadius: variables.componentBorderRadiusNormal,
            paddingHorizontal: 16,
            paddingVertical: 20,
            flexGrow: 1,
            flexShrink: 1,

            flexBasis: '35%',
        },

        onboardingInterestedFeaturesItem: {
            backgroundColor: theme.cardBG,
            borderRadius: variables.componentBorderRadiusNormal,
            padding: 16,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: '35%',
        },

        checkboxWithLabelCheckboxStyle: {
            marginLeft: -2,
        },

        singleOptionSelectorCircle: {
            borderColor: theme.icon,
        },

        headerProgressBarContainer: {
            position: 'absolute',
            width: '100%',
            zIndex: -1,
        },

        headerProgressBar: {
            width: variables.componentSizeMedium,
            height: variables.iconSizeXXXSmall,
            borderRadius: variables.componentBorderRadiusRounded,
            backgroundColor: theme.border,
            alignSelf: 'center',
        },

        headerProgressBarFill: {
            borderRadius: variables.componentBorderRadiusRounded,
            height: '100%',
            backgroundColor: theme.success,
        },

        interactiveStepHeaderContainer: {
            flex: 1,
            alignSelf: 'center',
            flexDirection: 'row',
        },

        interactiveStepHeaderStepContainer: {
            flexDirection: 'row',
            alignItems: 'center',
        },

        interactiveStepHeaderStepButton: {
            width: 40,
            height: 40,
            borderWidth: 2,
            borderRadius: 20,
            borderColor: theme.borderFocus,
            justifyContent: 'center',
            alignItems: 'center',
            color: theme.white,
        },

        interactiveStepHeaderLockedStepButton: {
            borderColor: theme.borderLighter,
        },

        interactiveStepHeaderStepText: {
            fontSize: variables.fontSizeLabel,
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
        },

        interactiveStepHeaderCompletedStepButton: {
            backgroundColor: theme.iconSuccessFill,
        },

        interactiveStepHeaderStepLine: {
            height: 1,
            flexGrow: 1,
            backgroundColor: theme.iconSuccessFill,
        },

        interactiveStepHeaderLockedStepLine: {
            backgroundColor: theme.activeComponentBG,
        },

        textHeadlineLineHeightXXL: {
            ...headlineFont,
            ...whiteSpace.preWrap,
            color: theme.heading,
            fontSize: variables.fontSizeXLarge,
            lineHeight: variables.lineHeightXXLarge,
        },

        videoPlayerPreview: {
            width: '100%',
            height: '100%',
            borderRadius: variables.componentBorderRadiusNormal,
        },

        videoPlayerControlsContainer: {
            position: 'absolute',
            bottom: CONST.VIDEO_PLAYER.CONTROLS_POSITION.NORMAL,
            left: CONST.VIDEO_PLAYER.CONTROLS_POSITION.NORMAL,
            right: CONST.VIDEO_PLAYER.CONTROLS_POSITION.NORMAL,
            backgroundColor: theme.videoPlayerBG,
            borderRadius: 8,
            flexDirection: 'column',
            overflow: 'visible',
            zIndex: 9000,
        },

        videoPlayerControlsButtonContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },

        progressBarOutline: {
            width: '100%',
            height: 4,
            borderRadius: 8,
            backgroundColor: theme.transparentWhite,
        },

        progressBarFill: {
            height: '100%',
            backgroundColor: colors.white,
            borderRadius: 8,
        },

        videoPlayerControlsRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },

        videoPlayerText: {
            textAlign: 'center',
            fontSize: variables.fontSizeLabel,
            fontWeight: FontUtils.fontWeight.bold,
            lineHeight: 16,
            color: theme.white,
            userSelect: 'none',
            WebkitUserSelect: 'none',
        },

        volumeSliderContainer: {
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            height: 100,
            alignItems: 'center',
            borderRadius: 4,
            backgroundColor: colors.green700,
        },

        splitItemBottomContent: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 12,
            justifyContent: 'space-between',
            minHeight: 16,
        },

        volumeSliderOverlay: {
            width: 4,
            height: 60,
            backgroundColor: theme.transparentWhite,
            borderRadius: 8,
            marginTop: 8,
            alignItems: 'center',
            justifyContent: 'flex-end',
        },

        volumeSliderThumb: {
            width: 8,
            height: 8,
            borderRadius: 8,
            backgroundColor: colors.white,
            marginBottom: -2,
        },

        volumeSliderFill: {
            width: 4,
            height: 20,
            backgroundColor: colors.white,
            borderRadius: 8,
        },

        videoIconButton: {
            padding: 4,
            borderRadius: 4,
        },

        videoIconButtonHovered: {
            backgroundColor: colors.green700,
        },

        videoThumbnailContainer: {
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
        },

        videoThumbnailPlayButton: {
            backgroundColor: theme.videoPlayerBG,
            borderRadius: 100,
            width: 72,
            height: 72,
            alignItems: 'center',
            justifyContent: 'center',
        },

        videoExpandButton: {
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: theme.videoPlayerBG,
            borderRadius: 8,
            padding: 8,
        },

        videoPlayerTimeComponentWidth: {
            width: 40,
        },

        updateAnimation: {
            width: variables.updateAnimationW,
            height: variables.updateAnimationH,
        },

        updateRequiredViewHeader: {
            height: variables.updateViewHeaderHeight,
        },

        updateRequiredViewTextContainer: {
            width: variables.updateTextViewContainerWidth,
        },

        twoFARequiredOverlay: {
            zIndex: 20, // must be greater than floatingCameraButton.zIndex
        },

        twoFARequiredContainer: {
            maxWidth: 520,
            margin: 'auto',
        },

        workspaceTitleStyle: {
            ...headlineFont,
            fontSize: variables.fontSizeXLarge,
            flex: 1,
        },

        expensifyCardIllustrationContainer: {
            width: 680,
            height: 220,
        },

        uberConfirmationIllustrationContainer: {
            width: 260,
            height: 172,
        },

        gpsWebIllustrationContainer: {
            width: 286,
            height: 188,
        },

        emptyStateCardIllustrationContainer: {
            height: 220,
            ...flex.alignItemsCenter,
            ...flex.justifyContentCenter,
        },

        emptyStateSamlIllustration: {
            width: 218,
            height: 190,
        },

        emptyStateCardIllustration: {
            width: 164,
            height: 190,
        },

        errorStateCardIllustration: {
            width: 254,
            height: 165,
            marginBottom: 12,
        },

        travelCardIllustration: {
            width: 191,
            height: 170,
        },

        successBankSharedCardIllustration: {
            width: 164,
            height: 164,
            marginBottom: 12,
        },

        emptyStateMoneyRequestReport: {
            maxHeight: 85,
            minHeight: 85,
            ...flex.alignItemsCenter,
            ...flex.justifyContentCenter,
        },

        emptyStateMoneyRequestPreviewReport: {
            borderWidth: 1,
            borderColor: theme.border,
            height: 168,
            width: '100%',
            boxSizing: 'border-box',
            ...borders.br4,
            ...flex.alignItemsCenter,
            ...flex.justifyContentCenter,
        },

        emptyStateTransactionMergeIllustration: {
            width: 180,
            height: 220,
        },

        pendingStateCardIllustration: {
            width: 233,
            height: 162,
        },

        computerIllustrationContainer: {
            width: 272,
            height: 188,
        },

        pendingBankCardIllustration: {
            width: 217,
            height: 150,
        },

        cardIcon: {
            overflow: 'hidden',
            borderRadius: variables.cardBorderRadius,
            alignSelf: 'center',
        },

        cardMiniature: {
            overflow: 'hidden',
            borderRadius: variables.cardMiniatureBorderRadius,
            alignSelf: 'center',
        },

        textLineThrough: {
            textDecorationLine: 'line-through',
        },

        skeletonBackground: {
            flex: 1,
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
        },

        emptyStateForeground: {
            margin: 32,
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
        },

        emptyStateContent: {
            backgroundColor: theme.cardBG,
            borderRadius: variables.componentBorderRadiusLarge,
            maxWidth: 400,
            width: '100%',
        },

        emptyFolderBG: {
            backgroundColor: theme.emptyFolderBG,
        },

        emptyFolderDarkBG: {
            backgroundColor: '#782c04',
            height: 220,
        },

        emptyStateVideo: {
            borderTopLeftRadius: variables.componentBorderRadiusLarge,
            borderTopRightRadius: variables.componentBorderRadiusLarge,
        },

        emptyStateFolderWithPaperIconSize: {
            width: 160,
            height: 100,
        },

        emptyStateFolderWebStyles: {
            ...sizing.w100,
            minWidth: 400,
            ...flex.alignItemsCenter,
            ...flex.justifyContentCenter,
            ...display.dFlex,
        },

        emptyStateFolderStaticIllustration: {
            width: 184,
            height: 112,
        },

        emptyStateFireworksWebStyles: {
            width: 250,
            ...flex.alignItemsCenter,
            ...flex.justifyContentCenter,
            ...display.dFlex,
        },

        emptyStateFireworksStaticIllustration: {
            width: 164,
            height: 148,
        },

        tripEmptyStateLottieWebView: {
            width: 335,
            height: 220,
        },

        offlineFeedbackDeleted: {
            textDecorationLine: 'line-through',
            textDecorationStyle: 'solid',
        },
        offlineFeedbackPending: {
            opacity: 0.5,
        },
        offlineFeedbackDefault: {
            // fixes a crash on iOS when we attempt to remove already unmounted children
            // see https://github.com/Expensify/App/issues/48197 for more details
            // it's a temporary solution while we are working on a permanent fix
            opacity: Platform.OS === 'ios' ? 0.99 : undefined,
        },
        offlineFeedbackError: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        offlineFeedbackContainer: {
            ...spacing.pv2,
        },
        offlineFeedbackTextContainer: {
            flexDirection: 'column',
            flex: 1,
        },
        offlineFeedbackText: {
            color: theme.textSupporting,
            verticalAlign: 'middle',
            fontSize: variables.fontSizeLabel,
        },
        offlineFeedbackErrorDot: {
            marginRight: 12,
        },

        workflowApprovalVerticalLine: {
            height: 16,
            width: 1,
            marginLeft: 19,
            backgroundColor: theme.border,
        },

        workflowApprovalLimitText: {
            marginLeft: 32,
            paddingBottom: 0,
        },

        integrationIcon: {
            overflow: 'hidden',
            borderRadius: variables.buttonBorderRadius,
        },

        importColumnCard: {
            backgroundColor: theme.cardBG,
            borderRadius: variables.componentBorderRadiusNormal,
            padding: 16,
        },

        accountSwitcherPopover: {
            width: variables.sideBarWidth - 19,
        },

        progressBarWrapper: {
            height: 2,
            width: '100%',
            backgroundColor: theme.transparent,
            overflow: 'hidden',
            position: 'absolute',
            bottom: -1,
        },

        progressBar: {
            height: '100%',
            backgroundColor: theme.success,
            width: '100%',
        },

        qbdSetupLinkBox: {
            backgroundColor: theme.hoverComponentBG,
            borderRadius: variables.componentBorderRadiusMedium,
            borderColor: theme.border,
            padding: 16,
        },

        // We have to use 9998 here as sidePanel has to be displayed right under popovers which have z-index of 9999
        sidePanelContainer: {zIndex: variables.sidePanelZIndex},

        reportPreviewArrowButton: {
            borderRadius: 50,
            width: variables.w28,
            height: variables.h28,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 4,
        },

        avatarSelectorWrapper: {
            borderRadius: 50,
            padding: 4,
            borderWidth: 2,
            borderColor: 'transparent',
        },

        avatarSelectorContainer: {
            alignItems: 'center',
            justifyContent: 'center',
        },

        avatarSelectorListContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 0,
            justifyContent: 'space-between',
        },

        avatarSelected: {borderColor: theme.success, borderWidth: 2},

        expenseWidgetRadius: {
            borderRadius: variables.componentBorderRadiusNormal,
        },

        translucentNavigationBarBG: {
            backgroundColor: theme.translucentNavigationBarBackgroundColor,
        },

        todoBadge: {
            width: variables.w36,
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: 0,
            paddingRight: 0,
        },

        stickToBottom: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
        },

        stickToTop: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
        },

        earlyDiscountButton: {
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 'auto',
        },

        backgroundWhite: {
            backgroundColor: colors.white,
        },

        embeddedDemoIframe: {
            height: '100%',
            width: '100%',
            border: 'none',
        },

        featureTrainingModalImage: {
            width: '100%',
            height: '100%',
            borderTopLeftRadius: variables.componentBorderRadiusLarge,
            borderTopRightRadius: variables.componentBorderRadiusLarge,
        },

        twoColumnLayoutCol: {
            flexGrow: 1,
            flexShrink: 1,
            // Choosing a lowest value just above the threshold for the items to adjust width against the various screens. Only 2 items are shown 35 * 2 = 70 thus third item of 35% width can't fit forcing a two column layout.
            flexBasis: '35%',
        },

        thumbnailImageContainerHover: {
            backgroundColor: theme.hoverComponentBG,
        },

        thumbnailImageContainerHighlight: {
            backgroundColor: theme.highlightBG,
        },

        multiScanEducationalPopupImage: {
            backgroundColor: colors.pink700,
            overflow: 'hidden',
            paddingHorizontal: 0,
            aspectRatio: 1.7,
        },

        topBarWrapper: {
            zIndex: 15,
        },

        receiptPreview: {
            position: 'absolute',
            left: 60,
            top: 60,
            width: 380,
            maxHeight: 'calc(100vh - 120px)',
            borderRadius: variables.componentBorderRadiusLarge,
            borderWidth: 1,
            borderColor: theme.border,
            overflow: 'hidden',
            boxShadow: theme.shadow,
            backgroundColor: theme.appBG,
        },

        receiptPreviewEReceiptsContainer: {
            ...sizing.w100,
            ...sizing.h100,
            backgroundColor: colors.green800,
        },

        wideRHPExtendedCardInterpolatorStyles: {
            position: 'absolute',
            height: '100%',
            right: 0,
            width: animatedWideRHPWidth,
        },

        superWideRHPExtendedCardInterpolatorStyles: {
            position: 'absolute',
            height: '100%',
            right: 0,
            width: animatedSuperWideRHPWidth,
        },

        singleRHPExtendedCardInterpolatorStyles: {
            position: 'absolute',
            height: '100%',
            right: 0,
            width: variables.sideBarWidth,
        },

        flexibleHeight: {
            height: 'auto',
            minHeight: 200,
        },

        receiptCellLoadingContainer: {
            backgroundColor: theme.activeComponentBG,
        },

        wideRHPMoneyRequestReceiptViewContainer: {
            backgroundColor: theme.appBG,
            width: animatedReceiptPaneRHPWidth,
            height: '100%',
            borderRightWidth: 1,
            borderColor: theme.border,
        },

        wideRHPMoneyRequestReceiptViewScrollViewContainer: {
            ...spacing.pt3,
            ...spacing.pb2,
            minHeight: '100%',
        },

        uploadFileView: getReceiptDropZoneViewStyle(theme, variables.uploadViewMargin, 40),

        textInputAndIconContainer: {
            zIndex: -1,
            flexDirection: 'row',
        },
        statusIndicator: {
            borderColor: theme.sidebar,
            borderRadius: 8,
            borderWidth: 2,
            position: 'absolute',
            right: -4,
            top: -3,
            height: 12,
            width: 12,
            zIndex: 10,
        },
        navigationTabBarStatusIndicator: {
            borderColor: theme.sidebar,
            borderRadius: 8,
            borderWidth: 2,
            position: 'absolute',
            right: -2,
            top: -3,
            height: 12,
            width: 12,
            zIndex: 10,
        },
        modalStackNavigatorContainer: {
            height: '100%',
            right: 0,
            position: Platform.OS === 'web' ? 'fixed' : 'absolute',
        },
        animatedRHPNavigatorContainer: {
            height: '100%',
            right: 0,
            position: 'absolute',
            overflow: 'hidden',
        },
        twoFactorAuthCodesBox: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.highlightBG,
            paddingVertical: 28,
            borderRadius: 16,
            marginTop: 32,
        },
        anonymousRoomFooter: {
            padding: 20,
            backgroundColor: theme.cardBG,
            borderRadius: variables.componentBorderRadiusLarge,
            overflow: 'hidden',
        },
        dropzoneArea: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
        },
        easeInOpacityTransition: {
            transition: 'opacity 0.2s ease-in',
        },
        overscrollSpacerPosition: {
            position: 'absolute',
            left: 0,
            right: 0,
        },
        emptyStateHeader: {
            borderTopLeftRadius: variables.componentBorderRadiusLarge,
            borderTopRightRadius: variables.componentBorderRadiusLarge,
            minHeight: 200,
        },
        sidePanelOverlay: {
            ...positioning.pFixed,
            top: 0,
            bottom: 0,
            left: 0,
            right: -variables.sideBarWidth,
            backgroundColor: theme.overlay,
        },
        sidePanelContent: {
            position: Platform.OS === 'web' ? 'fixed' : 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            height: '100%',
            backgroundColor: theme.modalBackground,
            borderLeftColor: theme.border,
        },
        searchBarMargin: {
            marginHorizontal: 20,
            marginBottom: 20,
        },
        loadingMessage: {
            alignItems: 'center',
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
        },
        domainIcon: {
            backgroundColor: theme.border,
            padding: 10,
            borderRadius: 8,
        },
        copyableTextField: {
            color: theme.textSupporting,
            flex: 1,
            ...FontUtils.fontFamily.platform.MONOSPACE,
            ...wordBreak.breakWord,
        },
        copyableTextFieldButton: {
            width: 28,
            height: 28,
            borderRadius: variables.buttonBorderRadius,
            justifyContent: 'center',
            alignItems: 'center',
        },
        moneyRequestView: {
            position: 'relative',
            paddingTop: 16,
            marginTop: -16,
            ...overflowMoneyRequestView,
        },
        wordBreakAll: {
            ...wordBreak.breakAll,
        },
        preferencesStaticIllustration: {
            width: 280,
            height: 180,
        },
        securitySettingsStaticIllustration: {
            width: 112,
            height: 160,
        },
        aboutStaticIllustration: {
            width: 100,
            height: 106,
        },
        troubleshootStaticIllustration: {
            width: 170,
            height: 160,
        },
        saveTheWorldStaticIllustration: {
            width: 179,
            height: 180,
        },
        paymentMethodErrorRow: {
            paddingHorizontal: variables.iconSizeMenuItem + variables.iconSizeNormal / 2,
        },
        discoverSectionImage: {
            width: '100%',
            height: undefined,
            aspectRatio: 2.2,
        },
    }) satisfies StaticStyles;

const dynamicStyles = (theme: ThemeColors) =>
    ({
        topLevelNavigationTabBar: (shouldDisplayTopLevelNavigationTabBar: boolean, shouldUseNarrowLayout: boolean, bottomSafeAreaOffset: number) => ({
            // We have to use position fixed to make sure web on safari displays the bottom tab bar correctly.
            // On natives we can use absolute positioning.
            position: Platform.OS === 'web' ? 'fixed' : 'absolute',
            opacity: shouldDisplayTopLevelNavigationTabBar ? 1 : 0,
            pointerEvents: shouldDisplayTopLevelNavigationTabBar ? 'auto' : 'none',
            width: shouldUseNarrowLayout ? '100%' : variables.sideBarWithLHBWidth,
            paddingBottom: bottomSafeAreaOffset,
        }),

        getSplitListItemAmountStyle: (inputMarginLeft: number, amountWidth: number | string) => ({
            marginLeft: inputMarginLeft,
            width: amountWidth,
            marginRight: 4,
        }),

        uploadFileViewBorderWidth: (isSmallScreenWidth: boolean) =>
            ({
                borderWidth: isSmallScreenWidth ? 0 : 2,
            }) satisfies ViewStyle,

        chooseFilesView: (isSmallScreenWidth: boolean) =>
            ({
                ...getReceiptDropZoneViewStyle(theme, variables.chooseFilesViewMargin, 20),
                borderWidth: isSmallScreenWidth ? 0 : 2,
            }) satisfies ViewStyle,

        autoGrowHeightInputContainer: (textInputHeight: number, minHeight: number, maxHeight: number) =>
            ({
                height: lodashClamp(textInputHeight, minHeight, maxHeight),
                minHeight,
            }) satisfies ViewStyle,

        autoGrowHeightHiddenInput: (maxWidth: number, maxHeight?: number) =>
            ({
                maxWidth,
                maxHeight: maxHeight && maxHeight + 1,
                overflow: 'hidden',
            }) satisfies TextStyle,

        textInputLabelTransformation: (translateY: SharedValue<number>, scale: SharedValue<number>, isForTextComponent?: boolean) => {
            'worklet';

            if (isForTextComponent) {
                return {
                    fontSize: interpolate(scale.get(), [0, ACTIVE_LABEL_SCALE], [0, variables.fontSizeLabel]),
                } satisfies TextStyle;
            }

            return {
                transform: [{translateY: translateY.get()}],
                fontSize: interpolate(scale.get(), [0, ACTIVE_LABEL_SCALE], [0, variables.fontSizeLabel]),
            } satisfies TextStyle;
        },

        statusIndicatorColor: (backgroundColor: string = theme.danger) =>
            ({
                backgroundColor,
            }) satisfies ViewStyle,

        RHPNavigatorContainer: (isSmallScreenWidth: boolean) =>
            ({
                ...modalNavigatorContainer(isSmallScreenWidth),
            }) satisfies ViewStyle,

        modalStackNavigatorContainerWidth: (isSmallScreenWidth: boolean) =>
            ({
                width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,
            }) satisfies ViewStyle,

        OnboardingNavigatorInnerView: (shouldUseNarrowLayout: boolean) =>
            ({
                width: shouldUseNarrowLayout ? variables.onboardingModalWidth : '100%',
                height: shouldUseNarrowLayout ? 732 : '100%',
                borderRadius: shouldUseNarrowLayout ? 16 : 0,
            }) satisfies ViewStyle,

        createMenuPositionSidebar: (windowHeight: number) =>
            ({
                horizontal: 16,
                // Menu should be displayed 8px above the floating action button.
                // To achieve that sidebar must be moved by: distance from the bottom of the sidebar to the fab (16px) + fab height on a wide layout (variables.componentSizeNormal) + distance above the fab (8px)
                vertical: windowHeight - 16 - variables.componentSizeNormal - 8,
            }) satisfies AnchorPosition,

        createMenuPositionSearchBar: (windowHeight: number) =>
            ({
                horizontal: 18,
                // Menu should be displayed 12px above the floating action button.
                // To achieve that sidebar must be moved by: distance from the bottom of the sidebar to the fab (variables.fabBottom) + fab height on a wide layout (variables.componentSizeNormal) + distance above the fab (12px)
                vertical: windowHeight - (variables.fabBottom + variables.componentSizeNormal + 12),
            }) satisfies AnchorPosition,

        overlayStyles: ({
            progress,
            positionLeftValue,
            positionRightValue,
        }: {
            progress: OverlayStylesParams;
            positionLeftValue: number | Animated.Value | Animated.AnimatedAddition<number>;
            positionRightValue: number | Animated.Value | Animated.AnimatedAddition<number>;
        }) =>
            ({
                // We need to stretch the overlay to cover the sidebar and the translate animation distance.
                left: positionLeftValue,
                right: positionRightValue,
                opacity: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, variables.overlayOpacity],
                    extrapolate: 'clamp',
                }),
            }) satisfies ViewStyle,

        getPDFPasswordFormStyle: (isSmallScreenWidth: boolean) =>
            ({
                width: isSmallScreenWidth ? '100%' : 350,
                flexBasis: isSmallScreenWidth ? '100%' : 350,
                flexGrow: 0,
                alignSelf: 'flex-start',
            }) satisfies ViewStyle,

        centeredModalStyles: (isSmallScreenWidth: boolean, isFullScreenWhenSmall: boolean) =>
            ({
                borderWidth: isSmallScreenWidth && !isFullScreenWhenSmall ? 1 : 0,
                marginHorizontal: isSmallScreenWidth ? 0 : 20,
            }) satisfies ViewStyle,

        twoFactorAuthCodesBoxPadding: ({isExtraSmallScreenWidth, isSmallScreenWidth}: TwoFactorAuthCodesBoxParams) => {
            let paddingHorizontal = spacing.ph9;

            if (isSmallScreenWidth) {
                paddingHorizontal = spacing.ph4;
            }

            if (isExtraSmallScreenWidth) {
                paddingHorizontal = spacing.ph2;
            }

            return {
                ...paddingHorizontal,
            } satisfies ViewStyle;
        },

        anonymousRoomFooterFlexDirection: (isSmallSizeLayout: boolean) =>
            ({
                flexDirection: isSmallSizeLayout ? 'column' : 'row',
                ...(!isSmallSizeLayout && {
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }),
            }) satisfies ViewStyle & TextStyle,
        anonymousRoomFooterWordmarkAndLogoContainer: (isSmallSizeLayout: boolean) =>
            ({
                ...(isSmallSizeLayout && {
                    justifyContent: 'space-between',
                    marginTop: 16,
                }),
            }) satisfies ViewStyle,

        workspaceUpgradeIntroBox: ({isExtraSmallScreenWidth}: WorkspaceUpgradeIntroBoxParams): ViewStyle => {
            let paddingHorizontal = spacing.ph5;
            let paddingVertical = spacing.pv5;

            if (isExtraSmallScreenWidth) {
                paddingHorizontal = spacing.ph2;
                paddingVertical = spacing.pv2;
            }

            return {
                ...paddingVertical,
                ...paddingHorizontal,
            } satisfies ViewStyle;
        },

        rootNavigatorContainerStyles: (isSmallScreenWidth: boolean) =>
            ({marginLeft: isSmallScreenWidth ? 0 : variables.sideBarWithLHBWidth + variables.navigationTabBarSize, flex: 1}) satisfies ViewStyle,

        RHPNavigatorContainerNavigatorContainerStyles: (isSmallScreenWidth: boolean) => ({marginLeft: isSmallScreenWidth ? 0 : variables.sideBarWidth, flex: 1}) satisfies ViewStyle,

        growlNotificationTranslateY: (translateY: SharedValue<number>) => {
            'worklet';

            return {
                transform: [{translateY: translateY.get()}],
            };
        },

        activeDropzoneDashedBorder: (borderColor: string, isActive: boolean) => {
            const browser = getBrowser();
            const isSafariOrChromeBrowser = getPlatform() === CONST.PLATFORM.WEB && (browser === CONST.BROWSER.SAFARI || browser === CONST.BROWSER.CHROME);

            return {
                opacity: isActive ? 1 : 0,
                ...(isSafariOrChromeBrowser && {
                    backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect x='1' y='1' width='calc(100%25 - 3px)' height='calc(100%25 - 3px)' fill='none' stroke='${encodeURIComponent(borderColor)}' stroke-width='2' stroke-dasharray='8' stroke-dashoffset='4 8' stroke-linecap='round' rx='8' ry='8' /%3e%3c/svg%3e")`,
                    backgroundSize: '100% 100%',
                    backgroundRepeat: 'no-repeat',
                }),
                // fallback for the desktop and other browsers that this svg doesn't work with
                ...(!isSafariOrChromeBrowser && {
                    borderWidth: 2,
                    borderStyle: 'dashed',
                    borderColor,
                    borderRadius: variables.componentBorderRadiusNormal,
                }),
            };
        },

        attachmentDropOverlay: (isActive?: boolean) => ({
            backgroundColor: isActive ? theme.attachmentDropUIBGActive : theme.attachmentDropUIBG,
            transition: 'background-color 0.2s ease-in',
        }),

        receiptDropOverlay: (isActive?: boolean) => ({
            backgroundColor: isActive ? theme.receiptDropUIBGActive : theme.receiptDropUIBG,
            transition: 'background-color 0.2s ease-in',
        }),

        fileUploadImageWrapper: (fileTopPosition: number) =>
            ({
                top: fileTopPosition,
            }) satisfies ViewStyle,

        tabText: (isSelected: boolean, hasIcon = false) =>
            ({
                marginLeft: hasIcon ? 8 : 0,
                ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
                color: isSelected ? theme.text : theme.textSupporting,
                lineHeight: variables.lineHeightLarge,
                fontSize: variables.fontSizeLabel,
            }) satisfies TextStyle,

        tabBackground: (hovered: boolean, isFocused: boolean, background: string | Animated.AnimatedInterpolation<string>) => ({
            backgroundColor: hovered && !isFocused ? theme.highlightBG : (background as string),
        }),

        tabOpacity: (
            hovered: boolean,
            isFocused: boolean,
            activeOpacityValue: number | Animated.AnimatedInterpolation<number>,
            inactiveOpacityValue: number | Animated.AnimatedInterpolation<number>,
        ) => ({
            opacity: hovered && !isFocused ? inactiveOpacityValue : activeOpacityValue,
        }),

        overscrollSpacer: (backgroundColor: string, height: number) =>
            ({
                backgroundColor,
                height,
                top: -height,
            }) satisfies ViewStyle,

        justSignedInModalAnimation: (is2FARequired: boolean) => ({
            height: is2FARequired ? variables.modalTopIconHeight : variables.modalTopBigIconHeight,
        }),

        screenWrapperContainerMinHeight: (minHeight: number | undefined) => ({
            minHeight,
        }),

        aspectRatioLottie: (animation: DotLottieAnimation) => ({aspectRatio: animation.w / animation.h}),

        colorSchemeStyle: (colorScheme: ColorScheme) => ({colorScheme}),

        emptyStateHeaderPosition: (isIllustration: boolean) => ({
            alignItems: isIllustration ? 'center' : undefined,
            justifyContent: isIllustration ? 'center' : undefined,
        }),

        emojiHeaderContainerWidth: (isSmallScreenWidth: boolean, windowWidth: number) =>
            ({
                width: isSmallScreenWidth ? windowWidth - 32 : CONST.EMOJI_PICKER_SIZE.WIDTH - 32,
            }) satisfies ViewStyle,

        sidePanelOverlayOpacity: (isOverlayVisible: boolean) => ({
            opacity: isOverlayVisible ? variables.overlayOpacity : 0,
        }),
        sidePanelContentWidth: (shouldUseNarrowLayout: boolean): ViewStyle => ({
            width: shouldUseNarrowLayout ? '100%' : variables.sidePanelWidth,
        }),
        sidePanelContentBorderWidth: (isExtraLargeScreenWidth: boolean): ViewStyle => ({
            borderLeftWidth: isExtraLargeScreenWidth ? 1 : 0,
        }),

        searchBarWidth: (shouldUseNarrowLayout: boolean) => ({
            maxWidth: shouldUseNarrowLayout ? '100%' : 300,
        }),

        getForYouSectionContainerStyle: (shouldUseNarrowLayout: boolean): ViewStyle => ({
            flexDirection: 'column',
            marginBottom: shouldUseNarrowLayout ? 20 : 32,
            marginHorizontal: shouldUseNarrowLayout ? 20 : 32,
            paddingVertical: 12,
            gap: 24,
        }),

        getSelectionListPopoverHeight: (itemCount: number, windowHeight: number, isSearchable: boolean) => {
            const SEARCHBAR_HEIGHT = isSearchable ? 52 : 0;
            const SEARCHBAR_PADDING = isSearchable ? 12 : 0;
            const PADDING = 32;
            const GAP = 8;
            const BUTTON_HEIGHT = 40;
            const ESTIMATED_LIST_HEIGHT = itemCount * variables.optionRowHeightCompact + SEARCHBAR_HEIGHT + SEARCHBAR_PADDING;
            const MAX_HEIGHT = CONST.POPOVER_DROPDOWN_MAX_HEIGHT - (PADDING + GAP + BUTTON_HEIGHT);

            // Native platforms don't support maxHeight in the way thats expected, so lets manually set the height to either
            // the listHeight, the max height of the popover, or 90% of the window height, such that we never overflow the screen
            // and never expand over the max height
            const height = Math.min(ESTIMATED_LIST_HEIGHT, MAX_HEIGHT, windowHeight * 0.9);

            return {height};
        },

        getUserSelectionListPopoverHeight: (itemCount: number, windowHeight: number, shouldUseNarrowLayout: boolean, isSearchable = true) => {
            const BUTTON_HEIGHT = 40;
            const SEARCHBAR_HEIGHT = isSearchable ? 50 : 0;
            const SEARCHBAR_MARGIN = isSearchable ? 14 : 0;
            const PADDING = 44 - (shouldUseNarrowLayout ? 32 : 0);
            const ESTIMATED_LIST_HEIGHT = itemCount * variables.optionRowHeightCompact + SEARCHBAR_HEIGHT + SEARCHBAR_MARGIN + BUTTON_HEIGHT + PADDING;

            // Native platforms don't support maxHeight in the way thats expected, so lets manually set the height to either
            // the listHeight, the max height of the popover, or 90% of the window height, such that we never overflow the screen
            // and never expand over the max height
            const height = Math.min(ESTIMATED_LIST_HEIGHT, CONST.POPOVER_DROPDOWN_MAX_HEIGHT, windowHeight * 0.9);
            const width = shouldUseNarrowLayout ? sizing.w100 : {width: CONST.POPOVER_DROPDOWN_WIDTH};

            return {height, ...width};
        },

        testDriveModalContainer: (shouldUseNarrowLayout: boolean) => ({
            // On small/medium screens, we need to remove the top padding
            paddingTop: 0,
            // On larger screens, we need to prevent the modal from becoming too big
            maxWidth: shouldUseNarrowLayout ? undefined : 500,
        }),

        getMoneyRequestViewImage: (showBorderless: boolean) => ({
            ...spacing.mh5,
            overflow: 'hidden',
            borderWidth: showBorderless ? 0 : 1,
            borderColor: theme.border,
            borderRadius: variables.componentBorderRadiusLarge,
            height: 180,
            maxWidth: '100%',
        }),

        getTestToolsNavigatorOuterView: (shouldUseNarrowLayout: boolean) => ({
            justifyContent: shouldUseNarrowLayout ? 'flex-end' : 'center',
        }),

        getTestToolsNavigatorInnerView: (shouldUseNarrowLayout: boolean, isAuthenticated: boolean) => {
            const borderBottomRadius = shouldUseNarrowLayout ? 0 : variables.componentBorderRadiusLarge;
            // Use fixed height values based on the actual content height after the removal of the
            // "Use profiling" and "Client side logging" menu items.
            // - ~654px when authenticated
            // - ~400px when unauthenticated
            // For narrow layouts, we keep using percentages because fixed heights like 654px can overflow on mWeb Safari.
            const defaultHeight = shouldUseNarrowLayout ? '78%' : 654;
            const height = isAuthenticated ? defaultHeight : 400;

            return {
                width: shouldUseNarrowLayout ? '100%' : '91%',
                height,
                borderRadius: variables.componentBorderRadiusLarge,
                borderBottomRightRadius: borderBottomRadius,
                borderBottomLeftRadius: borderBottomRadius,
                overflow: 'hidden',
            };
        },
    }) satisfies DynamicStyles;

// Styles that cannot be wrapped in StyleSheet.create because they eg. must be passed to 3rd party libraries as JS objects
const plainStyles = (theme: ThemeColors) =>
    ({
        webViewStyles: webViewStyles(theme),
        textInputDesktop: addOutlineWidth(theme, {}, 0),
        noOutline: addOutlineWidth(theme, {}, 0),
        picker: (disabled = false, backgroundColor: string = theme.appBG) =>
            ({
                iconContainer: {
                    top: Math.round(variables.inputHeight * 0.5) - 11,
                    right: 0,
                    ...pointerEventsNone,
                },

                inputWeb: {
                    appearance: 'none',
                    ...(disabled ? cursor.cursorDisabled : cursor.cursorPointer),
                    ...picker(theme),
                    backgroundColor,
                },

                inputIOS: {
                    ...picker(theme),
                },
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

                inputAndroid: {
                    ...picker(theme),
                },
            }) satisfies CustomPickerStyle,

        pickerSmall: (disabled = false, backgroundColor: string = theme.highlightBG) =>
            ({
                inputIOS: {
                    ...FontUtils.fontFamily.platform.EXP_NEUE,
                    fontSize: variables.fontSizeSmall,
                    paddingLeft: 0,
                    paddingRight: 17,
                    paddingTop: 6,
                    paddingBottom: 6,
                    borderWidth: 0,
                    color: theme.text,
                    height: 26,
                    opacity: 1,
                    backgroundColor: 'transparent',
                },
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
                inputWeb: {
                    ...FontUtils.fontFamily.platform.EXP_NEUE,
                    fontSize: variables.fontSizeSmall,
                    paddingLeft: 0,
                    paddingRight: 17,
                    paddingTop: 6,
                    paddingBottom: 6,
                    borderWidth: 0,
                    color: theme.text,
                    appearance: 'none',
                    height: 26,
                    opacity: 1,
                    backgroundColor,
                    ...(disabled ? cursor.cursorDisabled : cursor.cursorPointer),
                },
                inputAndroid: {
                    ...FontUtils.fontFamily.platform.EXP_NEUE,
                    fontSize: variables.fontSizeSmall,
                    paddingLeft: 0,
                    paddingRight: 17,
                    paddingTop: 6,
                    paddingBottom: 6,
                    borderWidth: 0,
                    color: theme.text,
                    height: 26,
                    opacity: 1,
                    backgroundColor: 'transparent',
                },
                iconContainer: {
                    top: 7,
                    ...pointerEventsNone,
                },
                icon: {
                    width: variables.iconSizeExtraSmall,
                    height: variables.iconSizeExtraSmall,
                },
                chevronContainer: {
                    pointerEvents: 'none',
                    opacity: 0,
                },
            }) satisfies CustomPickerStyle,
        mapDirection: {
            lineColor: theme.success,
            lineWidth: 7,
        },

        mapDirectionLayer: {
            layout: {'line-join': 'round', 'line-cap': 'round'},
            paint: {'line-color': theme.success, 'line-width': 7},
        },
        searchTopBarZIndexStyle: {
            zIndex: variables.searchTopBarZIndex,
        },

        getWidgetContainerTitleStyle: (color: string) =>
            ({
                ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
                fontSize: 17,
                lineHeight: 20,
                color,
            }) satisfies TextStyle,

        getWidgetContainerHeaderStyle: (shouldUseNarrowLayout: boolean) =>
            ({
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: 20,
                marginHorizontal: shouldUseNarrowLayout ? 20 : 32,
                marginTop: shouldUseNarrowLayout ? 20 : 32,
            }) satisfies ViewStyle,

        widgetContainerIconWrapper: {
            flexGrow: 0,
            flexShrink: 0,
            marginRight: 11,
        },

        getWidgetItemIconContainerStyle: (backgroundColor: string) =>
            ({
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: variables.componentBorderRadiusNormal,
                width: variables.componentSizeNormal,
                height: variables.componentSizeNormal,
                backgroundColor,
            }) satisfies ViewStyle,

        homePageMainLayout: (shouldUseNarrowLayout: boolean) =>
            ({
                flexDirection: shouldUseNarrowLayout ? 'column' : 'row',
                gap: 20,
                width: '100%',
            }) satisfies ViewStyle,

        homePageLeftColumn: (shouldUseNarrowLayout: boolean) =>
            shouldUseNarrowLayout
                ? ({width: '100%', flexDirection: 'column', gap: 20} satisfies ViewStyle)
                : ({flex: 2, flexBasis: '66.666%', maxWidth: variables.homePageLeftColumnMaxWidth, flexDirection: 'column', gap: 20} satisfies ViewStyle),

        homePageRightColumn: (shouldUseNarrowLayout: boolean) =>
            shouldUseNarrowLayout ? ({width: '100%'} satisfies ViewStyle) : ({flex: 1, flexBasis: '33.333%', maxWidth: variables.homePageRightColumnMaxWidth} satisfies ViewStyle),
    }) satisfies Styles;

const styles = (theme: ThemeColors) =>
    ({
        ...staticStyles(theme),
        ...dynamicStyles(theme),
        ...plainStyles(theme),
    }) satisfies Styles;

type ThemeStyles = ReturnType<typeof styles>;

const defaultStyles = styles(defaultTheme);

export default styles;
export {defaultStyles};
export type {ThemeStyles, StatusBarStyle, ColorScheme, AnchorPosition, AnchorDimensions, OverlayStylesParams};
