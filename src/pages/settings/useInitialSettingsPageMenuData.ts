/**
 * Builds the Account and General menu section data shown on the Initial Settings page.
 */
import {ModalActions} from '@components/Modal/Global/ModalContext';

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
import {hasPartiallySetupBankAccount, hasPersonalBankAccountMissingInfo} from '@libs/BankAccountUtils';
import {hasPendingExpensifyCardAction, hasVirtualExpensifyCardMissingPersonalDetails} from '@libs/CardUtils';
import {showPermissionErrorAlert} from '@libs/fileDownload/FileUtils';
import Log from '@libs/Log';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getSaveablePendingReceiptRequests, saveReceiptsToGallery} from '@libs/savePendingReceiptsToGallery';
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
import {stopLocationUpdatesAsync} from 'expo-location';

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
    const confirmModalTitle = isTrackingGPS ? translate('gps.signOutWarningTripInProgress.title') : translate('common.areYouSure');
    const confirmModalPrompt = isTrackingGPS ? translate('gps.signOutWarningTripInProgress.prompt') : translate('initialSettingsPage.signOutConfirmationText');
    const confirmModalConfirmText = isTrackingGPS ? translate('gps.signOutWarningTripInProgress.confirm') : translate('initialSettingsPage.signOut');

    const showSignOutModal = () => {
        return showConfirmModal({
            title: confirmModalTitle,
            prompt: confirmModalPrompt,
            confirmText: confirmModalConfirmText,
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        });
    };

    const showSaveReceiptsModal = (pendingReceiptCount: number) => {
        return showConfirmModal({
            title: translate('initialSettingsPage.saveReceiptsConfirmation.title'),
            prompt: translate('initialSettingsPage.saveReceiptsConfirmation.prompt', {
                count: pendingReceiptCount,
            }),
            confirmText: translate('initialSettingsPage.saveReceiptsConfirmation.confirm'),
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
        });
    };

    // Combined modal for the offline case: warns about losing offline changes and offers to save the pending receipts, so the user is not shown two back-to-back prompts.
    const showSaveReceiptsAndSignOutModal = (pendingReceiptCount: number) => {
        return showConfirmModal({
            title: translate('initialSettingsPage.saveReceiptsAndSignOutConfirmation.title'),
            prompt: translate('initialSettingsPage.saveReceiptsAndSignOutConfirmation.prompt', {
                count: pendingReceiptCount,
            }),
            confirmText: translate('initialSettingsPage.saveReceiptsAndSignOutConfirmation.confirm'),
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
        });
    };

    // Save must complete before the forced-signout branch dispatches `Onyx.clear`, which wipes the persisted queue that holds these local file paths.
    const saveReceipts = async (saveableReceipts: ReturnType<typeof getSaveablePendingReceiptRequests>) => {
        try {
            const {savedCount, failedCount, permissionDenied} = await saveReceiptsToGallery(saveableReceipts);
            Log.info('[Receipt] Saved pending receipts to gallery before sign-out', false, {savedCount, failedCount, permissionDenied});
            // When the OS denied gallery access the receipts could not be saved. Point the user to Settings with the same alert the manual download flow uses, then let sign-out proceed.
            if (permissionDenied) {
                showPermissionErrorAlert(translate);
            }
        } catch (error) {
            Log.alert('[Receipt] Unexpected rejection from saveReceiptsToGallery; sign-out continued', {error});
        }
    };

    const signOut = async (shouldForceSignout = false) => {
        // Forced sign-out (expired session, SAML re-auth) must be non-interactive: it must not touch the gallery flow, which can trigger OS permission prompts and delay the redirect.
        if (shouldForceSignout) {
            return signOutAndRedirectToSignIn();
        }

        // `getSaveablePendingReceiptRequests` is platform-split (web returns `[]`) and image-filtered so we do not promise a save the native gallery API can not deliver.
        const saveableReceipts = getSaveablePendingReceiptRequests();
        const shouldWarnBeforeSignOut = network.isOffline || isTrackingGPS;
        // Offline + receipts is the common case; merge the offline warning and the save-receipts prompt into a single modal. GPS keeps its own warning, so it falls through to the two-step path below.
        const isOfflineReceiptsCase = network.isOffline && !isTrackingGPS && saveableReceipts.length > 0;

        if (!shouldWarnBeforeSignOut && saveableReceipts.length === 0) {
            return signOutAndRedirectToSignIn();
        }

        if (isOfflineReceiptsCase) {
            const result = await showSaveReceiptsAndSignOutModal(saveableReceipts.length);
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            await saveReceipts(saveableReceipts);
        } else {
            if (shouldWarnBeforeSignOut) {
                const result = await showSignOutModal();
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
            }

            if (saveableReceipts.length > 0) {
                const result = await showSaveReceiptsModal(saveableReceipts.length);
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                await saveReceipts(saveableReceipts);
            }
        }

        if (isTrackingGPS) {
            stopGpsTripNotification();
            stopLocationUpdatesAsync(BACKGROUND_LOCATION_TRACKING_TASK_NAME).catch((error) => console.error('[GPS distance request] Failed to stop location tracking', error));
        }
        signOut(true);
    };

    const surveyThresholdInDays = 30;
    let surveyCompletedWithinLastMonth = false;
    if (tryNewDot?.classicRedirect?.timestamp && tryNewDot?.classicRedirect?.dismissed) {
        const daysSinceLastSurvey = differenceInDays(new Date(), new Date(tryNewDot.classicRedirect.timestamp));
        surveyCompletedWithinLastMonth = daysSinceLastSurvey < surveyThresholdInDays;
    }

    const profileBrickRoadIndicator = getProfilePageBrickRoadIndicator(loginList, privatePersonalDetails, vacationDelegate, session?.email);
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
