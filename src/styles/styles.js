import fontFamily from './fontFamily';
import addOutlineWidth from './addOutlineWidth';
import themeColors from './themes/default';
import fontWeightBold from './fontWeight/bold';
import variables from './variables';
import colors from './colors';
import spacing from './utilities/spacing';
import sizing from './utilities/sizing';
import flex from './utilities/flex';
import display from './utilities/display';
import overflow from './utilities/overflow';
import whiteSpace from './utilities/whiteSpace';
import wordBreak from './utilities/wordBreak';
import textInputAlignSelf from './utilities/textInputAlignSelf';
import positioning from './utilities/positioning';
import codeStyles from './codeStyles';
import visibility from './utilities/visibility';
import optionAlternateTextPlatformStyles from './optionAlternateTextPlatformStyles';

const picker = {
    backgroundColor: 'transparent',
    color: themeColors.text,
    fontFamily: fontFamily.GTA,
    fontSize: variables.fontSizeNormal,
    lineHeight: variables.fontSizeNormalHeight,
    paddingHorizontal: 11,
    paddingBottom: 8,
    paddingTop: 23,
    height: 52,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: themeColors.border,
    borderRadius: variables.componentBorderRadiusNormal,
    textAlign: 'left',
};

const link = {
    color: themeColors.link,
    textDecorationColor: themeColors.link,
    fontFamily: fontFamily.GTA,
};

const baseCodeTagStyles = {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: themeColors.border,
    backgroundColor: themeColors.textBackground,
};

