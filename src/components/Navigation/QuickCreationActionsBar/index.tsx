import {emailSelector} from '@selectors/Session';
import {validTransactionDraftIDsSelector} from '@selectors/TransactionDraft';
import {Str} from 'expensify-common';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Button from '@components/Button';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import useCreateEmptyReportConfirmation from '@hooks/useCreateEmptyReportConfirmation';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHasEmptyReportsForPolicy from '@hooks/useHasEmptyReportsForPolicy';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useThemeStyles from '@hooks/useThemeStyles';
import {startDistanceRequest, startMoneyRequest} from '@libs/actions/IOU';
import {openOldDotLink} from '@libs/actions/Link';
import {createNewReport} from '@libs/actions/Report';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import {openTravelDotLink} from '@libs/openTravelDotLink';
import Permissions from '@libs/Permissions';
import {areAllGroupPoliciesExpenseChatDisabled, getDefaultChatEnabledPolicy, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {generateReportID, hasViolations as hasViolationsReportUtils} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {primaryLoginSelector} from '@src/selectors/Account';
import {groupPaidPoliciesWithExpenseChatEnabledSelector} from '@src/selectors/Policy';
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
    const {showConfirmModal} = useConfirmModal();

    const groupPaidPoliciesWithChatEnabledSelector = useCallback((policies: OnyxCollection<OnyxTypes.Policy>) => groupPaidPoliciesWithExpenseChatEnabledSelector(policies, email), [email]);
    const [groupPoliciesWithChatEnabled = CONST.EMPTY_ARRAY] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: groupPaidPoliciesWithChatEnabledSelector}, [email]);

    const defaultChatEnabledPolicy = useMemo(
        () => getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled as Array<OnyxEntry<OnyxTypes.Policy>>, activePolicy),
        [activePolicy, groupPoliciesWithChatEnabled],
    );
    const defaultChatEnabledPolicyID = defaultChatEnabledPolicy?.id;

    const hasEmptyReport = useHasEmptyReportsForPolicy(defaultChatEnabledPolicyID);
    const [hasDismissedEmptyReportsConfirmation] = useOnyx(ONYXKEYS.NVP_EMPTY_REPORTS_CONFIRMATION_DISMISSED);
    const shouldShowEmptyReportConfirmationForDefaultChatEnabledPolicy = hasEmptyReport && hasDismissedEmptyReportsConfirmation !== true;

    const shouldRedirectToExpensifyClassic = useMemo(() => areAllGroupPoliciesExpenseChatDisabled((allPolicies as OnyxCollection<OnyxTypes.Policy>) ?? {}), [allPolicies]);

    const travelEnabledPolicy = useMemo(() => Object.values(allPolicies ?? {}).find((policy) => !!policy?.isTravelEnabled), [allPolicies]);

    const shouldShowBookTravel = !!travelEnabledPolicy;

    const isBlockedFromSpotnanaTravel = Permissions.isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL, allBetas);
    const primaryContactMethod = primaryLogin ?? session?.email ?? '';
    const isTravelReady = useMemo(() => {
        if (!!isBlockedFromSpotnanaTravel || !primaryContactMethod || Str.isSMSLogin(primaryContactMethod) || !isPaidGroupPolicy(travelEnabledPolicy)) {
            return false;
        }

        const isPolicyProvisioned = travelEnabledPolicy?.travelSettings?.spotnanaCompanyID ?? travelEnabledPolicy?.travelSettings?.associatedTravelDomainAccountID;

        return travelEnabledPolicy?.travelSettings?.hasAcceptedTerms ?? (travelSettings?.hasAcceptedTerms && isPolicyProvisioned);
    }, [travelEnabledPolicy, isBlockedFromSpotnanaTravel, primaryContactMethod, travelSettings?.hasAcceptedTerms]);

    const showRedirectToExpensifyClassicModal = useCallback(async () => {
        const {action} = await showConfirmModal({
            title: translate('sidebarScreen.redirectToExpensifyClassicModal.title'),
            prompt: translate('sidebarScreen.redirectToExpensifyClassicModal.description'),
            confirmText: translate('exitSurvey.goToExpensifyClassic'),
            cancelText: translate('common.cancel'),
        });
        if (action === ModalActions.CONFIRM) {
            openOldDotLink(CONST.OLDDOT_URLS.INBOX);
        }
    }, [showConfirmModal, translate]);

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
            );
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(
                    isSearchTopmostFullScreenRoute()
                        ? ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: createdReportID, backTo: Navigation.getActiveRoute()})
                        : ROUTES.REPORT_WITH_ID.getRoute(createdReportID, undefined, undefined, Navigation.getActiveRoute()),
                );
            });
        },
        [currentUserPersonalDetails, hasViolations, defaultChatEnabledPolicy, isASAPSubmitBetaEnabled, allBetas],
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
                if (shouldRedirectToExpensifyClassic) {
                    showRedirectToExpensifyClassicModal();
                    return;
                }
                startMoneyRequest(CONST.IOU.TYPE.CREATE, generateReportID(), draftTransactionIDs);
            }),
        [draftTransactionIDs, shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal],
    );

    const handleReport = useCallback(
        () =>
            interceptAnonymousUser(() => {
                if (shouldRedirectToExpensifyClassic) {
                    showRedirectToExpensifyClassicModal();
                    return;
                }

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
                    Navigation.navigate(ROUTES.NEW_REPORT_WORKSPACE_SELECTION.getRoute());
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
            shouldRedirectToExpensifyClassic,
            showRedirectToExpensifyClassicModal,
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
                if (shouldRedirectToExpensifyClassic) {
                    showRedirectToExpensifyClassicModal();
                    return;
                }
                startDistanceRequest(CONST.IOU.TYPE.CREATE, generateReportID(), draftTransactionIDs, lastDistanceExpenseType);
            }),
        [draftTransactionIDs, lastDistanceExpenseType, shouldRedirectToExpensifyClassic, showRedirectToExpensifyClassicModal],
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
