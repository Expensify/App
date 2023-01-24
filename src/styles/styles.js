import fontFamily from './fontFamily';
import addOutlineWidth from './addOutlineWidth';
import themeColors from './themes/default';
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
import overflowXHidden from './overflowXHidden';
import CONST from '../CONST';

const picker = {
    backgroundColor: themeColors.transparent,
    color: themeColors.text,
    fontFamily: fontFamily.EXP_NEUE,
    fontSize: variables.fontSizeNormal,
    lineHeight: variables.fontSizeNormalHeight,
    paddingHorizontal: 11,
    paddingBottom: 8,
    paddingTop: 23,
    height: variables.inputHeight,
    borderWidth: 0,
    borderRadius: variables.componentBorderRadiusNormal,
    textAlign: 'left',
};

const link = {
    color: themeColors.link,
    textDecorationColor: themeColors.link,
    fontFamily: fontFamily.EXP_NEUE,
};

const baseCodeTagStyles = {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: themeColors.border,
    backgroundColor: themeColors.textBackground,
};

const headlineFont = {
    fontFamily: fontFamily.EXP_NEW_KANSAS_MEDIUM,
    fontWeight: '500',
};

const webViewStyles = {
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
        },

        strong: {
            fontFamily: fontFamily.EXP_NEUE,
            fontWeight: 'bold',
        },

        a: link,

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
            borderLeftColor: themeColors.border,
            borderLeftWidth: 4,
            paddingLeft: 12,
            marginTop: 4,
            marginBottom: 4,

            // Overwrite default HTML margin for blockquotes
            marginLeft: 0,
        },

        pre: {
            ...baseCodeTagStyles,
            paddingTop: 12,
            paddingBottom: 12,
            paddingRight: 8,
            paddingLeft: 8,
            fontFamily: fontFamily.MONOSPACE,
            marginTop: 0,
            marginBottom: 0,
        },

        code: {
            ...baseCodeTagStyles,
            ...codeStyles.codeTextStyle,
            paddingLeft: 5,
            paddingRight: 5,
            fontFamily: fontFamily.MONOSPACE,
            fontSize: 13,
        },

        img: {
            borderColor: themeColors.border,
            borderRadius: variables.componentBorderRadiusNormal,
            borderWidth: 1,
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
        color: themeColors.text,
        fontSize: variables.fontSizeNormal,
        fontFamily: fontFamily.EXP_NEUE,
        flex: 1,
        lineHeight: variables.fontSizeNormalHeight,
    },
};

