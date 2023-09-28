import {defaultStyles as defaultPickerStyles} from 'react-native-picker-select/src/styles';
import lodashClamp from 'lodash/clamp';
import fontFamily from './fontFamily';
import addOutlineWidth from './addOutlineWidth';
import defaultTheme from './themes/default';
import fontWeightBold from './fontWeight/bold';
import variables from './variables';
import spacing from './utilities/spacing';
import sizing from './utilities/sizing';
import flex from './utilities/flex';
import display from './utilities/display';
import overflow from './utilities/overflow';
import whiteSpace from './utilities/whiteSpace';
import wordBreak from './utilities/wordBreak';
import positioning from './utilities/positioning';
import codeStyles from './codeStyles';
import visibility from './utilities/visibility';
import writingDirection from './utilities/writingDirection';
import optionAlternateTextPlatformStyles from './optionAlternateTextPlatformStyles';
import pointerEventsNone from './pointerEventsNone';
import pointerEventsAuto from './pointerEventsAuto';
import getPopOverVerticalOffset from './getPopOverVerticalOffset';
import overflowXHidden from './overflowXHidden';
import CONST from '../CONST';
import * as Browser from '../libs/Browser';
import cursor from './utilities/cursor';
import userSelect from './utilities/userSelect';
import textUnderline from './utilities/textUnderline';

// touchCallout is an iOS safari only property that controls the display of the callout information when you touch and hold a target
const touchCalloutNone = Browser.isMobileSafari() ? {WebkitTouchCallout: 'none'} : {};
// to prevent vertical text offset in Safari for badges, new lineHeight values have been added
const lineHeightBadge = Browser.isSafari() ? {lineHeight: variables.lineHeightXSmall} : {lineHeight: variables.lineHeightNormal};

const picker = (theme) => ({
    backgroundColor: theme.transparent,
    color: theme.text,
    fontFamily: fontFamily.EXP_NEUE,
    fontSize: variables.fontSizeNormal,
    lineHeight: variables.fontSizeNormalHeight,
    paddingBottom: 8,
    paddingTop: 23,
    paddingLeft: 0,
    paddingRight: 25,
    height: variables.inputHeight,
    borderWidth: 0,
    textAlign: 'left',
});

const link = (theme) => ({
    color: theme.link,
    textDecorationColor: theme.link,
    fontFamily: fontFamily.EXP_NEUE,
});

const baseCodeTagStyles = (theme) => ({
    borderWidth: 1,
    borderRadius: 5,
    borderColor: theme.border,
    backgroundColor: theme.textBackground,
});

const headlineFont = {
    fontFamily: fontFamily.EXP_NEW_KANSAS_MEDIUM,
    fontWeight: '500',
};

