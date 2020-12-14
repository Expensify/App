// We place items a percentage to the safe area on the top or bottom of the screen
import fontFamily from './fontFamily';
import italic from './italic';
import addOutlineWidth from './addOutlineWidth';

const variables = {
    contentHeaderHeight: 65,
    componentSizeNormal: 40,
    componentSizeSmall: 28,
    componentBorderRadius: 8,
    fontSizeSmall: 11,
    fontSizeLabel: 13,
    fontSizeNormal: 15,
    safeInsertPercentage: 0.7,
};

const colors = {
    white: '#FFFFFF',
    gray1: '#FAFAFA',
    gray2: '#ECECEC',
    gray3: '#C6C9CA',
    gray4: '#7D8B8F',
    gray5: '#4A5960',
    charcoal: '#37444C',
    black: '#000000',
    blue: '#2EAAE2',
    green: '#2ECB70',
    red: '#E84A3B',
    transparent: 'transparent',
};

const uiColors = {
    shadow: colors.black,
    link: colors.blue,
    componentBG: colors.white,
    appBG: colors.white,
    sidebar: colors.gray1,
    border: colors.gray2,
    borderFocus: colors.blue,
    icon: colors.gray3,
    textSupporting: colors.gray4,
    text: colors.gray5,
    heading: colors.charcoal,
    textBackground: colors.gray1,
    textReversed: colors.white,
    textMutedReversed: colors.gray3,
    buttonSuccessBG: colors.green,
    online: colors.green,
    offline: colors.gray3,
    errorText: colors.red,
    sidebarButtonBG: 'rgba(198, 201, 202, 0.25)',
    modalBackdrop: 'rgba(198, 201, 202, 0.5)',
    pillBG: colors.gray2,
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
        marginTop: 4,
    },

    mt3: {
        marginTop: 12,
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
        flexWrap: 'wrap',
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

    overflowHidden: {
        overflow: 'hidden',
    },

    textP: {
        color: uiColors.text,
        fontSize: variables.fontSizeNormal,
        lineHeight: 20,
    },

    textLabel: {
        color: uiColors.text,
        fontSize: variables.fontSizeLabel,
        lineHeight: 18,
    },

    textMicro: {
        fontSize: variables.fontSizeSmall,
    },

    textStrong: {
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: '700',
    },

    textDecorationNoLine: {
        textDecorationLine: 'none',
    },

    colorReversed: {
        color: uiColors.textReversed,
    },

    colorMutedReversed: {
        color: uiColors.textMutedReversed,
    },

    button: {
        borderColor: uiColors.border,
        borderRadius: variables.componentBorderRadius,
        borderWidth: 1,
        height: variables.componentSizeNormal,
        justifyContent: 'center',
    },

    buttonText: {
        color: uiColors.text,
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: '700',
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
        backgroundColor: uiColors.buttonSuccessBG,
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
        color: uiColors.textReversed,
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
        backgroundColor: uiColors.pillBG,
        height: variables.componentSizeSmall,
        flexDirection: 'row',
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 7,
        paddingRight: 7,
        alignItems: 'center',
    },

    pillText: {
        color: uiColors.text,
        weight: '400',
        fontSize: variables.fontSizeSmall,
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
        fontFamily: fontFamily.GTA,
        color: uiColors.heading,
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
        color: uiColors.textSupporting,
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeSmall,
        marginLeft: 48,
    },

    // Actions
    actionAvatar: {
        borderRadius: 20,
        marginRight: 8,
        height: variables.componentSizeNormal,
        width: variables.componentSizeNormal,
    },

    textInput: {
        backgroundColor: uiColors.componentBG,
        borderRadius: variables.componentBorderRadius,
        height: variables.componentSizeNormal,
        borderColor: uiColors.border,
        borderWidth: 1,
        color: uiColors.text,
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeNormal,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 10,
        paddingBottom: 10,
        textAlignVertical: 'center',
    },

    textInputReversed: addOutlineWidth({
        backgroundColor: uiColors.heading,
        borderColor: uiColors.text,
        color: uiColors.textReversed,
    }, 0),

    textInputReversedFocus: {
        borderColor: uiColors.icon,
    },

    textInputNoOutline: addOutlineWidth({}, 0),

    formLabel: {
        color: uiColors.heading,
        fontSize: variables.fontSizeLabel,
        fontWeight: '600',
        lineHeight: 18,
        marginBottom: 4,
    },

    formError: {
        color: uiColors.errorText,
        fontSize: variables.fontSizeLabel,
        lineHeight: 18,
        marginBottom: 4,
    },

    signInPage: {
        backgroundColor: uiColors.sidebar,
        height: '100%',
        padding: 20,
    },

    signInPageLogo: {
        alignItems: 'center',
        height: variables.componentSizeNormal,
        justifyContent: 'center',
        width: '100%',
        marginBottom: 24,
    },

    signinLogo: {
        height: variables.componentSizeNormal,
        width: variables.componentSizeNormal,
    },

    genericView: {
        backgroundColor: uiColors.heading,
        height: '100%',
    },

    signInPageInner: {
        marginLeft: 'auto',
        marginRight: 'auto',
        maxWidth: 325,
        width: '100%',
    },

    // Sidebar Styles
    sidebar: {
        backgroundColor: uiColors.sidebar,
    },

    sidebarHeader: {
        minHeight: 64,
        paddingTop: 12,
        flex: 1,
        flexGrow: 0,
    },

    sidebarHeaderTop: {
        paddingHorizontal: 20,
    },

    sidebarHeaderLogo: {
        height: variables.componentSizeNormal,
        width: variables.componentSizeNormal,
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

    sidebarFooterAvatar: {
        backgroundColor: uiColors.text,
        borderRadius: 20,
        height: variables.componentSizeNormal,
        marginRight: 12,
        width: variables.componentSizeNormal,
    },

    statusIndicator: {
        borderColor: uiColors.sidebar,
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
        backgroundColor: uiColors.online,
    },

    statusIndicatorOffline: {
        backgroundColor: uiColors.offline,
    },

    sidebarFooterUsername: {
        color: uiColors.heading,
        fontSize: variables.fontSizeLabel,
        fontWeight: '700',
    },

    sidebarFooterLink: {
        color: uiColors.textSupporting,
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
        color: uiColors.text,
        fontSize: variables.fontSizeLabel,
        textDecorationLine: 'none',
        overflow: 'hidden',
    },

    sidebarLinkActive: {
        backgroundColor: uiColors.border,
        textDecorationLine: 'none',
    },

    sidebarLinkTextUnread: {
        fontWeight: '700',
        color: uiColors.heading,
    },

    sidebarLinkActiveText: {
        color: uiColors.text,
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
        color: uiColors.textSupporting,
        fontFamily: fontFamily.GTA,
        height: 16,
        lineHeight: 16,
    },

    // App Content Wrapper styles
    appContentWrapper: {
        backgroundColor: uiColors.appBG,
        color: uiColors.text,
    },

    appContent: {
        backgroundColor: uiColors.appBG,
        overflow: 'hidden',
    },

    appContentHeader: {
        borderBottomWidth: 1,
        borderColor: uiColors.border,
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
    },

    chatItemMessageHeaderSender: {
        color: uiColors.heading,
        fontSize: variables.fontSizeNormal,
        height: 24,
        lineHeight: 20,
        fontWeight: '600',
        paddingRight: 5,
        paddingBottom: 4,
    },

    chatItemMessageHeaderTimestamp: {
        color: uiColors.textSupporting,
        fontSize: variables.fontSizeSmall,
        height: 24,
        lineHeight: 20,
    },

    chatItemMessage: {
        color: uiColors.text,
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
        borderColor: uiColors.border,
    },

    chatItemComposeBoxFocusedColor: {
        borderColor: uiColors.borderFocus,
    },

    chatItemComposeBox: {
        backgroundColor: uiColors.componentBG,
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

    reportPinIcon: {
        height: 20,
        width: 20,
    },

    chatItemAttachButton: {
        alignItems: 'center',
        alignSelf: 'flex-end',
        borderRightColor: uiColors.border,
        borderRightWidth: 1,
        height: 26,
        marginBottom: 6,
        marginTop: 6,
        justifyContent: 'center',
        width: 39,
    },

    chatItemAttachmentPlaceholder: {
        backgroundColor: uiColors.sidebar,
        borderColor: uiColors.border,
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
        backgroundColor: uiColors.appBG,
        borderRadius: variables.componentBorderRadius,
        borderWidth: 1,
        borderColor: uiColors.border,
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
        maxWidth: 174,
        overflow: 'hidden',
    },

    chatSwitcherInputGroup: {
        minWidth: 1,
    },

    chatSwitcherGroupDMTextInput: {
        backgroundColor: uiColors.componentBG,
        color: uiColors.text,
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeNormal,
        flexGrow: 1,
        height: variables.componentSizeSmall,
        width: 171,
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
        shadowColor: uiColors.shadow,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
    },

    hamburgerOpen: {
        borderRightWidth: 1,
        borderColor: uiColors.border,
        width: 300,
    },

    chatSwitcherAvatar: {
        backgroundColor: uiColors.icon,
        borderRadius: 20,
        height: variables.componentSizeNormal,
        overflow: 'hidden',
        width: variables.componentSizeNormal,
    },

    chatSwitcherAvatarImage: {
        height: variables.componentSizeNormal,
        width: variables.componentSizeNormal,
    },

    chatSwitcherItemText: {
        color: uiColors.text,
    },

    chatSwitcherItemAvatarNameWrapper: {
        minWidth: 0,
        flex: 1,
    },

    chatSwitcherItemButton: {
        backgroundColor: uiColors.sidebarButtonBG,
        paddingTop: 6,
        paddingRight: 8,
        paddingBottom: 6,
        paddingLeft: 8,
        borderRadius: variables.componentBorderRadius,
        height: variables.componentSizeSmall,
        marginLeft: 4,
    },

    chatSwitcherItemButtonText: {
        color: uiColors.heading,
        fontFamily: fontFamily.GTA_BOLD,
        fontSize: variables.fontSizeSmall,
        lineHeight: 16,
        fontWeight: '700',
    },

    modalViewContainerMobile: {
        backgroundColor: uiColors.componentBG,
        borderColor: uiColors.border,
        borderWidth: 1,
        height: '100%',
        alignItems: 'center',
        overflow: 'hidden',
    },

    modalViewContainer: {
        backgroundColor: uiColors.componentBG,
        borderColor: uiColors.border,
        borderWidth: 1,
        borderRadius: 12,
        height: '100%',
        alignItems: 'center',
        overflow: 'hidden',
    },

    modalHeaderBar: {
        overflow: 'hidden',
        justifyContent: 'center',
        display: 'flex',
        paddingLeft: 32,
        paddingRight: 20,
        borderBottomWidth: 1,
        borderColor: uiColors.border,
        height: variables.contentHeaderHeight,
        width: '100%',
    },

    imageModalPDF: {
        flex: 1,
        backgroundColor: uiColors.componentBG,
    },

    modalCenterContentContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: uiColors.modalBackdrop,
    },

    imageModalImageCenterContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        width: '100%',
    },

    defaultAttachmentView: {
        backgroundColor: uiColors.sidebar,
        borderRadius: variables.componentBorderRadius,
        borderWidth: 1,
        borderColor: uiColors.border,
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
};

const baseCodeTagStyles = {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: uiColors.border,
    backgroundColor: uiColors.textBackground,
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
            fontWeight: '600',
        },

        a: {
            color: uiColors.link,
            textDecorationColor: uiColors.link,
        },

        blockquote: {
            borderLeftColor: uiColors.border,
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

            // override user agent styles
            marginTop: 0,
            marginBottom: 0
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
            borderColor: uiColors.border,
            borderRadius: variables.componentBorderRadius,
            borderWidth: 1,
        },
    },

    baseFontStyle: {
        color: uiColors.text,
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
    getSafeAreaPadding, getSafeAreaMargins, colors, uiColors, webViewStyles, variables,
};
