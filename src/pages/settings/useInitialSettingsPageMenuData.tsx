import {ModalActions} from '@components/Modal/Global/ModalContext';

import useCardFeedErrors from '@hooks/useCardFeedErrors';
import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useNonPersonalCardList from '@hooks/useNonPersonalCardList';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePrevious from '@hooks/usePrevious';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useSubscriptionPlan from '@hooks/useSubscriptionPlan';

import {resetExitSurveyForm} from '@libs/actions/ExitSurvey';
import {closeReactNativeApp} from '@libs/actions/HybridApp';
import {hasPartiallySetupBankAccount, hasPersonalBankAccountMissingInfo} from '@libs/BankAccountUtils';
import {hasPendingExpensifyCardAction} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {useIsAgentAccount} from '@libs/SessionUtils';
import {getFreeTrialText, hasSubscriptionRedDotError} from '@libs/SubscriptionUtils';
import {shouldHideOldAppRedirect} from '@libs/TryNewDotUtils';
import {expensifyLoginsSelector, getProfilePageBrickRoadIndicator, hasDeviceManagementError} from '@libs/UserUtils';

import {BACKGROUND_LOCATION_TRACKING_TASK_NAME} from '@pages/iou/request/step/IOURequestStepDistanceGPS/const';
import {stopGpsTripNotification} from '@pages/iou/request/step/IOURequestStepDistanceGPS/GPSNotifications';

import {openExternalLink, openOldDotLink} from '@userActions/Link';
import {hasPaymentMethodError} from '@userActions/PaymentMethods';
import {hasStashedSession, isSupportAuthToken, signOutAndRedirectToSignIn} from '@userActions/Session';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import type {PersonalDetails} from '@src/types/onyx';
import type {Icon as TIcon} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {differenceInDays} from 'date-fns';
import {stopLocationUpdatesAsync} from 'expo-location';
import {useEffect} from 'react';

type SettingsTopLevelScreens =
    | typeof SCREENS.SETTINGS.PROFILE.ROOT
    | typeof SCREENS.SETTINGS.WALLET.ROOT
    | typeof SCREENS.SETTINGS.RULES.ROOT
    | typeof SCREENS.SETTINGS.PREFERENCES.ROOT
    | typeof SCREENS.SETTINGS.COPILOT
    | typeof SCREENS.SETTINGS.SECURITY
    | typeof SCREENS.SETTINGS.AGENTS.ROOT
    | typeof SCREENS.SETTINGS.SUBSCRIPTION.ROOT
    | typeof SCREENS.SETTINGS.HELP
    | typeof SCREENS.SETTINGS.ABOUT
    | typeof SCREENS.SETTINGS.TROUBLESHOOT
    | typeof SCREENS.SETTINGS.SAVE_THE_WORLD;

type MenuData = {
    translationKey: TranslationPaths;
    icon: IconAsset;
    screenName?: SettingsTopLevelScreens;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    action: () => void;
    iconType?: typeof CONST.ICON_TYPE_ICON | typeof CONST.ICON_TYPE_AVATAR | typeof CONST.ICON_TYPE_WORKSPACE;
    iconStyles?: StyleProp<ViewStyle>;
    fallbackIcon?: IconAsset;
    shouldStackHorizontally?: boolean;
    avatarSize?: ValueOf<typeof CONST.AVATAR_SIZE>;
    floatRightAvatars?: TIcon[];
    title?: string;
    shouldShowRightIcon?: boolean;
    iconRight?: IconAsset;
    badgeText?: string;
    badgeStyle?: ViewStyle;
    isBadgeSuccess?: boolean;
    isBadgeStrong?: boolean;
    isBadgeCondensed?: boolean;
    sentryLabel?: string;
};

type Menu = {sectionStyle: StyleProp<ViewStyle>; sectionTranslationKey: TranslationPaths; items: MenuData[]};