const webViewStyles = {
    // As of react-native-render-html v6, don't declare distinct styles for
    // custom renderers, the API for custom renderers has changed. Declare the
    // styles in the below "tagStyles" instead. If you need to reuse those
    // styles from the renderer, just pass the "style" prop to the underlying
    // component.
    tagStyles: {
        em: {
            fontFamily: fontFamily.GTA,
            fontStyle: 'italic',
        },

        del: {
            textDecorationLine: 'line-through',
            textDecorationStyle: 'solid',
        },

        strong: {
            fontFamily: fontFamily.GTA,
            fontWeight: 'bold',
        },

        a: link,

        ul: {
            maxWidth: '100%',
            flex: 1,
        },

        ol: {
            maxWidth: '100%',
            flex: 1,
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
            paddingTop: 4,
            paddingBottom: 5,
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
    },

    baseFontStyle: {
        color: themeColors.text,
        fontSize: variables.fontSizeNormal,
        fontFamily: fontFamily.GTA,
        flex: 1,
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

    linkHovered: {
        color: themeColors.linkHover,
    },

    linkMuted: {
        color: themeColors.textSupporting,
        textDecorationColor: themeColors.textSupporting,
        fontFamily: fontFamily.GTA,
    },

    linkMutedHovered: {
        color: themeColors.textMutedReversed,
    },

    h1: {
        color: themeColors.heading,
        fontFamily: fontFamily.GTA_BOLD,
        fontSize: variables.fontSizeh1,
        fontWeight: fontWeightBold,
    },

    h3: {
        fontFamily: fontFamily.GTA_BOLD,
        fontSize: variables.fontSizeNormal,
        fontWeight: fontWeightBold,
    },

    h4: {
        fontFamily: fontFamily.GTA_BOLD,
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
        lineHeight: 18,
    },

    textLabel: {
        color: themeColors.text,
        fontSize: variables.fontSizeLabel,
        lineHeight: 18,
    },

    mutedTextLabel: {
        color: themeColors.textSupporting,
        fontSize: variables.fontSizeLabel,
        lineHeight: 18,
    },

    textMicro: {
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeSmall,
        lineHeight: 14,
    },

    textMicroBold: {
        color: themeColors.text,
        fontWeight: fontWeightBold,
        fontFamily: fontFamily.GTA_BOLD,
        fontSize: variables.fontSizeSmall,
    },

    textMicroSupporting: {
        color: themeColors.textSupporting,
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeSmall,
        lineHeight: 14,
    },

    textExtraSmallSupporting: {
        color: themeColors.textSupporting,
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeExtraSmall,
    },

    textLarge: {
        fontSize: variables.fontSizeLarge,
    },

    textXXLarge: {
        fontSize: variables.fontSizeXXLarge,
    },

    textXXXLarge: {
        color: themeColors.heading,
        fontFamily: fontFamily.GTA_BOLD,
        fontSize: variables.fontSizeXXXLarge,
        fontWeight: fontWeightBold,
    },

    textStrong: {
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
    },

    textItalic: {
        fontFamily: fontFamily.GTA_ITALIC,
        fontStyle: 'italic',
    },

    textDecorationNoLine: {
        textDecorationLine: 'none',
    },

    textWhite: {
        color: colors.white,
    },

    textBlue: {
        color: colors.blue,
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

    textDanger: {
        color: colors.red,
    },

    button: {
        backgroundColor: themeColors.buttonDefaultBG,
        borderRadius: variables.componentBorderRadiusNormal,
        height: variables.componentSizeLarge,
        justifyContent: 'center',
        ...spacing.ph3,
    },

    buttonText: {
        color: themeColors.heading,
        fontFamily: fontFamily.GTA_BOLD,
        fontSize: variables.fontSizeNormal,
        fontWeight: fontWeightBold,
        textAlign: 'center',

        // It is needed to unset the Lineheight. We don't need it for buttons as button always contains single line of text.
        // It allows to vertically center the text.
        lineHeight: undefined,
    },

    buttonSmall: {
        borderRadius: variables.componentBorderRadiusNormal,
        height: variables.componentSizeSmall,
        paddingTop: 6,
        paddingRight: 10,
        paddingBottom: 6,
        paddingLeft: 10,
        backgroundColor: themeColors.buttonDefaultBG,
    },

    buttonMedium: {
        borderRadius: variables.componentBorderRadiusNormal,
        height: variables.componentSizeNormal,
        paddingTop: 6,
        paddingRight: 12,
        paddingBottom: 6,
        paddingLeft: 12,
        backgroundColor: themeColors.buttonDefaultBG,
    },

    buttonLarge: {
        borderRadius: variables.componentBorderRadius,
        height: variables.componentSizeLarge,
        paddingTop: 8,
        paddingRight: 12,
        paddingBottom: 8,
        paddingLeft: 12,
        backgroundColor: themeColors.buttonDefaultBG,
    },

    buttonSmallText: {
        fontSize: variables.fontSizeSmall,
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        textAlign: 'center',
    },

    buttonMediumText: {
        fontSize: variables.fontSizeLabel,
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        textAlign: 'center',
    },

    buttonLargeText: {
        fontSize: variables.fontSizeNormal,
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        textAlign: 'center',
    },

    buttonSuccess: {
        backgroundColor: themeColors.buttonSuccessBG,
        borderWidth: 0,
    },

    buttonSuccessDisabled: {
        opacity: 0.5,
    },

    buttonSuccessHovered: {
        backgroundColor: themeColors.buttonSuccessHoveredBG,
        borderWidth: 0,
    },

    buttonDanger: {
        backgroundColor: themeColors.buttonDangerBG,
        borderWidth: 0,
    },

    buttonDangerDisabled: {
        backgroundColor: themeColors.buttonDangerDisabledBG,
    },

    buttonDangerHovered: {
        backgroundColor: themeColors.buttonDangerPressedBG,
        borderWidth: 0,
    },

    buttonDisable: {
        backgroundColor: themeColors.buttonDisabledBG,
        borderWidth: 0,
    },

    buttonDropdown: {
        borderLeftWidth: 1,
        borderColor: themeColors.textReversed,
    },

    noRightBorderRadius: {
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
    },

    noLeftBorderRadius: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
    },

    buttonConfirm: {
        margin: 20,
    },

    buttonConfirmText: {
        paddingLeft: 20,
        paddingRight: 20,
    },

    buttonSuccessText: {
        color: themeColors.textReversed,
    },

    buttonDangerText: {
        color: themeColors.textReversed,
    },

    hoveredComponentBG: {
        backgroundColor: themeColors.hoverComponentBG,
    },

    activeComponentBG: {
        backgroundColor: themeColors.activeComponentBG,
    },

    touchableButtonImage: {
        alignItems: 'center',
        height: variables.componentSizeNormal,
        justifyContent: 'center',
        marginRight: 8,
        width: variables.componentSizeNormal,
    },

    visuallyHidden: {
        ...visibility('hidden'),
        overflow: 'hidden',
        width: 0,
        height: 0,
    },

    loadingVBAAnimation: {
        width: 160,
        height: 160,
    },

    pickerSmall: {
        inputIOS: {
            fontFamily: fontFamily.GTA,
            fontSize: variables.fontSizeSmall,
            paddingLeft: 9,
            paddingRight: 25,
            paddingTop: 6,
            paddingBottom: 6,
            borderRadius: variables.componentBorderRadius,
            borderWidth: 1,
            borderColor: themeColors.border,
            borderStyle: 'solid',
            color: themeColors.text,
            height: variables.componentSizeSmall,
            opacity: 1,
            backgroundColor: 'transparent',
        },
        inputWeb: {
            fontFamily: fontFamily.GTA,
            fontSize: variables.fontSizeSmall,
            paddingLeft: 9,
            paddingRight: 25,
            paddingTop: 6,
            paddingBottom: 6,
            borderWidth: 1,
            borderColor: themeColors.border,
            borderStyle: 'solid',
            borderRadius: variables.componentBorderRadius,
            color: themeColors.text,
            appearance: 'none',
            height: variables.componentSizeSmall,
            opacity: 1,
            cursor: 'pointer',
            backgroundColor: 'transparent',
        },
        inputAndroid: {
            fontFamily: fontFamily.GTA,
            fontSize: variables.fontSizeSmall,
            paddingLeft: 9,
            paddingRight: 25,
            paddingTop: 6,
            paddingBottom: 6,
            borderWidth: 1,
            borderColor: themeColors.border,
            borderStyle: 'solid',
            borderRadius: variables.componentBorderRadius,
            color: themeColors.text,
            height: variables.componentSizeSmall,
            opacity: 1,
        },
        iconContainer: {
            top: 8,
            right: 9,
            pointerEvents: 'none',
        },
        icon: {
            width: variables.iconSizeExtraSmall,
            height: variables.iconSizeExtraSmall,
        },
    },

    badge: {
        backgroundColor: themeColors.badgeDefaultBG,
        borderRadius: 14,
        height: variables.iconSizeNormal,
        flexDirection: 'row',
        paddingHorizontal: 7,
        alignItems: 'center',
    },

    badgeSuccess: {
        backgroundColor: themeColors.badgeSuccessBG,
    },

    badgeSuccessPressed: {
        backgroundColor: themeColors.badgeSuccessPressedBG,
    },

    badgeDanger: {
        backgroundColor: themeColors.badgeDangerBG,
    },

    badgeDangerPressed: {
        backgroundColor: themeColors.badgeDangerPressedBG,
    },

    badgeText: {
        color: themeColors.text,
        fontSize: variables.fontSizeSmall,
        lineHeight: 16,
        ...whiteSpace.noWrap,
    },

    border: {
        borderWidth: 1,
        borderRadius: variables.componentBorderRadiusNormal,
        borderColor: themeColors.border,
    },

    borderColorFocus: {
        borderColor: themeColors.borderFocus,
    },

    borderColorDanger: {
        borderColor: themeColors.badgeDangerBG,
    },

    headerText: {
        color: themeColors.heading,
        fontFamily: fontFamily.GTA_BOLD,
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
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeSmall,
        lineHeight: 14,
    },

    chatItemComposeSecondaryRowOffset: {
        marginLeft: 48,
    },

    // Actions
    actionAvatar: {
        borderRadius: 20,
        marginRight: 8,
    },

    componentHeightLarge: {
        height: variables.componentSizeLarge,
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
        fontFamily: fontFamily.GTA,
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
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeNormal,
        lineHeight: variables.fontSizeNormalHeight,
        color: themeColors.text,
        paddingTop: 23,
        paddingBottom: 8,
        paddingHorizontal: 11,
        borderWidth: 0,
        borderRadius: variables.componentBorderRadiusNormal,
    },

    textInputAndIconContainer: {
        flex: 1,
        height: '100%',
        zIndex: -1,
        flexDirection: 'row',
    },

    textInputDesktop: addOutlineWidth({}, 0),

    secureInputEyeButton: {
        paddingHorizontal: 11,
        justifyContent: 'center',
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
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeNormal,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 10,
        paddingBottom: 10,
        textAlignVertical: 'center',
    },

    textInputWithPrefix: {
        container: {
            backgroundColor: themeColors.componentBG,
            borderColor: themeColors.border,
            borderWidth: 1,
            borderRadius: variables.componentBorderRadiusNormal,
            color: themeColors.text,
            display: 'flex',
            flexDirection: 'row',
            fontFamily: fontFamily.GTA,
            fontSize: variables.fontSizeNormal,
            height: variables.inputComponentSizeNormal,
            marginBottom: 4,
            paddingBottom: 10,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 10,
            textAlignVertical: 'center',
        },
        textInput: {
            outlineStyle: 'none',
            color: themeColors.text,
            fontFamily: fontFamily.GTA,
            fontSize: variables.fontSizeNormal,
            textAlignVertical: 'center',
            flex: 1,
        },
        prefix: {
            paddingRight: 10,
            color: themeColors.text,
            fontFamily: fontFamily.GTA,
            fontSize: variables.fontSizeNormal,
            textAlignVertical: 'center',
        },
    },

    textInputPrefix: {
        paddingLeft: 11,
        paddingTop: 23,
        paddingBottom: 8,
        color: themeColors.text,
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeNormal,
        textAlignVertical: 'center',
    },

    pickerContainer: {
        borderWidth: 0,
        borderRadius: variables.componentBorderRadiusNormal,
        justifyContent: 'center',
        backgroundColor: themeColors.componentBG,
    },
    pickerLabel: {
        position: 'absolute',
        left: 12,
        top: 7,
    },
    picker: (disabled = false, error = false, focused = false) => ({
        iconContainer: {
            top: 16,
            right: 11,
            zIndex: -1,
        },
        inputWeb: {
            appearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            ...picker,
            ...(focused && {borderColor: themeColors.borderFocus}),
            ...(error && {borderColor: themeColors.badgeDangerBG}),
        },
        inputNative: {
            ...picker,
            ...(focused && {borderColor: themeColors.borderFocus}),
            ...(error && {borderColor: themeColors.badgeDangerBG}),
        },
    }),

    disabledText: {
        color: colors.gray3,
    },

    inputDisabled: {
        backgroundColor: colors.gray1,
        color: colors.gray3,
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
        borderColor: colors.red,
    },

    textLabelSupporting: {
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeLabel,
        color: themeColors.textSupporting,
    },

    formLabel: {
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        color: themeColors.heading,
        fontSize: variables.fontSizeLabel,
        lineHeight: 18,
        marginBottom: 8,
    },

    formHelp: {
        color: themeColors.textSupporting,
        fontSize: variables.fontSizeLabel,
        lineHeight: 18,
        marginBottom: 4,
    },

    formError: {
        color: themeColors.textError,
        fontSize: variables.fontSizeLabel,
        lineHeight: 18,
        marginBottom: 4,
    },

    formSuccess: {
        color: themeColors.textSuccess,
        fontSize: variables.fontSizeLabel,
        lineHeight: 18,
        marginBottom: 4,
    },

    signInPage: {
        backgroundColor: themeColors.sidebar,
        minHeight: '100%',
        flex: 1,
    },

    signInPageLogo: {
        height: variables.componentSizeLarge,
        marginBottom: 24,
    },

    signInPageInner: {
        marginLeft: 'auto',
        marginRight: 'auto',
        height: '100%',
        width: '100%',
    },

    signInPageInnerNative: {
        width: '100%',
    },

    signInPageHeroHeading: {
        fontFamily: fontFamily.GTA,
        fontWeight: fontWeightBold,
        fontSize: variables.fontSizeHero,
        color: colors.white,
        lineHeight: variables.lineHeightHero,
    },

    signInPageHeroDescription: {
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeNormal,
        color: colors.white,
    },

    signInPageFormContainer: {
        maxWidth: 295,
        width: '100%',
    },

    signInPageNarrowContentContainer: {
        maxWidth: 335,
    },

    signInPageNarrowContentMargin: {
        marginTop: '40%',
    },

    signInPageWideLeftContainer: {
        width: 375,
        maxWidth: 375,
    },

    signInPageWideLeftContentMargin: {
        marginTop: '44.5%',
    },

    signInPageWideHeroContent: {
        maxWidth: 400,
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

    resendLinkButton: {
        minWidth: 124,
    },

    sidebarFooter: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        paddingVertical: 20,
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
        backgroundColor: themeColors.online,
    },

    statusIndicatorOffline: {
        backgroundColor: themeColors.offline,
    },

    floatingActionButton: {
        backgroundColor: themeColors.buttonSuccessBG,
        position: 'absolute',
        height: variables.componentSizeLarge,
        width: variables.componentSizeLarge,
        right: 20,
        bottom: 34,
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
        fontFamily: fontFamily.GTA,
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

    singleEmojiText: {
        fontSize: variables.fontSizeSingleEmoji,
        lineHeight: variables.fontSizeSingleEmojiHeight,
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
        fontFamily: fontFamily.GTA,
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
        fontFamily: fontFamily.GTA_BOLD,
        fontSize: variables.fontSizeNormal,
        fontWeight: fontWeightBold,
        color: themeColors.heading,
        maxWidth: 240,
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

    sidebarInnerRow: {
        height: 64,
        paddingTop: 12,
        paddingBottom: 12,
    },

    sidebarInnerRowSmall: {
        height: 52,
        paddingTop: 12,
        paddingBottom: 12,
    },

    sidebarLinkText: {
        color: themeColors.text,
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

    sidebarLinkTextUnread: {
        fontWeight: '700',
        color: themeColors.heading,
    },

    sidebarLinkActiveText: {
        color: themeColors.text,
        fontSize: variables.fontSizeNormal,
        textDecorationLine: 'none',
        overflow: 'hidden',
    },

    optionItemAvatarNameWrapper: {
        minWidth: 0,
        flex: 1,
    },

    optionDisplayName: {
        fontFamily: fontFamily.GTA,
        height: 20,
        lineHeight: 20,
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
        height: 20,
        lineHeight: 20,
    },

    optionAlternateTextCompact: {
        flexShrink: 1,
        flexGrow: 1,
        flexBasis: 'auto',
        ...optionAlternateTextPlatformStyles,
    },

    appContent: {
        backgroundColor: themeColors.appBG,
        overflow: 'hidden',
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
        marginLeft: 48,
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
        fontFamily: fontFamily.GTA_BOLD,
        fontSize: variables.fontSizeNormal,
        fontWeight: fontWeightBold,
        lineHeight: 20,
        paddingRight: 5,
        paddingBottom: 4,
        ...wordBreak.breakWord,
    },

    chatItemMessageHeaderTimestamp: {
        flexShrink: 0,
        color: themeColors.textSupporting,
        fontSize: variables.fontSizeSmall,
        height: 24,
        lineHeight: 20,
    },

    chatItemMessage: {
        color: themeColors.text,
        fontSize: variables.fontSizeNormal,
        fontFamily: fontFamily.GTA,
        lineHeight: 20,
        marginTop: -2,
        marginBottom: -2,
        maxWidth: '100%',
        ...whiteSpace.preWrap,
        ...wordBreak.breakWord,
    },

    chatItemUnsentMessage: {
        opacity: 0.6,
    },

    chatItemMessageLink: {
        color: colors.blue,
        fontSize: variables.fontSizeNormal,
        fontFamily: fontFamily.GTA,
        lineHeight: 20,
    },

    chatItemCompose: {
        minHeight: 65,
        marginBottom: 5,
        paddingLeft: 20,
        paddingRight: 20,
        display: 'flex',
        backgroundColor: themeColors.appBG,
    },

    chatItemComposeWithFirstRow: {
        minHeight: 90,
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
        borderRadius: variables.componentBorderRadiusNormal,
        minHeight: variables.componentSizeNormal,
    },

    textInputCompose: addOutlineWidth({
        backgroundColor: themeColors.componentBG,
        borderColor: themeColors.border,
        color: themeColors.text,
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeNormal,
        borderWidth: 0,
        borderRadius: 0,
        height: 'auto',
        lineHeight: 20,
        overflowX: 'hidden',

        // On Android, multiline TextInput with height: 'auto' will show extra padding unless they are configured with
        // paddingVertical: 0, alignSelf: 'center', and textAlignVertical: 'center'

        paddingHorizontal: 8,
        marginVertical: 5,
        paddingVertical: 0,
        ...textInputAlignSelf.center,
        textAlignVertical: 'center',
    }, 0),

    chatItemSubmitButton: {
        alignSelf: 'flex-end',
        borderRadius: 6,
        height: 32,
        padding: 6,
        margin: 3,
        justifyContent: 'center',
    },

    emojiPickerContainer: {
        backgroundColor: themeColors.componentBG,
    },

    emojiPickerList: {
        height: 300,
        width: '100%',
        ...spacing.ph4,
    },
    emojiPickerListLandscape: {
        height: 240,
    },

    emojiHeaderStyle: {
        backgroundColor: themeColors.componentBG,
        width: '100%',
        ...spacing.pv3,
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        color: themeColors.heading,
        fontSize: variables.fontSizeSmall,
    },

    emojiSkinToneTitle: {
        backgroundColor: themeColors.componentBG,
        width: '100%',
        ...spacing.pv1,
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        color: themeColors.heading,
        fontSize: variables.fontSizeSmall,
    },

    // Emoji Picker Styles
    emojiText: {
        fontFamily: fontFamily.GTA_BOLD,
        textAlign: 'center',
        fontSize: variables.emojiSize,
        ...spacing.pv0,
        ...spacing.ph0,
    },

    emojiItem: {
        width: '12.5%',
        textAlign: 'center',
        borderRadius: 8,
    },

    emojiItemHighlighted: {
        transition: '0.2s ease',
        backgroundColor: themeColors.buttonDefaultBG,
    },

    chatItemEmojiButton: {
        alignSelf: 'flex-end',
        borderRadius: 6,
        height: 32,
        margin: 3,
        justifyContent: 'center',
    },

    hoveredButton: {
        backgroundColor: themeColors.buttonHoveredBG,
    },

    chatItemAttachButton: {
        alignItems: 'center',
        alignSelf: 'flex-end',
        borderRightColor: themeColors.border,
        borderRightWidth: 1,
        height: 26,
        marginBottom: 6,
        marginTop: 6,
        justifyContent: 'center',
        width: 39,
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

    singleAvatarSmall: {
        height: 18,
        width: 18,
        backgroundColor: themeColors.icon,
        borderRadius: 18,
    },

    singleAvatarLarge: {
        height: 64,
        width: 64,
        backgroundColor: themeColors.icon,
        borderRadius: 64,
        overflow: 'hidden',
    },

    secondAvatar: {
        position: 'absolute',
        right: -18,
        bottom: -18,
        borderWidth: 3,
        borderRadius: 30,
        borderColor: 'transparent',
    },

    secondAvatarHovered: {
        backgroundColor: themeColors.sidebarHover,
        borderColor: themeColors.sidebarHover,
    },

    secondAvatarSmall: {
        position: 'absolute',
        right: -13,
        bottom: -13,
        borderWidth: 3,
        borderRadius: 18,
        borderColor: 'transparent',
    },

    secondAvatarInline: {
        bottom: -3,
        right: -25,
        borderWidth: 3,
        borderRadius: 18,
        borderColor: themeColors.componentBG,
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
        color: themeColors.textReversed,
        fontSize: variables.fontSizeSmall,
        lineHeight: undefined,
        marginLeft: -3,
        textAlign: 'center',
    },

    avatarInnerTextSmall: {
        color: themeColors.textReversed,
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
        marginRight: variables.componentSizeNormal - 24,
        height: variables.avatarSizeNormal,
        width: variables.avatarSizeNormal,
    },

    emptyAvatarSmall: {
        marginRight: variables.componentSizeNormal - 28,
        height: variables.avatarSizeSmall,
        width: variables.avatarSizeSmall,
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

    pointerEventsNone: {
        pointerEvents: 'none',
    },

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
        flex: 1,
        backgroundColor: themeColors.modalBackground,
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        overflow: 'hidden',
        overflowY: 'auto',
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
        color: colors.blue,
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        fontSize: 150,
    },

    notFoundTextBody: {
        color: themeColors.componentBG,
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        fontSize: 15,
    },

    notFoundButtonText: {
        color: colors.blue,
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        fontSize: 15,
    },

    defaultModalContainer: {
        backgroundColor: themeColors.componentBG,
        borderColor: colors.transparent,
    },

    reportActionContextMenuMiniButton: {
        ...spacing.p1,
        ...spacing.mv1,
        ...spacing.mh1,
        ...{borderRadius: variables.componentBorderRadiusSmall},
    },

    reportDetailsTitleContainer: {
        ...flex.dFlex,
        ...flex.flexColumn,
        ...flex.alignItemsCenter,
        ...spacing.mt4,
        height: 150,
    },

    reportDetailsRoomInfo: {
        ...flex.flex1,
        ...flex.dFlex,
        ...flex.flexColumn,
        ...flex.alignItemsCenter,
    },

    reportSettingsChangeNameButton: {
        height: 42,
        paddingHorizontal: 20,
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

    avatarLarge: {
        width: 80,
        height: 80,
    },

    roomHeaderAvatar: {
        height: variables.componentSizeLarge,
        width: variables.componentSizeLarge,
        borderRadius: 100,
        borderColor: themeColors.componentBG,
        borderWidth: 4,
        marginLeft: -16,
    },

    screenBlur: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: colors.dark,
        opacity: 0.5,
    },

    avatarInnerTextChat: {
        color: themeColors.textReversed,
        fontSize: variables.fontSizeNormal,
        left: 1,
        textAlign: 'center',
        fontWeight: 'normal',
        position: 'absolute',
    },

    displayName: {
        fontSize: variables.fontSizeLarge,
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        color: themeColors.heading,
    },

    pageWrapper: {
        width: '100%',
        alignItems: 'center',
        padding: 20,
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
        fontFamily: fontFamily.GTA_BOLD,
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
        backgroundColor: colors.green,
    },

    switchInactive: {
        backgroundColor: colors.gray2,
    },

    switchThumb: {
        width: 22,
        height: 22,
        borderRadius: 11,
        position: 'absolute',
        left: 4,
        backgroundColor: colors.white,
    },

    checkboxContainer: {
        backgroundColor: themeColors.componentBG,
        borderRadius: 2,
        height: 20,
        width: 20,
        borderColor: themeColors.border,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    checkedContainer: {
        backgroundColor: colors.blue,
    },

    iouAmountText: {
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        fontSize: variables.iouAmountTextSize,
        color: themeColors.heading,
    },

    iouAmountTextInput: addOutlineWidth({
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        fontSize: variables.iouAmountTextSize,
        color: themeColors.heading,
        padding: 0,
        lineHeight: undefined,
    }, 0),

    iouPreviewBox: {
        backgroundColor: themeColors.componentBG,
        borderColor: themeColors.border,
        borderWidth: 1,
        borderRadius: variables.componentBorderRadiusCard,
        padding: 20,
        marginTop: 16,
        maxWidth: variables.sideBarWidth,
        width: '100%',
    },

    iouPreviewBoxLoading: {
        minHeight: 47,
        width: '100%',
    },

    iouPreviewBoxAvatar: {
        marginRight: -10,
        marginBottom: -10,
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

    iouConfirmComment: {
        flexBasis: 92,
    },

    noScrollbars: {
        scrollbarWidth: 'none',
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
        backgroundColor: colors.gray1,
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

    growlNotificationBox: {
        backgroundColor: colors.dark,
        borderRadius: variables.componentBorderRadiusNormal,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        shadowColor: '#000',
        ...spacing.p5,
    },

    growlNotificationText: {
        fontSize: variables.fontSizeNormal,
        fontFamily: fontFamily.GTA,
        width: '90%',
        lineHeight: variables.fontSizeNormalHeight,
        color: themeColors.textReversed,
    },

    blockquote: {
        borderLeftColor: themeColors.border,
        borderLeftWidth: 4,
        paddingLeft: 12,
        marginVertical: 4,
    },

    cursorDisabled: {
        cursor: 'not-allowed',
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
        backgroundColor: themeColors.icon,
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
        borderBottomWidth: 1,
        borderColor: themeColors.border,
        ...spacing.pv2,
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
        lineHeight: 16,
        ...whiteSpace.noWrap,
    },

    sidebarPopover: {
        width: variables.sideBarWidth - 68,
    },

    cardOverlay: {
        backgroundColor: themeColors.modalBackdrop,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.5,
    },

    communicationsLinkIcon: {
        right: -36,
        top: 0,
        bottom: 0,
    },

    shortTermsBorder: {
        borderWidth: 1,
        borderColor: themeColors.shadow,
    },

    shortTermsHorizontalRule: {
        borderBottomWidth: 1,
        borderColor: themeColors.shadow,
        ...spacing.mh3,
    },

    shortTermsLargeHorizontalRule: {
        borderWidth: 1,
        borderColor: themeColors.shadow,
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
        height: 20,
    },

    reportMarkerBadgeWrapper: {
        position: 'absolute',
        left: '50%',
        top: 0,
        zIndex: 100,
        ...visibility('hidden'),
    },

    reportMarkerBadgeWrapperAndroid: {
        left: 0,
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        zIndex: 100,
        ...visibility('hidden'),
    },

    reportMarkerBadgeSubWrapperAndroid: {
        left: '50%',
        width: 'auto',
    },

    reportMarkerBadge: {
        left: '-50%',
        ...visibility('visible'),
    },

    reportMarkerBadgeTransformation: translateY => ({
        transform: [
            {translateY},
        ],
    }),

    confettiIcon: {
        height: 100,
        width: 100,
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
        fontFamily: fontFamily.GTA,
        flex: 1,
    },

    threeDotsPopoverOffset: {
        top: 50,
        right: 60,
    },

    googleListView: {
        transform: [{scale: 0}],
    },

    keyboardShortcutModalContainer: {
        maxWidth: 600,
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
        backgroundColor: colors.black,
        flex: 1,
    },

    errorPageContainer: {
        backgroundColor: themeColors.componentBG,
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
        minHeight: 140,
    },
};

export default styles;
