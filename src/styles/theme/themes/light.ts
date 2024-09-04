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
    shadow: colors.black,
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
    fileDropUIBG: 'rgba(3, 212, 124, 0.84)',
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
    tooltipHighlightBG: colors.green100,
    tooltipHighlightText: colors.green500,
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

    // Adding a color here will animate the status bar to the right color when the screen is opened.
    // Note that it needs to be a screen name, not a route url.
    // The route urls from ROUTES.ts are only used for deep linking and configuring URLs on web.
    // The screen name (see SCREENS.ts) is the name of the screen as far as react-navigation is concerned, and the linkingConfig maps screen names to URLs
    PAGE_THEMES: {
        [SCREENS.HOME]: {
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
        [SCREENS.SETTINGS.WORKSPACES]: {
            backgroundColor: colors.productLight100,
            statusBarStyle: CONST.STATUS_BAR_STYLE.DARK_CONTENT,
        },
        [SCREENS.SETTINGS.WALLET.ROOT]: {
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
        [SCREENS.LEFT_MODAL.WORKSPACE_SWITCHER]: {
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

    statusBarStyle: CONST.STATUS_BAR_STYLE.DARK_CONTENT,
    colorScheme: CONST.COLOR_SCHEME.LIGHT,
} satisfies ThemeColors;

export default lightTheme;
