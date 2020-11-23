// We place items a percentage to the safe area on the top or bottom of the screen
import fontFamily from './fontFamily';
import italic from './italic';

const safeInsertPercentage = 0.7;

const colors = {
    componentBG: '#FFFFFF',
    background: '#FAFAFA',
    black: '#000000',
    blue: '#2EAAE2',
    border: '#ECECEC',
    borderLight: '#E0E0E0',
    green: '#2ECB70',
    heading: '#37444C',
    icon: '#C6C9CA',
    text: '#4A5960',
    textBackground: '#F0F0F0',
    textReversed: '#FFFFFF',
    textSupporting: '#7D8B8F',
    red: '#E84A3B',
    buttonBG: '#8A8A8A',
    modalBackdrop: '#00000080',
};

const styles = {
    // Utility classes
    m0: {
        margin: 0,
    },

    mr0: {
        marginRight: 0,
    },

    mr1: {
        marginRight: 4,
    },

    mr2: {
        marginRight: 8,
    },

    mr3: {
        marginRight: 12,
    },

    ml1: {
        marginLeft: 10,
    },

    ml2: {
        marginLeft: 8,
    },

    mt2: {
        marginTop: 20,
    },
    mt1: {
        marginTop: 10,
    },
    mb1: {
        marginBottom: 4,
    },
    mb2: {
        marginBottom: 8,
    },
    mb3: {
        marginBottom: 12,
    },
    mb4: {
        marginBottom: 16,
    },

    mbn5: {
        marginBottom: -5,
    },

    p1: {
        padding: 10,
    },
    pr1: {
        paddingRight: 4,
    },
    pr2: {
        paddingRight: 8,
    },

    h100p: {
        height: '100%',
    },

    flex0: {
        flex: 0,
    },

    flex1: {
        flex: 1,
    },

    flex4: {
        flex: 4,
    },

    flexRow: {
        flexDirection: 'row',
    },

    flexColumn: {
        flexDirection: 'column',
    },

    flexJustifyCenter: {
        justifyContent: 'center',
    },

    flexJustifyEnd: {
        justifyContent: 'flex-end',
    },

    flexJustifySpaceBetween: {
        justifyContent: 'space-between',
    },

    flexAlignSelfStretch: {
        alignSelf: 'stretch',
    },

    alignItemsCenter: {
        alignItems: 'center',
    },

    flexWrap: {
        flexWrap: 'wrap'
    },

    flexGrow1: {
        flexGrow: 1,
    },

    flexGrow4: {
        flexGrow: 4,
    },

    dFlex: {
        display: 'flex',
    },

    dNone: {
        display: 'none',
    },

    bgHighlight: {
        backgroundColor: 'yellow',
    },

    bgHighlight2: {
        backgroundColor: 'green',
    },

    bgHighlight3: {
        backgroundColor: 'pink',
    },

    overflowHidden: {
        overflow: 'hidden',
    },

    h4: {
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: '700',
        fontSize: 13,
    },

    textP: {
        color: colors.text,
        fontSize: 15,
        lineHeight: 20,
    },

    textLabel: {
        color: colors.text,
        fontSize: 13,
        lineHeight: 18,
    },

    textMicro: {
        fontSize: 11,
    },

    textStrong: {
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: '600',
    },

    textDecorationNoLine: {
        textDecorationLine: 'none',
    },

    colorReversed: {
        color: colors.textReversed,
    },

    colorMutedReversed: {
        color: colors.icon,
    },

    button: {
        borderColor: colors.border,
        borderRadius: 8,
        borderWidth: 1,
        height: 40,
        justifyContent: 'center',
    },

    buttonText: {
        color: colors.text,
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: '700',
        textAlign: 'center',
    },

    buttonSmall: {
        height: 28,
        paddingTop: 6,
        paddingRight: 10,
        paddingBottom: 6,
        paddingLeft: 10,
    },

    buttonSmallText: {
        fontSize: 11,
        lineHeight: 16,
    },

    buttonSuccess: {
        backgroundColor: colors.green,
        borderWidth: 0,
    },

    buttonSuccessText: {
        color: colors.textReversed,
    },

    touchableButtonImage: {
        alignItems: 'center',
        height: 40,
        justifyContent: 'center',
        marginRight: 8,
        width: 40,
    },

    pill: {
        borderRadius: 14,
        backgroundColor: colors.text,
        height: 28,
        flexDirection: 'row',
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 7,
        paddingRight: 7,
        alignItems: 'center',
    },

    pillText: {
        color: colors.componentBG,
        weight: '400',
        fontSize: 11,
        lineHeight: 16,
        marginRight: 4,
        userSelect: 'none',
        maxWidth: 160,
    },

    pillCancelIcon: {
        width: 12,
        height: 12,
    },

    navText: {
        color: colors.heading,
        fontSize: 17,
        fontWeight: '700'
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
        color: colors.textSupporting,
        fontFamily: fontFamily.GTA,
        fontSize: 11,
        marginLeft: 48,
    },

    // Actions
    actionAvatar: {
        borderRadius: 20,
        marginRight: 8,
        height: 40,
        width: 40,
    },

    textInput: {
        backgroundColor: colors.componentBG,
        borderRadius: 8,
        height: 40,
        borderColor: colors.border,
        borderWidth: 1,
        color: colors.text,
        fontFamily: fontFamily.GTA,
        fontSize: 15,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 10,
        paddingBottom: 10,
        textAlignVertical: 'center',
    },

    textInputReversed: {
        backgroundColor: colors.heading,
        borderColor: colors.text,
        color: colors.textReversed,
        outlineWidth: 0,
    },

    textInputReversedFocus: {
        borderColor: colors.icon,
    },

    textInputNoOutline: {
        outlineWidth: 0,
    },

    formLabel: {
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
        marginBottom: 4,
    },

    formError: {
        color: colors.red,
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 4,
    },

    signInPage: {
        backgroundColor: colors.heading,
        height: '100%',
        padding: 20,
    },

    signinLogo: {
        height: 21,
        width: 143,
    },

    genericView: {
        backgroundColor: colors.heading,
        height: '100%',
    },

    signInPageInner: {
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: 325,
        width: '100%',
    },

    signInPageLogo: {
        height: 72,
        justifyContent: 'center',
        width: '100%',
    },

    // Sidebar Styles
    sidebar: {
        backgroundColor: colors.heading,
    },

    sidebarHeader: {
        minHeight: 72,
        paddingTop: 16,
        paddingRight: 12,
        paddingBottom: 16,
        paddingLeft: 12,
        flex: 1,
    },

    sidebarHeaderLogo: {
        height: 40,
        width: 40,
    },

    sidebarFooter: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        height: 85,
        justifyContent: 'flex-start',
        paddingLeft: 24,
        paddingRight: 24,
        width: '100%',
    },

    sidebarFooterAvatar: {
        backgroundColor: colors.text,
        borderRadius: 20,
        height: 40,
        marginRight: 12,
        width: 40,
    },

    statusIndicator: {
        borderColor: colors.heading,
        borderRadius: 7,
        borderWidth: 2,
        position: 'absolute',
        right: -6,
        top: 3,
        height: 14,
        width: 14,
        zIndex: 10,
    },

    statusIndicatorOnline: {
        backgroundColor: colors.green,
    },

    statusIndicatorOffline: {
        backgroundColor: colors.icon,
    },

    sidebarFooterUsername: {
        color: colors.textReversed,
        fontSize: 15,
        fontWeight: '700',
    },

    sidebarFooterLink: {
        color: colors.icon,
        fontSize: 11,
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
        paddingLeft: 12,
        paddingRight: 12,
    },

    sidebarListHeader: {
        color: colors.textReversed,
        fontSize: 15,
        fontWeight: '700',
        paddingTop: 8,
        paddingRight: 8,
        paddingBottom: 8,
        paddingLeft: 8,
    },

    sidebarListItem: {
        justifyContent: 'center',
        textDecorationLine: 'none',
        backgroundColor: colors.heading,
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
        height: 48,
        paddingTop: 10,
        paddingRight: 8,
        paddingBottom: 10,
        paddingLeft: 8,
    },

    sidebarLinkText: {
        color: colors.icon,
        fontSize: 13,
        textDecorationLine: 'none',
        overflow: 'hidden',
    },

    sidebarLinkActive: {
        backgroundColor: colors.text,
        borderRadius: 8,
        textDecorationLine: 'none',
    },

    sidebarLinkTextUnread: {
        fontWeight: '600',
        color: colors.textReversed,
    },

    sidebarLinkActiveText: {
        color: colors.textReversed,
        fontSize: 13,
        textDecorationLine: 'none',
        overflow: 'hidden',
    },

    chatSwitcherDisplayName: {
        fontFamily: fontFamily.GTA,
        height: 16,
        lineHeight: 16,
    },

    chatSwitcherLogin: {
        fontFamily: fontFamily.GTA,
        height: 12,
        lineHeight: 12,
    },

    unreadBadge: {
        backgroundColor: colors.green,
        borderRadius: 15,
        height: 10,
        marginTop: 3,
        width: 10,
    },

    // App Content Wrapper styles
    appContentWrapper: {
        backgroundColor: colors.background,
        color: colors.text,
    },

    // App Content Wrapper styles for large screens
    // The darker BG color allows the rounded corners to show through
    appContentWrapperLarge: {
        backgroundColor: colors.heading,
    },

    appContent: {
        backgroundColor: colors.background,
        overflow: 'hidden',
    },

    appContentRounded: {
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },

    appContentHeader: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        height: 73,
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
        height: 40,
        justifyContent: 'center',
        marginRight: 8,
        width: 40,
    },

    LHNToggleIcon: {
        height: 15,
        width: 18,
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
    },

    chatItemMessageHeaderSender: {
        color: colors.heading,
        fontSize: 15,
        height: 24,
        lineHeight: 20,
        fontWeight: '600',
        paddingRight: 5,
        paddingBottom: 4,
    },

    chatItemMessageHeaderTimestamp: {
        color: colors.textSupporting,
        fontSize: 11,
        height: 24,
        lineHeight: 20,
    },

    chatItemMessage: {
        color: colors.text,
        fontSize: 15,
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
        borderColor: colors.border,
    },

    chatItemComposeBoxFocusedColor: {
        borderColor: colors.blue,
    },

    chatItemComposeBox: {
        backgroundColor: colors.componentBG,
        borderWidth: 1,
        borderRadius: 8,
        minHeight: 40,
    },

    textInputCompose: {
        borderWidth: 0,
        borderRadius: 0,
        outlineWidth: 0,
        height: 'auto',
        minHeight: 38,
        paddingTop: 10,
        paddingRight: 8,
        paddingBottom: 10,
        paddingLeft: 8,
    },

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

    reportPinIcon: {
        height: 20,
        width: 20,
    },

    chatItemAttachButton: {
        alignItems: 'center',
        alignSelf: 'flex-end',
        borderRightColor: colors.border,
        borderRightWidth: 1,
        height: 26,
        marginBottom: 6,
        marginTop: 6,
        justifyContent: 'center',
        width: 39,
    },

    chatItemAttachmentPlaceholder: {
        backgroundColor: colors.border,
        borderColor: colors.borderLight,
        borderWidth: 1,
        borderRadius: 8,
        height: 150,
        textAlign: 'center',
        verticalAlign: 'middle',
        width: 200,
    },

    chatSwitcherInputClear: {
        alignSelf: 'flex-end',
        height: 40,
        justifyContent: 'center',
    },

    chatSwitcherInputClearIcon: {
        height: 24,
        width: 24,
    },

    chatSwitcherGroupDMContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.textSupporting,
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
        maxWidth: 190,
        overflow: 'hidden',
    },

    chatSwitcherInputGroup: {
        minWidth: 1,
    },

    chatSwitcherGroupDMTextInput: {
        backgroundColor: colors.sidebar,
        color: colors.textReversed,
        fontFamily: fontFamily.GTA,
        fontSize: 15,
        flexGrow: 1,
        height: 28,
        width: 186,
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 3,
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

    chatSwitcherMessage: {
        paddingLeft: 12,
        paddingRight: 12,
    },

    hamburgerOpenAbsolute: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 2,
        width: 300,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20
    },

    hamburgerOpen: {
        width: 300,
    },

    chatSwitcherAvatar: {
        backgroundColor: colors.text,
        borderRadius: 14,
        height: 28,
        overflow: 'hidden',
        width: 28,
    },

    chatSwitcherAvatarImage: {
        height: 28,
        width: 28,
    },

    chatSwitcherItemText: {
        color: colors.text,
    },

    chatSwitcherItemAvatarNameWrapper: {
        minWidth: 0,
        flex: 1,
    },

    chatSwitcherItemButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingTop: 6,
        paddingRight: 8,
        paddingBottom: 6,
        paddingLeft: 8,
        borderRadius: 8,
        height: 28,
        marginLeft: 4,
    },

    chatSwitcherItemButtonText: {
        color: colors.componentBG,
        fontFamily: fontFamily.GTA_BOLD,
        fontSize: 11,
        lineHeight: 16,
        fontWeight: '700',
    },

    modalViewContainer: {
        backgroundColor: colors.componentBG,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 20,
        height: '100%',
    },

    modalHeaderBar: {
        fontFamily: fontFamily.GTA,
        overflow: 'hidden',
        justifyContent: 'center',
        display: 'flex',
        paddingLeft: 32,
        paddingRight: 20,
        borderBottomWidth: 1,
        borderColor: colors.border,
        height: 73,
    },

    imageModalPDF: {
        flex: 1,
        backgroundColor: colors.componentBG,
    },

    modalCenterContentContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.modalBackdrop,
    },

    imageModalImageCenterContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
};