const webViewStyles = (theme) => ({
    // As of react-native-render-html v6, don't declare distinct styles for
    // custom renderers, the API for custom renderers has changed. Declare the
    // styles in the below "tagStyles" instead. If you need to reuse those
    // styles from the renderer, just pass the "style" prop to the underlying
    // component.
    tagStyles: {
        em: {
            fontFamily: fontFamily.EXP_NEUE,
            fontStyle: 'italic',
        },

        del: {
            textDecorationLine: 'line-through',
            textDecorationStyle: 'solid',
            flex: 1,
        },

        strong: {
            fontFamily: fontFamily.EXP_NEUE,
            fontWeight: 'bold',
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
            paddingTop: 12,
            paddingBottom: 12,
            paddingRight: 8,
            paddingLeft: 8,
            fontFamily: fontFamily.MONOSPACE,
            marginTop: 0,
            marginBottom: 0,
        },

        code: {
            ...baseCodeTagStyles(theme),
            ...codeStyles.codeTextStyle,
            paddingLeft: 5,
            paddingRight: 5,
            fontFamily: fontFamily.MONOSPACE,
            fontSize: 13,
        },

        img: {
            borderColor: theme.border,
            borderRadius: variables.componentBorderRadiusNormal,
            borderWidth: 1,
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
        fontFamily: fontFamily.EXP_NEUE,
        flex: 1,
        lineHeight: variables.fontSizeNormalHeight,
        ...writingDirection.ltr,
    },
});

const styles = (theme) => ({
    // Add all of our utility and helper styles
    ...spacing,
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
    ...theme, // TODO: Should we do this?

    autoCompleteSuggestionsContainer: {
        backgroundColor: theme.appBG,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.border,
        justifyContent: 'center',
        boxShadow: variables.popoverMenuShadow,
        position: 'absolute',
        left: 0,
        right: 0,
        paddingVertical: CONST.AUTO_COMPLETE_SUGGESTER.SUGGESTER_INNER_PADDING,
    },

    autoCompleteSuggestionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontWeight: fontWeightBold,
    },

    mentionSuggestionsHandle: {
        color: theme.textSupporting,
    },

    webViewStyles: webViewStyles(theme),

    link: link(theme),

    linkMuted: {
        color: theme.textSupporting,
        textDecorationColor: theme.textSupporting,
        fontFamily: fontFamily.EXP_NEUE,
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

    h4: {
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontSize: variables.fontSizeLabel,
        fontWeight: fontWeightBold,
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

    textUnderline: {
        textDecorationLine: 'underline',
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

    mutedTextLabel: {
        color: theme.textSupporting,
        fontSize: variables.fontSizeLabel,
        lineHeight: variables.lineHeightLarge,
    },

    textMicro: {
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeSmall,
        lineHeight: variables.lineHeightSmall,
    },

    textMicroBold: {
        color: theme.text,
        fontWeight: fontWeightBold,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontSize: variables.fontSizeSmall,
        lineHeight: variables.lineHeightSmall,
    },

    textMicroSupporting: {
        color: theme.textSupporting,
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeSmall,
        lineHeight: variables.lineHeightSmall,
    },

    textExtraSmallSupporting: {
        color: theme.textSupporting,
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeExtraSmall,
    },

    textNormal: {
        fontSize: variables.fontSizeNormal,
    },

    textLarge: {
        fontSize: variables.fontSizeLarge,
    },

    textXLarge: {
        fontSize: variables.fontSizeXLarge,
    },

    textXXLarge: {
        fontSize: variables.fontSizeXXLarge,
    },

    textXXXLarge: {
        fontSize: variables.fontSizeXXXLarge,
    },

    textHero: {
        fontSize: variables.fontSizeHero,
        fontFamily: fontFamily.EXP_NEW_KANSAS_MEDIUM,
        lineHeight: variables.lineHeightHero,
    },

    textStrong: {
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontWeight: fontWeightBold,
    },

    textItalic: {
        fontFamily: fontFamily.EXP_NEUE_ITALIC,
        fontStyle: 'italic',
    },

    textHeadline: {
        ...headlineFont,
        ...whiteSpace.preWrap,
        color: theme.heading,
        fontSize: variables.fontSizeXLarge,
        lineHeight: variables.lineHeightXXLarge,
    },

    textHeadlineH1: {
        ...headlineFont,
        ...whiteSpace.preWrap,
        color: theme.heading,
        fontSize: variables.fontSizeh1,
        lineHeight: variables.lineHeightSizeh1,
    },

    textDecorationNoLine: {
        textDecorationLine: 'none',
    },

    textWhite: {
        color: theme.textLight,
    },

    textBlue: {
        color: theme.link,
    },

    textUppercase: {
        textTransform: 'uppercase',
    },

    textNoWrap: {
        ...whiteSpace.noWrap,
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

    opacity1: {
        opacity: 1,
    },

    textDanger: {
        color: theme.danger,
    },

    borderRadiusNormal: {
        borderRadius: variables.buttonBorderRadius,
    },

    button: {
        backgroundColor: theme.buttonDefaultBG,
        borderRadius: variables.buttonBorderRadius,
        minHeight: variables.componentSizeLarge,
        justifyContent: 'center',
        ...spacing.ph3,
    },

    buttonContainer: {
        padding: 1,
        borderRadius: variables.buttonBorderRadius,
    },

    buttonText: {
        color: theme.text,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontSize: variables.fontSizeNormal,
        fontWeight: fontWeightBold,
        textAlign: 'center',
        flexShrink: 1,

        // It is needed to unset the Lineheight. We don't need it for buttons as button always contains single line of text.
        // It allows to vertically center the text.
        lineHeight: undefined,

        // Add 1px to the Button text to give optical vertical alignment.
        paddingBottom: 1,
    },

    buttonSmall: {
        borderRadius: variables.buttonBorderRadius,
        minHeight: variables.componentSizeSmall,
        paddingTop: 4,
        paddingHorizontal: 14,
        paddingBottom: 4,
        backgroundColor: theme.buttonDefaultBG,
    },

    buttonMedium: {
        borderRadius: variables.buttonBorderRadius,
        minHeight: variables.componentSizeNormal,
        paddingTop: 12,
        paddingRight: 16,
        paddingBottom: 12,
        paddingLeft: 16,
        backgroundColor: theme.buttonDefaultBG,
    },

    buttonLarge: {
        borderRadius: variables.buttonBorderRadius,
        minHeight: variables.componentSizeLarge,
        paddingTop: 8,
        paddingRight: 10,
        paddingBottom: 8,
        paddingLeft: 18,
        backgroundColor: theme.buttonDefaultBG,
    },

    buttonSmallText: {
        fontSize: variables.fontSizeSmall,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontWeight: fontWeightBold,
        textAlign: 'center',
    },

    buttonMediumText: {
        fontSize: variables.fontSizeLabel,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontWeight: fontWeightBold,
        textAlign: 'center',
    },

    buttonLargeText: {
        fontSize: variables.fontSizeNormal,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontWeight: fontWeightBold,
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
        height: variables.dropDownButtonDividerHeight,
        borderWidth: 0.7,
        borderColor: theme.text,
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
        paddingVertical: 6,
        ...spacing.mh4,
    },

    buttonCTAIcon: {
        marginRight: 22,

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

    pickerSmall: (backgroundColor = theme.highlightBG) => ({
        inputIOS: {
            fontFamily: fontFamily.EXP_NEUE,
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
            fontSize: defaultPickerStyles.done.fontSize,
        },
        modalViewMiddle: {
            backgroundColor: theme.border,
            borderTopWidth: 0,
        },
        modalViewBottom: {
            backgroundColor: theme.highlightBG,
        },
        inputWeb: {
            fontFamily: fontFamily.EXP_NEUE,
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
            ...cursor.cursorPointer,
        },
        inputAndroid: {
            fontFamily: fontFamily.EXP_NEUE,
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
    }),

    badge: {
        backgroundColor: theme.border,
        borderRadius: 14,
        height: variables.iconSizeNormal,
        flexDirection: 'row',
        paddingHorizontal: 7,
        alignItems: 'center',
    },

    badgeSuccess: {
        backgroundColor: theme.success,
    },

    badgeSuccessPressed: {
        backgroundColor: theme.successHover,
    },

    badgeAdHocSuccess: {
        backgroundColor: theme.badgeAdHoc,
    },

    badgeAdHocSuccessPressed: {
        backgroundColor: theme.badgeAdHocHover,
    },

    badgeDanger: {
        backgroundColor: theme.danger,
    },

    badgeDangerPressed: {
        backgroundColor: theme.dangerPressed,
    },

    badgeText: {
        color: theme.text,
        fontSize: variables.fontSizeSmall,
        ...lineHeightBadge,
        ...whiteSpace.noWrap,
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

    uploadReceiptView: (isSmallScreenWidth) => ({
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
    }),

    receiptViewTextContainer: {
        paddingHorizontal: 40,
        ...sizing.w100,
    },

    cameraView: {
        flex: 1,
        overflow: 'hidden',
        padding: 10,
        borderRadius: 28,
        borderStyle: 'solid',
        borderWidth: 8,
        backgroundColor: theme.highlightBG,
        borderColor: theme.appBG,
    },

    permissionView: {
        paddingVertical: 108,
        paddingHorizontal: 61,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerAnonymousFooter: {
        color: theme.heading,
        fontFamily: fontFamily.EXP_NEW_KANSAS_MEDIUM,
        fontSize: variables.fontSizeXLarge,
        lineHeight: variables.lineHeightXXLarge,
    },

    headerText: {
        color: theme.heading,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontSize: variables.fontSizeNormal,
        fontWeight: fontWeightBold,
    },

    headerGap: {
        height: CONST.DESKTOP_HEADER_PADDING,
    },

    reportOptions: {
        marginLeft: 8,
    },

    chatItemComposeSecondaryRow: {
        height: 15,
        marginBottom: 5,
        marginTop: 5,
    },

    chatItemComposeSecondaryRowSubText: {
        color: theme.textSupporting,
        fontFamily: fontFamily.EXP_NEUE,
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

    calendarDayContainerSelected: {
        backgroundColor: theme.buttonDefaultBG,
    },

    /**
     * @param {number} textInputHeight
     * @param {number} minHeight
     * @param {number} maxHeight
     * @returns {object}
     */
    autoGrowHeightInputContainer: (textInputHeight, minHeight, maxHeight) => ({
        height: lodashClamp(textInputHeight, minHeight, maxHeight),
        minHeight,
    }),

    autoGrowHeightHiddenInput: (maxWidth, maxHeight) => ({
        maxWidth,
        maxHeight: maxHeight && maxHeight + 1,
        overflow: 'hidden',
    }),

    textInputContainer: {
        flex: 1,
        justifyContent: 'center',
        height: '100%',
        backgroundColor: 'transparent',
        borderBottomWidth: 2,
        borderColor: theme.border,
        overflow: 'hidden',
    },

    textInputLabel: {
        position: 'absolute',
        left: 0,
        top: 0,
        fontSize: variables.fontSizeNormal,
        color: theme.textSupporting,
        fontFamily: fontFamily.EXP_NEUE,
        width: '100%',
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

    textInputLabelTransformation: (translateY, translateX, scale) => ({
        transform: [{translateY}, {translateX}, {scale}],
    }),

    baseTextInput: {
        fontFamily: fontFamily.EXP_NEUE,
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

    textInputDesktop: addOutlineWidth({}, 0),

    textInputIconContainer: {
        paddingHorizontal: 11,
        justifyContent: 'center',
        margin: 1,
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
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeNormal,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 10,
        paddingBottom: 10,
        textAlignVertical: 'center',
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

    textInputPrefix: {
        color: theme.text,
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeNormal,
        textAlignVertical: 'center',
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

    picker: (disabled = false, backgroundColor = theme.appBG) => ({
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
            fontSize: defaultPickerStyles.done.fontSize,
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
    }),

    disabledText: {
        color: theme.icon,
    },

    inputDisabled: {
        backgroundColor: theme.highlightBG,
        color: theme.icon,
    },

    noOutline: addOutlineWidth({}, 0),

    textLabelSupporting: {
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeLabel,
        color: theme.textSupporting,
    },

    textLabelError: {
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeLabel,
        color: theme.textError,
    },

    textReceiptUpload: {
        ...headlineFont,
        fontSize: variables.fontSizeXLarge,
        color: theme.textLight,
        textAlign: 'center',
    },

    subTextReceiptUpload: {
        fontFamily: fontFamily.EXP_NEUE,
        lineHeight: variables.lineHeightLarge,
        textAlign: 'center',
        color: theme.textLight,
    },

    furtherDetailsText: {
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeSmall,
        color: theme.textSupporting,
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
        lineHeight: variables.lineHeightLarge,
        marginBottom: 4,
    },

    formError: {
        color: theme.textError,
        fontSize: variables.fontSizeLabel,
        lineHeight: variables.formErrorLineHeight,
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

    sidebarAnimatedWrapperContainer: {
        height: '100%',
        position: 'absolute',
    },

    sidebarFooter: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        paddingVertical: variables.lineHeightXLarge,
        width: '100%',
    },

    sidebarAvatar: {
        backgroundColor: theme.icon,
        borderRadius: 20,
        height: variables.componentSizeNormal,
        width: variables.componentSizeNormal,
    },

    statusIndicator: (backgroundColor = theme.danger) => ({
        borderColor: theme.sidebar,
        backgroundColor,
        borderRadius: 8,
        borderWidth: 2,
        position: 'absolute',
        right: -2,
        top: -1,
        height: 16,
        width: 16,
        zIndex: 10,
    }),

    floatingActionButtonContainer: {
        position: 'absolute',
        right: 20,

        // The bottom of the floating action button should align with the bottom of the compose box.
        // The value should be equal to the height + marginBottom + marginTop of chatItemComposeSecondaryRow
        bottom: 25,
    },

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
        fontWeight: '700',
        width: 200,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        ...whiteSpace.noWrap,
    },

    sidebarFooterLink: {
        color: theme.textSupporting,
        fontSize: variables.fontSizeSmall,
        textDecorationLine: 'none',
        fontFamily: fontFamily.EXP_NEUE,
        lineHeight: 20,
    },

    sidebarListContainer: {
        scrollbarWidth: 'none',
        paddingBottom: 4,
    },

    sidebarListItem: {
        justifyContent: 'center',
        textDecorationLine: 'none',
    },

    RHPNavigatorContainer: (isSmallScreenWidth) => ({
        width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,
        position: 'absolute',
        right: 0,
        height: '100%',
    }),

    onlyEmojisText: {
        fontSize: variables.fontSizeOnlyEmojis,
        lineHeight: variables.fontSizeOnlyEmojisHeight,
    },

    onlyEmojisTextLineHeight: {
        lineHeight: variables.fontSizeOnlyEmojisHeight,
    },

    createMenuPositionSidebar: (windowHeight) => ({
        horizontal: 18,
        vertical: windowHeight - 100,
    }),

    createMenuPositionProfile: (windowWidth) => ({
        horizontal: windowWidth - 355,
        ...getPopOverVerticalOffset(162),
    }),

    createMenuPositionReportActionCompose: (windowHeight) => ({
        horizontal: 18 + variables.sideBarWidth,
        vertical: windowHeight - 83,
    }),

    createMenuPositionRightSidepane: {
        right: 18,
        bottom: 75,
    },

    createMenuContainer: {
        width: variables.sideBarWidth - 40,
        paddingVertical: 12,
    },

    createMenuHeaderText: {
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeLabel,
        color: theme.heading,
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

    sidebarLinkInner: {
        alignItems: 'center',
        flexDirection: 'row',
        paddingLeft: 20,
        paddingRight: 20,
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
        backgroundColor: theme.border,
        textDecorationLine: 'none',
    },

    sidebarLinkTextBold: {
        fontWeight: '700',
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
        fontFamily: fontFamily.EXP_NEUE,
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
        height: variables.optionsListSectionHeaderHeight,
    },

    overlayStyles: (current) => ({
        position: 'fixed',

        // We need to stretch the overlay to cover the sidebar and the translate animation distance.
        left: -2 * variables.sideBarWidth,
        top: 0,
        bottom: 0,
        right: 0,
        backgroundColor: theme.overlay,
        opacity: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, variables.overlayOpacity],
            extrapolate: 'clamp',
        }),
    }),

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

    chatContentScrollView: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingBottom: 16,
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
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontSize: variables.fontSizeNormal,
        fontWeight: fontWeightBold,
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
        fontFamily: fontFamily.EXP_NEUE,
        lineHeight: variables.lineHeightXLarge,
        maxWidth: '100%',
        ...cursor.cursorAuto,
        ...whiteSpace.preWrap,
        ...wordBreak.breakWord,
    },

    renderHTMLTitle: {
        color: theme.text,
        fontSize: variables.fontSizeNormal,
        fontFamily: fontFamily.EXP_NEUE,
        lineHeight: variables.lineHeightXLarge,
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
        flex: 1,
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
        {
            backgroundColor: theme.componentBG,
            borderColor: theme.border,
            color: theme.text,
            fontFamily: fontFamily.EXP_NEUE,
            fontSize: variables.fontSizeNormal,
            borderWidth: 0,
            height: 'auto',
            lineHeight: variables.lineHeightXLarge,
            ...overflowXHidden,

            // On Android, multiline TextInput with height: 'auto' will show extra padding unless they are configured with
            // paddingVertical: 0, alignSelf: 'center', and textAlignVertical: 'center'

            paddingHorizontal: variables.avatarChatSpacing,
            paddingTop: 0,
            paddingBottom: 0,
            alignSelf: 'center',
            textAlignVertical: 'center',
        },
        0,
    ),

    textInputFullCompose: {
        alignSelf: 'stretch',
        flex: 1,
        maxHeight: '100%',
        textAlignVertical: 'top',
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
        width: '100%',
    },

    emojiSkinToneTitle: {
        width: '100%',
        ...spacing.pv1,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontWeight: fontWeightBold,
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
        width: '12.5%',
        textAlign: 'center',
        borderRadius: 8,
        paddingTop: 2,
        paddingBottom: 2,
        height: CONST.EMOJI_PICKER_ITEM_HEIGHT,
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

    hoveredButton: {
        backgroundColor: theme.buttonHoveredBG,
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
        borderRadius: 24,
    },

    singleAvatarSmall: {
        height: 18,
        width: 18,
        backgroundColor: theme.icon,
        borderRadius: 18,
    },

    secondAvatar: {
        position: 'absolute',
        right: -18,
        bottom: -18,
        borderWidth: 3,
        borderRadius: 30,
        borderColor: 'transparent',
    },

    secondAvatarSmall: {
        position: 'absolute',
        right: -13,
        bottom: -13,
        borderWidth: 3,
        borderRadius: 18,
        borderColor: 'transparent',
    },

    secondAvatarSubscript: {
        position: 'absolute',
        right: -6,
        bottom: -6,
    },

    secondAvatarSubscriptCompact: {
        position: 'absolute',
        bottom: -1,
        right: -1,
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

    avatarLarge: {
        width: variables.avatarSizeLarge,
        height: variables.avatarSizeLarge,
    },

    avatarXLarge: {
        width: variables.avatarSizeXLarge,
        height: variables.avatarSizeXLarge,
    },

    avatarInnerText: {
        color: theme.textLight,
        fontSize: variables.fontSizeSmall,
        lineHeight: undefined,
        marginLeft: -3,
        textAlign: 'center',
    },

    avatarInnerTextSmall: {
        color: theme.textLight,
        fontSize: variables.fontSizeExtraSmall,
        lineHeight: undefined,
        marginLeft: -2,
        textAlign: 'center',
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

    headerBar: {
        overflow: 'hidden',
        justifyContent: 'center',
        display: 'flex',
        paddingLeft: 20,
        height: variables.contentHeaderHeight,
        width: '100%',
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

    PDFView: {
        // `display: grid` is not supported in native platforms!
        // It's being used on Web/Desktop only to vertically center short PDFs,
        // while preventing the overflow of the top of long PDF files.
        display: 'grid',
        backgroundColor: theme.modalBackground,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        overflow: 'hidden',
        alignItems: 'center',
    },

    PDFViewList: {
        overflowX: 'hidden',
        // There properties disable "focus" effect on list
        boxShadow: 'none',
        outline: 'none',
    },

    getPDFPasswordFormStyle: (isSmallScreenWidth) => ({
        width: isSmallScreenWidth ? '100%' : 350,
        ...(isSmallScreenWidth && flex.flex1),
    }),

    centeredModalStyles: (isSmallScreenWidth, isFullScreenWhenSmall) => ({
        borderWidth: isSmallScreenWidth && !isFullScreenWhenSmall ? 1 : 0,
        marginHorizontal: isSmallScreenWidth ? 0 : 20,
    }),

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
    },

    defaultModalContainer: {
        backgroundColor: theme.componentBG,
        borderColor: theme.transparent,
    },

    reportActionContextMenuMiniButton: {
        ...spacing.p1,
        ...spacing.mv1,
        ...spacing.mh1,
        ...{borderRadius: variables.buttonBorderRadius},
    },

    reportActionSystemMessageContainer: {
        marginLeft: 42,
    },

    reportDetailsTitleContainer: {
        ...flex.dFlex,
        ...flex.flexColumn,
        ...flex.alignItemsCenter,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    reportDetailsRoomInfo: {
        ...flex.flex1,
        ...flex.dFlex,
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

    twoFactorAuthCodesBox: ({isExtraSmallScreenWidth, isSmallScreenWidth}) => {
        let paddingHorizontal = styles.ph9;

        if (isSmallScreenWidth) {
            paddingHorizontal = styles.ph4;
        }

        if (isExtraSmallScreenWidth) {
            paddingHorizontal = styles.ph2;
        }

        return {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.highlightBG,
            paddingVertical: 28,
            borderRadius: 16,
            marginTop: 32,
            ...paddingHorizontal,
        };
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
        fontFamily: fontFamily.MONOSPACE,
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

    anonymousRoomFooter: (isSmallSizeLayout) => ({
        flexDirection: isSmallSizeLayout ? 'column' : 'row',
        ...(!isSmallSizeLayout && {
            alignItems: 'center',
            justifyContent: 'space-between',
        }),
        padding: 20,
        backgroundColor: theme.sidebar,
        borderRadius: variables.componentBorderRadiusLarge,
        overflow: 'hidden',
    }),
    anonymousRoomFooterWordmarkAndLogoContainer: (isSmallSizeLayout) => ({
        flexDirection: 'row',
        alignItems: 'center',
        ...(isSmallSizeLayout && {
            justifyContent: 'space-between',
            marginTop: 16,
        }),
    }),
    anonymousRoomFooterLogo: {
        width: 88,
        marginLeft: 0,
        height: 20,
    },
    anonymousRoomFooterLogoTaglineText: {
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeMedium,
        color: theme.textLight,
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

    rootNavigatorContainerStyles: (isSmallScreenWidth) => ({marginLeft: isSmallScreenWidth ? 0 : variables.sideBarWidth, flex: 1}),
    RHPNavigatorContainerNavigatorContainerStyles: (isSmallScreenWidth) => ({marginLeft: isSmallScreenWidth ? 0 : variables.sideBarWidth, flex: 1}),

    avatarInnerTextChat: {
        color: theme.textLight,
        fontSize: variables.fontSizeXLarge,
        fontFamily: fontFamily.EXP_NEW_KANSAS_MEDIUM,
        textAlign: 'center',
        fontWeight: 'normal',
        position: 'absolute',
        width: 88,
        left: -16,
    },

    pageWrapper: {
        width: '100%',
        alignItems: 'center',
        padding: 20,
    },

    avatarSectionWrapper: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    avatarSectionWrapperSkeleton: {
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 20,
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
        marginHorizontal: 20,
    },

    unreadIndicatorText: {
        color: theme.unreadIndicator,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontSize: variables.fontSizeSmall,
        fontWeight: fontWeightBold,
        textTransform: 'capitalize',
    },

    flipUpsideDown: {
        transform: [{rotate: '180deg'}],
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
        backgroundColor: theme.border,
    },

    switchThumb: {
        width: 22,
        height: 22,
        borderRadius: 11,
        position: 'absolute',
        left: 4,
        backgroundColor: theme.appBG,
    },

    switchThumbTransformation: (translateX) => ({
        transform: [{translateX}],
    }),

    radioButtonContainer: {
        backgroundColor: theme.componentBG,
        borderRadius: 10,
        height: 20,
        width: 20,
        borderColor: theme.icon,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    checkboxPressable: {
        borderRadius: 6,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
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
        {
            ...headlineFont,
            fontSize: variables.iouAmountTextSize,
            color: theme.heading,
            padding: 0,
            lineHeight: undefined,
        },
        0,
    ),

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

    requestPreviewBox: {
        marginTop: 12,
        maxWidth: variables.sideBarWidth,
    },

    moneyRequestPreviewBox: {
        backgroundColor: theme.cardBG,
        borderRadius: variables.componentBorderRadiusLarge,
        maxWidth: variables.sideBarWidth,
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
        marginRight: -10,
        marginBottom: 0,
    },

    moneyRequestPreviewAmount: {
        ...headlineFont,
        ...whiteSpace.preWrap,
        color: theme.heading,
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
        position: 'fixed',
    },

    growlNotificationTranslateY: (y) => ({
        transform: [{translateY: y}],
    }),

    makeSlideInTranslation: (translationType, fromValue) => ({
        from: {
            [translationType]: fromValue,
        },
        to: {
            [translationType]: 0,
        },
    }),

    growlNotificationBox: {
        backgroundColor: theme.inverse,
        borderRadius: variables.componentBorderRadiusNormal,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        shadowColor: theme.shadow,
        ...spacing.p5,
    },

    growlNotificationText: {
        fontSize: variables.fontSizeNormal,
        fontFamily: fontFamily.EXP_NEUE,
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
        outline: 'none',
    },

    cardStyleNavigator: {
        overflow: 'hidden',
        height: '100%',
    },

    smallEditIcon: {
        alignItems: 'center',
        backgroundColor: theme.buttonHoveredBG,
        borderColor: theme.textReversed,
        borderRadius: 14,
        borderWidth: 3,
        color: theme.textReversed,
        height: 28,
        width: 28,
        justifyContent: 'center',
    },

    smallAvatarEditIcon: {
        position: 'absolute',
        right: -4,
        bottom: -4,
    },

    autoGrowHeightMultilineInput: {
        maxHeight: 115,
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

    peopleBadge: {
        backgroundColor: theme.icon,
        ...spacing.ph3,
    },

    peopleBadgeText: {
        color: theme.textReversed,
        fontSize: variables.fontSizeSmall,
        lineHeight: variables.lineHeightNormal,
        ...whiteSpace.noWrap,
    },

    offlineFeedback: {
        deleted: {
            textDecorationLine: 'line-through',
            textDecorationStyle: 'solid',
        },
        pending: {
            opacity: 0.5,
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
            textAlignVertical: 'center',
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

    sidebarPopover: {
        width: variables.sideBarWidth - 68,
    },

    cardOverlay: {
        backgroundColor: theme.overlay,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: variables.overlayOpacity,
    },

    shortTermsBorder: {
        borderWidth: 1,
        borderColor: theme.border,
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
        fontSize: variables.fontSizeXXXLarge,
        lineHeight: variables.lineHeightXXXLarge,
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

    floatingMessageCounterWrapperAndroid: {
        left: 0,
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        zIndex: 100,
        ...visibility.hidden,
    },

    floatingMessageCounterSubWrapperAndroid: {
        left: '50%',
        width: 'auto',
    },

    floatingMessageCounter: {
        left: '-50%',
        ...visibility.visible,
    },

    floatingMessageCounterTransformation: (translateY) => ({
        transform: [{translateY}],
    }),

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
        fontFamily: fontFamily.EXP_NEUE,
        flex: 1,
    },

    threeDotsPopoverOffset: (windowWidth) => ({
        ...getPopOverVerticalOffset(60),
        horizontal: windowWidth - 60,
    }),

    threeDotsPopoverOffsetNoCloseButton: (windowWidth) => ({
        ...getPopOverVerticalOffset(60),
        horizontal: windowWidth - 10,
    }),

    threeDotsPopoverOffsetAttachmentModal: (windowWidth) => ({
        ...getPopOverVerticalOffset(80),
        horizontal: windowWidth - 140,
    }),

    invert: {
        // It's important to invert the Y AND X axis to prevent a react native issue that can lead to ANRs on android 13
        transform: [{scaleX: -1}, {scaleY: -1}],
    },

    keyboardShortcutModalContainer: {
        maxHeight: '100%',
        flex: 0,
        flexBasis: 'auto',
    },

    keyboardShortcutTableWrapper: {
        alignItems: 'center',
        flex: 1,
        height: 'auto',
        maxHeight: '100%',
    },

    keyboardShortcutTableContainer: {
        display: 'flex',
        width: '100%',
        borderColor: theme.border,
        height: 'auto',
        borderRadius: variables.componentBorderRadius,
        borderWidth: 1,
    },

    keyboardShortcutTableRow: {
        flex: 1,
        flexDirection: 'row',
        borderColor: theme.border,
        flexBasis: 'auto',
        alignSelf: 'stretch',
        borderTopWidth: 1,
    },

    keyboardShortcutTablePrefix: {
        width: '30%',
        borderRightWidth: 1,
        borderColor: theme.border,
    },

    keyboardShortcutTableFirstRow: {
        borderTopWidth: 0,
    },

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
        fontFamily: fontFamily.EXP_NEUE,
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

    reportDropOverlay: {
        backgroundColor: theme.dropUIBG,
        zIndex: 2,
    },

    receiptDropOverlay: {
        backgroundColor: theme.receiptDropUIBG,
        zIndex: 2,
    },

    receiptImageWrapper: (receiptImageTopPosition) => ({
        position: 'absolute',
        top: receiptImageTopPosition,
    }),

    cardSection: {
        backgroundColor: theme.cardBG,
        borderRadius: variables.componentBorderRadiusCard,
        marginBottom: 20,
        marginHorizontal: 16,
        padding: 20,
        width: 'auto',
        textAlign: 'left',
    },

    cardSectionTitle: {
        lineHeight: variables.lineHeightXXLarge,
    },

    cardMenuItem: {
        paddingLeft: 8,
        paddingRight: 0,
        borderRadius: variables.buttonBorderRadius,
        height: variables.componentSizeLarge,
        alignItems: 'center',
    },

    archivedReportFooter: {
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
        fontSize: 15,
        lineHeight: 20,
        textAlignVertical: 'center',
    },

    emojiReactionBubbleText: {
        textAlignVertical: 'center',
    },

    reactionCounterText: {
        fontSize: 13,
        marginLeft: 4,
        fontWeight: 'bold',
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
        fontFamily: fontFamily.EXP_NEUE,
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
        fontFamily: fontFamily.EXP_NEW_KANSAS_MEDIUM,
        color: theme.success,
        fontWeight: '500',
        textAlign: 'center',
    },

    newKansasLarge: {
        ...headlineFont,
        fontSize: variables.fontSizeXLarge,
        lineHeight: variables.lineHeightXXLarge,
    },

    loginHeroBody: {
        fontFamily: fontFamily.EXP_NEUE,
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
        resizeMode: 'contain',
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

    taskCheckbox: {
        height: 16,
        width: 16,
    },

    taskTitleMenuItem: {
        ...writingDirection.ltr,
        ...headlineFont,
        ...spacing.flexWrap,
        ...spacing.flex1,
        fontSize: variables.fontSizeXLarge,
        maxWidth: '100%',
        ...wordBreak.breakWord,
    },

    taskDescriptionMenuItem: {
        maxWidth: '100%',
        ...wordBreak.breakWord,
    },

    taskTitleDescription: {
        fontFamily: fontFamily.EXP_NEUE,
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
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontWeight: fontWeightBold,
        minHeight: variables.avatarSizeSubscript,
    },

    taskRightIconContainer: {
        width: variables.componentSizeNormal,
        marginLeft: 'auto',
        ...spacing.mt1,
        ...pointerEventsAuto,
        ...spacing.dFlex,
        ...spacing.alignItemsCenter,
    },

    shareCodePage: {
        paddingHorizontal: 38.5,
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
        marginLeft: 0,
        marginBottom: 2,
        height: 12,
        paddingLeft: 4,
        paddingRight: 4,
        alignItems: 'center',
    },

    headerEnvBadgeText: {
        fontSize: 7,
        fontWeight: fontWeightBold,
        lineHeight: undefined,
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
        width: 219,
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

    tabText: (isSelected) => ({
        marginLeft: 8,
        fontFamily: isSelected ? fontFamily.EXP_NEUE_BOLD : fontFamily.EXP_NEUE,
        fontWeight: isSelected ? fontWeightBold : 400,
        color: isSelected ? theme.textLight : theme.textSupporting,
    }),

    /**
     * @param {String} backgroundColor
     * @param {Number} height
     * @returns {Object}
     */
    overscrollSpacer: (backgroundColor, height) => ({
        backgroundColor,
        height,
        width: '100%',
        position: 'absolute',
        top: -height,
        left: 0,
        right: 0,
    }),

    dualColorOverscrollSpacer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
    },

    willChangeTransform: {
        willChange: 'transform',
    },

    dropDownButtonCartIconContainerPadding: {
        paddingRight: 0,
        paddingLeft: 0,
    },

    dropDownButtonArrowContain: {
        marginLeft: 12,
        marginRight: 14,
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
        marginBottom: 32,
        alignSelf: 'flex-start',
    },

    emojiPickerButtonDropdownIcon: {
        fontSize: 30,
    },

    moneyRequestImage: {
        height: 200,
        borderRadius: 16,
        margin: 20,
    },

    reportPreviewBox: {
        backgroundColor: theme.cardBG,
        borderRadius: variables.componentBorderRadiusLarge,
        maxWidth: variables.sideBarWidth,
        width: '100%',
    },

    reportPreviewBoxHoverBorder: {
        borderColor: theme.border,
        backgroundColor: theme.border,
    },

    reportContainerBorderRadius: {
        borderRadius: variables.componentBorderRadiusLarge,
    },

    reportPreviewBoxBody: {
        padding: 16,
    },

    reportActionItemImages: {
        flexDirection: 'row',
        borderWidth: 4,
        borderColor: theme.transparent,
        borderTopLeftRadius: variables.componentBorderRadiusLarge,
        borderTopRightRadius: variables.componentBorderRadiusLarge,
        borderBottomLeftRadius: variables.componentBorderRadiusLarge,
        borderBottomRightRadius: variables.componentBorderRadiusLarge,
        overflow: 'hidden',
        height: 200,
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
        borderRightWidth: 2,
        borderColor: theme.cardBG,
    },

    reportActionItemImagesMore: {
        position: 'absolute',
        borderRadius: 18,
        backgroundColor: theme.cardBG,
        width: 36,
        height: 36,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },

    moneyRequestHeaderStatusBarBadge: {
        paddingHorizontal: 8,
        borderRadius: variables.componentBorderRadiusSmall,
        height: variables.inputHeightSmall,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.border,
        marginRight: 12,
    },

    staticHeaderImage: {
        minHeight: 240,
    },

    emojiPickerButtonDropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    rotate90: {
        transform: [{rotate: '90deg'}],
    },

    emojiStatusLHN: {
        fontSize: 22,
    },
    sidebarStatusAvatarContainer: {
        height: 44,
        width: 84,
        backgroundColor: theme.componentBG,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 42,
        paddingHorizontal: 2,
        marginVertical: -2,
        marginRight: -2,
    },
    sidebarStatusAvatar: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

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

    distanceRequestContainer: (maxHeight) => ({
        ...flex.flexShrink2,
        minHeight: variables.optionRowHeight * 2,
        maxHeight,
    }),

    mapViewContainer: {
        ...flex.flex1,
        ...spacing.p4,
        ...spacing.flex1,
        minHeight: 300,
        maxHeight: 500,
    },

    mapView: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
    },

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
        ...spacing.m5,
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
        backgroundColor: theme.highlightBG,
        ...flex.flex1,
        borderRadius: variables.componentBorderRadiusLarge,
    },
    userReportStatusEmoji: {
        fontSize: variables.fontSizeNormal,
        marginRight: 4,
    },
    draggableTopBar: {
        height: 30,
        width: '100%',
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

    walletCardHolder: {
        position: 'absolute',
        left: 16,
        bottom: 16,
        width: variables.cardNameWidth,
        color: theme.text,
        fontSize: variables.fontSizeSmall,
        lineHeight: variables.lineHeightLarge,
    },
});

// For now we need to export the styles function that takes the theme as an argument
// as something named different than "styles", because a lot of files import the "defaultStyles"
// as "styles", which causes ESLint to throw an error.
// TODO: Remove "stylesGenerator" and instead only return "styles" once the app is migrated to theme switching hooks and HOCs and "styles/theme/default.js" is not used anywhere anymore (GH issue: https://github.com/Expensify/App/issues/27337)
const stylesGenerator = styles;
const defaultStyles = styles(defaultTheme);

export default defaultStyles;
export {stylesGenerator};
