// We place items a percentage to the safe area on the top or bottom of the screen
const safeInsertPercentage = 0.7;

const colors = {
    componentBG: '#FFFFFF',
    background: '#FAFAFA',
    border: '#ECECEC',
    heading: '#37444C',
    text: '#4A5960',
    textSupporting: '#7D8B8F',
    blue: '#2EAAE2',
    green: '#2ECB70',
    red: '#E84A3B',
};

const styles = {
    // Utility classes
    mr1: {
        marginRight: 10,
    },
    ml1: {
        marginLeft: 10,
    },
    mt2: {
        marginTop: 20,
    },
    mt1: {
        marginTop: 10,
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

    p1: {
        padding: 10,
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
    flexJustifyEnd: {
        justifyContent: 'flex-end',
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
    textP: {
        color: colors.text,
        fontSize: 15,
        lineHeight: 20,
    },

    colorReversed: {
        color: '#ffffff',
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
        fontWeight: '700',
        textAlign: 'center',
    },

    buttonSuccess: {
        backgroundColor: colors.green,
        borderWidth: 0,
    },

    buttonSuccessText: {
        color: '#ffffff',
    },

    // History Items
    historyItemAvatarWrapper: {
        width: 40,
    },
    historyItemAvatar: {
        borderRadius: 20,
        height: 40,
        width: 40,
    },

    textInput: {
        backgroundColor: colors.componentBG,
        borderRadius: 8,
        borderColor: colors.border,
        borderWidth: 1,
        color: colors.text,
        fontFamily: 'GTAmericaExp-Regular',
        padding: 12,
    },

    textInputReversed: {
        backgroundColor: colors.heading,
        borderRadius: 8,
        borderColor: colors.text,
        borderWidth: 1,
        color: '#ffffff',
        padding: 12,
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
        height: 72,
        justifyContent: 'center',
        paddingLeft: 24,
        paddingRight: 24,
        width: '100%',
    },

    sidebarHeaderLogo: {
        height: 21,
        width: 143,
    },

    sidebarFooter: {
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.text,
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

    sidebarFooterUsername: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    sidebarFooterLink: {
        color: '#C6C9CA',
        fontSize: 11,
    },

    sidebarListContainer: {
        flex: 1,
        flexGrow: 1,
        scrollbarWidth: 'none',
        overflow: 'scroll',
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 12,
        paddingRight: 12,
    },

    sidebarListHeader: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        paddingTop: 8,
        paddingRight: 12,
        paddingBottom: 8,
        paddingLeft: 12,
    },

    sidebarListItem: {
        height: 40,
        justifyContent: 'center',
        textDecorationLine: 'none',
    },

    sidebarLink: {
        height: 40,
        paddingTop: 8,
        paddingRight: 12,
        paddingBottom: 8,
        paddingLeft: 12,
        textDecorationLine: 'none',
    },

    sidebarLinkInner: {
        alignItems: 'center',
        flexDirection: 'row',
        height: 24,
    },

    sidebarLinkText: {
        color: '#C6C9CA',
        fontSize: 13,
        textDecorationLine: 'none',
        overflow: 'hidden',
    },

    sidebarLinkActive: {
        backgroundColor: colors.blue,
        borderRadius: 8,
        height: 40,
        paddingTop: 8,
        paddingRight: 12,
        paddingBottom: 8,
        paddingLeft: 12,
        textDecorationLine: 'none',
    },
    sidebarLinkTextUnread: {
        fontWeight: '600',
        color: '#ffffff',
    },
    sidebarLinkActiveText: {
        color: '#ffffff',
        fontSize: 13,
        textDecorationLine: 'none',
        overflow: 'hidden',
    },

    unreadBadge: {
        backgroundColor: '#2ECB70',
        borderRadius: 15,
        height: 10,
        marginTop: 3,
        width: 10,
    },

    // App Content styles
    appContentWrapper: {
        backgroundColor: colors.heading,
        color: colors.text,
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

    navText: {
        color: colors.heading,
        fontSize: 17,
        fontWeight: '700',
    },

    chatContent: {
        flex: 4,
        justifyContent: 'flex-end',
    },

    chatContentInner: {
        paddingTop: 8,
        paddingBottom: 8,
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

    chatItemLeft: {
        display: 'flex',
        flexShrink: 0,
        marginRight: 8,
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
        lineHeight: 20,
        marginTop: -2,
        marginBottom: -2,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
    },

    chatItemCompose: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        minHeight: 85,
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 20,
        paddingRight: 20,
    },
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
export {getSafeAreaPadding, getSafeAreaMargins};