const baseCodeTagStyles = {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: colors.border,
    backgroundColor: colors.textBackground,
};

const webViewStyles = {
    preTagStyle: {
        ...baseCodeTagStyles,
        paddingTop: 4,
        paddingBottom: 5,
        paddingRight: 8,
        paddingLeft: 8,
    },
    codeTagStyle: {
        ...baseCodeTagStyles,
        paddingLeft: 5,
        paddingRight: 5,
        paddingBottom: 2,
        alignSelf: 'flex-start',
    },
    tagStyles: {
        em: {
            fontFamily: fontFamily.GTA_ITALIC,
            fontStyle: italic,
        },

        del: {
            textDecorationLine: 'line-through',
            textDecorationStyle: 'solid'
        },

        strong: {
            fontFamily: fontFamily.GTA_BOLD,
            fontWeight: '600',
        },

        a: {
            color: colors.blue
        },

        pre: {
            fontFamily: fontFamily.MONOSPACE,
        },

        code: {
            fontFamily: fontFamily.MONOSPACE,
        },

        img: {
            borderColor: colors.border,
            borderRadius: 8,
            borderWidth: 1,
        }
    },

    baseFontStyle: {
        color: colors.text,
        fontSize: 15,
        fontFamily: fontFamily.GTA,
    }
};


/**
 * Takes safe area insets and returns padding to use for a View
 *
 * @param {object} insets
 * @returns {{paddingBottom: number, paddingTop: number}}
 */
function getSafeAreaPadding(insets) {
    return {paddingTop: insets.top, paddingBottom: insets.bottom * safeInsertPercentage};
}

/**
 * Takes safe area insets and returns margin to use for a View
 *
 * @param {object} insets
 * @returns {{marginBottom: number}}
 */
function getSafeAreaMargins(insets) {
    return {marginBottom: insets.bottom * safeInsertPercentage};
}

export default styles;
export {
    getSafeAreaPadding, getSafeAreaMargins, colors, webViewStyles
};
