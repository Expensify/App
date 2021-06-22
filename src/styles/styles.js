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
import CONST from '../CONST';
import positioning from './utilities/positioning';
import codeStyles from './codeStyles';

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

    link: {
        color: themeColors.link,
        textDecorationColor: themeColors.link,
        fontFamily: fontFamily.GTA,
    },

    linkHovered: {
        color: themeColors.linkHover,
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

    textLarge: {
        fontSize: variables.fontSizeLarge,
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

    textUppercase: {
        textTransform: 'uppercase',
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

    button: {
        backgroundColor: themeColors.buttonDefaultBG,
        borderRadius: variables.componentBorderRadiusNormal,
        height: variables.componentSizeNormal,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },

    buttonText: {
        color: themeColors.heading,
        fontFamily: fontFamily.GTA_BOLD,
        fontSize: variables.fontSizeLabel,
        fontWeight: fontWeightBold,
        textAlign: 'center',
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

    buttonLarge: {
        borderRadius: variables.componentBorderRadius,
        height: variables.componentSizeLarge,
        paddingTop: 8,
        paddingRight: 12,
        paddingBottom: 8,
        paddingLeft: 12,
    },

    buttonLargeText: {
        fontSize: variables.fontSizeLarge,
        lineHeight: 18,
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        textAlign: 'center',
    },

    buttonSmallText: {
        fontSize: variables.fontSizeSmall,
        lineHeight: 16,
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

    buttonDisable: {
        backgroundColor: themeColors.buttonDisabledBG,
        borderWidth: 0,
    },

    buttonDropdown: {
        marginLeft: 1,
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

    picker: {
        inputIOS: {
            fontFamily: fontFamily.GTA,
            fontSize: variables.fontSizeNormal,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 10,
            paddingBottom: 10,
            borderRadius: variables.componentBorderRadius,
            borderWidth: 1,
            borderColor: themeColors.border,
            color: themeColors.text,
            height: variables.componentSizeNormal,
            opacity: 1,
        },
        inputWeb: {
            fontFamily: fontFamily.GTA,
            fontSize: variables.fontSizeNormal,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 10,
            paddingBottom: 10,
            borderWidth: 1,
            borderRadius: variables.componentBorderRadius,
            borderColor: themeColors.border,
            color: themeColors.text,
            appearance: 'none',
            height: variables.componentSizeNormal,
            opacity: 1,
            cursor: 'pointer',
        },
        inputAndroid: {
            fontFamily: fontFamily.GTA,
            fontSize: variables.fontSizeNormal,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 10,
            paddingBottom: 10,
            borderWidth: 1,
            borderRadius: variables.componentBorderRadius,
            borderColor: themeColors.border,
            color: themeColors.text,
            height: variables.componentSizeNormal,
            opacity: 1,
        },
        iconContainer: {
            top: 12,
            right: 12,
            pointerEvents: 'none',
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
        color: themeColors.textReversed,
        fontSize: variables.fontSizeSmall,
        lineHeight: 16,
        ...whiteSpace.noWrap,
    },

    border: {
        borderWidth: 1,
        borderRadius: variables.componentBorderRadiusNormal,
        borderColor: themeColors.border,
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
    },

    chatItemComposeSecondaryRowOffset: {
        marginLeft: 48,
    },

    // Actions
    actionAvatar: {
        borderRadius: 20,
        marginRight: 8,
    },

    textInput: {
        backgroundColor: themeColors.componentBG,
        borderRadius: variables.componentBorderRadiusNormal,
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

    disabledText: {
        color: colors.gray3,
    },

    disabledTextInput: {
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

    formLabel: {
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        color: themeColors.heading,
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

    formHint: {
        color: themeColors.textSupporting,
        fontSize: variables.fontSizeLabel,
        lineHeight: 18,
    },

    signInPage: {
        backgroundColor: themeColors.sidebar,
        padding: 20,
        minHeight: '100%',
        flex: 1,
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

    signInPageFormContainer: {
        maxWidth: 295,
        width: '100%',
    },

    loginTermsText: {
        color: themeColors.textSupporting,
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeSmall,
        lineHeight: 16,
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

    createMenuPositionSidebar: {
        left: 18,
        bottom: 100,
    },

    createMenuPositionProfile: {
        right: 18,
        top: 100,
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

    createMenuItem: {
        flexDirection: 'row',
        borderRadius: 0,
        paddingHorizontal: 20,
        paddingVertical: 12,
        justifyContent: 'space-between',
        width: '100%',
    },

    createMenuIcon: {
        width: variables.componentSizeNormal,
        height: variables.componentSizeNormal,
        justifyContent: 'center',
        alignItems: 'center',
    },

    createMenuIconEmphasized: {
        backgroundColor: themeColors.iconSuccessFill,
        borderRadius: variables.componentSizeLarge / 2,
    },

    createMenuText: {
        fontFamily: fontFamily.GTA_BOLD,
        fontSize: variables.fontSizeNormal,
        fontWeight: fontWeightBold,
        color: themeColors.heading,
    },

    createMenuDescription: {
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeLabel,
        color: themeColors.textSupporting,
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
        height: 18,
        lineHeight: 18,
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
        color: themeColors.textSupporting,
        fontFamily: fontFamily.GTA,
        fontSize: variables.fontSizeLabel,
        height: 16,
        lineHeight: 16,
    },

    optionAlternateTextCompact: {
        flexShrink: 1,
        flexGrow: 1,
        flexBasis: 'auto',
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
        ...wordBreak.breakWord,
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
        paddingTop: 6,
        paddingRight: 6,
        paddingBottom: 6,
        paddingLeft: 6,
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

    emojiHeaderStyle: {
        backgroundColor: themeColors.componentBG,
        width: '100%',
        ...spacing.pv3,
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        color: themeColors.heading,
        fontSize: variables.fontSizeSmall,
    },

    // Emoji Picker Styles
    emojiText: {
        fontFamily: fontFamily.GTA_BOLD,
        fontSize: variables.iconSizeLarge,
        textAlign: 'center',
        ...spacing.pv1,
        ...spacing.ph2,
    },

    emojiItem: {
        width: '12.5%',
        height: 40,
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
        backgroundColor: themeColors.icon,
        borderRadius: variables.componentSizeNormal,
    },

    avatarSmall: {
        height: variables.avatarSizeSmall,
        width: variables.avatarSizeSmall,
        backgroundColor: themeColors.icon,
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

    borderBottom: {
        borderBottomWidth: 1,
        borderColor: themeColors.border,
    },

    borderRight: {
        borderRightWidth: 1,
        borderColor: themeColors.border,
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

    displayName: {
        fontSize: variables.fontSizeLarge,
        fontFamily: fontFamily.GTA_BOLD,
        fontWeight: fontWeightBold,
        color: themeColors.heading,
    },

    settingsLoginName: {
        fontSize: variables.fontSizeLabel,
        fontFamily: fontFamily.GTA,
        color: themeColors.textSupporting,
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
        cursor: 'pointer',
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

    hiddenElementOutsideOfWindow: {
        position: 'fixed',
        top: 0,
        left: 0,
        opacity: 0,
        transform: 'translateX(-100%)',
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
        ...spacing.ph5,
    },

    growlNotificationDesktopContainer: {
        maxWidth: 380,
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

    fullscreenCardMobile: {
        left: '-20%',
        top: '-30%',
        width: '150%',
    },

    workspaceSidebarAvatar: {
        width: 80,
        height: 80,
    },

    workspaceSidebarAvatarPencil: {
        width: 32,
        height: 32,
        position: 'absolute',
        right: -1,
        bottom: -1,
        backgroundColor: themeColors.icon,
        color: themeColors.textReversed,
        borderRadius: '100%',
        borderWidth: 3,
        borderColor: themeColors.textReversed,
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

    workspaceCardMainText: {
        fontSize: variables.fontSizeXXXLarge,
        fontWeight: 'bold',
        lineHeight: variables.fontSizeXXXLarge,
    },

    workspaceCardContent: {
        zIndex: 1,
        padding: 50,
    },

    workspaceCardCTA: {
        width: 250,
    },

    workspaceInviteWelcome: {
        minHeight: 150,
    },
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
            fontFamily: fontFamily.GTA_ITALIC,
            fontStyle: 'italic',
        },

        del: {
            textDecorationLine: 'line-through',
            textDecorationStyle: 'solid',
        },

        strong: {
            fontFamily: fontFamily.GTA_BOLD,
            fontWeight: 'bold',
        },

        a: styles.link,

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
    },

    baseFontStyle: {
        color: themeColors.text,
        fontSize: variables.fontSizeNormal,
        lineHeight: variables.fontSizeNormalHeight,
        fontFamily: fontFamily.GTA,
        flex: 1,
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

/**
 * Return navigation menu styles.
 *
 * @param {Number} windowWidth
 * @param {Number} windowHeight
 * @param {Boolean} isSmallScreenWidth
 * @returns {Object}
 */
function getNavigationDrawerStyle(windowWidth, windowHeight, isSmallScreenWidth) {
    return isSmallScreenWidth
        ? {
            width: windowWidth,
            height: windowHeight,
            borderColor: themeColors.border,
        }
        : {
            height: windowHeight,
            width: variables.sideBarWidth,
            borderRightColor: themeColors.border,
        };
}

function getNavigationDrawerType(isSmallScreenWidth) {
    return isSmallScreenWidth ? 'slide' : 'permanent';
}

function getNavigationModalCardStyle(isSmallScreenWidth) {
    return {
        position: 'absolute',
        top: 0,
        right: 0,
        width: isSmallScreenWidth ? '100%' : variables.sideBarWidth,
        backgroundColor: 'transparent',
        height: '100%',
    };
}

/**
 * @param {Boolean} isZoomed
 * @param {Boolean} isDragging
 * @return {Object}
 */
function getZoomCursorStyle(isZoomed, isDragging) {
    if (!isZoomed) {
        return {cursor: 'zoom-in'};
    }

    return {
        cursor: isDragging ? 'grabbing' : 'zoom-out',
    };
}

/**
 * @param {Boolean} isZoomed
 * @return {Object}
 */
function getZoomSizingStyle(isZoomed) {
    return {
        height: isZoomed ? '250%' : '100%',
        width: isZoomed ? '250%' : '100%',
    };
}

/**
 * Returns auto grow text input style
 *
 * @param {Number} width
 * @return {Object}
 */
function getAutoGrowTextInputStyle(width) {
    return {
        minWidth: 5,
        width,
    };
}

/**
 * Returns a style with backgroundColor and borderColor set to the same color
 *
 * @param {String} backgroundColor
 * @returns {Object}
 */
function getBackgroundAndBorderStyle(backgroundColor) {
    return {
        backgroundColor,
        borderColor: backgroundColor,
    };
}

/**
 * Returns a style with the specified backgroundColor
 *
 * @param {String} backgroundColor
 * @returns {Object}
 */
function getBackgroundColorStyle(backgroundColor) {
    return {
        backgroundColor,
    };
}

/**
 * Generate a style for the background color of the IOU badge
 *
 * @param {Boolean} isOwner
 * @param {Boolean} [isPressed]
 * @returns {Object}
 */
function getBadgeColorStyle(isOwner, isPressed = false) {
    if (isOwner) {
        return isPressed ? styles.badgeSuccessPressed : styles.badgeSuccess;
    }
    return isPressed ? styles.badgeDangerPressed : styles.badgeDanger;
}

/**
 * Generate a style for the background color of the button, based on its current state.
 *
 * @param {String} [buttonState] - One of {'default', 'hovered', 'pressed'}
 * @returns {Object}
 */
function getButtonBackgroundColorStyle(buttonState = CONST.BUTTON_STATES.DEFAULT) {
    switch (buttonState) {
        case CONST.BUTTON_STATES.ACTIVE:
            return {backgroundColor: themeColors.buttonHoveredBG};
        case CONST.BUTTON_STATES.PRESSED:
            return {backgroundColor: themeColors.buttonPressedBG};
        case CONST.BUTTON_STATES.DISABLED:
        case CONST.BUTTON_STATES.DEFAULT:
        default:
            return {};
    }
}

/**
 * Generate fill color of an icon based on its state.
 *
 * @param {String} [buttonState] - One of {'default', 'hovered', 'pressed'}
 * @returns {Object}
 */
function getIconFillColor(buttonState = CONST.BUTTON_STATES.DEFAULT) {
    switch (buttonState) {
        case CONST.BUTTON_STATES.ACTIVE:
            return themeColors.text;
        case CONST.BUTTON_STATES.PRESSED:
            return themeColors.heading;
        case CONST.BUTTON_STATES.COMPLETE:
            return themeColors.iconSuccessFill;
        case CONST.BUTTON_STATES.DEFAULT:
        case CONST.BUTTON_STATES.DISABLED:
        default:
            return themeColors.icon;
    }
}

/**
 * @param {Animated.Value} rotate
 * @param {Animated.Value} backgroundColor
 * @returns {Object}
 */
function getAnimatedFABStyle(rotate, backgroundColor) {
    return {
        transform: [{rotate}],
        backgroundColor,
    };
}

/**
 * @param {Number} width
 * @param {Number} height
 * @returns {Object}
 */
function getWidthAndHeightStyle(width, height) {
    return {
        width,
        height,
    };
}

/**
 * @param {Object} params
 * @returns {Object}
 */
function getModalPaddingStyles({
    shouldAddBottomSafeAreaPadding,
    shouldAddTopSafeAreaPadding,
    safeAreaPaddingTop,
    safeAreaPaddingBottom,
    modalContainerStylePaddingTop,
    modalContainerStylePaddingBottom,
}) {
    return {
        paddingTop: shouldAddTopSafeAreaPadding
            ? (modalContainerStylePaddingTop || 0) + safeAreaPaddingTop
            : modalContainerStylePaddingTop || 0,
        paddingBottom: shouldAddBottomSafeAreaPadding
            ? (modalContainerStylePaddingBottom || 0) + safeAreaPaddingBottom
            : modalContainerStylePaddingBottom || 0,
    };
}

/**
 * Takes fontStyle and fontWeight and returns the correct fontFamily
 *
 * @param {Object} params
 * @returns {String}
 */
function getFontFamilyMonospace({fontStyle, fontWeight}) {
    const italic = fontStyle === 'italic' && fontFamily.MONOSPACE_ITALIC;
    const bold = fontWeight === 'bold' && fontFamily.MONOSPACE_BOLD;
    const italicBold = italic && bold && fontFamily.MONOSPACE_BOLD_ITALIC;

    return italicBold || bold || italic || fontFamily.MONOSPACE;
}

/**
 * Gives the width for Emoji picker Widget
 *
 * @param {Boolean} isSmallScreenWidth
 * @returns {String}
 */
function getEmojiPickerStyle(isSmallScreenWidth) {
    return {
        width: isSmallScreenWidth ? '100%' : CONST.EMOJI_PICKER_SIZE,
    };
}

export default styles;
export {
    getSafeAreaPadding,
    getSafeAreaMargins,
    webViewStyles,
    getNavigationDrawerStyle,
    getNavigationDrawerType,
    getNavigationModalCardStyle,
    getZoomCursorStyle,
    getZoomSizingStyle,
    getAutoGrowTextInputStyle,
    getBackgroundAndBorderStyle,
    getBackgroundColorStyle,
    getBadgeColorStyle,
    getButtonBackgroundColorStyle,
    getIconFillColor,
    getAnimatedFABStyle,
    getWidthAndHeightStyle,
    getModalPaddingStyles,
    getFontFamilyMonospace,
    getEmojiPickerStyle,
};
