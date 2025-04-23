import colors from '@styles/theme/colors';
import type {ThemeColors} from '@styles/theme/types';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

const darkTheme = {
    // Figma keys
    appBG: colors.productDark100,
    splashBG: colors.green400,
    highlightBG: colors.productDark200,
    border: colors.productDark400,
    borderLighter: colors.productDark400,
    borderFocus: colors.green400,
    icon: colors.productDark700,
    iconMenu: colors.green400,
    iconHovered: colors.productDark900,
    iconMenuHovered: colors.green400,
    iconSuccessFill: colors.green400,
    iconDangerFill: colors.red,
    iconReversed: colors.productDark100,
    iconColorfulBackground: `${colors.ivory}cc`,
    textSupporting: colors.productDark800,
    text: colors.productDark900,
    textColorfulBackground: colors.ivory,
    syntax: colors.productDark800,
    link: colors.blue300,
    linkHover: colors.blue100,
    buttonDefaultBG: colors.productDark400,
    buttonHoveredBG: colors.productDark500,
    buttonPressedBG: colors.productDark600,
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
    overlay: colors.productDark400,
    inverse: colors.productDark900,
    shadow: '0px 4px 12px 0px rgba(2,18,4,0.24)',
    componentBG: colors.productDark100,
    hoverComponentBG: colors.productDark300,
    messageHighlightBG: colors.messageHighlightDark,
    activeComponentBG: colors.productDark400,
    signInSidebar: colors.green800,
    sidebar: colors.productDark100,
    sidebarHover: colors.productDark300,
    heading: colors.productDark900,
    textLight: colors.productDark900,
    textDark: colors.productDark100,
    textReversed: colors.productLight900,
    textBackground: colors.productDark200,
    textMutedReversed: colors.productDark700,
    textError: colors.red,
    offline: colors.productDark700,
    modalBackground: colors.productDark100,
    cardBG: colors.productDark200,
    cardBorder: colors.productDark200,
    spinner: colors.productDark800,
    unreadIndicator: colors.green400,
    placeholderText: colors.productDark700,
    heroCard: colors.blue400,
    uploadPreviewActivityIndicator: colors.productDark200,
    dropUIBG: 'rgba(6,27,9,0.92)',
    fileDropUIBG: 'rgba(3, 212, 124, 0.84)',
    checkBox: colors.green400,
    imageCropBackgroundColor: colors.productDark700,
    fallbackIconColor: colors.green700,
    reactionActiveBackground: colors.green600,
    reactionActiveText: colors.green100,
    badgeAdHoc: colors.pink600,
    badgeAdHocHover: colors.pink700,
    mentionText: colors.blue100,
    mentionBG: colors.blue600,
    ourMentionText: colors.green100,
    ourMentionBG: colors.green600,
    tooltipHighlightBG: colors.green100,
    tooltipHighlightText: colors.green400,
    tooltipSupportingText: colors.productLight800,
    tooltipPrimaryText: colors.productLight900,
    trialBannerBackgroundColor: colors.green700,
    skeletonLHNIn: colors.productDark400,
    skeletonLHNOut: colors.productDark600,
    QRLogo: colors.green400,
    starDefaultBG: 'rgb(254, 228, 94)',
    mapAttributionText: colors.black,
    white: colors.white,
    videoPlayerBG: `${colors.productDark100}cc`,
    transparentWhite: `${colors.white}51`,
    emptyFolderBG: colors.yellow600,
    travelBG: colors.blue600,
    trialTimer: colors.green500,

    // Adding a color here will animate the status bar to the right color when the screen is opened.
    // Note that it needs to be a screen name, not a route url.
    // The route urls from ROUTES.ts are only used for deep linking and configuring URLs on web.
    // The screen name (see SCREENS.ts) is the name of the screen as far as react-navigation is concerned, and the linkingConfig maps screen names to URLs
    PAGE_THEMES: {
        [SCREENS.HOME]: {
            backgroundColor: colors.productDark100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.LIGHT_CONTENT,
        },
        [SCREENS.REPORT]: {
            backgroundColor: colors.productDark100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.LIGHT_CONTENT,
        },
        [SCREENS.SAVE_THE_WORLD.ROOT]: {
            backgroundColor: colors.tangerine800,
            statusBarStyle: CONST.STATUS_BAR_STYLE.LIGHT_CONTENT,
        },
        [SCREENS.SETTINGS.PREFERENCES.ROOT]: {
            backgroundColor: colors.productDark100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.LIGHT_CONTENT,
        },
        [SCREENS.SETTINGS.WORKSPACES]: {
            backgroundColor: colors.productDark100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.LIGHT_CONTENT,
        },
        [SCREENS.SETTINGS.WALLET.ROOT]: {
            backgroundColor: colors.productDark100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.LIGHT_CONTENT,
        },
        [SCREENS.SETTINGS.PROFILE.STATUS]: {
            backgroundColor: colors.productDark100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.LIGHT_CONTENT,
        },
        [SCREENS.SETTINGS.ROOT]: {
            backgroundColor: colors.productDark100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.LIGHT_CONTENT,
        },
        [SCREENS.LEFT_MODAL.WORKSPACE_SWITCHER]: {
            backgroundColor: colors.productDark100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.LIGHT_CONTENT,
        },
        [SCREENS.SETTINGS.TROUBLESHOOT]: {
            backgroundColor: colors.productDark100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.LIGHT_CONTENT,
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

    statusBarStyle: CONST.STATUS_BAR_STYLE.LIGHT_CONTENT,
    navigationBarButtonsStyle: CONST.NAVIGATION_BAR_BUTTONS_STYLE.LIGHT,
    navigationBarBackgroundColor: `${colors.productDark100}CD`, // CD is 80% opacity (80% of 0xFF)
    colorScheme: CONST.COLOR_SCHEME.DARK,
} satisfies ThemeColors;

export default darkTheme;