function useInitialSettingsPageMenuData(currentUserPersonalDetails: PersonalDetails) {
    const {convertToDisplayString} = useCurrencyListActions();
    const icons = useMemoizedLazyExpensifyIcons([
        'Bot',
        'Gear',
        'Profile',
        'NewWindow',
        'Heart',
        'Info',
        'QuestionMark',
        'ExpensifyLogoNew',
        'TreasureChest',
        'Exit',
        'Lightbulb',
        'Lock',
        'Users',
        'CreditCard',
        'Wallet',
        'Bolt',
    ]);
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [hasDeviceManagementErrorValue] = useOnyx(ONYXKEYS.LOGINS, {selector: hasDeviceManagementError});
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE);
    const allCards = useNonPersonalCardList();
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [stripeCustomerId] = useOnyx(ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [retryBillingSuccessful] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL);
    const [billingDisputePending] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING);
    const [retryBillingFailed] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED);
    const [billingStatus] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS);
    const [amountOwed = 0] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const network = useNetwork();
    const {translate} = useLocalize();
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {selector: isTrackingSelector});
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);
    const [unsharedBankAccount] = useOnyx(ONYXKEYS.UNSHARE_BANK_ACCOUNT);
    const [stashedCredentials] = useOnyx(ONYXKEYS.STASHED_CREDENTIALS);
    const [stashedSession] = useOnyx(ONYXKEYS.STASHED_SESSION);
    const [hasAgentErrors] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT, {
        selector: (agents) => Object.values(agents ?? {}).some((agent) => !isEmptyObject(agent?.nameErrors) || !isEmptyObject(agent?.promptErrors) || !isEmptyObject(agent?.avatarErrors)),
    });
    const privateSubscription = usePrivateSubscription();
    const subscriptionPlan = useSubscriptionPlan();
    const previousUserPersonalDetails = usePrevious(currentUserPersonalDetails);
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const {isBetaEnabled} = usePermissions();
    const isAgentAccount = useIsAgentAccount();
    const isLoadingTryNewDot = isLoadingOnyxValue(tryNewDotMetadata);

    const freeTrialText = getFreeTrialText(currentUserPersonalDetails.accountID, translate, policies, introSelected, firstDayFreeTrial, lastDayFreeTrial);
    const {
        personalCard: {shouldShowRBR: shouldShowRBRForPersonalCard},
    } = useCardFeedErrors();
    const hasPendingCardAction = hasPendingExpensifyCardAction(allCards, privatePersonalDetails);
    const hasActivatedWallet = ([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM] as string[]).includes(userWallet?.tierName ?? '');
    const hasLockedBankAccount = bankAccountList ? Object.values(bankAccountList).some((bankAccount) => bankAccount.accountData?.state === CONST.BANK_ACCOUNT.STATE.LOCKED) : false;

    let walletBrickRoadIndicator;
    if (
        hasLockedBankAccount ||
        hasPaymentMethodError(bankAccountList, fundList, allCards, session, policies) ||
        !isEmptyObject(userWallet?.errors) ||
        !isEmptyObject(walletTerms?.errors) ||
        !isEmptyObject(unsharedBankAccount?.errors) ||
        shouldShowRBRForPersonalCard
    ) {
        walletBrickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    } else if (hasPartiallySetupBankAccount(bankAccountList) || hasPersonalBankAccountMissingInfo(bankAccountList) || hasPendingCardAction) {
        walletBrickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
    }

    useEffect(() => {
        if (currentUserPersonalDetails.accountID === previousUserPersonalDetails.accountID) {
            return;
        }
        Navigation.clearPreloadedRoutes();
    }, [currentUserPersonalDetails.accountID, previousUserPersonalDetails.accountID]);

    const {showConfirmModal} = useConfirmModal();
    const confirmModalTitle = isTrackingGPS ? translate('gps.signOutWarningTripInProgress.title') : translate('common.areYouSure');
    const confirmModalPrompt = isTrackingGPS ? translate('gps.signOutWarningTripInProgress.prompt') : translate('initialSettingsPage.signOutConfirmationText');
    const confirmModalConfirmText = isTrackingGPS ? translate('gps.signOutWarningTripInProgress.confirm') : translate('initialSettingsPage.signOut');

    const signOut = async (shouldForceSignout = false) => {
        if ((!network.isOffline && !isTrackingGPS) || shouldForceSignout) {
            return signOutAndRedirectToSignIn();
        }

        const result = await showConfirmModal({
            title: confirmModalTitle,
            prompt: confirmModalPrompt,
            confirmText: confirmModalConfirmText,
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
            danger: true,
        });
        if (result.action !== ModalActions.CONFIRM) {
            return;
        }
        if (isTrackingGPS) {
            stopGpsTripNotification();
            stopLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).catch((error) => console.error('[GPS distance request] Failed to stop location tracking', error));
        }
        signOutAndRedirectToSignIn();
    };

    const surveyThresholdInDays = 30;
    let surveyCompletedWithinLastMonth = false;
    if (tryNewDot?.classicRedirect?.timestamp && tryNewDot?.classicRedirect?.dismissed) {
        const daysSinceLastSurvey = differenceInDays(new Date(), new Date(tryNewDot.classicRedirect.timestamp));
        surveyCompletedWithinLastMonth = daysSinceLastSurvey < surveyThresholdInDays;
    }

    const profileBrickRoadIndicator = getProfilePageBrickRoadIndicator(loginList, privatePersonalDetails, vacationDelegate, session?.email);
    const securityBrickRoadIndicator = hasDeviceManagementErrorValue ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
    const accountItems: MenuData[] = [
        {
            translationKey: 'common.profile',
            icon: icons.Profile,
            screenName: SCREENS.SETTINGS.PROFILE.ROOT,
            brickRoadIndicator: profileBrickRoadIndicator,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.PROFILE,
            action: () => Navigation.navigate(ROUTES.SETTINGS_PROFILE.getRoute()),
        },
        ...(!isAgentAccount
            ? [
                  {
                      translationKey: 'common.wallet' as const,
                      icon: icons.Wallet,
                      screenName: SCREENS.SETTINGS.WALLET.ROOT,
                      brickRoadIndicator: walletBrickRoadIndicator,
                      sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.WALLET,
                      action: () => Navigation.navigate(ROUTES.SETTINGS_WALLET),
                      badgeText: hasActivatedWallet ? convertToDisplayString(userWallet?.currentBalance, CONST.CURRENCY.USD) : undefined,
                  },
              ]
            : []),
        {
            translationKey: 'expenseRulesPage.title',
            icon: icons.Bolt,
            screenName: SCREENS.SETTINGS.RULES.ROOT,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.RULES,
            action: () => Navigation.navigate(ROUTES.SETTINGS_RULES),
        },
        ...(!isAgentAccount
            ? [
                  {
                      translationKey: 'common.preferences' as const,
                      icon: icons.Gear,
                      screenName: SCREENS.SETTINGS.PREFERENCES.ROOT,
                      sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.PREFERENCES,
                      action: () => Navigation.navigate(ROUTES.SETTINGS_PREFERENCES),
                  },
              ]
            : []),
        {
            translationKey: 'delegate.copilot',
            icon: icons.Users,
            screenName: SCREENS.SETTINGS.COPILOT,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.COPILOT,
            action: () => Navigation.navigate(ROUTES.SETTINGS_COPILOT),
        },
        ...(!isAgentAccount
            ? [
                  {
                      translationKey: 'initialSettingsPage.security' as const,
                      icon: icons.Lock,
                      screenName: SCREENS.SETTINGS.SECURITY,
                      brickRoadIndicator: securityBrickRoadIndicator,
                      sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.SECURITY,
                      action: () => Navigation.navigate(ROUTES.SETTINGS_SECURITY),
                  },
              ]
            : []),
    ];

    if (!isAgentAccount && isBetaEnabled(CONST.BETAS.CUSTOM_AGENT)) {
        const rulesIndex = accountItems.findIndex((item) => item.screenName === SCREENS.SETTINGS.RULES.ROOT);
        accountItems.splice(rulesIndex + 1, 0, {
            translationKey: 'agentsPage.title',
            icon: icons.Bot,
            screenName: SCREENS.SETTINGS.AGENTS.ROOT,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.AGENTS,
            action: () => Navigation.navigate(ROUTES.SETTINGS_AGENTS),
            badgeText: translate('common.beta'),
            brickRoadIndicator: hasAgentErrors ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        });
    }

    if (!isAgentAccount && (subscriptionPlan || (amountOwed ?? 0) > 0)) {
        accountItems.splice(1, 0, {
            translationKey: 'allSettingsScreen.subscription',
            icon: icons.CreditCard,
            screenName: SCREENS.SETTINGS.SUBSCRIPTION.ROOT,
            brickRoadIndicator:
                !!privateSubscription?.errors ||
                hasSubscriptionRedDotError(
                    stripeCustomerId,
                    retryBillingSuccessful,
                    billingDisputePending,
                    retryBillingFailed,
                    fundList,
                    billingStatus,
                    amountOwed,
                    ownerBillingGracePeriodEnd,
                )
                    ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                    : undefined,
            badgeText: freeTrialText,
            isBadgeSuccess: !!freeTrialText,
            isBadgeCondensed: !!freeTrialText,
            sentryLabel: CONST.SENTRY_LABEL.ACCOUNT.SUBSCRIPTION,
            action: () => Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION.route),
        });
    }

    const accountMenuItemsData: Menu = {
        sectionStyle: {},
        sectionTranslationKey: 'initialSettingsPage.account',
        items: accountItems,
    };

    let classicRedirectMenuItem: MenuData | null = null;
    if (!shouldHideOldAppRedirect(tryNewDot, isLoadingTryNewDot, CONFIG.IS_HYBRID_APP)) {
        const shouldOpenSurveyReasonPage = tryNewDot?.classicRedirect?.dismissed === false;

        classicRedirectMenuItem = {
            translationKey: 'exitSurvey.goToExpensifyClassic',
            icon: icons.ExpensifyLogoNew,
            sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.GO_TO_CLASSIC,
            action: CONFIG.IS_HYBRID_APP
                ? () => closeReactNativeApp({shouldSetNVP: true, isTrackingGPS})
                : () => {
                      if (surveyCompletedWithinLastMonth) {
                          openOldDotLink(CONST.OLDDOT_URLS.INBOX, true);
                          return;
                      }

                      resetExitSurveyForm(() => {
                          if (shouldOpenSurveyReasonPage) {
                              Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.EXIT_SURVEY_REASON.path));
                              return;
                          }
                          Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.EXIT_SURVEY_CONFIRM.path));
                      });
                  },
        };
    }

    const signOutTranslationKey = isSupportAuthToken() && hasStashedSession(stashedSession, stashedCredentials) ? 'initialSettingsPage.restoreStashed' : 'initialSettingsPage.signOut';
    const generalMenuItemsData: Menu = {
        sectionStyle: {},
        sectionTranslationKey: 'initialSettingsPage.general',
        items: [
            ...(classicRedirectMenuItem && tryNewDot?.nudgeMigration ? [classicRedirectMenuItem] : []),
            {
                translationKey: 'initialSettingsPage.help',
                icon: icons.QuestionMark,
                screenName: SCREENS.SETTINGS.HELP,
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.HELP,
                action: () => Navigation.navigate(ROUTES.SETTINGS_HELP),
            },
            {
                translationKey: 'initialSettingsPage.whatIsNew',
                icon: icons.TreasureChest,
                iconRight: icons.NewWindow,
                shouldShowRightIcon: true,
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.WHATS_NEW,
                action: () => openExternalLink(CONST.WHATS_NEW_URL),
            },
            {
                translationKey: 'initialSettingsPage.about',
                icon: icons.Info,
                screenName: SCREENS.SETTINGS.ABOUT,
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.ABOUT,
                action: () => Navigation.navigate(ROUTES.SETTINGS_ABOUT),
            },
            {
                translationKey: 'initialSettingsPage.aboutPage.troubleshoot',
                icon: icons.Lightbulb,
                screenName: SCREENS.SETTINGS.TROUBLESHOOT,
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.TROUBLESHOOT,
                action: () => Navigation.navigate(ROUTES.SETTINGS_TROUBLESHOOT),
            },
            {
                translationKey: 'sidebarScreen.saveTheWorld',
                icon: icons.Heart,
                screenName: SCREENS.SETTINGS.SAVE_THE_WORLD,
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.SAVE_THE_WORLD,
                action: () => Navigation.navigate(ROUTES.SETTINGS_SAVE_THE_WORLD),
            },
            {
                translationKey: signOutTranslationKey,
                icon: icons.Exit,
                sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.SIGN_OUT,
                action: () => {
                    signOut(false);
                },
            },
        ],
    };

    return {
        accountMenuItemsData,
        generalMenuItemsData,
    };
}

export default useInitialSettingsPageMenuData;
