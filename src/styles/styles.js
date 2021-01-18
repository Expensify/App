import fontFamily from './fontFamily';
import italic from './italic';
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

const styles = {
    // Add all of our utility and helper styles
    ...spacing,
    ...sizing,
    ...flex,
    ...display,
    ...overflow,

    link: {
        color: themeColors.link,
        textDecorationColor: themeColors.link,
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

    textP: {
        color: themeColors.text,
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeNormal,
        lineHeight: 20,
    },

    textLabel: {
        color: themeColors.text,
        fontSize: variables.fontSizeLabel,
        lineHeight: 18,
    },

    textMicro: {
        fontSize: variables.fontSizeSmall,
    },

    textLarge: {
        fontSize: variables.fontSizeLarge,
    },

    textStrong: {
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
    },

    textDecorationNoLine: {
        textDecorationLine: 'none',
    },

    colorReversed: {
        color: themeColors.textReversed,
    },

    colorMutedReversed: {
        color: themeColors.textMutedReversed,
    },

    button: {
        borderColor: themeColors.border,
        borderRadius: variables.componentBorderRadius,
        borderWidth: 1,
        height: variables.componentSizeNormal,
        justifyContent: 'center',
    },

    buttonText: {
        color: themeColors.text,
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        textAlign: 'center',
    },

    buttonSmall: {
        height: variables.componentSizeSmall,
        paddingTop: 6,
        paddingRight: 10,
        paddingBottom: 6,
        paddingLeft: 10,
    },

    buttonSmallText: {
        fontSize: variables.fontSizeSmall,
        lineHeight: 16,
    },

    buttonSuccess: {
        backgroundColor: themeColors.buttonSuccessBG,
        borderWidth: 0,
    },

    buttonDisable: {
        backgroundColor: themeColors.buttonDisabledBG,
        borderWidth: 0,
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

    touchableButtonImage: {
        alignItems: 'center',
        height: variables.componentSizeNormal,
        justifyContent: 'center',
        marginRight: 8,
        width: variables.componentSizeNormal,
    },

    pill: {
        borderRadius: 14,
        backgroundColor: themeColors.pillBG,
        height: variables.componentSizeSmall,
        flexDirection: 'row',
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 7,
        paddingRight: 7,
        alignItems: 'center',
    },

    pillText: {
        color: themeColors.text,
        weight: '400',
        fontSize: variables.fontSizeSmall,
        lineHeight: 16,
        marginRight: 4,
        userSelect: 'none',
        maxWidth: 144,
        whiteSpace: 'nowrap',
    },

    pillCancelIcon: {
        width: 12,
        height: 12,
    },

    headerText: {
        fontFamily: fontFamily.GTA,
        color: themeColors.heading,
        fontSize: variables.fontSizeNormal,
        fontWeight: '700',
    },

    reportOptions: {
        marginLeft: 8,
    },

    typingIndicator: {
        height: 15,
        marginBottom: 5,
        marginTop: 5,
    },

    typingIndicatorSubText: {
        color: themeColors.textSupporting,
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeSmall,
        marginLeft: 48,
    },

    // Actions
    actionAvatar: {
        borderRadius: 20,
        marginRight: 8,
    },

    textInput: {
        backgroundColor: themeColors.componentBG,
        borderRadius: variables.componentBorderRadius,
        height: variables.componentSizeNormal,
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

    textInputReversed: addOutlineWidth({
        backgroundColor: themeColors.heading,
        borderColor: themeColors.text,
        color: themeColors.textReversed,
    }, 0),

    textInputReversedFocus: {
        borderColor: themeColors.icon,
    },

    textInputNoOutline: addOutlineWidth({}, 0),

    formLabel: {
        color: themeColors.text,
        fontSize: variables.fontSizeLabel,
        lineHeight: 18,
        marginBottom: 8,
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
        padding: 20,
        minHeight: '100%',
    },

    signInPageLogo: {
        height: variables.componentSizeLarge,
        marginBottom: 24,
    },

    signInPageLogoNative: {
        alignItems: 'center',
        height: variables.componentSizeLarge,
        justifyContent: 'center',
        width: '100%',
        marginBottom: 20,
        marginTop: 20,
    },

    signinLogo: {
        height: variables.componentSizeLarge,
        width: variables.componentSizeLarge,
    },

    signinWelcomeScreenshot: {
        height: 354,
        width: 295,
    },

    signinWelcomeScreenshotWide: {
        height: 592,
        width: 295,
    },

    genericView: {
        backgroundColor: themeColors.heading,
        height: '100%',
    },

    signInPageInner: {
        paddingTop: 40,
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: 800,
        width: '100%',
    },

    signInPageInnerNative: {
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: 295,
        width: '100%',
    },

    loginFormContainer: {
        maxWidth: 295,
        width: '100%',
    },

    // Sidebar Styles
    sidebar: {
        backgroundColor: themeColors.sidebar,
        height: '100%',
    },

    sidebarHeader: {
        flexGrow: 0,
    },

    sidebarHeaderActive: {
        flexGrow: 1,
        height: '100%',
    },

    sidebarHeaderTop: {
        paddingHorizontal: 20,
        paddingVertical: 12,
    },

    sidebarFooter: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        height: 84,
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        width: '100%',
    },

    sidebarAvatar: {
        backgroundColor: themeColors.text,
        borderRadius: 20,
        height: variables.componentSizeNormal,
        width: variables.componentSizeNormal,
    },

    statusIndicator: {
        borderColor: themeColors.sidebar,
        borderRadius: 7,
        borderWidth: 2,
        position: 'absolute',
        right: -6,
        bottom: 3,
        height: 14,
        width: 14,
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
        height: variables.componentSizeNormal,
        width: variables.componentSizeNormal,
        right: 20,
        bottom: 24,
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
        whiteSpace: 'nowrap',
    },

    sidebarFooterLink: {
        color: themeColors.textSupporting,
        fontSize: variables.fontSizeSmall,
        textDecorationLine: 'none',
        fontFamily: fontFamily.GTA,
        lineHeight: 20,
    },

    sidebarListContainer: {
        flex: 1,
        flexGrow: 100,
        scrollbarWidth: 'none',
        overflow: 'scroll',
        paddingBottom: 4,
    },

    sidebarListItem: {
        justifyContent: 'center',
        textDecorationLine: 'none',
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
        height: 64,
        paddingTop: 12,
        paddingRight: 20,
        paddingBottom: 12,
        paddingLeft: 20,
    },

    sidebarLinkText: {
        color: themeColors.text,
        fontSize: variables.fontSizeLabel,
        textDecorationLine: 'none',
        overflow: 'hidden',
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
        fontSize: variables.fontSizeLabel,
        textDecorationLine: 'none',
        overflow: 'hidden',
    },

    chatSwitcherDisplayName: {
        fontFamily: fontFamily.GTA,
        height: 18,
        lineHeight: 18,
        whiteSpace: 'nowrap',
    },

    chatSwitcherLogin: {
        color: themeColors.textSupporting,
        fontFamily: fontFamily.GTA,
        height: 16,
        lineHeight: 16,
    },

    // App Content Wrapper styles
    appContentWrapper: {
        backgroundColor: themeColors.appBG,
        color: themeColors.text,
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
        paddingLeft: 20,
        paddingRight: 20,
    },

    appContentHeaderTitle: {
        alignItems: 'center',
        flexDirection: 'row',
    },

    LHNToggle: {
        alignItems: 'center',
        height: variables.componentSizeNormal,
        justifyContent: 'center',
        marginRight: 8,
        width: variables.componentSizeNormal,
    },

    LHNToggleIcon: {
        height: 15,
        width: 18,
    },

    LHNPencilIcon: {
        height: 16,
        width: 16,
    },

    attachmentCloseIcon: {
        height: 20,
        width: 20,
        padding: 0,
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

    chatContentEmpty: {
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 20,
        paddingRight: 20,
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
        flexWrap: 'wrap',
    },

    chatItemMessageHeaderSender: {
        color: themeColors.heading,
        fontFamily: fontFamily.GTA_BOLD,
        fontSize: variables.fontSizeNormal,
        fontWeight: fontWeightBold,
        lineHeight: 20,
        paddingRight: 5,
        paddingBottom: 4,
        wordBreak: 'break-word',
    },

    chatItemMessageHeaderTimestamp: {
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
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },

    chatItemCompose: {
        minHeight: 65,
        marginBottom: 5,
        paddingLeft: 20,
        paddingRight: 20,
        display: 'flex',
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
        borderRadius: variables.componentBorderRadius,
        minHeight: variables.componentSizeNormal,
    },

    textInputCompose: addOutlineWidth({
        borderWidth: 0,
        borderRadius: 0,
        height: 'auto',
        minHeight: 38,
        paddingTop: 10,
        paddingRight: 8,
        paddingBottom: 10,
        paddingLeft: 8,
    }, 0),

    chatItemSubmitButton: {
        alignSelf: 'flex-end',
        borderRadius: 6,
        height: 32,
        paddingTop: 8,
        paddingRight: 6,
        paddingBottom: 8,
        paddingLeft: 6,
        margin: 3,
        justifyContent: 'center',
    },

    chatItemSubmitButtonIcon: {
        height: 20,
        width: 20,
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
        borderRadius: variables.componentBorderRadius,
        height: 150,
        textAlign: 'center',
        verticalAlign: 'middle',
        width: 200,
    },

    chatSwitcherInputClear: {
        alignSelf: 'flex-end',
        height: variables.componentSizeNormal,
        justifyContent: 'center',
    },

    chatSwitcherInputClearIcon: {
        height: 24,
        width: 24,
    },

    chatSwitcherGroupDMContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: themeColors.appBG,
        borderRadius: variables.componentBorderRadius,
        borderWidth: 1,
        borderColor: themeColors.border,
        paddingTop: 0,
        paddingRight: 3,
        paddingBottom: 0,
        paddingLeft: 5,
    },

    chatSwitcherPillsInput: {
        alignItems: 'flex-start',
        alignSelf: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
        maxWidth: 177,
        overflow: 'hidden',
    },

    chatSwitcherInputGroup: {
        minWidth: 1,
    },

    chatSwitcherGroupDMTextInput: {
        backgroundColor: themeColors.componentBG,
        color: themeColors.text,
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeNormal,
        flexGrow: 1,
        height: variables.componentSizeSmall,
        width: '100%',
        marginTop: 5,
        marginBottom: 5,
        padding: 0,
    },

    chatSwticherPillWrapper: {
        marginTop: 5,
        marginRight: 4,
    },

    chatSwitcherGo: {
        borderRadius: 6,
        height: 32,
        marginBottom: 3,
    },

    navigationMenuOpenAbsolute: {
        borderColor: themeColors.border,
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 2,
        shadowColor: themeColors.shadow,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
    },

    navigationMenuOpen: {
        borderColor: themeColors.border,
    },

    sidebarVisible: {
        borderRightWidth: 1,
    },

    sidebarHidden: {
        width: 0,
        borderRightWidth: 0,
    },

    singleAvatar: {
        height: 24,
        width: 24,
        borderRadius: 24,
    },

    avatarNormal: {
        height: variables.componentSizeNormal,
        width: variables.componentSizeNormal,
        borderRadius: variables.componentSizeNormal,
    },

    singleLeftAvatar: {
        marginTop: -variables.componentSizeNormal / 2,
        borderRadius: 24,
    },

    singleRightAvatar: {
        marginTop: 12,
        height: 30,
        width: 30,
        borderRadius: 30,
        left: -12,
    },

    avatarText: {
        backgroundColor: themeColors.icon,
        borderRadius: 24,
        height: 24,
        width: 24,
    },

    avatarInnerText: {
        color: themeColors.textReversed,
        fontSize: variables.fontSizeSmall,
        lineHeight: 24,
        textAlign: 'center',
    },

    avatarSpace: {
        top: 3,
        left: 3,
    },

    avatar: {
        backgroundColor: themeColors.sidebar,
    },

    focusedAvatar: {
        backgroundColor: themeColors.border,
    },

    emptyAvatar: {
        marginRight: variables.componentSizeNormal - 24,
    },

    chatSwitcherItemAvatarNameWrapper: {
        minWidth: 0,
        flex: 1,
    },

    chatSwitcherItemButton: {
        backgroundColor: themeColors.sidebarButtonBG,
        paddingTop: 6,
        paddingRight: 8,
        paddingBottom: 6,
        paddingLeft: 8,
        borderRadius: variables.componentBorderRadius,
        height: variables.componentSizeSmall,
        marginLeft: 4,
    },

    chatSwitcherItemButtonText: {
        color: themeColors.heading,
        fontFamily: fontFamily.GTA_BOLD,
        fontSize: variables.fontSizeSmall,
        lineHeight: 16,
        fontWeight: fontWeightBold,
    },

    modalViewContainer: {
        alignItems: 'center',
        flex: 1,
    },

    headerBar: {
        overflow: 'hidden',
        justifyContent: 'center',
        display: 'flex',
        paddingLeft: 20,
        borderBottomWidth: 1,
        borderColor: themeColors.border,
        height: variables.contentHeaderHeight,
        width: '100%',
    },

    imageModalPDF: {
        flex: 1,
        backgroundColor: themeColors.componentBG,
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
        borderRadius: variables.componentBorderRadius,
        borderWidth: 1,
        borderColor: themeColors.border,
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 10,
        paddingRight: 20,
        paddingLeft: 20,
        alignItems: 'center',
    },

    defaultAttachmentViewIcon: {
        width: 47,
        height: 60,
        marginRight: 20,
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
};

const baseCodeTagStyles = {
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 4,
    marginBottom: 4,
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
            fontFamily: fontFamily.GTA_ITALIC,
            fontStyle: italic,
        },

        del: {
            textDecorationLine: 'line-through',
            textDecorationStyle: 'solid',
        },

        strong: {
            fontFamily: fontFamily.GTA_BOLD,
            fontWeight: fontWeightBold,
        },

        a: styles.link,

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
        },

        code: {
            ...baseCodeTagStyles,
            paddingLeft: 5,
            paddingRight: 5,
            paddingBottom: 2,
            alignSelf: 'flex-start',
            fontFamily: fontFamily.MONOSPACE,
        },

        img: {
            borderColor: themeColors.border,
            borderRadius: variables.componentBorderRadius,
            borderWidth: 1,
        },
    },

    baseFontStyle: {
        color: themeColors.text,
        fontSize: variables.fontSizeNormal,
        fontFamily: fontFamily.GTA,
    },
};

/**
 * Takes safe area insets and returns padding to use for a View
 *
 * @param {Object} insets
 * @returns {Object}
 */
function getSafeAreaPadding(insets) {
    return {
        paddingTop: insets.top,
        paddingBottom: insets.bottom * variables.safeInsertPercentage,
    };
}

/**
 * Takes safe area insets and returns margin to use for a View
 *
 * @param {Object} insets
 * @returns {Object}
 */
function getSafeAreaMargins(insets) {
    return {marginBottom: insets.bottom * variables.safeInsertPercentage};
}

export default styles;
export {
    getSafeAreaPadding, getSafeAreaMargins, webViewStyles,
};
