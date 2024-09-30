/* eslint-disable @typescript-eslint/naming-convention */
import type {LineLayerStyleProps} from '@rnmapbox/maps/src/utils/MapboxStyles';
import lodashClamp from 'lodash/clamp';
import type {LineLayer} from 'react-map-gl';
import type {AnimatableNumericValue, Animated, ImageStyle, TextStyle, ViewStyle} from 'react-native';
import {Platform, StyleSheet} from 'react-native';
import type {CustomAnimation} from 'react-native-animatable';
import type {PickerStyle} from 'react-native-picker-select';
import type {MixedStyleDeclaration, MixedStyleRecord} from 'react-native-render-html';
import type {ValueOf} from 'type-fest';
import type DotLottieAnimation from '@components/LottieAnimations/types';
import * as Browser from '@libs/Browser';
import CONST from '@src/CONST';
import {defaultTheme} from './theme';
import colors from './theme/colors';
import type {ThemeColors} from './theme/types';
import addOutlineWidth from './utils/addOutlineWidth';
import borders from './utils/borders';
import chatContentScrollViewPlatformStyles from './utils/chatContentScrollViewPlatformStyles';
import codeStyles from './utils/codeStyles';
import cursor from './utils/cursor';
import display from './utils/display';
import editedLabelStyles from './utils/editedLabelStyles';
import emojiDefaultStyles from './utils/emojiDefaultStyles';
import flex from './utils/flex';
import FontUtils from './utils/FontUtils';
import getPopOverVerticalOffset from './utils/getPopOverVerticalOffset';
import objectFit from './utils/objectFit';
import optionAlternateTextPlatformStyles from './utils/optionAlternateTextPlatformStyles';
import overflow from './utils/overflow';
import overflowXHidden from './utils/overflowXHidden';
import pointerEventsAuto from './utils/pointerEventsAuto';
import pointerEventsBoxNone from './utils/pointerEventsBoxNone';
import pointerEventsNone from './utils/pointerEventsNone';
import positioning from './utils/positioning';
import sizing from './utils/sizing';
import spacing from './utils/spacing';
import textDecorationLine from './utils/textDecorationLine';
import textUnderline from './utils/textUnderline';
import userSelect from './utils/userSelect';
import visibility from './utils/visibility';
import whiteSpace from './utils/whiteSpace';
import wordBreak from './utils/wordBreak';
import writingDirection from './utils/writingDirection';
import variables from './variables';

type ColorScheme = ValueOf<typeof CONST.COLOR_SCHEME>;
type StatusBarStyle = ValueOf<typeof CONST.STATUS_BAR_STYLE>;

type AnchorDimensions = {
    width: number;
    height: number;
};

type AnchorPosition = {
    horizontal: number;
    vertical: number;
};

type WebViewStyle = {
    tagStyles: MixedStyleRecord;
    baseFontStyle: MixedStyleDeclaration;
};

type CustomPickerStyle = PickerStyle & {icon?: ViewStyle};

type OverlayStylesParams = {progress: Animated.AnimatedInterpolation<string | number>};

type TwoFactorAuthCodesBoxParams = {isExtraSmallScreenWidth: boolean; isSmallScreenWidth: boolean};
type WorkspaceUpgradeIntroBoxParams = {isExtraSmallScreenWidth: boolean; isSmallScreenWidth: boolean};

type Translation = 'perspective' | 'rotate' | 'rotateX' | 'rotateY' | 'rotateZ' | 'scale' | 'scaleX' | 'scaleY' | 'translateX' | 'translateY' | 'skewX' | 'skewY' | 'matrix';

type OfflineFeedbackStyle = Record<'deleted' | 'pending' | 'default' | 'error' | 'container' | 'textContainer' | 'text' | 'errorDot', ViewStyle | TextStyle>;

type MapDirectionStyle = Pick<LineLayerStyleProps, 'lineColor' | 'lineWidth'>;

type MapDirectionLayerStyle = Pick<LineLayer, 'layout' | 'paint'>;

type Styles = Record<
    string,
    | ViewStyle
    | TextStyle
    | ImageStyle
    | WebViewStyle
    | OfflineFeedbackStyle
    | MapDirectionStyle
    | MapDirectionLayerStyle
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | ((...args: any[]) => ViewStyle | TextStyle | ImageStyle | AnchorPosition | CustomAnimation | CustomPickerStyle)
>;

// touchCallout is an iOS safari only property that controls the display of the callout information when you touch and hold a target
const touchCalloutNone: Pick<ViewStyle, 'WebkitTouchCallout'> = Browser.isMobileSafari() ? {WebkitTouchCallout: 'none'} : {};
// to prevent vertical text offset in Safari for badges, new lineHeight values have been added
const lineHeightBadge: Pick<TextStyle, 'lineHeight'> = Browser.isSafari() ? {lineHeight: variables.lineHeightXSmall} : {lineHeight: variables.lineHeightNormal};

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
    } satisfies TextStyle);

const link = (theme: ThemeColors) =>
    ({
        color: theme.link,
        textDecorationColor: theme.link,
        // We set fontFamily directly in order to avoid overriding fontWeight and fontStyle.
        fontFamily: FontUtils.fontFamily.platform.EXP_NEUE.fontFamily,
    } satisfies ViewStyle & MixedStyleDeclaration);

const baseCodeTagStyles = (theme: ThemeColors) =>
    ({
        borderWidth: 1,
        borderRadius: 5,
        borderColor: theme.border,
        backgroundColor: theme.textBackground,
    } satisfies ViewStyle & MixedStyleDeclaration);

const headlineFont = {
    ...FontUtils.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM,
} satisfies TextStyle;

const modalNavigatorContainer = (isSmallScreenWidth: boolean) =>
    ({
        position: 'absolute',
        width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,
        height: '100%',
    } satisfies ViewStyle);