const styles = {
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
    ...themeColors,

    rateCol: {
        margin: 0,
        padding: 0,
        flexBasis: '48%',
    },

    unitCol: {
        margin: 0,
        padding: 0,
        marginLeft: '4%',
        flexBasis: '48%',
    },

    webViewStyles,

    link,

    linkMuted: {
        color: themeColors.textSupporting,
        textDecorationColor: themeColors.textSupporting,
        fontFamily: fontFamily.EXP_NEUE,
    },

    linkMutedHovered: {
        color: themeColors.textMutedReversed,
    },

    h1: {
        color: themeColors.heading,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontSize: variables.fontSizeh1,
        fontWeight: fontWeightBold,
    },

    h3: {
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontSize: variables.fontSizeNormal,
        fontWeight: fontWeightBold,
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

    textUnderline: {
        textDecorationLine: 'underline',
    },

    label: {
        fontSize: variables.fontSizeLabel,
        lineHeight: variables.lineHeightLarge,
    },

    textLabel: {
        color: themeColors.text,
        fontSize: variables.fontSizeLabel,
        lineHeight: variables.lineHeightLarge,
    },

    mutedTextLabel: {
        color: themeColors.textSupporting,
        fontSize: variables.fontSizeLabel,
        lineHeight: variables.lineHeightLarge,
    },

    textMicro: {
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeSmall,
        lineHeight: variables.lineHeightSmall,
    },

    textMicroBold: {
        color: themeColors.text,
        fontWeight: fontWeightBold,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontSize: variables.fontSizeSmall,
    },

    textMicroSupporting: {
        color: themeColors.textSupporting,
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeSmall,
        lineHeight: variables.lineHeightSmall,
    },

    textExtraSmallSupporting: {
        color: themeColors.textSupporting,
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeExtraSmall,
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
        color: themeColors.heading,
        fontSize: variables.fontSizeXLarge,
    },

    textDecorationNoLine: {
        textDecorationLine: 'none',
    },

    textWhite: {
        color: themeColors.textLight,
    },

    textBlue: {
        color: themeColors.link,
    },

    textUppercase: {
        textTransform: 'uppercase',
    },

    textNoWrap: {
        ...whiteSpace.noWrap,
    },

    colorReversed: {
        color: themeColors.textReversed,
    },

    colorMutedReversed: {
        color: themeColors.textMutedReversed,
    },

    colorMuted: {
        color: themeColors.textSupporting,
    },

    colorHeading: {
        color: themeColors.heading,
    },

    bgTransparent: {
        backgroundColor: 'transparent',
    },

    bgDark: {
        backgroundColor: themeColors.inverse,
    },

    opacity0: {
        opacity: 0,
    },

    opacity1: {
        opacity: 1,
    },

    pr0: {
        paddingRight: 0,
    },

    pl0: {
        paddingLeft: 0,
    },

    textDanger: {
        color: themeColors.danger,
    },

    borderRadiusNormal: {
        borderRadius: variables.buttonBorderRadius,
    },

    button: {
        backgroundColor: themeColors.buttonDefaultBG,
        borderRadius: variables.buttonBorderRadius,
        height: variables.componentSizeLarge,
        justifyContent: 'center',
        ...spacing.ph3,
    },

    buttonContainer: {
        padding: 1,
        borderRadius: variables.buttonBorderRadius,
    },

    buttonText: {
        color: themeColors.text,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontSize: variables.fontSizeNormal,
        fontWeight: fontWeightBold,
        textAlign: 'center',

        // It is needed to unset the Lineheight. We don't need it for buttons as button always contains single line of text.
        // It allows to vertically center the text.
        lineHeight: undefined,

        // Add 1px to the Button text to give optical vertical alignment.
        paddingBottom: 1,
    },

    buttonSmall: {
        borderRadius: variables.buttonBorderRadius,
        height: variables.componentSizeSmall,
        paddingTop: 4,
        paddingHorizontal: 14,
        paddingBottom: 4,
        backgroundColor: themeColors.buttonDefaultBG,
    },

    buttonMedium: {
        borderRadius: variables.buttonBorderRadius,
        height: variables.componentSizeNormal,
        paddingTop: 12,
        paddingRight: 16,
        paddingBottom: 12,
        paddingLeft: 16,
        backgroundColor: themeColors.buttonDefaultBG,
    },

    buttonLarge: {
        borderRadius: variables.buttonBorderRadius,
        height: variables.componentSizeLarge,
        paddingTop: 8,
        paddingRight: 10,
        paddingBottom: 8,
        paddingLeft: 18,
        backgroundColor: themeColors.buttonDefaultBG,
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

    buttonSuccess: {
        backgroundColor: themeColors.success,
        borderWidth: 0,
    },

    buttonSuccessDisabled: {
        opacity: 0.5,
    },

    buttonSuccessHovered: {
        backgroundColor: themeColors.successHover,
        borderWidth: 0,
    },

    buttonDanger: {
        backgroundColor: themeColors.danger,
        borderWidth: 0,
    },

    buttonDangerDisabled: {
        opacity: 0.5,
    },

    buttonDangerHovered: {
        backgroundColor: themeColors.dangerHover,
        borderWidth: 0,
    },

    buttonDisable: {
        backgroundColor: themeColors.buttonDefaultBG,
        borderWidth: 0,
    },

    buttonDivider: {
        width: 1,
        alignSelf: 'stretch',
        backgroundColor: themeColors.appBG,
        marginVertical: 1,
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
        color: themeColors.textLight,
    },

    buttonDangerText: {
        color: themeColors.textLight,
    },

    hoveredComponentBG: {
        backgroundColor: themeColors.hoverComponentBG,
    },

    activeComponentBG: {
        backgroundColor: themeColors.activeComponentBG,
    },

    fontWeightBold: {
        fontWeight: fontWeightBold,
    },

    touchableButtonImage: {
        alignItems: 'center',
        height: variables.componentSizeNormal,
        justifyContent: 'center',
        width: variables.componentSizeNormal,
    },

    visuallyHidden: {
        ...visibility('hidden'),
        overflow: 'hidden',
        width: 0,
        height: 0,
    },

    visibilityHidden: {
        ...visibility('hidden'),
    },

    loadingVBAAnimation: {
        width: 140,
        height: 140,
    },

    pickerSmall: {
        inputIOS: {
            fontFamily: fontFamily.EXP_NEUE,
            fontSize: variables.fontSizeSmall,
            paddingLeft: 9,
            paddingRight: 25,
            paddingTop: 6,
            paddingBottom: 6,
            borderRadius: variables.componentBorderRadius,
            borderWidth: 0,
            color: themeColors.text,
            height: 26,
            opacity: 1,
            backgroundColor: 'transparent',
        },
        inputWeb: {
            fontFamily: fontFamily.EXP_NEUE,
            fontSize: variables.fontSizeSmall,
            paddingLeft: 9,
            paddingRight: 25,
            paddingTop: 6,
            paddingBottom: 6,
            borderWidth: 0,
            borderRadius: variables.componentBorderRadius,
            color: themeColors.text,
            appearance: 'none',
            height: 26,
            opacity: 1,
            cursor: 'pointer',
            backgroundColor: 'transparent',
        },
        inputAndroid: {
            fontFamily: fontFamily.EXP_NEUE,
            fontSize: variables.fontSizeSmall,
            paddingLeft: 9,
            paddingRight: 25,
            paddingTop: 6,
            paddingBottom: 6,
            borderWidth: 0,
            borderRadius: variables.componentBorderRadius,
            color: themeColors.text,
            height: 26,
            opacity: 1,
        },
        iconContainer: {
            top: 7,
            right: 8,
            ...pointerEventsNone,
        },
        icon: {
            width: variables.iconSizeExtraSmall,
            height: variables.iconSizeExtraSmall,
        },
    },

    badge: {
        backgroundColor: themeColors.border,
        borderRadius: 14,
        height: variables.iconSizeNormal,
        flexDirection: 'row',
        paddingHorizontal: 7,
        alignItems: 'center',
    },

    badgeSuccess: {
        backgroundColor: themeColors.success,
    },

    badgeSuccessPressed: {
        backgroundColor: themeColors.successHover,
    },

    badgeDanger: {
        backgroundColor: themeColors.danger,
    },

    badgeDangerPressed: {
        backgroundColor: themeColors.dangerPressed,
    },

    badgeText: {
        color: themeColors.text,
        fontSize: variables.fontSizeSmall,
        lineHeight: variables.lineHeightNormal,
        ...whiteSpace.noWrap,
    },

    border: {
        borderWidth: 1,
        borderRadius: variables.componentBorderRadius,
        borderColor: themeColors.border,
    },

    borderColorFocus: {
        borderColor: themeColors.borderFocus,
    },

    borderColorDanger: {
        borderColor: themeColors.danger,
    },

    headerText: {
        color: themeColors.heading,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontSize: variables.fontSizeNormal,
        fontWeight: fontWeightBold,
    },

    headerGap: {
        height: 12,
    },

    pushTextRight: {
        left: 100000,
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
        color: themeColors.textSupporting,
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
        paddingBottom: 9,
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

    textInputContainer: {
        flex: 1,
        borderRadius: variables.componentBorderRadiusNormal,
        justifyContent: 'center',
        height: '100%',
        backgroundColor: themeColors.componentBG,
        borderWidth: 1,
        borderColor: themeColors.border,
        overflow: 'hidden',
    },

    textInputLabel: {
        position: 'absolute',
        left: 11,
        top: 0,
        fontSize: variables.fontSizeNormal,
        color: themeColors.textSupporting,
        fontFamily: fontFamily.EXP_NEUE,
        width: '100%',
        textAlign: 'left',
    },

    textInputLabelBackground: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: 25,
        backgroundColor: themeColors.componentBG,
        borderTopRightRadius: variables.componentBorderRadiusNormal,
        borderTopLeftRadius: variables.componentBorderRadiusNormal,
    },

    textInputLabelDesktop: {
        transformOrigin: 'left center',
    },

    textInputLabelTransformation: (translateY, translateX, scale) => ({
        transform: [
            {translateY},
            {translateX},
            {scale},
        ],
    }),

    baseTextInput: {
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeNormal,
        lineHeight: variables.lineHeightNormal,
        color: themeColors.text,
        paddingTop: 23,
        paddingBottom: 8,
        paddingHorizontal: 11,
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

    secureInputShowPasswordButton: {
        borderTopRightRadius: 6,
        borderBottomRightRadius: 6,
        paddingHorizontal: 11,
        justifyContent: 'center',
        margin: 1,
    },

    secureInput: {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },

    textInput: {
        backgroundColor: themeColors.componentBG,
        borderRadius: variables.componentBorderRadiusNormal,
        height: variables.inputComponentSizeNormal,
        borderColor: themeColors.border,
        borderWidth: 1,
        color: themeColors.text,
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeNormal,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 10,
        paddingBottom: 10,
        textAlignVertical: 'center',
    },

    textInputPrefix: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        paddingLeft: 11,
        paddingTop: 23,
        paddingBottom: 8,
        color: themeColors.text,
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeNormal,
        textAlignVertical: 'center',
    },

    pickerContainer: {
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: themeColors.border,
        borderRadius: variables.componentBorderRadiusNormal,
        justifyContent: 'center',
        backgroundColor: themeColors.componentBG,
    },
    pickerLabel: {
        position: 'absolute',
        left: 11,
        top: 6,
    },
    picker: (disabled = false) => ({
        iconContainer: {
            top: Math.round(variables.inputHeight * 0.5) - 11,
            right: 10,
            zIndex: -1,
        },
        inputWeb: {
            appearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            ...picker,
        },
        inputNative: {
            ...picker,
        },
    }),

    disabledText: {
        color: themeColors.icon,
    },

    inputDisabled: {
        backgroundColor: themeColors.highlightBG,
        color: themeColors.icon,
    },

    textInputReversed: addOutlineWidth({
        backgroundColor: themeColors.heading,
        borderColor: themeColors.text,
        color: themeColors.textReversed,
    }, 0),

    textInputReversedFocus: {
        borderColor: themeColors.icon,
    },

    noOutline: addOutlineWidth({}, 0),

    errorOutline: {
        borderColor: themeColors.danger,
    },

    textLabelSupporting: {
        fontFamily: fontFamily.EXP_NEUE,
        fontSize: variables.fontSizeLabel,
        color: themeColors.textSupporting,
    },

    lh16: {
        lineHeight: 16,
    },

    formHelp: {
        color: themeColors.textSupporting,
        fontSize: variables.fontSizeLabel,
        lineHeight: variables.lineHeightLarge,
        marginBottom: 4,
    },

    formError: {
        color: themeColors.textError,
        fontSize: variables.fontSizeLabel,
        lineHeight: variables.formErrorLineHeight,
        marginBottom: 4,
    },

    formSuccess: {
        color: themeColors.success,
        fontSize: variables.fontSizeLabel,
        lineHeight: 18,
        marginBottom: 4,
    },

    signInPage: {
        backgroundColor: themeColors.sidebar,
        minHeight: '100%',
        flex: 1,
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

    signInPageLeftContainer: {
        paddingLeft: 40,
        paddingRight: 40,
    },

    signInPageLeftContainerWide: {
        maxWidth: 360,
    },

    signInPageWelcomeFormContainer: {
        maxWidth: 300,
    },

    signInPageWelcomeTextContainer: {
        width: 300,
    },

    changeExpensifyLoginLinkContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        ...wordBreak.breakWord,
    },

    // Sidebar Styles
    sidebar: {
        backgroundColor: themeColors.sidebar,
        height: '100%',
    },

    sidebarFooter: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        paddingVertical: variables.lineHeightXLarge,
        width: '100%',
    },

    sidebarAvatar: {
        backgroundColor: themeColors.icon,
        borderRadius: 20,
        height: variables.componentSizeNormal,
        width: variables.componentSizeNormal,
    },

    statusIndicator: {
        borderColor: themeColors.sidebar,
        backgroundColor: themeColors.danger,
        borderRadius: 6,
        borderWidth: 2,
        position: 'absolute',
        right: -1,
        bottom: -1,
        height: 12,
        width: 12,
        zIndex: 10,
    },

    statusIndicatorLarge: {
        borderColor: themeColors.componentBG,
        backgroundColor: themeColors.danger,
        borderRadius: 8,
        borderWidth: 2,
        position: 'absolute',
        right: 4,
        bottom: 4,
        height: 16,
        width: 16,
        zIndex: 10,
    },

    statusIndicatorOnline: {
        backgroundColor: themeColors.success,
    },

    avatarWithIndicator: {
        errorDot: {
            borderColor: themeColors.sidebar,
            borderRadius: 6,
            borderWidth: 2,
            position: 'absolute',
            right: -1,
            bottom: -1,
            height: 12,
            width: 12,
            zIndex: 10,
        },
    },

    floatingActionButtonContainer: {
        position: 'absolute',
        right: 20,

        // The bottom of the floating action button should align with the bottom of the compose box.
        // The value should be equal to the height + marginBottom + marginTop of chatItemComposeSecondaryRow
        bottom: 25,
    },

    floatingActionButton: {
        backgroundColor: themeColors.success,
        height: variables.componentSizeLarge,
        width: variables.componentSizeLarge,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },

    sidebarFooterUsername: {
        color: themeColors.heading,
        fontSize: variables.fontSizeLabel,
        fontWeight: '700',
        width: 200,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        ...whiteSpace.noWrap,
    },

    sidebarFooterLink: {
        color: themeColors.textSupporting,
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

    onlyEmojisText: {
        fontSize: variables.fontSizeOnlyEmojis,
        lineHeight: variables.fontSizeOnlyEmojisHeight,
    },

    createMenuPositionSidebar: {
        left: 18,
        bottom: 100,
    },

    createMenuPositionProfile: {
        right: 18,
        top: 180,
    },

    createMenuPositionReportActionCompose: {
        left: 18 + variables.sideBarWidth,
        bottom: 75,
    },

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
        color: themeColors.heading,
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
        height: variables.componentSizeNormal,
        justifyContent: 'center',
        alignItems: 'center',
    },

    popoverMenuIconEmphasized: {
        backgroundColor: themeColors.iconSuccessFill,
        borderRadius: variables.componentSizeLarge / 2,
    },

    popoverMenuText: {
        fontSize: variables.fontSizeNormal,
        color: themeColors.heading,
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
        color: themeColors.textSupporting,
        fontSize: variables.fontSizeNormal,
        textDecorationLine: 'none',
        overflow: 'hidden',
    },

    sidebarLinkHover: {
        backgroundColor: themeColors.sidebarHover,
    },

    sidebarLinkActive: {
        backgroundColor: themeColors.border,
        textDecorationLine: 'none',
    },

    sidebarLinkTextBold: {
        fontWeight: '700',
        color: themeColors.heading,
    },

    sidebarLinkActiveText: {
        color: themeColors.textSupporting,
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
        height: variables.alternateTextHeight,
        lineHeight: variables.lineHeightXLarge,
        ...whiteSpace.noWrap,
    },

    optionDisplayNameCompact: {
        minWidth: 'auto',
        flexBasis: 'auto',
        flexGrow: 0,
        flexShrink: 0,
    },

    displayNameTooltipEllipsis: {
        position: 'absolute',
        opacity: 0,
        right: 0,
        bottom: 0,
    },

    optionAlternateText: {
        height: variables.alternateTextHeight,
        lineHeight: variables.lineHeightXLarge,
    },

    optionAlternateTextCompact: {
        flexShrink: 1,
        flexGrow: 1,
        flexBasis: 'auto',
        ...optionAlternateTextPlatformStyles,
    },

    optionRow: {
        height: variables.optionRowHeight,
        paddingTop: 12,
        paddingBottom: 12,
    },

    optionRowCompact: {
        height: variables.optionRowHeightCompact,
        paddingTop: 12,
        paddingBottom: 12,
    },

    optionsListSectionHeader: {
        height: variables.optionsListSectionHeaderHeight,
    },

    appContent: {
        backgroundColor: themeColors.appBG,
        overflow: 'hidden',

        // Starting version 6.3.2 @react-navigation/drawer adds "user-select: none;" to its container.
        // We add user-select-auto to the inner component to prevent incorrect triple-click text selection.
        // For further explanation see - https://github.com/Expensify/App/pull/12730/files#r1022883823
        userSelect: 'auto',
        WebkitUserSelect: 'auto',
    },

    appContentHeader: {
        borderBottomWidth: 1,
        borderColor: themeColors.border,
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

    chatContent: {
        flex: 4,
        justifyContent: 'flex-end',
    },

    chatContentScrollView: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingVertical: 16,
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
        color: themeColors.heading,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontSize: variables.fontSizeNormal,
        fontWeight: fontWeightBold,
        lineHeight: variables.lineHeightXLarge,
        paddingBottom: 4,
        ...wordBreak.breakWord,
    },

    chatItemMessageHeaderTimestamp: {
        flexShrink: 0,
        color: themeColors.textSupporting,
        fontSize: variables.fontSizeSmall,
        height: 24,
        lineHeight: variables.lineHeightXLarge,
    },

    chatItemMessage: {
        color: themeColors.text,
        fontSize: variables.fontSizeNormal,
        fontFamily: fontFamily.EXP_NEUE,
        lineHeight: variables.lineHeightXLarge,
        marginTop: -2,
        marginBottom: -2,
        maxWidth: '100%',
        cursor: 'auto',
        ...whiteSpace.preWrap,
        ...wordBreak.breakWord,
    },

    chatItemMessageLink: {
        color: themeColors.link,
        fontSize: variables.fontSizeNormal,
        fontFamily: fontFamily.EXP_NEUE,
        lineHeight: variables.lineHeightXLarge,
    },

    chatItemComposeWithFirstRow: {
        minHeight: 90,
    },

    chatItemFullComposeRow: {
        ...sizing.h100,
    },

    chatItemComposeBoxColor: {
        borderColor: themeColors.border,
    },

    chatItemComposeBoxFocusedColor: {
        borderColor: themeColors.borderFocus,
    },

    chatItemComposeBox: {
        backgroundColor: themeColors.componentBG,
        borderWidth: 1,
        borderRadius: variables.componentBorderRadiusRounded,
        minHeight: variables.componentSizeNormal,
    },

    chatItemFullComposeBox: {
        ...flex.flex1,
        ...spacing.mt4,
        ...sizing.h100,
    },

    chatFooter: {
        paddingLeft: 20,
        paddingRight: 20,
        display: 'flex',
        backgroundColor: themeColors.appBG,
    },

    chatFooterFullCompose: {
        flex: 1,
        flexShrink: 1,
        flexBasis: '100%',
    },

    // Be extremely careful when editing the compose styles, as it is easy to introduce regressions.
    // Make sure you run the following tests against any changes: #12669
    textInputCompose: addOutlineWidth({
        backgroundColor: themeColors.componentBG,
        borderColor: themeColors.border,
        color: themeColors.text,
        fontFamily: fontFamily.EMOJI_TEXT_FONT,
        fontSize: variables.fontSizeNormal,
        borderWidth: 0,
        borderRadius: variables.componentBorderRadiusRounded,
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
    }, 0),

    textInputFullCompose: {
        alignSelf: 'stretch',
        flex: 1,
        maxHeight: '100%',
        textAlignVertical: 'top',
    },

    editInputComposeSpacing: {
        marginVertical: 6,
    },

    // composer padding should not be modified unless thoroughly tested against the cases in this PR: #12669
    textInputComposeSpacing: {
        paddingVertical: 5,
        ...flex.flexRow,
        flex: 1,
    },

    chatItemSubmitButton: {
        alignSelf: 'flex-end',
        borderRadius: variables.componentBorderRadiusRounded,
        backgroundColor: themeColors.transparent,
        height: 32,
        padding: 6,
        margin: 3,
        justifyContent: 'center',
    },

    emojiPickerContainer: {
        backgroundColor: themeColors.componentBG,
    },

    emojiPickerList: {
        height: 288,
        width: '100%',
        ...spacing.ph4,
    },
    emojiPickerListLandscape: {
        height: 240,
    },

    emojiHeaderStyle: {
        backgroundColor: themeColors.componentBG,
        width: '100%',
        height: 32,
        display: 'flex',
        alignItems: 'center',
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontWeight: fontWeightBold,
        color: themeColors.heading,
        fontSize: variables.fontSizeSmall,
    },

    emojiSkinToneTitle: {
        backgroundColor: themeColors.componentBG,
        width: '100%',
        ...spacing.pv1,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontWeight: fontWeightBold,
        color: themeColors.heading,
        fontSize: variables.fontSizeSmall,
    },

    // Emoji Picker Styles
    emojiText: {
        fontFamily: fontFamily.EMOJI_TEXT_FONT,
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
    },

    emojiItemHighlighted: {
        transition: '0.2s ease',
        backgroundColor: themeColors.buttonDefaultBG,
    },

    emojiItemKeyboardHighlighted: {
        transition: '0.2s ease',
        borderWidth: 1,
        borderColor: themeColors.link,
        borderRadius: variables.buttonBorderRadius,
    },

    categoryShortcutButton: {
        width: '10%',
        textAlign: 'center',
        borderRadius: 8,
        paddingTop: 2,
        paddingBottom: 2,
        height: CONST.EMOJI_PICKER_ITEM_HEIGHT,
    },

    chatItemEmojiButton: {
        alignSelf: 'flex-end',
        borderRadius: variables.buttonBorderRadius,
        height: 32,
        marginVertical: 3,
        paddingHorizontal: 6,
        justifyContent: 'center',
    },

    editChatItemEmojiWrapper: {
        marginRight: 3,
    },

    hoveredButton: {
        backgroundColor: themeColors.buttonHoveredBG,
    },

    chatItemAttachBorder: {
        borderRightColor: themeColors.border,
        borderRightWidth: 1,
    },

    composerSizeButton: {
        alignSelf: 'center',
        height: 32,
        width: 32,
        padding: 6,
        margin: 3,
        borderRadius: variables.componentBorderRadiusRounded,
        backgroundColor: themeColors.transparent,
    },

    chatItemAttachmentPlaceholder: {
        backgroundColor: themeColors.sidebar,
        borderColor: themeColors.border,
        borderWidth: 1,
        borderRadius: variables.componentBorderRadiusNormal,
        height: 150,
        textAlign: 'center',
        verticalAlign: 'middle',
        width: 200,
    },

    chatSwticherPillWrapper: {
        marginTop: 5,
        marginRight: 4,
    },

    navigationModalOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        transform: [{
            translateX: -variables.sideBarWidth,
        }],
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
        borderColor: themeColors.border,
        borderWidth: 1,
        borderRadius: variables.componentBorderRadiusNormal,
    },

    singleAvatar: {
        height: 24,
        width: 24,
        backgroundColor: themeColors.icon,
        borderRadius: 24,
    },

    horizontalStackedAvatar: {
        height: 28,
        width: 28,
        backgroundColor: themeColors.appBG,
        borderRadius: 33,
        paddingTop: 2,
        alignItems: 'center',
    },

    singleSubscript: {
        height: variables.iconSizeNormal,
        width: variables.iconSizeNormal,
        backgroundColor: themeColors.icon,
        borderRadius: 20,
        zIndex: 1,
    },

    singleAvatarSmall: {
        height: 18,
        width: 18,
        backgroundColor: themeColors.icon,
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
        right: -4,
        bottom: -2,
        borderWidth: 2,
        borderRadius: 18,
        borderColor: 'transparent',
    },

    secondAvatarSubscriptCompact: {
        position: 'absolute',
        bottom: -1,
        right: -1,
        borderWidth: 1,
        borderRadius: 18,
        borderColor: 'transparent',
    },

    leftSideLargeAvatar: {
        left: 15,
    },

    rightSideLargeAvatar: {
        right: 15,
        zIndex: 2,
        borderWidth: 4,
        borderRadius: 100,
    },

    secondAvatarInline: {
        bottom: -3,
        right: -25,
        borderWidth: 3,
        borderRadius: 18,
        borderColor: themeColors.cardBorder,
    },

    avatarLarge: {
        width: variables.avatarSizeLarge,
        height: variables.avatarSizeLarge,
    },

    avatarNormal: {
        height: variables.componentSizeNormal,
        width: variables.componentSizeNormal,
        borderRadius: variables.componentSizeNormal,
    },

    avatarSmall: {
        height: variables.avatarSizeSmall,
        width: variables.avatarSizeSmall,
        borderRadius: variables.avatarSizeSmall,
    },

    avatarInnerText: {
        color: themeColors.textLight,
        fontSize: variables.fontSizeSmall,
        lineHeight: undefined,
        marginLeft: -3,
        textAlign: 'center',
    },

    avatarInnerTextSmall: {
        color: themeColors.textLight,
        fontSize: variables.fontSizeExtraSmall,
        lineHeight: undefined,
        marginLeft: -2,
        textAlign: 'center',
    },

    avatarSpace: {
        top: 3,
        left: 3,
    },

    avatar: {
        backgroundColor: themeColors.sidebar,
        borderColor: themeColors.sidebar,
    },

    focusedAvatar: {
        backgroundColor: themeColors.border,
        borderColor: themeColors.border,
    },

    emptyAvatar: {
        marginRight: variables.avatarChatSpacing,
        height: variables.avatarSizeNormal,
        width: variables.avatarSizeNormal,
    },

    emptyAvatarSmall: {
        marginRight: variables.avatarChatSpacing - 4,
        height: variables.avatarSizeSmall,
        width: variables.avatarSizeSmall,
    },

    horizontalStackedAvatar1: {
        left: -19,
        top: -79,
        zIndex: 2,
    },

    horizontalStackedAvatar2: {
        left: 1,
        top: -51,
        zIndex: 3,
    },

    horizontalStackedAvatar3: {
        left: 21,
        top: -23,
        zIndex: 4,
    },

    horizontalStackedAvatar4: {
        top: 5,
        left: 41,
        zIndex: 5,
    },

    horizontalStackedAvatar4Overlay: {
        top: -107,
        left: 41,
        height: 28,
        width: 28,
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: 24,
        zIndex: 6,
    },

    modalViewContainer: {
        alignItems: 'center',
        flex: 1,
    },

    borderTop: {
        borderTopWidth: 1,
        borderColor: themeColors.border,
    },

    borderTopRounded: {
        borderTopWidth: 1,
        borderColor: themeColors.border,
        borderTopLeftRadius: variables.componentBorderRadiusNormal,
        borderTopRightRadius: variables.componentBorderRadiusNormal,
    },

    borderBottomRounded: {
        borderBottomWidth: 1,
        borderColor: themeColors.border,
        borderBottomLeftRadius: variables.componentBorderRadiusNormal,
        borderBottomRightRadius: variables.componentBorderRadiusNormal,
    },

    borderBottom: {
        borderBottomWidth: 1,
        borderColor: themeColors.border,
    },

    borderNone: {
        borderWidth: 0,
    },

    borderRight: {
        borderRightWidth: 1,
        borderColor: themeColors.border,
    },

    borderLeft: {
        borderLeftWidth: 1,
        borderColor: themeColors.border,
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
        backgroundColor: themeColors.modalBackground,
    },

    PDFView: {
        // `display: grid` is not supported in native platforms!
        // It's being used on Web/Desktop only to vertically center short PDFs,
        // while preventing the overflow of the top of long PDF files.
        display: 'grid',
        backgroundColor: themeColors.modalBackground,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        overflow: 'hidden',
        overflowY: 'auto',
        alignItems: 'center',
    },

    pdfPasswordForm: {
        wideScreenWidth: {
            width: 350,
        },
    },

    modalCenterContentContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: themeColors.modalBackdrop,
    },

    imageModalImageCenterContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        width: '100%',
    },

    defaultAttachmentView: {
        backgroundColor: themeColors.sidebar,
        borderRadius: variables.componentBorderRadiusNormal,
        borderWidth: 1,
        borderColor: themeColors.border,
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
    },

    notFoundSafeArea: {
        flex: 1,
        backgroundColor: themeColors.heading,
    },

    notFoundView: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },

    notFoundLogo: {
        width: 202,
        height: 63,
    },

    notFoundContent: {
        alignItems: 'center',
    },

    notFoundTextHeader: {
        ...headlineFont,
        color: themeColors.heading,
        fontSize: variables.fontSizeXLarge,
        marginTop: 20,
        marginBottom: 8,
    },

    notFoundTextBody: {
        color: themeColors.componentBG,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontWeight: fontWeightBold,
        fontSize: 15,
    },

    notFoundButtonText: {
        color: themeColors.link,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontWeight: fontWeightBold,
        fontSize: 15,
    },

    blockingViewContainer: {
        paddingBottom: variables.contentHeaderHeight,
    },

    defaultModalContainer: {
        backgroundColor: themeColors.componentBG,
        borderColor: themeColors.transparent,
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
        ...spacing.mt4,
        height: 170,
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

    reportTransactionWrapper: {
        paddingVertical: 8,
        display: 'flex',
        flexDirection: 'row',
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

    settingsPageColumn: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-around',
    },

    settingsPageContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },

    roomHeaderAvatar: {
        borderColor: themeColors.componentBG,
        borderWidth: 4,
        marginLeft: -16,
    },

    roomHeaderAvatarOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: themeColors.overlay,
        opacity: variables.overlayOpacity,
        borderRadius: 88,
    },

    avatarInnerTextChat: {
        color: themeColors.textLight,
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

    selectCircle: {
        width: variables.componentSizeSmall,
        height: variables.componentSizeSmall,
        borderColor: themeColors.border,
        borderWidth: 1,
        borderRadius: variables.componentSizeSmall / 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: themeColors.componentBG,
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
        cursor: 'default',
    },

    unreadIndicatorLine: {
        height: 1,
        backgroundColor: themeColors.unreadIndicator,
        flexGrow: 1,
        marginRight: 8,
        opacity: 0.5,
    },

    unreadIndicatorText: {
        color: themeColors.unreadIndicator,
        fontFamily: fontFamily.EXP_NEUE_BOLD,
        fontSize: variables.fontSizeSmall,
        fontWeight: fontWeightBold,
        textTransform: 'capitalize',
    },

    flipUpsideDown: {
        transform: [{rotate: '180deg'}],
    },

    navigationSceneContainer: {
        backgroundColor: themeColors.appBG,
    },

    navigationScreenCardStyle: {
        backgroundColor: themeColors.appBG,
        height: '100%',
    },

    navigationSceneFullScreenWrapper: {
        borderRadius: variables.componentBorderRadiusCard,
        overflow: 'hidden',
        height: '100%',
    },

    invisible: {
        position: 'absolute',
        opacity: 0,
    },

    containerWithSpaceBetween: {
        justifyContent: 'space-between',
        width: '100%',
        flex: 1,
    },

    detailsPageSectionContainer: {
        alignSelf: 'flex-start',
    },

    detailsPageSectionVersion: {
        alignSelf: 'center',
        color: themeColors.textSupporting,
        fontSize: variables.fontSizeSmall,
        height: 24,
        lineHeight: 20,
    },

    switchTrack: {
        width: 50,
        height: 28,
        justifyContent: 'center',
        borderRadius: 20,
        padding: 15,
        backgroundColor: themeColors.success,
    },

    switchInactive: {
        backgroundColor: themeColors.border,
    },

    switchThumb: {
        width: 22,
        height: 22,
        borderRadius: 11,
        position: 'absolute',
        left: 4,
        backgroundColor: themeColors.appBG,
    },

    radioButtonContainer: {
        backgroundColor: themeColors.componentBG,
        borderRadius: 10,
        height: 20,
        width: 20,
        borderColor: themeColors.icon,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    checkboxContainer: {
        backgroundColor: themeColors.componentBG,
        borderRadius: 2,
        height: 20,
        width: 20,
        borderColor: themeColors.icon,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    checkedContainer: {
        backgroundColor: themeColors.checkBox,
    },

    iouAmountText: {
        ...headlineFont,
        fontSize: variables.iouAmountTextSize,
        color: themeColors.heading,
        lineHeight: variables.inputHeight,
    },

    iouAmountTextInput: addOutlineWidth({
        ...headlineFont,
        fontSize: variables.iouAmountTextSize,
        color: themeColors.heading,
        padding: 0,
        lineHeight: undefined,
    }, 0),

    iouPreviewBox: {
        backgroundColor: themeColors.cardBG,
        borderRadius: variables.componentBorderRadiusCard,
        padding: 20,
        marginTop: 16,
        maxWidth: variables.sideBarWidth,
        width: '100%',
    },

    iouPreviewBoxHover: {
        backgroundColor: themeColors.border,
    },

    iouPreviewBoxLoading: {
        // When a new IOU request arrives it is very briefly in a loading state, so set the minimum height of the container to 94 to match the rendered height after loading.
        // Otherwise, the IOU request pay button will not be fully visible and the user will have to scroll up to reveal the entire IOU request container.
        // See https://github.com/Expensify/App/issues/10283.
        minHeight: 94,
        width: '100%',
    },

    iouPreviewBoxAvatar: {
        marginRight: -10,
        marginBottom: -10,
    },

    iouPreviewBoxAvatarHover: {
        borderColor: themeColors.border,
    },

    iouPreviewBoxCheckmark: {
        marginLeft: 4,
        alignSelf: 'center',
    },

    iouDetailsContainer: {
        flexGrow: 1,
        paddingStart: 20,
        paddingEnd: 20,
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
        backgroundColor: themeColors.componentBG,
        opacity: 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },

    navigatorFullScreenLoading: {
        backgroundColor: themeColors.highlightBG,
        opacity: 1,
    },

    reimbursementAccountFullScreenLoading: {
        backgroundColor: themeColors.componentBG,
        opacity: 0.8,
        justifyContent: 'flex-start',
        alignItems: 'center',
        zIndex: 10,
    },

    hiddenElementOutsideOfWindow: {
        position: 'absolute',
        top: 0,
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

    growlNotificationTranslateY: y => ({
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
        backgroundColor: themeColors.inverse,
        borderRadius: variables.componentBorderRadiusNormal,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        shadowColor: themeColors.shadow,
        ...spacing.p5,
    },

    growlNotificationText: {
        fontSize: variables.fontSizeNormal,
        fontFamily: fontFamily.EXP_NEUE,
        width: '90%',
        lineHeight: variables.fontSizeNormalHeight,
        color: themeColors.textReversed,
        ...spacing.ml4,
    },

    blockquote: {
        borderLeftColor: themeColors.border,
        borderLeftWidth: 4,
        paddingLeft: 12,
        marginVertical: 4,
    },

    cursorDefault: {
        cursor: 'default',
    },

    cursorDisabled: {
        cursor: 'not-allowed',
    },

    noSelect: {
        boxShadow: 'none',
        outline: 'none',
    },

    cursorPointer: {
        cursor: 'pointer',
    },

    fullscreenCard: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
    },

    fullscreenCardWeb: {
        left: 'auto',
        right: '-24%',
        top: '-18%',
        height: '120%',
    },

    fullscreenCardWebCentered: {
        left: '0',
        right: '0',
        top: '0',
        height: '60%',
    },

    fullscreenCardMobile: {
        left: '-20%',
        top: '-30%',
        width: '150%',
    },

    fullscreenCardMediumScreen: {
        left: '-15%',
        top: '-30%',
        width: '145%',
    },

    smallEditIcon: {
        alignItems: 'center',
        backgroundColor: themeColors.buttonHoveredBG,
        borderColor: themeColors.textReversed,
        borderRadius: 14,
        borderWidth: 3,
        color: themeColors.textReversed,
        height: 28,
        width: 28,
        justifyContent: 'center',
    },

    smallAvatarEditIcon: {
        position: 'absolute',
        right: -4,
        bottom: -4,
    },

    workspaceCard: {
        width: '100%',
        height: 400,
        borderRadius: variables.componentBorderRadiusCard,
        overflow: 'hidden',
        backgroundColor: themeColors.heroCard,
    },

    workspaceCardMobile: {
        height: 475,
    },

    workspaceCardMediumScreen: {
        height: 540,
    },

    workspaceCardMainText: {
        fontSize: variables.fontSizeXXXLarge,
        fontWeight: 'bold',
        lineHeight: variables.fontSizeXXXLarge,
    },

    workspaceCardContent: {
        zIndex: 1,
        padding: 50,
    },

    workspaceCardContentMediumScreen: {
        padding: 25,
    },

    workspaceCardCTA: {
        width: 250,
    },

    workspaceInviteWelcome: {
        minHeight: 115,
    },

    peopleRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        ...spacing.pt2,
    },

    peopleRowBorderBottom: {
        borderColor: themeColors.border,
        borderBottomWidth: 1,
        ...spacing.pb2,
    },

    peopleRowCell: {
        justifyContent: 'center',
    },

    peopleBadge: {
        backgroundColor: themeColors.icon,
        ...spacing.ph3,
    },

    peopleBadgeText: {
        color: themeColors.textReversed,
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
            color: themeColors.textSupporting,
            textAlignVertical: 'center',
            fontSize: variables.fontSizeLabel,
        },
        errorDot: {
            marginRight: 12,
        },
        menuItemErrorPadding: {
            paddingLeft: 44,
            paddingRight: 20,
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
        backgroundColor: themeColors.overlay,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: variables.overlayOpacity,
    },

    communicationsLinkIcon: {
        right: -36,
        top: 0,
        bottom: 0,
    },

    shortTermsBorder: {
        borderWidth: 1,
        borderColor: themeColors.border,
    },

    shortTermsHorizontalRule: {
        borderBottomWidth: 1,
        borderColor: themeColors.border,
        ...spacing.mh3,
    },

    shortTermsLargeHorizontalRule: {
        borderWidth: 1,
        borderColor: themeColors.border,
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

    longTermsRow: {
        flexDirection: 'row',
        marginTop: 20,
    },

    collapsibleSectionBorder: {
        borderBottomWidth: 2,
        borderBottomColor: themeColors.border,
    },

    communicationsLinkHeight: {
        height: variables.communicationsLinkHeight,
    },

    floatingMessageCounterWrapper: {
        position: 'absolute',
        left: '50%',
        top: 0,
        zIndex: 100,
        ...visibility('hidden'),
    },

    floatingMessageCounterWrapperAndroid: {
        left: 0,
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        zIndex: 100,
        ...visibility('hidden'),
    },

    floatingMessageCounterSubWrapperAndroid: {
        left: '50%',
        width: 'auto',
    },

    floatingMessageCounter: {
        left: '-50%',
        ...visibility('visible'),
    },

    floatingMessageCounterTransformation: translateY => ({
        transform: [
            {translateY},
        ],
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
        backgroundColor: themeColors.border,
    },

    googleSearchText: {
        color: themeColors.text,
        fontSize: variables.fontSizeNormal,
        lineHeight: variables.fontSizeNormalHeight,
        fontFamily: fontFamily.EXP_NEUE,
        flex: 1,
    },

    threeDotsPopoverOffset: {
        top: 50,
        right: 60,
    },

    googleListView: {
        transform: [{scale: 0}],
    },

    invert: {
        // It's important to invert the Y AND X axis to prevent a react native issue that can lead to ANRs on android 13
        transform: [{scaleX: -1}, {scaleY: -1}],
    },

    keyboardShortcutModalContainer: {
        maxHeight: '100%',
        flex: '0 0 auto',
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
        borderColor: themeColors.border,
        height: 'auto',
        borderRadius: variables.componentBorderRadius,
        borderWidth: 1,
    },

    keyboardShortcutTableRow: {
        flex: 1,
        flexDirection: 'row',
        borderColor: themeColors.border,
        flexBasis: 'auto',
        alignSelf: 'stretch',
        borderTopWidth: 1,
    },

    keyboardShortcutTablePrefix: {
        width: '30%',
        borderRightWidth: 1,
        borderColor: themeColors.border,
    },

    keyboardShortcutTableFirstRow: {
        borderTopWidth: 0,
    },

    iPhoneXSafeArea: {
        backgroundColor: themeColors.inverse,
        flex: 1,
    },

    transferBalancePayment: {
        borderWidth: 1,
        borderRadius: variables.componentBorderRadiusNormal,
        borderColor: themeColors.border,
    },

    transferBalanceSelectedPayment: {
        borderColor: themeColors.iconSuccessFill,
    },

    transferBalanceBalance: {
        fontSize: 48,
    },

    closeAccountMessageInput: {
        height: 153,
    },

    imageCropContainer: {
        borderRadius: variables.componentBorderRadiusCard,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: themeColors.imageCropBackgroundColor,
        cursor: 'move',
    },

    sliderKnob: {
        backgroundColor: themeColors.success,
        position: 'absolute',
        height: variables.sliderKnobSize,
        width: variables.sliderKnobSize,
        borderRadius: variables.sliderKnobSize / 2,
        top: -variables.sliderBarHeight,
        left: -(variables.sliderKnobSize / 2),
        cursor: 'pointer',
    },

    sliderBar: {
        backgroundColor: themeColors.border,
        height: variables.sliderBarHeight,
        borderRadius: variables.sliderBarHeight / 2,
        alignSelf: 'stretch',
    },

    imageCropRotateButton: {
        height: variables.iconSizeExtraLarge,
    },

    userSelectText: {
        userSelect: 'text',
        WebkitUserSelect: 'text',
    },

    userSelectNone: {
        userSelect: 'none',
        WebkitUserSelect: 'none',
    },

    screenCenteredContainer: {
        flex: 1,
        justifyContent: 'center',
        marginBottom: 40,
        padding: 16,
    },

    inlineSystemMessage: {
        color: themeColors.textSupporting,
        fontSize: variables.fontSizeLabel,
        fontFamily: fontFamily.EXP_NEUE,
        marginLeft: 6,
    },

    addWorkspaceRoomErrorRow: {
        paddingHorizontal: 20,
        maxWidth: 450,
        alignSelf: 'center',
    },

    fullScreenTransparentOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: themeColors.dropUIBG,
        zIndex: 2,
    },

    textPill: {
        ellipsizeMode: 'end',
        backgroundColor: themeColors.border,
        borderRadius: 10,
        overflow: 'hidden',
        paddingVertical: 2,
        flexShrink: 1,
        fontSize: variables.fontSizeSmall,
        ...spacing.ph2,
    },

    dropZoneTopInvisibleOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: themeColors.dropTransparentOverlay,
        zIndex: 1000,
    },

    cardSection: {
        backgroundColor: themeColors.cardBG,
        borderRadius: variables.componentBorderRadiusCard,
        marginBottom: 20,
        marginHorizontal: 16,
        padding: 20,
        width: 'auto',
        textAlign: 'left',
    },

    cardMenuItem: {
        paddingLeft: 8,
        paddingRight: 0,
        borderRadius: variables.buttonBorderRadius,
        height: variables.componentSizeLarge,
        alignItems: 'center',
    },

    callRequestSection: {
        backgroundColor: themeColors.appBG,
        paddingHorizontal: 0,
        paddingBottom: 0,
        marginHorizontal: 0,
        marginBottom: 0,
    },

    archivedReportFooter: {
        borderRadius: variables.componentBorderRadius,
        ...wordBreak.breakWord,
    },

    saveButtonPadding: {
        paddingLeft: 18,
        paddingRight: 18,
    },

    deeplinkWrapperContainer: {
        padding: 20,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: themeColors.appBG,
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
};

export default styles;
