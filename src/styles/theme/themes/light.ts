import colors from '@styles/theme/colors';
import type {ThemeColors} from '@styles/theme/types';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

const lightTheme = {
    // Figma keys
    appBG: colors.productLight100,
    splashBG: colors.green400,
    highlightBG: colors.productLight200,
    border: colors.productLight400,
    borderLighter: colors.productLight400,
    borderFocus: colors.green400,
    icon: colors.productLight700,
    iconMenu: colors.green400,
    iconHovered: colors.productLight900,
    iconMenuHovered: colors.green400,
    iconSuccessFill: colors.green400,
    iconDangerFill: colors.red,
    iconReversed: colors.productLight100,
    iconColorfulBackground: `${colors.ivory}cc`,
    textSupporting: colors.productLight800,
    text: colors.productLight900,
    textColorfulBackground: colors.ivory,
    textReceiptDropZone: colors.green700,
    textAttachmentDropZone: colors.blue700,
    syntax: colors.productLight800,
    link: colors.blue600,
    linkHover: colors.blue500,
    buttonDefaultBG: colors.productLight400,
    buttonHoveredBG: colors.productLight500,
    buttonPressedBG: colors.productLight600,
    buttonSuccessText: colors.productLight100,
    danger: colors.red,
    dangerHover: colors.redHover,
    dangerPressed: colors.redHover,
    warning: colors.yellow400,
    success: colors.green400,
    successHover: colors.greenHover,
    successPressed: colors.greenPressed,
    transparent: colors.transparent,
    signInPage: colors.green800,
    darkSupportingText: colors.productDark800,

    // Additional keys
    overlay: colors.productLight400,
    inverse: colors.productLight900,
    shadow: '0px 4px 12px 0px rgba(2,18,4,0.06)',
    componentBG: colors.productLight100,
    messageHighlightBG: colors.yellow100,
    hoverComponentBG: colors.productLight300,
    activeComponentBG: colors.productLight400,
    signInSidebar: colors.green800,
    sidebar: colors.productLight100,
    sidebarHover: colors.productLight300,
    heading: colors.productLight900,
    textLight: colors.white,
    textDark: colors.productLight900,
    textReversed: colors.productDark900,
    textBackground: colors.productLight200,
    textMutedReversed: colors.productLight700,
    textError: colors.red,
    offline: colors.productLight700,
    modalBackground: colors.productLight100,
    cardBG: colors.productLight200,
    cardBorder: colors.productLight200,
    spinner: colors.productLight800,
    unreadIndicator: colors.green400,
    placeholderText: colors.productLight700,
    heroCard: colors.blue400,
    uploadPreviewActivityIndicator: colors.productLight200,
    dropUIBG: 'rgba(252, 251, 249, 0.92)',
    dropWrapperBG: 'rgba(235, 230, 223, 0.72)',
    fileDropUIBG: 'rgba(3, 212, 124, 0.84)',
    attachmentDropUIBG: 'rgba(90, 176, 255, 0.8)',
    attachmentDropUIBGActive: 'rgba(90, 176, 255, 0.96)',
    attachmentDropBorderColorActive: colors.blue100,
    receiptDropUIBG: 'rgba(3, 212, 124, 0.8)',
    receiptDropUIBGActive: 'rgba(3, 212, 124, 0.96)',
    receiptDropBorderColorActive: colors.green100,
    checkBox: colors.green400,
    imageCropBackgroundColor: colors.productLight700,
    fallbackIconColor: colors.green700,
    reactionActiveBackground: colors.green100,
    reactionActiveText: colors.green600,
    badgeAdHoc: colors.pink600,
    badgeAdHocHover: colors.pink700,
    mentionText: colors.blue600,
    mentionBG: colors.blue100,
    ourMentionText: colors.green600,
    ourMentionBG: colors.green100,
    tooltipHighlightBG: colors.green700,
    tooltipHighlightText: colors.green400,
    tooltipSupportingText: colors.productDark800,
    tooltipPrimaryText: colors.productDark900,
    trialBannerBackgroundColor: colors.green100,
    skeletonLHNIn: colors.productLight400,
    skeletonLHNOut: colors.productLight600,
    QRLogo: colors.green400,
    starDefaultBG: 'rgb(254, 228, 94)',
    mapAttributionText: colors.black,
    white: colors.white,
    videoPlayerBG: `${colors.productDark100}cc`,
    transparentWhite: `${colors.white}51`,
    emptyFolderBG: colors.yellow600,
    travelBG: colors.blue600,
    todoBG: colors.blue800,
    trialTimer: colors.green600,

    // Adding a color here will animate the status bar to the right color when the screen is opened.
    // Note that it needs to be a screen name, not a route url.
    // The route urls from ROUTES.ts are only used for deep linking and configuring URLs on web.
    // The screen name (see SCREENS.ts) is the name of the screen as far as react-navigation is concerned, and the linkingConfig maps screen names to URLs
    PAGE_THEMES: {
        [SCREENS.INBOX]: {
            backgroundColor: colors.productLight100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.DARK_CONTENT,
        },
        [SCREENS.REPORT]: {
            backgroundColor: colors.productLight100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.DARK_CONTENT,
        },
        [SCREENS.SAVE_THE_WORLD.ROOT]: {
            backgroundColor: colors.tangerine800,
            statusBarStyle: CONST.STATUS_BAR_STYLE.LIGHT_CONTENT,
        },
        [SCREENS.SETTINGS.PREFERENCES.ROOT]: {
            backgroundColor: colors.productLight100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.DARK_CONTENT,
        },
        [SCREENS.WORKSPACES_LIST]: {
            backgroundColor: colors.productLight100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.DARK_CONTENT,
        },
        [SCREENS.SETTINGS.WALLET.ROOT]: {
            backgroundColor: colors.productLight100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.DARK_CONTENT,
        },
        [SCREENS.SETTINGS.RULES.ROOT]: {
            backgroundColor: colors.productLight100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.DARK_CONTENT,
        },
        [SCREENS.SETTINGS.PROFILE.STATUS]: {
            backgroundColor: colors.productLight100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.DARK_CONTENT,
        },
        [SCREENS.SETTINGS.ROOT]: {
            backgroundColor: colors.productLight100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.DARK_CONTENT,
        },
        [SCREENS.SETTINGS.TROUBLESHOOT]: {
            backgroundColor: colors.productLight100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.DARK_CONTENT,
        },
        [SCREENS.REFERRAL_DETAILS]: {
            backgroundColor: colors.pink800,
            statusBarStyle: CONST.STATUS_BAR_STYLE.LIGHT_CONTENT,
        },
        [SCREENS.RIGHT_MODAL.SIGN_IN]: {
            backgroundColor: colors.productDark200,
            statusBarStyle: CONST.STATUS_BAR_STYLE.LIGHT_CONTENT,
        },
    },

    reportStatusBadge: {
        draft: {
            backgroundColor: colors.blue200,
            textColor: colors.blue700,
        },
        outstanding: {
            backgroundColor: colors.tangerine200,
            textColor: colors.tangerine700,
        },
        approved: {
            backgroundColor: colors.ice200,
            textColor: colors.ice700,
        },
        paid: {
            backgroundColor: colors.green200,
            textColor: colors.green700,
        },
        closed: {
            backgroundColor: colors.pink200,
            textColor: colors.pink700,
        },
    },

    statusBarStyle: CONST.STATUS_BAR_STYLE.DARK_CONTENT,
    navigationBarButtonsStyle: CONST.NAVIGATION_BAR_BUTTONS_STYLE.DARK,
    translucentNavigationBarBackgroundColor: `${colors.productLight100}CD`, // CD is 80% opacity (80% of 0xFF)
    colorScheme: CONST.COLOR_SCHEME.LIGHT,
} satisfies ThemeColors;

export default lightTheme;
