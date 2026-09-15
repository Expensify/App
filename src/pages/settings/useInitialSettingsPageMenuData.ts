/**
 * Builds the Account and General menu section data shown on the Initial Settings page.
 */
import useCardFeedErrors from '@hooks/useCardFeedErrors';
import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useNonPersonalCardList from '@hooks/useNonPersonalCardList';
import useOnyx from '@hooks/useOnyx';
import usePrivateSubscription from '@hooks/usePrivateSubscription';

import {resetExitSurveyForm} from '@libs/actions/ExitSurvey';
import {closeReactNativeApp} from '@libs/actions/HybridApp';
import {signOutImmediately, signOutInteractively} from '@libs/actions/InteractiveSignOut';
import {hasPartiallySetupBankAccount, hasPersonalBankAccountMissingInfo} from '@libs/BankAccountUtils';
import {hasPendingExpensifyCardAction, hasVirtualExpensifyCardMissingPersonalDetails} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getFreeTrialText, hasSubscriptionRedDotError} from '@libs/SubscriptionUtils';
import {shouldHideOldAppRedirect} from '@libs/TryNewDotUtils';
import {expensifyLoginsSelector, getProfilePageBrickRoadIndicator, hasDeviceManagementError} from '@libs/UserUtils';

import useTimeSensitiveHomeAddress from '@pages/home/TimeSensitiveSection/hooks/useTimeSensitiveHomeAddress';

import {openExternalLink, openOldDotLink} from '@userActions/Link';
import {hasPaymentMethodError} from '@userActions/PaymentMethods';
import {hasStashedSession, isSupportAuthToken} from '@userActions/Session';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isActingAsDelegateSelector} from '@src/selectors/Account';
import {isTrackingSelector} from '@src/selectors/GPSDraftDetails';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {ValueOf} from 'type-fest';

import {differenceInDays} from 'date-fns';

import type {MenuData, MenuSection} from './useSettingsNavigationMenuData';

import useSettingsNavigationMenuData from './useSettingsNavigationMenuData';

