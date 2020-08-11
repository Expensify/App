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
    textLightGray: {
        color: '#7d8b8f',
    },
    brand: {
        fontSize: 25,
        fontWeight: 'bold',
    },

    // History Items
    historyItemAvatarWrapper: {
        width: 40,
    },
    historyItemMessageWrapper: {
        flexGrow: 1,
        paddingLeft: 50,
        marginBottom: 20,
    },
    historyItemAvatar: {
        borderRadius: 20,
        height: 40,
        width: 40,
    },
    historyItemHeaderTimestamp: {
        color: '#7d8b8f',
        fontSize: 10,
        lineHeight: 15,
    },
    reportHistoryItemUserName: {
        fontWeight: 'bold',
    },
    textInput: {
        borderColor: '#7d8b8f',
        borderRadius: 5,
        borderWidth: 1,
        padding: 10,
    },
    unreadBadge: {
        backgroundColor: '#dc3545',
        borderRadius: 15,
        height: 10,
        marginTop: 3,
        width: 10,
    },

    // Sidebar Styles
    sidebar: {
        backgroundColor: '#37444C',
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

    sidebarListContainer: {
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 12,
        paddingRight: 12,
    },

    sidebarListItem: {
        height: 40,
        justifyContent: 'center',
        paddingTop: 8,
        paddingRight: 12,
        paddingBottom: 8,
        paddingLeft: 12,
        textDecorationLine: 'none',
    },

    sidebarLinkActive: {
        backgroundColor: '#4A5960',
        borderRadius: 8,
    },

    sidebarLinkActiveAnchor: {
        textDecorationLine: 'none',
    },

    sidebarLinkText: {
        color: '#C6C9CA',
        textDecorationLine: 'none',
    },

    sidebarLinkActiveText: {
        color: '#ffffff',
    },

    // App Content styles
    appContentWrapper: {
        backgroundColor: '#37444C',
        color: '#4A5960',
    },

    appContent: {
        backgroundColor: '#fafafa',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
        overflow: 'hidden',
    },

    appContentHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#ECECEC',
        padding: 20,
    },

    navText: {
        color: '#37444C',
        fontWeight: 700,
    },
};

export default styles;
