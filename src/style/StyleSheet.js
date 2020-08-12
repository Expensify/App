const colors = {
    componentBG: '#FFFFFF',
    background: '#FAFAFA',
    border: '#ECECEC',
    heading: '#37444C',
    text: '#4A5960',
    textSupporting: '#7D8B8F',
    blue: '#2EAAE2',
    green: '#2ECB70',
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
    brand: {
        fontSize: 25,
        fontWeight: 'bold',
    },

    colorReversed: {
        color: '#ffffff',
    },

    button: {
        borderWidth: 1,
        borderColor: colors.border,
        height: 40,
        borderRadius: 8,
        textAlign: 'center',
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

    signInPage: {
        backgroundColor: colors.heading,
        height: '100%',
    },

    signInPageInner: {
        marginLeft: 'auto',
        marginRight: 'auto',
        minWidth: 300,
    },

    signInPageLogo: {
        alignContent: 'center',
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
        marginTop: 4,
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
        fontWeight: 'bold',
        color: '#ECECEC',
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
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        overflow: 'hidden',
    },

    appContentHeader: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        height: 73,
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
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

    chatContentEmpty: {
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 16,
        paddingRight: 16,
    },

    // Chat Item
    chatItem: {
        display: 'flex',
        flexDirection: 'row',
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 16,
        paddingRight: 16,
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
        alignItems: 'baseline',
        display: 'flex',
        flexDirection: 'row',
    },

    chatItemMessageHeaderSender: {
        color: colors.heading,
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '600',
        paddingRight: 5,
        paddingBottom: 4,
    },

    chatItemMessageHeaderTimestamp: {
        color: colors.textSupporting,
        fontSize: 11,
        lineHeight: 20,
        fontWeight: '600',
    },

    chatItemMessage: {
        color: colors.text,
        fontSize: 15,
        lineHeight: '1.4',
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
        paddingLeft: 16,
        paddingRight: 16,
    },
};

export default styles;