function useInitialSettingsPageMenuData(currentUserPersonalDetails: CurrentUserPersonalDetails): {accountMenuItemsData: MenuSection; generalMenuItemsData: MenuSection} {
    const {convertToDisplayString} = useCurrencyListActions();
    const icons = useMemoizedLazyExpensifyIcons(['NewWindow', 'ExpensifyLogoNew', 'TreasureChest', 'Exit']);
    const {accountMenuItemsData: navigationAccountMenuItemsData, generalMenuItemsData: navigationGeneralMenuItemsData} = useSettingsNavigationMenuData();
    const [userWallet] = useOnyx(ONYXKEYS.USER_WALLET);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [walletTerms] = useOnyx(ONYXKEYS.WALLET_TERMS);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {
        selector: expensifyLoginsSelector,
    });
    const [hasDeviceManagementErrorValue] = useOnyx(ONYXKEYS.LOGINS, {
        selector: hasDeviceManagementError,
    });
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
    const [ownerTravelBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_TRAVEL_BILLING_GRACE_PERIOD_END);
    const network = useNetwork();
    const {translate} = useLocalize();
    const hasActivatedWallet = ([CONST.WALLET.TIER_NAME.GOLD, CONST.WALLET.TIER_NAME.PLATINUM] as string[]).includes(userWallet?.tierName ?? '');
    const hasLockedBankAccount = bankAccountList ? Object.values(bankAccountList).some((bankAccount) => bankAccount.accountData?.state === CONST.BANK_ACCOUNT.STATE.LOCKED) : false;
    const {shouldShowAddHomeAddress} = useTimeSensitiveHomeAddress();
    const [firstDayFreeTrial] = useOnyx(ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL);
    const [isTrackingGPS = false] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS, {
        selector: isTrackingSelector,
    });
    const [lastDayFreeTrial] = useOnyx(ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL);
    const [unsharedBankAccount] = useOnyx(ONYXKEYS.UNSHARE_BANK_ACCOUNT);
    const [stashedCredentials] = useOnyx(ONYXKEYS.STASHED_CREDENTIALS);
    const [stashedSession] = useOnyx(ONYXKEYS.STASHED_SESSION);
    const [hasAgentErrors] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT, {
        selector: (agents) => Object.values(agents ?? {}).some((agent) => !isEmptyObject(agent?.nameErrors) || !isEmptyObject(agent?.promptErrors) || !isEmptyObject(agent?.avatarErrors)),
    });
    const privateSubscription = usePrivateSubscription();
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const isLoadingTryNewDot = isLoadingOnyxValue(tryNewDotMetadata);

    const freeTrialText = getFreeTrialText(currentUserPersonalDetails.accountID, translate, policies, introSelected, firstDayFreeTrial, lastDayFreeTrial);

    const {
        personalCard: {shouldShowRBR: shouldShowRBRForPersonalCard},
    } = useCardFeedErrors();
    const hasPendingCardAction = hasPendingExpensifyCardAction(allCards, privatePersonalDetails);
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: isActingAsDelegateSelector,
    });
    const hasVirtualCardMissingDetails = hasVirtualExpensifyCardMissingPersonalDetails(allCards, privatePersonalDetails, isActingAsDelegate);
    let walletBrickRoadIndicator: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;
    if (
        hasLockedBankAccount ||
        hasPaymentMethodError(bankAccountList, fundList, allCards, session, policies) ||
        !isEmptyObject(userWallet?.errors) ||
        !isEmptyObject(walletTerms?.errors) ||
        !isEmptyObject(unsharedBankAccount?.errors) ||
        shouldShowRBRForPersonalCard
    ) {
        walletBrickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    } else if (hasPartiallySetupBankAccount(bankAccountList) || hasPersonalBankAccountMissingInfo(bankAccountList) || hasPendingCardAction || hasVirtualCardMissingDetails) {
        walletBrickRoadIndicator = CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
    }

    const {showConfirmModal} = useConfirmModal();

    const signOut = async (shouldForceSignout = false) => {
        if (shouldForceSignout) {
            return signOutImmediately();
        }

        return signOutInteractively({
            translate,
            isOffline: network.isOffline,
            isTrackingGPS,
            showConfirmModal,
        });
    };

    const surveyThresholdInDays = 30;
    let surveyCompletedWithinLastMonth = false;
    if (tryNewDot?.classicRedirect?.timestamp && tryNewDot?.classicRedirect?.dismissed) {
        const daysSinceLastSurvey = differenceInDays(new Date(), new Date(tryNewDot.classicRedirect.timestamp));
        surveyCompletedWithinLastMonth = daysSinceLastSurvey < surveyThresholdInDays;
    }

    const profileBrickRoadIndicator = getProfilePageBrickRoadIndicator(loginList, privatePersonalDetails, vacationDelegate, session?.email, shouldShowAddHomeAddress);
    const securityBrickRoadIndicator = hasDeviceManagementErrorValue ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
    const accountItems = navigationAccountMenuItemsData.items.map((item): MenuData => {
        if (item.screenName === SCREENS.SETTINGS.PROFILE.ROOT) {
            return {...item, brickRoadIndicator: profileBrickRoadIndicator};
        }
        if (item.screenName === SCREENS.SETTINGS.WALLET.ROOT) {
            return {
                ...item,
                brickRoadIndicator: walletBrickRoadIndicator,
                badgeText: hasActivatedWallet ? convertToDisplayString(userWallet?.currentBalance, CONST.CURRENCY.USD) : undefined,
            };
        }
        if (item.screenName === SCREENS.SETTINGS.SECURITY) {
            return {...item, brickRoadIndicator: securityBrickRoadIndicator};
        }
        if (item.screenName === SCREENS.SETTINGS.AGENTS.ROOT) {
            return {
                ...item,
                badgeText: translate('common.beta'),
                brickRoadIndicator: hasAgentErrors ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            };
        }
        if (item.screenName === SCREENS.SETTINGS.SUBSCRIPTION.ROOT) {
            return {
                ...item,
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
                        ownerTravelBillingGracePeriodEnd,
                    )
                        ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                        : undefined,
                badgeText: freeTrialText,
                isBadgeSuccess: !!freeTrialText,
                isBadgeCondensed: !!freeTrialText,
            };
        }
        return item;
    });

    const accountMenuItemsData: MenuSection = {
        sectionTranslationKey: navigationAccountMenuItemsData.sectionTranslationKey,
        items: accountItems,
    };

    let classicRedirectMenuItem: MenuData | null = null;
    if (!shouldHideOldAppRedirect(tryNewDot, isLoadingTryNewDot, CONFIG.IS_HYBRID_APP)) {
        const shouldOpenSurveyReasonPage = tryNewDot?.classicRedirect?.dismissed === false;

        classicRedirectMenuItem = {
            translationKey: 'exitSurvey.goToExpensifyClassic',
            icon: icons.ExpensifyLogoNew,
            sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.GO_TO_CLASSIC,
            ...(CONFIG.IS_HYBRID_APP
                ? {
                      action: () => closeReactNativeApp({shouldSetNVP: true, isTrackingGPS}),
                  }
                : {
                      action() {
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
                  }),
        };
    }

    const signOutTranslationKey = isSupportAuthToken(session) && hasStashedSession(stashedSession, stashedCredentials) ? 'initialSettingsPage.restoreStashed' : 'initialSettingsPage.signOut';
    const whatIsNewMenuItem: MenuData = {
        translationKey: 'initialSettingsPage.whatIsNew',
        icon: icons.TreasureChest,
        iconRight: icons.NewWindow,
        shouldShowRightIcon: true,
        sentryLabel: CONST.SENTRY_LABEL.SETTINGS_GENERAL.WHATS_NEW,
        link: CONST.WHATS_NEW_URL,
        action: () => {
            openExternalLink(CONST.WHATS_NEW_URL);
        },
    };
    const generalMenuItemsData: MenuSection = {
        sectionTranslationKey: navigationGeneralMenuItemsData.sectionTranslationKey,
        items: [
            ...(classicRedirectMenuItem && tryNewDot?.nudgeMigration ? [classicRedirectMenuItem] : []),
            ...navigationGeneralMenuItemsData.items.flatMap((item) => (item.screenName === SCREENS.SETTINGS.HELP ? [item, whatIsNewMenuItem] : [item])),
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
export type {MenuData, MenuSection};
