import Button from '@components/ButtonComposed';

import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultWorkspaceTravelGuard from '@hooks/useDefaultWorkspaceTravelGuard';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useShouldShowEmptyReportConfirmation from '@hooks/useShouldShowEmptyReportConfirmation';
import useThemeStyles from '@hooks/useThemeStyles';

import {startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU/MoneyRequest';
import {createNewReport} from '@libs/actions/Report';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getCreateReportRoute, {getReportsRootRoute, navigateToCreateReportWorkspaceSelection} from '@libs/Navigation/helpers/getCreateReportRoute';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';
import Permissions from '@libs/Permissions';
import {getDefaultChatEnabledPolicySelection, hasAcceptedTravelTerms, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {generateReportID, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import {primaryLoginSelector} from '@src/selectors/Account';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {emailSelector} from '@selectors/Session';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import {Str} from 'expensify-common';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';

function QuickCreationActionsBar() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ReceiptPlus', 'DocumentPlus', 'LocationAdd', 'LuggageWithLinesPlus']);

    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [email] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [primaryLogin] = useOnyx(ONYXKEYS.ACCOUNT, {selector: primaryLoginSelector});
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {isBetaEnabled} = usePermissions();
    const blockIfDefaultWorkspaceLacksTravel = useDefaultWorkspaceTravelGuard();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const {shouldNavigateToUpgradePath} = usePolicyForMovingExpenses();
    // scalar selector keeps useOnyx from deep-comparing thousands of policy objects
    const [defaultChatEnabledPolicySelection] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies: OnyxCollection<OnyxTypes.Policy>) => getDefaultChatEnabledPolicySelection(policies, email, activePolicyID),
    });
    const defaultChatEnabledPolicyID = defaultChatEnabledPolicySelection?.defaultChatEnabledPolicyID;
    const hasMultipleChatEnabledPolicies = !!defaultChatEnabledPolicySelection?.hasMultipleChatEnabledPolicies;
    const [defaultChatEnabledPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(defaultChatEnabledPolicyID)}`);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const shouldShowEmptyReportConfirmationForDefaultChatEnabledPolicy = useShouldShowEmptyReportConfirmation(defaultChatEnabledPolicyID);

    const travelEnabledPolicy = useMemo(() => Object.values(allPolicies ?? {}).find((policy) => !!policy?.isTravelEnabled), [allPolicies]);

    const shouldShowBookTravel = !!travelEnabledPolicy;

    const isBlockedFromSpotnanaTravel = Permissions.isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL, allBetas);
    const primaryContactMethod = primaryLogin ?? session?.email ?? '';
    const isTravelReady = useMemo(() => {
        if (!!isBlockedFromSpotnanaTravel || !primaryContactMethod || Str.isSMSLogin(primaryContactMethod) || !isPaidGroupPolicy(travelEnabledPolicy)) {
            return false;
        }

        return hasAcceptedTravelTerms(travelEnabledPolicy, travelSettings);
    }, [travelEnabledPolicy, isBlockedFromSpotnanaTravel, primaryContactMethod, travelSettings]);

    const handleCreateWorkspaceReport = useCallback(
        (shouldDismissEmptyReportsConfirmation?: boolean) => {
            if (!defaultChatEnabledPolicy?.id) {
                return;
            }

            const {reportID: createdReportID} = createNewReport(
                currentUserPersonalDetails,
                hasViolations,
                isASAPSubmitBetaEnabled,
                defaultChatEnabledPolicy,
                allBetas,
                isTrackIntentUser,
                getCurrencyDecimals,
                false,
                shouldDismissEmptyReportsConfirmation,
            );
            // Navigate to the Reports page first so getCreateReportRoute() resolves against
            // the Search/Reports fullscreen context before opening the created report modal.
            Navigation.navigate(getReportsRootRoute());
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(getCreateReportRoute({reportID: createdReportID}));
            });
        },
        [currentUserPersonalDetails, hasViolations, defaultChatEnabledPolicy, isASAPSubmitBetaEnabled, allBetas, isTrackIntentUser, getCurrencyDecimals],
    );

    const {openCreateReportConfirmation} = useCreateEmptyReportConfirmation({
        policyID: defaultChatEnabledPolicyID,
        policyName: defaultChatEnabledPolicy?.name ?? '',
        onConfirm: handleCreateWorkspaceReport,
        shouldHandleNavigationBack: false,
    });

    const handleExpense = useCallback(
        () =>
            interceptAnonymousUser(() => {
                startMoneyRequest(CONST.IOU.TYPE.CREATE, generateReportID(), draftTransactionIDs);
            }),
        [draftTransactionIDs],
    );

    const handleReport = useCallback(
        () =>
            interceptAnonymousUser(() => {
                if (shouldNavigateToUpgradePath) {
                    const freshReportID = generateReportID();
                    const freshTransactionID = generateReportID();
                    Navigation.navigate(
                        createDynamicRoute(
                            DYNAMIC_ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                                action: CONST.IOU.ACTION.CREATE,
                                iouType: CONST.IOU.TYPE.CREATE,
                                transactionID: freshTransactionID,
                                reportID: freshReportID,
                                upgradePath: CONST.UPGRADE_PATHS.REPORTS,
                            }),
                        ),
                    );
                    return;
                }

                const workspaceIDForReportCreation = defaultChatEnabledPolicyID;

                if (
                    !workspaceIDForReportCreation ||
                    (shouldRestrictUserBillableActions(defaultChatEnabledPolicy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, currentUserPersonalDetails.accountID) &&
                        hasMultipleChatEnabledPolicies)
                ) {
                    navigateToCreateReportWorkspaceSelection();
                    return;
                }

                if (!shouldRestrictUserBillableActions(defaultChatEnabledPolicy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, currentUserPersonalDetails.accountID)) {
                    if (shouldShowEmptyReportConfirmationForDefaultChatEnabledPolicy) {
                        openCreateReportConfirmation();
                    } else {
                        handleCreateWorkspaceReport(false);
                    }
                    return;
                }

                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(workspaceIDForReportCreation));
            }),
        [
            shouldNavigateToUpgradePath,
            defaultChatEnabledPolicyID,
            userBillingGracePeriodEnds,
            ownerBillingGracePeriodEnd,
            amountOwed,
            defaultChatEnabledPolicy,
            hasMultipleChatEnabledPolicies,
            shouldShowEmptyReportConfirmationForDefaultChatEnabledPolicy,
            openCreateReportConfirmation,
            handleCreateWorkspaceReport,
            currentUserPersonalDetails.accountID,
        ],
    );

    const handleDistance = useCallback(
        () =>
            interceptAnonymousUser(() => {
                startDistanceRequest(CONST.IOU.TYPE.CREATE, generateReportID(), draftTransactionIDs, lastDistanceExpenseType);
            }),
        [draftTransactionIDs, lastDistanceExpenseType],
    );

    const handleBookTravel = useCallback(
        () =>
            interceptAnonymousUser(() => {
                if (isTravelReady) {
                    if (blockIfDefaultWorkspaceLacksTravel()) {
                        return;
                    }
                    openTravelDotLink(travelEnabledPolicy?.id);
                    return;
                }
                Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS.getRoute(travelEnabledPolicy?.id));
            }),
        [travelEnabledPolicy?.id, isTravelReady, blockIfDefaultWorkspaceLacksTravel],
    );

    return (
        <View style={[styles.flexRow, styles.gap2, styles.pt1, styles.pb5]}>
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={handleExpense}
                style={styles.quickCreationActionsBarButton}
            >
                <Button.Icon src={icons.ReceiptPlus} />
                <Button.Text style={styles.quickCreationActionsBarButtonText}>{translate('common.expense')}</Button.Text>
            </Button>
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={handleReport}
                style={styles.quickCreationActionsBarButton}
            >
                <Button.Icon src={icons.DocumentPlus} />
                <Button.Text style={styles.quickCreationActionsBarButtonText}>{translate('common.report')}</Button.Text>
            </Button>
            <Button
                size={CONST.BUTTON_SIZE.SMALL}
                onPress={handleDistance}
                style={styles.quickCreationActionsBarButton}
            >
                <Button.Icon src={icons.LocationAdd} />
                <Button.Text style={styles.quickCreationActionsBarButtonText}>{translate('common.distance')}</Button.Text>
            </Button>
            {shouldShowBookTravel && (
                <Button
                    size={CONST.BUTTON_SIZE.SMALL}
                    onPress={handleBookTravel}
                    style={styles.quickCreationActionsBarButton}
                >
                    <Button.Icon src={icons.LuggageWithLinesPlus} />
                    <Button.Text style={styles.quickCreationActionsBarButtonText}>{translate('workspace.common.travel')}</Button.Text>
                </Button>
            )}
        </View>
    );
}

export default QuickCreationActionsBar;