const webViewStyles = (theme: ThemeColors) =>
    ({
        // As of react-native-render-html v6, don't declare distinct styles for
        // custom renderers, the API for custom renderers has changed. Declare the
        // styles in the below "tagStyles" instead. If you need to reuse those
        // styles from the renderer, just pass the "style" prop to the underlying
        // component.
        tagStyles: {
            em: {
                // We set fontFamily and fontStyle directly in order to avoid overriding fontWeight.
                fontFamily: FontUtils.fontFamily.platform.EXP_NEUE_ITALIC.fontFamily,
                fontStyle: FontUtils.fontFamily.platform.EXP_NEUE_ITALIC.fontStyle,
            },

            del: {
                textDecorationLine: 'line-through',
                textDecorationStyle: 'solid',
            },

            strong: {
                // We set fontFamily and fontWeight directly in order to avoid overriding fontStyle.
                fontFamily: FontUtils.fontFamily.platform.EXP_NEUE_BOLD.fontFamily,
                fontWeight: FontUtils.fontFamily.platform.EXP_NEUE_BOLD.fontWeight,
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

            blockquote: {
                borderLeftColor: theme.border,
                borderLeftWidth: 4,
                paddingLeft: 12,
                marginTop: 4,
                marginBottom: 4,

                // Overwrite default HTML margin for blockquotes
                marginLeft: 0,
            },

            pre: {
                ...baseCodeTagStyles(theme),
                paddingVertical: 8,
                paddingHorizontal: 12,
                fontSize: 13,
                ...FontUtils.fontFamily.platform.MONOSPACE,
                marginTop: 0,
                marginBottom: 0,
            },

            code: {
                ...baseCodeTagStyles(theme),
                ...(codeStyles.codeTextStyle as MixedStyleDeclaration),
                paddingLeft: 5,
                paddingRight: 5,
                ...FontUtils.fontFamily.platform.MONOSPACE,
                // Font size is determined by getCodeFontSize function in `StyleUtils.js`
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
                fontSize: variables.fontSizeLarge,
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
    } satisfies WebViewStyle);

const styles = (theme: ThemeColors) =>
    ({
        // Add all of our utility and helper styles
        ...spacing,
        ...borders,
        ...sizing,
        ...flex,
        ...display,
        ...overflow,
        ...positioning,
        ...wordBreak,
        ...whiteSpace,
        ...writingDirection,
        ...cursor,
        ...userSelect,
        ...textUnderline,
        ...objectFit,
        ...textDecorationLine,
        editedLabelStyles,
        emojiDefaultStyles,

        autoCompleteSuggestionsContainer: {
            backgroundColor: theme.appBG,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.border,
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: variables.popoverMenuShadow,
            paddingVertical: CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTER_INNER_PADDING,
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

        textSupporting: {
            color: theme.textSupporting,
        },

        webViewStyles: webViewStyles(theme),

        link: link(theme),

        linkMuted: {
            color: theme.textSupporting,
            textDecorationColor: theme.textSupporting,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
        },

        linkMutedHovered: {
            color: theme.textMutedReversed,
        },

        highlightBG: {
            backgroundColor: theme.highlightBG,
        },

        appBG: {
            backgroundColor: theme.appBG,
        },
        fontSizeLabel: {
            fontSize: variables.fontSizeLabel,
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

        verticalAlignTop: {
            verticalAlign: 'top',
        },
        lineHeightLarge: {
            lineHeight: variables.lineHeightLarge,
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

        textMicro: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeSmall,
            lineHeight: variables.lineHeightSmall,
        },

        textMicroBold: {
            color: theme.text,
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            fontSize: variables.fontSizeSmall,
            lineHeight: variables.lineHeightSmall,
        },

        textMicroSupporting: {
            color: theme.textSupporting,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeSmall,
            lineHeight: variables.lineHeightSmall,
        },

        textExtraSmallSupporting: {
            color: theme.textSupporting,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeExtraSmall,
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
            fontSize: variables.fontSizeh2,
            lineHeight: variables.lineHeightSizeh2,
        },

        textHeadlineH1: {
            ...headlineFont,
            ...whiteSpace.preWrap,
            color: theme.heading,
            fontSize: variables.fontSizeXLarge,
            lineHeight: variables.lineHeightSizeh1,
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

        colorReversed: {
            color: theme.textReversed,
        },

        colorMutedReversed: {
            color: theme.textMutedReversed,
        },

        colorMuted: {
            color: theme.textSupporting,
        },

        bgTransparent: {
            backgroundColor: 'transparent',
        },

        bgDark: {
            backgroundColor: theme.inverse,
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

        bottomTabBarContainer: {
            flexDirection: 'row',
            height: variables.bottomTabHeight,
            borderTopWidth: 1,
            borderTopColor: theme.border,
            backgroundColor: theme.appBG,
        },

        bottomTabBarItem: {
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
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

            // It is needed to unset the Lineheight. We don't need it for buttons as button always contains single line of text.
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
            height: 64,
        },

        buttonSmall: {
            borderRadius: variables.buttonBorderRadius,
            minHeight: variables.componentSizeSmall,
            minWidth: variables.componentSizeSmall,
            paddingHorizontal: 12,
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

        buttonDangerDivider: {
            borderRightWidth: 1,
            borderRightColor: theme.dangerHover,
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

        buttonCTA: {
            ...spacing.mh4,
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
            color: theme.textLight,
        },

        buttonDangerText: {
            color: theme.textLight,
        },

        hoveredComponentBG: {
            backgroundColor: theme.hoverComponentBG,
        },

        activeComponentBG: {
            backgroundColor: theme.activeComponentBG,
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

        loadingVBAAnimation: {
            width: 140,
            height: 140,
        },

        loadingVBAAnimationWeb: {
            width: 140,
            height: 140,
        },

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
            } satisfies CustomPickerStyle),

        badge: {
            backgroundColor: theme.border,
            borderRadius: 14,
            height: variables.iconSizeNormal,
            flexDirection: 'row',
            paddingHorizontal: 7,
            alignItems: 'center',
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

        badgeSmall: {
            backgroundColor: theme.border,
            borderRadius: variables.componentBorderRadiusSmall,
            borderColor: theme.border,
            paddingHorizontal: 6,
            minHeight: 20,
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

        activeItemBadge: {
            borderColor: theme.buttonHoveredBG,
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

        textInputDisabled: {
            // Adding disabled color theme to indicate user that the field is not editable.
            backgroundColor: theme.highlightBG,
            borderBottomWidth: 2,
            borderColor: theme.borderLighter,
            // Adding browser specefic style to bring consistency between Safari and other platforms.
            // Applying the Webkit styles only to browsers as it is not available in native.
            ...(Browser.getBrowser()
                ? {
                      WebkitTextFillColor: theme.textSupporting,
                      WebkitOpacity: 1,
                  }
                : {}),
            color: theme.textSupporting,
        },

        uploadFileView: (isSmallScreenWidth: boolean) =>
            ({
                borderRadius: variables.componentBorderRadiusLarge,
                borderWidth: isSmallScreenWidth ? 0 : 2,
                borderColor: theme.borderFocus,
                borderStyle: 'dotted',
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 40,
                gap: 4,
                flex: 1,
            } satisfies ViewStyle),

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

        headerGap: {
            height: CONST.DESKTOP_HEADER_PADDING,
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

        offlineIndicator: {
            marginLeft: variables.chatInputSpacing,
        },

        offlineIndicatorMobile: {
            paddingLeft: 20,
            paddingTop: 5,
            paddingBottom: 30,
            marginBottom: -25,
        },

        offlineIndicatorRow: {
            height: 25,
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
            paddingHorizontal: 15,
            paddingRight: 5,
            ...userSelect.userSelectNone,
        },

        calendarDayRoot: {
            flex: 1,
            height: 45,
            justifyContent: 'center',
            alignItems: 'center',
            ...userSelect.userSelectNone,
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

        autoGrowHeightInputContainer: (textInputHeight: number, minHeight: number, maxHeight: number) =>
            ({
                height: lodashClamp(textInputHeight, minHeight, maxHeight),
                minHeight,
            } satisfies ViewStyle),

        autoGrowHeightHiddenInput: (maxWidth: number, maxHeight?: number) =>
            ({
                maxWidth,
                maxHeight: maxHeight && maxHeight + 1,
                overflow: 'hidden',
            } satisfies TextStyle),

        textInputContainer: {
            flex: 1,
            justifyContent: 'center',
            height: '100%',
            backgroundColor: 'transparent',
            overflow: 'hidden',
            borderBottomWidth: 2,
            borderColor: theme.border,
        },

        optionRowAmountInput: {
            textAlign: 'right',
        },

        textInputLabel: {
            position: 'absolute',
            left: 0,
            top: 0,
            fontSize: variables.fontSizeNormal,
            color: theme.textSupporting,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            width: '100%',
            zIndex: 1,
        },

        textInputLabelBackground: {
            position: 'absolute',
            top: 0,
            width: '100%',
            height: 23,
            backgroundColor: theme.componentBG,
        },

        textInputLabelDesktop: {
            transformOrigin: 'left center',
        },

        textInputLabelTransformation: (translateY: AnimatableNumericValue, translateX: AnimatableNumericValue, scale: AnimatableNumericValue) =>
            ({
                transform: [{translateY}, {translateX}, {scale}],
            } satisfies TextStyle),

        baseTextInput: {
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            fontSize: variables.fontSizeNormal,
            lineHeight: variables.lineHeightXLarge,
            color: theme.text,
            paddingTop: 23,
            paddingBottom: 8,
            paddingLeft: 0,
            borderWidth: 0,
        },

        textInputMultiline: {
            scrollPadding: '23px 0 0 0',
        },

        textInputMultilineContainer: {
            paddingTop: 23,
        },

        textInputAndIconContainer: {
            flex: 1,
            height: '100%',
            zIndex: -1,
            flexDirection: 'row',
        },

        textInputDesktop: addOutlineWidth(theme, {}, 0),

        textInputIconContainer: {
            paddingHorizontal: 11,
            justifyContent: 'center',
            margin: 1,
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
            height: variables.inputHeight,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 23,
            paddingBottom: 8,
        },

        textInputSuffixWrapper: {
            position: 'absolute',
            right: 0,
            top: 0,
            height: variables.inputHeight,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 23,
            paddingBottom: 8,
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
            } satisfies CustomPickerStyle),

        disabledText: {
            color: theme.icon,
        },

        inputDisabled: {
            backgroundColor: theme.highlightBG,
            color: theme.icon,
        },

        noOutline: addOutlineWidth(theme, {}, 0),

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

        lhnSuccessText: {
            color: theme.success,
            fontWeight: FontUtils.fontWeight.bold,
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
            width: 800,
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

        sidebarHeaderContainer: {
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingVertical: 19,
            justifyContent: 'space-between',
            alignItems: 'center',
        },

        subNavigationContainer: {
            backgroundColor: theme.sidebar,
            flex: 1,
            borderTopLeftRadius: variables.componentBorderRadiusRounded,
        },

        sidebarAnimatedWrapperContainer: {
            height: '100%',
            position: 'absolute',
        },

        sidebarFooter: {
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            paddingLeft: 20,
        },

        sidebarAvatar: {
            borderRadius: variables.sidebarAvatarSize,
            height: variables.sidebarAvatarSize,
            width: variables.sidebarAvatarSize,
        },

        selectedAvatarBorder: {
            padding: 2,
            borderWidth: 2,
            borderRadius: 20,
            borderColor: theme.success,
        },

        statusIndicator: (backgroundColor: string = theme.danger) =>
            ({
                borderColor: theme.sidebar,
                backgroundColor,
                borderRadius: 8,
                borderWidth: 2,
                position: 'absolute',
                right: -4,
                top: -3,
                height: 12,
                width: 12,
                zIndex: 10,
            } satisfies ViewStyle),

        bottomTabStatusIndicator: (backgroundColor: string = theme.danger) => ({
            borderColor: theme.sidebar,
            backgroundColor,
            borderRadius: 8,
            borderWidth: 2,
            position: 'absolute',
            right: -3,
            top: -4,
            height: 12,
            width: 12,
            zIndex: 10,
        }),

        floatingActionButton: {
            backgroundColor: theme.success,
            height: variables.componentSizeLarge,
            width: variables.componentSizeLarge,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
        },

        sidebarFooterUsername: {
            color: theme.heading,
            fontSize: variables.fontSizeLabel,
            fontWeight: FontUtils.fontWeight.bold,
            width: 200,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            ...whiteSpace.noWrap,
        },

        sidebarFooterLink: {
            color: theme.textSupporting,
            fontSize: variables.fontSizeSmall,
            textDecorationLine: 'none',
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            lineHeight: 20,
        },

        sidebarListContainer: {
            paddingBottom: 4,
        },

        sidebarListItem: {
            justifyContent: 'center',
            textDecorationLine: 'none',
        },

        breadcrumsContainer: {
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

        LHPNavigatorContainer: (isSmallScreenWidth: boolean) =>
            ({
                ...modalNavigatorContainer(isSmallScreenWidth),
                left: 0,
            } satisfies ViewStyle),

        RHPNavigatorContainer: (isSmallScreenWidth: boolean) =>
            ({
                ...modalNavigatorContainer(isSmallScreenWidth),
                right: 0,
            } satisfies ViewStyle),

        onboardingNavigatorOuterView: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },

        OnboardingNavigatorInnerView: (shouldUseNarrowLayout: boolean) =>
            ({
                width: shouldUseNarrowLayout ? variables.onboardingModalWidth : '100%',
                height: shouldUseNarrowLayout ? 732 : '100%',
                maxHeight: '100%',
                borderRadius: shouldUseNarrowLayout ? 16 : 0,
                overflow: 'hidden',
            } satisfies ViewStyle),

        welcomeVideoNarrowLayout: {
            width: variables.onboardingModalWidth,
        },

        onlyEmojisText: {
            fontSize: variables.fontSizeOnlyEmojis,
            lineHeight: variables.fontSizeOnlyEmojisHeight,
        },

        onlyEmojisTextLineHeight: {
            lineHeight: variables.fontSizeOnlyEmojisHeight,
        },

        createMenuPositionSidebar: (windowHeight: number) =>
            ({
                horizontal: 18,
                // Menu should be displayed 12px above the floating action button.
                // To achieve that sidebar must be moved by: distance from the bottom of the sidebar to the fab (variables.fabBottom) + fab height (variables.componentSizeLarge) + distance above the fab (12px)
                vertical: windowHeight - (variables.fabBottom + variables.componentSizeLarge + 12),
            } satisfies AnchorPosition),

        createAccountMenuPositionProfile: () =>
            ({
                horizontal: 18,
                ...getPopOverVerticalOffset(202 + 40),
            } satisfies AnchorPosition),

        createMenuPositionReportActionCompose: (shouldUseNarrowLayout: boolean, windowHeight: number, windowWidth: number) =>
            ({
                // On a narrow layout the menu is displayed in ReportScreen in RHP, so it must be moved from the right side of the screen
                horizontal: (shouldUseNarrowLayout ? windowWidth - variables.sideBarWidth : variables.sideBarWidth) + 18,
                vertical: windowHeight - CONST.MENU_POSITION_REPORT_ACTION_COMPOSE_BOTTOM,
            } satisfies AnchorPosition),

        createMenuPositionRightSidepane: {
            right: 18,
            bottom: 75,
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
            maxHeight: '95%',
        },

        menuItemTextContainer: {
            minHeight: variables.componentSizeNormal,
        },

        chatLinkRowPressable: {
            minWidth: 0,
            textDecorationLine: 'none',
            flex: 1,
        },

        sidebarLink: {
            textDecorationLine: 'none',
        },

        sidebarLinkLHN: {
            textDecorationLine: 'none',
            marginLeft: 12,
            marginRight: 12,
            borderRadius: 8,
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

        sidebarLinkHoverLHN: {
            backgroundColor: theme.highlightBG,
        },

        sidebarLinkActive: {
            backgroundColor: theme.activeComponentBG,
            textDecorationLine: 'none',
        },

        sidebarLinkActiveLHN: {
            backgroundColor: theme.highlightBG,
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

        optionRowSelected: {
            backgroundColor: theme.activeComponentBG,
        },

        optionRowDisabled: {
            color: theme.textSupporting,
        },

        optionRowCompact: {
            height: variables.optionRowHeightCompact,
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

        travelIllustrationStyle: {
            marginTop: 16,
            marginBottom: -16,
        },

        overlayStyles: (current: OverlayStylesParams, isModalOnTheLeft: boolean) =>
            ({
                ...positioning.pFixed,
                // We need to stretch the overlay to cover the sidebar and the translate animation distance.
                left: isModalOnTheLeft ? 0 : -2 * variables.sideBarWidth,
                top: 0,
                bottom: 0,
                right: isModalOnTheLeft ? -2 * variables.sideBarWidth : 0,
                backgroundColor: theme.overlay,
                opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, variables.overlayOpacity],
                    extrapolate: 'clamp',
                }),
            } satisfies ViewStyle),

        nativeOverlayStyles: (current: OverlayStylesParams) =>
            ({
                position: 'absolute',
                backgroundColor: theme.overlay,
                width: '100%',
                height: '100%',
                opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, variables.overlayOpacity],
                    extrapolate: 'clamp',
                }),
            } satisfies ViewStyle),

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
            paddingLeft: 20,
        },

        LHNToggleIcon: {
            height: 15,
            width: 18,
        },

        chatContentScrollViewWithHeaderLoader: {
            paddingTop: CONST.CHAT_HEADER_LOADER_HEIGHT,
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
            flexBasis: 0,
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
        chatFooterAtTheTop: {
            flexGrow: 1,
            justifyContent: 'flex-start',
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

        customMarginButtonWithMenuItem: {
            marginRight: variables.bankButtonMargin,
        },

        composerSizeButton: {
            alignSelf: 'center',
            height: 32,
            width: 32,
            padding: 6,
            margin: 3,
            borderRadius: variables.componentBorderRadiusRounded,
            backgroundColor: theme.transparent,
            justifyContent: 'center',
        },

        chatItemAttachmentPlaceholder: {
            backgroundColor: theme.sidebar,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: variables.componentBorderRadiusNormal,
            height: 150,
            textAlign: 'center',
            verticalAlign: 'middle',
            width: 200,
        },

        chatItemPDFAttachmentLoading: {
            backgroundColor: 'transparent',
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: variables.componentBorderRadiusNormal,
            ...flex.alignItemsCenter,
            ...flex.justifyContentCenter,
        },

        sidebarVisible: {
            borderRightWidth: 1,
        },

        sidebarHidden: {
            width: 0,
            borderRightWidth: 0,
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

        secondAvatarSubscript: {
            position: 'absolute',
            right: -6,
            bottom: -6,
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

        emptyAvatarSmallNormal: {
            height: variables.avatarSizeSmallNormal,
            width: variables.avatarSizeSmallNormal,
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

        subscriptIcon: {
            position: 'absolute',
            bottom: -4,
            right: -4,
            width: 20,
            height: 20,
            backgroundColor: theme.buttonDefaultBG,
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

        borderNone: {
            borderWidth: 0,
            borderBottomWidth: 0,
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

        headerBarDesktopHeight: {
            height: variables.contentHeaderDesktopHeight,
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

        getPDFPasswordFormStyle: (isSmallScreenWidth: boolean) =>
            ({
                width: isSmallScreenWidth ? '100%' : 350,
                flexBasis: isSmallScreenWidth ? '100%' : 350,
                flexGrow: 0,
                alignSelf: 'flex-start',
            } satisfies ViewStyle),

        centeredModalStyles: (isSmallScreenWidth: boolean, isFullScreenWhenSmall: boolean) =>
            ({
                borderWidth: isSmallScreenWidth && !isFullScreenWhenSmall ? 1 : 0,
                marginHorizontal: isSmallScreenWidth ? 0 : 20,
            } satisfies ViewStyle),

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
            marginTop: 20,
            marginBottom: 8,
            textAlign: 'center',
        },

        blockingViewContainer: {
            paddingBottom: variables.contentHeaderHeight,
            maxWidth: 400,
            alignSelf: 'center',
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

        twoFactorAuthCodesBox: ({isExtraSmallScreenWidth, isSmallScreenWidth}: TwoFactorAuthCodesBoxParams) => {
            let paddingHorizontal = spacing.ph9;

            if (isSmallScreenWidth) {
                paddingHorizontal = spacing.ph4;
            }

            if (isExtraSmallScreenWidth) {
                paddingHorizontal = spacing.ph2;
            }

            return {
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.highlightBG,
                paddingVertical: 28,
                borderRadius: 16,
                marginTop: 32,
                ...paddingHorizontal,
            } satisfies ViewStyle;
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

        anonymousRoomFooter: (isSmallSizeLayout: boolean) =>
            ({
                flexDirection: isSmallSizeLayout ? 'column' : 'row',
                ...(!isSmallSizeLayout && {
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }),
                padding: 20,
                backgroundColor: theme.cardBG,
                borderRadius: variables.componentBorderRadiusLarge,
                overflow: 'hidden',
            } satisfies ViewStyle & TextStyle),
        anonymousRoomFooterWordmarkAndLogoContainer: (isSmallSizeLayout: boolean) =>
            ({
                flexDirection: 'row',
                alignItems: 'center',
                ...(isSmallSizeLayout && {
                    justifyContent: 'space-between',
                    marginTop: 16,
                }),
            } satisfies ViewStyle),
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

        workspaceUpgradeIntroBox: ({isExtraSmallScreenWidth}: WorkspaceUpgradeIntroBoxParams): ViewStyle => {
            let paddingHorizontal = spacing.ph5;
            let paddingVertical = spacing.pv5;

            if (isExtraSmallScreenWidth) {
                paddingHorizontal = spacing.ph2;
                paddingVertical = spacing.pv2;
            }

            return {
                backgroundColor: theme.highlightBG,
                borderRadius: 16,
                ...paddingVertical,
                ...paddingHorizontal,
            } satisfies ViewStyle;
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

        rootNavigatorContainerStyles: (isSmallScreenWidth: boolean) => ({marginLeft: isSmallScreenWidth ? 0 : variables.sideBarWidth, flex: 1} satisfies ViewStyle),
        RHPNavigatorContainerNavigatorContainerStyles: (isSmallScreenWidth: boolean) => ({marginLeft: isSmallScreenWidth ? 0 : variables.sideBarWidth, flex: 1} satisfies ViewStyle),

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

        avatarSectionWrapperSettings: {
            width: '100%',
            alignItems: 'center',
        },

        accountSettingsSectionContainer: {
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            ...spacing.mt0,
            ...spacing.mb0,
            ...spacing.pt0,
        },

        workspaceSettingsSectionContainer: {
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            ...spacing.pt4,
        },

        centralPaneAnimation: {
            height: CONST.CENTRAL_PANE_ANIMATION_HEIGHT,
        },

        sectionTitle: {
            ...spacing.pt2,
            ...spacing.pr3,
            ...spacing.pb4,
            paddingLeft: 13,
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

        sectionMenuItem: {
            borderRadius: 8,
            paddingHorizontal: 8,
            height: 56,
            alignItems: 'center',
        },

        sectionSelectCircle: {
            backgroundColor: theme.cardBG,
        },

        qrShareSection: {
            width: 264,
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
            backgroundColor: theme.border,
            flexGrow: 1,
            ...spacing.mh5,
            ...spacing.mv3,
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
            backgroundColor: theme.appBG,
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
            backgroundColor: theme.success,
        },

        switchInactive: {
            backgroundColor: theme.icon,
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

        switchThumbTransformation: (translateX: AnimatableNumericValue) =>
            ({
                transform: [{translateX}],
            } satisfies ViewStyle),

        radioButtonContainer: {
            backgroundColor: theme.componentBG,
            borderRadius: 10,
            height: 20,
            width: 20,
            borderColor: theme.border,
            borderWidth: 1,
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
            minHeight: variables.inputHeight,
        },

        magicCodeInput: {
            fontSize: variables.fontSizeXLarge,
            color: theme.heading,
            lineHeight: variables.inputHeight,
        },

        // Manually style transparent, in iOS Safari, an input in a container with its opacity set to
        // 0 (completely transparent) cannot handle user interaction, hence the Paste option is never shown
        inputTransparent: {
            color: 'transparent',
            // These properties are available in browser only
            ...(Browser.getBrowser()
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
            fontSize: variables.fontSizeh1,
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

        moneyRequestPreviewBoxText: {
            padding: 16,
        },

        amountSplitPadding: {
            paddingTop: 2,
        },

        moneyRequestPreviewBoxLoading: {
            // When a new IOU request arrives it is very briefly in a loading state, so set the minimum height of the container to 94 to match the rendered height after loading.
            // Otherwise, the IOU request pay button will not be fully visible and the user will have to scroll up to reveal the entire IOU request container.
            // See https://github.com/Expensify/App/issues/10283.
            minHeight: 94,
            width: '100%',
        },

        moneyRequestPreviewBoxAvatar: {
            // This should "hide" the right border of the last avatar
            marginRight: -2,
            marginBottom: 0,
        },

        moneyRequestPreviewAmount: {
            ...headlineFont,
            ...whiteSpace.preWrap,
            color: theme.heading,
        },

        moneyRequestLoadingHeight: {
            height: 27,
        },

        defaultCheckmarkWrapper: {
            marginLeft: 8,
            alignSelf: 'center',
        },

        codeWordWrapper: {
            ...codeStyles.codeWordWrapper,
        },

        codeWordStyle: {
            borderLeftWidth: 0,
            borderRightWidth: 0,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            paddingLeft: 0,
            paddingRight: 0,
            justifyContent: 'center',
            ...codeStyles.codeWordStyle,
        },

        codeFirstWordStyle: {
            borderLeftWidth: 1,
            borderTopLeftRadius: 4,
            borderBottomLeftRadius: 4,
            paddingLeft: 5,
        },

        codeLastWordStyle: {
            borderRightWidth: 1,
            borderTopRightRadius: 4,
            borderBottomRightRadius: 4,
            paddingRight: 5,
        },

        codePlainTextStyle: {
            ...codeStyles.codePlainTextStyle,
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

        growlNotificationTranslateY: (translateY: AnimatableNumericValue) =>
            ({
                transform: [{translateY}],
            } satisfies ViewStyle),

        makeSlideInTranslation: (translationType: Translation, fromValue: number) =>
            ({
                from: {
                    [translationType]: fromValue,
                },
                to: {
                    [translationType]: 0,
                },
            } satisfies CustomAnimation),

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

        blockquote: {
            borderLeftColor: theme.border,
            borderLeftWidth: 4,
            paddingLeft: 12,
            marginVertical: 4,
        },

        noSelect: {
            boxShadow: 'none',
            outlineStyle: 'none',
        },

        boxShadowNone: {
            boxShadow: 'none',
        },

        cardStyleNavigator: {
            overflow: 'hidden',
            height: '100%',
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

        peopleRowBorderBottom: {
            borderColor: theme.border,
            borderBottomWidth: 1,
            ...spacing.pb2,
        },

        offlineFeedback: {
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
                opacity: Platform.OS === 'ios' ? 0.99 : undefined,
            },
            error: {
                flexDirection: 'row',
                alignItems: 'center',
            },
            container: {
                ...spacing.pv2,
            },
            textContainer: {
                flexDirection: 'column',
                flex: 1,
            },
            text: {
                color: theme.textSupporting,
                verticalAlign: 'middle',
                fontSize: variables.fontSizeLabel,
            },
            errorDot: {
                marginRight: 12,
            },
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

        communicationsLinkHeight: {
            height: variables.communicationsLinkHeight,
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

        googleSearchTextInputContainer: {
            flexDirection: 'column',
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

        searchInputStyle: {
            color: theme.textSupporting,
            fontSize: 13,
            lineHeight: 16,
        },

        searchRouterInput: {
            borderRadius: variables.componentBorderRadiusSmall,
            borderWidth: 2,
            borderColor: theme.borderFocus,
        },

        searchRouterInputResults: {
            backgroundColor: theme.sidebarHover,
            borderWidth: 1,
            borderColor: theme.sidebarHover,
        },

        searchRouterInputResultsFocused: {
            borderWidth: 1,
            borderColor: theme.success,
        },

        searchTableHeaderActive: {
            fontWeight: FontUtils.fontWeight.bold,
        },

        threeDotsPopoverOffset: (windowWidth: number) =>
            ({
                ...getPopOverVerticalOffset(60),
                horizontal: windowWidth - 60,
            } satisfies AnchorPosition),

        threeDotsPopoverOffsetNoCloseButton: (windowWidth: number) =>
            ({
                ...getPopOverVerticalOffset(60),
                horizontal: windowWidth - 10,
            } satisfies AnchorPosition),

        threeDotsPopoverOffsetAttachmentModal: (windowWidth: number) =>
            ({
                ...getPopOverVerticalOffset(80),
                horizontal: windowWidth - 140,
            } satisfies AnchorPosition),

        popoverMenuOffset: (windowWidth: number) =>
            ({
                ...getPopOverVerticalOffset(180),
                horizontal: windowWidth - 355,
            } satisfies AnchorPosition),

        popoverButtonDropdownMenuOffset: (windowWidth: number) =>
            ({
                ...getPopOverVerticalOffset(70),
                horizontal: windowWidth - 20,
            } satisfies AnchorPosition),

        iPhoneXSafeArea: {
            backgroundColor: theme.inverse,
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

        invisibleOverlay: {
            backgroundColor: theme.transparent,
            zIndex: 1000,
        },

        invisibleImage: {
            opacity: 0,
            width: 200,
            height: 200,
        },

        reportDropOverlay: {
            backgroundColor: theme.dropUIBG,
            zIndex: 2,
        },

        fileDropOverlay: {
            backgroundColor: theme.fileDropUIBG,
            zIndex: 2,
        },

        isDraggingOver: {
            backgroundColor: theme.fileDropUIBG,
        },

        fileUploadImageWrapper: (fileTopPosition: number) =>
            ({
                position: 'absolute',
                top: fileTopPosition,
            } satisfies ViewStyle),

        cardSectionContainer: {
            backgroundColor: theme.cardBG,
            borderRadius: variables.componentBorderRadiusLarge,
            width: 'auto',
            textAlign: 'left',
            overflow: 'hidden',
            marginBottom: 20,
            marginHorizontal: variables.sectionMargin,
        },

        cardSectionIllustration: {
            width: 'auto',
            height: variables.sectionIllustrationHeight,
        },

        cardSectionTitle: {
            fontSize: variables.fontSizeLarge,
            lineHeight: variables.lineHeightXLarge,
        },

        cardMenuItem: {
            paddingLeft: 8,
            paddingRight: 0,
            borderRadius: variables.buttonBorderRadius,
            height: variables.componentSizeLarge,
            alignItems: 'center',
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

        stickyHeaderEmoji: (isSmallScreenWidth: boolean, windowWidth: number) =>
            ({
                position: 'absolute',
                width: isSmallScreenWidth ? windowWidth - 32 : CONST.EMOJI_PICKER_SIZE.WIDTH - 32,
                ...spacing.mh4,
            } satisfies ViewStyle),

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

        reportActionComposeTooltipWrapper: {
            backgroundColor: theme.tooltipHighlightBG,
            paddingVertical: 8,
            borderRadius: variables.componentBorderRadiusMedium,
        },

        quickActionTooltipWrapper: {
            backgroundColor: theme.tooltipHighlightBG,
        },

        quickActionTooltipTitle: {
            ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
            fontSize: variables.fontSizeLabel,
            color: theme.tooltipHighlightText,
        },

        quickActionTooltipSubtitle: {
            fontSize: variables.fontSizeLabel,
            color: theme.textDark,
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

        datePickerRoot: {
            position: 'relative',
            zIndex: 99,
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
            fontSize: variables.fontSizeNormal,
            lineHeight: variables.lineHeightNormal,
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
            width: 335,
            minHeight: 540,
            borderRadius: 20,
            overflow: 'hidden',
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
            maxWidth: 375,
        },

        formSpaceVertical: {
            height: 20,
            width: 1,
        },

        taskCheckboxWrapper: {
            height: variables.fontSizeNormalHeight,
            ...flex.justifyContentCenter,
        },

        taskTitleMenuItem: {
            ...writingDirection.ltr,
            ...headlineFont,
            fontSize: variables.fontSizeXLarge,
            maxWidth: '100%',
            ...wordBreak.breakWord,
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
            backgroundColor: theme.highlightBG,
        },

        splashScreenHider: {
            backgroundColor: theme.splashBG,
            alignItems: 'center',
            justifyContent: 'center',
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

        desktopSignInButtonContainer: {
            width: 40,
            height: 40,
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
            padding: variables.tabSelectorButtonPadding,
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

        tabText: (isSelected: boolean) =>
            ({
                marginLeft: 8,
                ...FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
                color: isSelected ? theme.text : theme.textSupporting,
                lineHeight: variables.lineHeightNormal,
                fontSize: variables.fontSizeNormal,
            } satisfies TextStyle),

        tabBackground: (hovered: boolean, isFocused: boolean, background: string | Animated.AnimatedInterpolation<string>) => ({
            backgroundColor: hovered && !isFocused ? theme.highlightBG : background,
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
                width: '100%',
                position: 'absolute',
                top: -height,
                left: 0,
                right: 0,
            } satisfies ViewStyle),

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
        },

        moneyRequestImage: {
            height: 200,
            borderRadius: 16,
            margin: 20,
            overflow: 'hidden',
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

        reportPreviewAmountSubtitleContainer: {
            gap: 4,
        },

        expenseAndReportPreviewTextButtonContainer: {
            gap: 16,
        },

        reportActionItemImagesContainer: {
            margin: 4,
        },

        reportActionItemImages: {
            flexDirection: 'row',
            borderRadius: 12,
            overflow: 'hidden',
            height: variables.reportActionImagesSingleImageHeight,
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

        assignedCardsIconContainer: {
            height: variables.bankCardHeight,
            width: variables.bankCardWidth,
            borderRadius: 4,
            overflow: 'hidden',
            alignSelf: 'center',
        },

        bankIconContainer: {
            height: variables.bankCardWidth,
            width: variables.bankCardWidth,
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
            ...(Browser.getBrowser() && !Browser.isMobile() && {transform: 'scale(.5)', fontSize: 22, overflow: 'visible'}),
            ...(Browser.getBrowser() &&
                Browser.isSafari() &&
                !Browser.isMobile() && {
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

        sidebarStatusAvatarContainer: {
            height: 40,
            width: 40,
            backgroundColor: theme.componentBG,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
        },
        sidebarStatusAvatar: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.border,
            height: 20,
            width: 20,
            borderRadius: 10,
            position: 'absolute',
            right: -4,
            bottom: -4,
            borderColor: theme.highlightBG,
            borderWidth: 2,
            overflow: 'hidden',
        },

        profilePageAvatar: {
            borderColor: theme.highlightBG,
        },

        justSignedInModalAnimation: (is2FARequired: boolean) => ({
            height: is2FARequired ? variables.modalTopIconHeight : variables.modalTopBigIconHeight,
        }),

        moneyRequestViewImage: {
            ...spacing.mh5,
            ...spacing.mv3,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: theme.cardBG,
            borderRadius: variables.componentBorderRadiusLarge,
            height: 200,
            maxWidth: 400,
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

        mapDirection: {
            lineColor: theme.success,
            lineWidth: 7,
        },

        mapDirectionLayer: {
            layout: {'line-join': 'round', 'line-cap': 'round'},
            paint: {'line-color': theme.success, 'line-width': 7},
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
        timePickerWidth100: {
            width: 100,
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
        },
        selectionListRadioSeparator: {
            height: StyleSheet.hairlineWidth,
            backgroundColor: theme.border,
            marginHorizontal: 20,
        },

        selectionListPressableItemWrapper: {
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingVertical: 16,
            marginHorizontal: 20,
            backgroundColor: theme.highlightBG,
            borderRadius: 8,
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
        },
        timePickerInputExtraSmall: {
            fontSize: 50,
        },
        setTimeFormButtonContainer: {
            minHeight: 54,
        },
        timePickerInputsContainer: {
            maxHeight: 100,
        },
        timePickerButtonErrorText: {
            position: 'absolute',
            top: -36,
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
            color: theme.heading,
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

        walletIllustration: {
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
            color: theme.darkSupportingText,
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

        aspectRatioLottie: (animation: DotLottieAnimation) => ({aspectRatio: animation.w / animation.h}),

        receiptDropHeaderGap: {
            backgroundColor: theme.fileDropUIBG,
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
        confirmBankInfoCard: {
            backgroundColor: colors.green800,
            borderRadius: variables.componentBorderRadiusCard,
            marginBottom: 20,
            marginHorizontal: 16,
            padding: 20,
            width: 'auto',
            textAlign: 'left',
        },
        confirmBankInfoText: {
            fontSize: variables.fontSizeNormal,
            ...FontUtils.fontFamily.platform.EXP_NEUE,
            color: theme.text,
        },
        confirmBankInfoCompanyIcon: {
            height: 40,
            width: 40,
            backgroundColor: colors.darkIcons,
            borderRadius: 50,
            justifyContent: 'center',
            alignItems: 'center',
        },
        confirmBankInfoBankIcon: {
            height: 40,
            width: 40,
            borderRadius: 50,
        },
        confirmBankInfoNumber: {
            ...FontUtils.fontFamily.platform.MONOSPACE,
            fontSize: variables.fontSizeNormal,
            lineHeight: variables.lineHeightXLarge,
            color: theme.text,
            textAlignVertical: 'center',
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
            backgroundColor: theme.highlightBG,
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

        colorSchemeStyle: (colorScheme: ColorScheme) => ({colorScheme}),

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

        widthAuto: {
            width: 'auto',
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

        emptyStateCardIllustrationContainer: {
            height: 220,
            ...flex.alignItemsCenter,
            ...flex.justifyContentCenter,
        },

        emptyStateCardIllustration: {
            width: 164,
            height: 190,
        },

        pendingStateCardIllustration: {
            width: 233,
            height: 162,
        },

        computerIllustrationContainer: {
            width: 272,
            height: 188,
        },

        cardIcon: {
            overflow: 'hidden',
            borderRadius: variables.cardBorderRadius,
            height: variables.cardIconHeight,
            alignSelf: 'center',
        },

        tripReservationIconContainer: {
            width: variables.avatarSizeNormal,
            height: variables.avatarSizeNormal,
            backgroundColor: theme.border,
            borderRadius: variables.componentBorderRadiusXLarge,
            alignItems: 'center',
            justifyContent: 'center',
        },

        textLineThrough: {
            textDecorationLine: 'line-through',
        },

        reportListItemTitle: {
            color: theme.text,
            fontSize: variables.fontSizeNormal,
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

        emptyStateHeader: (isIllustration: boolean) => ({
            borderTopLeftRadius: variables.componentBorderRadiusLarge,
            borderTopRightRadius: variables.componentBorderRadiusLarge,
            minHeight: 200,
            alignItems: isIllustration ? 'center' : undefined,
            justifyContent: isIllustration ? 'center' : undefined,
        }),

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

        workflowApprovalVerticalLine: {
            height: 16,
            width: 1,
            marginLeft: 19,
            backgroundColor: theme.border,
        },

        colorGreenSuccess: {
            color: colors.green400,
        },

        bgPaleGreen: {
            backgroundColor: colors.green100,
        },

        importColumnCard: {
            backgroundColor: theme.cardBG,
            borderRadius: variables.componentBorderRadiusNormal,
            padding: 16,
            flexWrap: 'wrap',
        },

        accountSwitcherPopover: {
            width: variables.sideBarWidth - 19,
        },

        accountSwitcherAnchorPosition: {
            top: 80,
            left: 12,
        },
    } satisfies Styles);

type ThemeStyles = ReturnType<typeof styles>;

const defaultStyles = styles(defaultTheme);

export default styles;
export {defaultStyles};
export type {Styles, ThemeStyles, StatusBarStyle, ColorScheme, AnchorPosition, AnchorDimensions};
