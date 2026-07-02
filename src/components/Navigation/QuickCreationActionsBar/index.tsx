import {emailSelector} from '@selectors/Session';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import {Str} from 'expensify-common';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useShouldShowEmptyReportConfirmation from '@hooks/useShouldShowEmptyReportConfirmation';
import useThemeStyles from '@hooks/useThemeStyles';
import {startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU/MoneyRequest';
import {createNewReport} from '@libs/actions/Report';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import getCreateReportRoute, {getReportsRootRoute, navigateToCreateReportWorkspaceSelection} from '@libs/Navigation/helpers/getCreateReportRoute';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';
import Permissions from '@libs/Permissions';
import {getDefaultChatEnabledPolicy, getGroupPoliciesWhereReportCanBeCreated, isPaidGroupPolicy, isWorkspaceProvisionedForTravel} from '@libs/PolicyUtils';
import {generateReportID, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {primaryLoginSelector} from '@src/selectors/Account';
import type * as OnyxTypes from '@src/types/onyx';

function QuickCreationActionsBar() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ReceiptPlus', 'DocumentPlus', 'CarPlus', 'LuggageWithLinesPlus']);

    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [email] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});
    const [allBetas] = useOnyx(ONYXKEYS.BETAS);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [draftTransactionIDs] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftIDsSelector});
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [primaryLogin] = useOnyx(ONYXKEYS.ACCOUNT, {selector: primaryLoginSelector});
    const [travelSettings] = useOnyx(ONYXKEYS.NVP_TRAVEL_SETTINGS);

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(undefined, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses();
    const shouldNavigateToUpgradePath = !policyForMovingExpensesID && !shouldSelectPolicy;
    const isSubmit2026BetaEnabled = isBetaEnabled(CONST.BETAS.SUBMIT_2026);
    const groupPoliciesWithChatEnabledSelector = (policies: OnyxCollection<OnyxTypes.Policy>) => getGroupPoliciesWhereReportCanBeCreated(policies, isSubmit2026BetaEnabled, email);
    const [groupPoliciesWithChatEnabled = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: groupPoliciesWithChatEnabledSelector}, [email, isSubmit2026BetaEnabled]);

    const defaultChatEnabledPolicy = useMemo(
        () => getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled as Array<OnyxEntry<OnyxTypes.Policy>>, activePolicy),
        [activePolicy, groupPoliciesWithChatEnabled],
    );
    const defaultChatEnabledPolicyID = defaultChatEnabledPolicy?.id;

    const shouldShowEmptyReportConfirmationForDefaultChatEnabledPolicy = useShouldShowEmptyReportConfirmation(defaultChatEnabledPolicyID);

    const travelEnabledPolicy = useMemo(() => Object.values(allPolicies ?? {}).find((policy) => !!policy?.isTravelEnabled), [allPolicies]);

    const shouldShowBookTravel = !!travelEnabledPolicy;

    const isBlockedFromSpotnanaTravel = Permissions.isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL, allBetas);
    const primaryContactMethod = primaryLogin ?? session?.email ?? '';
    const isTravelReady = useMemo(() => {
        if (!!isBlockedFromSpotnanaTravel || !primaryContactMethod || Str.isSMSLogin(primaryContactMethod) || !isPaidGroupPolicy(travelEnabledPolicy)) {
            return false;
        }

        const isPolicyProvisioned = isWorkspaceProvisionedForTravel(travelEnabledPolicy?.travelSettings);

        return travelEnabledPolicy?.travelSettings?.hasAcceptedTerms ?? (travelSettings?.hasAcceptedTerms && isPolicyProvisioned);
    }, [travelEnabledPolicy, isBlockedFromSpotnanaTravel, primaryContactMethod, travelSettings?.hasAcceptedTerms]);

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
                false,
                shouldDismissEmptyReportsConfirmation,
                undefined,
                translate,
            );
            // Navigate to the Reports page first so getCreateReportRoute() resolves against
            // the Search/Reports fullscreen context before opening the created report modal.
            Navigation.navigate(getReportsRootRoute());
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(getCreateReportRoute({reportID: createdReportID}));
            });
        },
        [currentUserPersonalDetails, hasViolations, defaultChatEnabledPolicy, isASAPSubmitBetaEnabled, allBetas, translate],
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
                        ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                            action: CONST.IOU.ACTION.CREATE,
                            iouType: CONST.IOU.TYPE.CREATE,
                            transactionID: freshTransactionID,
                            reportID: freshReportID,
                            upgradePath: CONST.UPGRADE_PATHS.REPORTS,
                        }),
                    );
                    return;
                }

                const workspaceIDForReportCreation = defaultChatEnabledPolicyID;

                if (
                    !workspaceIDForReportCreation ||
                    (shouldRestrictUserBillableActions(defaultChatEnabledPolicy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, currentUserPersonalDetails.accountID) &&
                        groupPoliciesWithChatEnabled.length > 1)
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
            groupPoliciesWithChatEnabled.length,
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
                    openTravelDotLink(travelEnabledPolicy?.id);
                    return;
                }
                Navigation.navigate(ROUTES.TRAVEL_MY_TRIPS.getRoute(travelEnabledPolicy?.id));
            }),
        [travelEnabledPolicy?.id, isTravelReady],
    );

    return (
        <View style={[styles.flexRow, styles.gap2, styles.pt1, styles.pb5]}>
            <Button
                small
                icon={icons.ReceiptPlus}
                text={translate('common.expense')}
                onPress={handleExpense}
                style={styles.quickCreationActionsBarButton}
                textStyles={styles.quickCreationActionsBarButtonText}
            />
            <Button
                small
                icon={icons.DocumentPlus}
                text={translate('common.report')}
                onPress={handleReport}
                style={styles.quickCreationActionsBarButton}
                textStyles={styles.quickCreationActionsBarButtonText}
            />
            <Button
                small
                icon={icons.CarPlus}
                text={translate('common.distance')}
                onPress={handleDistance}
                style={styles.quickCreationActionsBarButton}
                textStyles={styles.quickCreationActionsBarButtonText}
            />
            {shouldShowBookTravel && (
                <Button
                    small
                    icon={icons.LuggageWithLinesPlus}
                    text={translate('workspace.common.travel')}
                    onPress={handleBookTravel}
                    style={styles.quickCreationActionsBarButton}
                    textStyles={styles.quickCreationActionsBarButtonText}
                />
            )}
        </View>
    );
}

export default QuickCreationActionsBar;
