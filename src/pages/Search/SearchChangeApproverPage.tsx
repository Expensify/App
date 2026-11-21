import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useStrictPolicyRules from '@hooks/useStrictPolicyRules';
import useThemeStyles from '@hooks/useThemeStyles';

import {assignReportToMe} from '@libs/actions/IOU/ReportWorkflow';
import {openBulkChangeApproverPage} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {hasDynamicExternalWorkflow, isControlPolicy, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {
    canReassignAsApprover,
    hasViolations as hasViolationsReportUtils,
    isAllowedToApproveExpenseReport,
    isMoneyRequestReport,
    isMoneyRequestReportPendingDeletion,
    isProcessingReport,
} from '@libs/ReportUtils';

import {APPROVER_TYPE, getSelectedApproverType} from '@pages/DynamicReportChangeApproverPage';
import type {ApproverType} from '@pages/DynamicReportChangeApproverPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';

type SelectedReportRef = {reportID: string | undefined; policyID?: string};

function areAllSelectedPoliciesLoaded(selectedReports: SelectedReportRef[], allPolicies: OnyxCollection<Policy>): boolean {
    return selectedReports.every((selectedReport) => !!selectedReport.policyID && !!allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`]);
}

function areAllSelectedReportsLoaded(selectedReports: SelectedReportRef[], onyxReports: Record<string, Report> | undefined): boolean {
    return selectedReports.every((selectedReport) => !!selectedReport.reportID && !!onyxReports?.[selectedReport.reportID]);
}

export {areAllSelectedPoliciesLoaded, areAllSelectedReportsLoaded};

/**
 * Decides whether the bulk change-approver page should open the only available Add or Reassign option without a
 * confirmation. It waits until every selected report is in Onyx, because the permission checks that build
 * `approverTypes` can report a stale value before then.
 */
function shouldAutoApplyApprover({
    isLoadingBulkChangeApproverPage,
    selectedReports,
    onyxReports,
    approverTypes,
    selectedApproverType,
    areSelectedPoliciesLoaded = true,
}: {
    isLoadingBulkChangeApproverPage: boolean;
    selectedReports: SelectedReportRef[];
    onyxReports: Record<string, Report> | undefined;
    approverTypes: Array<{keyForList: ApproverType}>;
    selectedApproverType: ApproverType | undefined;
    areSelectedPoliciesLoaded?: boolean;
}): boolean {
    if (isLoadingBulkChangeApproverPage || selectedReports.length === 0 || !areSelectedPoliciesLoaded) {
        return false;
    }

    if (!areAllSelectedReportsLoaded(selectedReports, onyxReports)) {
        return false;
    }

    // Add and Reassign only open the next page, but Bypass approves every selected report, so it always waits for the confirm button.
    const onlyApproverType = approverTypes.at(0)?.keyForList;
    return approverTypes.length === 1 && selectedApproverType === onlyApproverType && onlyApproverType !== APPROVER_TYPE.BYPASS_APPROVER;
}

export {shouldAutoApplyApprover};

function canReassignAllReports({
    selectedReports,
    onyxReports,
    allPolicies,
    currentUserAccountID,
    areStrictPolicyRulesEnabled,
    isLoadingSecurityGroup,
}: {
    selectedReports: SelectedReportRef[];
    onyxReports: Record<string, Report> | undefined;
    allPolicies: OnyxCollection<Policy>;
    currentUserAccountID: number;
    areStrictPolicyRulesEnabled: boolean;
    isLoadingSecurityGroup: boolean;
}): boolean {
    return (
        selectedReports.length > 0 &&
        selectedReports.every((selectedReport) => {
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
            const report = selectedReport.reportID ? onyxReports?.[selectedReport.reportID] : undefined;
            const isApprovalEnabled = !!policy?.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
            const canReassignReportAsApprover = canReassignAsApprover({
                report,
                currentUserAccountID,
                isLoadingSecurityGroup,
                areStrictPolicyRulesEnabled,
            });

            return (
                !!policy &&
                !!report &&
                !hasDynamicExternalWorkflow(policy) &&
                (isPolicyAdmin(policy) || canReassignReportAsApprover) &&
                !isPendingDeletePolicy(policy) &&
                isMoneyRequestReport(report) &&
                !isMoneyRequestReportPendingDeletion(report) &&
                isProcessingReport(report) &&
                isApprovalEnabled
            );
        })
    );
}

export {canReassignAllReports};

function SearchChangeApproverPage() {
    const {translate, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const [selectedApproverType, setSelectedApproverType] = useState<ApproverType>(APPROVER_TYPE.ADD_APPROVER);
    const {isBetaEnabled} = usePermissions();
    const {areStrictPolicyRulesEnabled, isLoadingSecurityGroup} = useStrictPolicyRules();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {selectedReports} = useSearchSelectionContext();
    const [hasLoadedApp] = useOnyx(ONYXKEYS.HAS_LOADED_APP);
    const [isLoadingBulkChangeApproverPage = true] = useOnyx(ONYXKEYS.IS_LOADING_BULK_CHANGE_APPROVER_PAGE);
    const {isOffline} = useNetwork();

    const getOnyxReports = (allReports: OnyxCollection<Report>) => {
        const reports = Object.create(null) as Record<string, Report>;
        for (const selectedReport of selectedReports) {
            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReport.reportID}`];
            if (!report?.reportID) {
                continue;
            }
            reports[report.reportID] = report;
        }
        return reports;
    };
    const [onyxReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: getOnyxReports});
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const hasAutoAppliedRef = useRef(false);
    // Set when navigating to WORKSPACE_UPGRADE; prevents the auto-close in useLayoutEffect from
    // dismissing the RHP if selectedReports goes transiently empty before this page unmounts
    // TODO: drop this ref once the CHANGE_APPROVER_SEARCH_RHP `backTo` is removed so navigation matches the regular
    // "Change approver" flow after upgrading workspace. See https://github.com/Expensify/App/pull/89192.
    const hasInitiatedUpgradeRef = useRef(false);
    const prevSelectedReportsLength = useRef(0);

    useEffect(() => {
        if (selectedReports.length === 0) {
            return;
        }
        hasInitiatedUpgradeRef.current = false;
    }, [selectedReports.length]);

    useEffect(() => {
        if (!hasLoadedApp || !selectedReports.length || prevSelectedReportsLength.current === selectedReports.length) {
            return;
        }

        prevSelectedReportsLength.current = selectedReports.length;
        openBulkChangeApproverPage(selectedReports.map((selectedReport) => selectedReport.reportID).filter((selectedReportID) => undefined !== selectedReportID));
    }, [hasLoadedApp, selectedReports]);

    const getSelectedPolicies = () => {
        const policies = new Map<string, Policy>();
        for (const selectedReport of selectedReports) {
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
            if (policy?.id) {
                policies.set(policy.id, policy);
            }
        }
        return Array.from(policies.values());
    };
    const selectedPolicies = getSelectedPolicies();
    const hasAdminPermission = selectedReports.every((selectedReport) => {
        const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
        return !!policy && isPolicyAdmin(policy) && !isPendingDeletePolicy(policy);
    });
    const areSelectedPoliciesLoadedForSelection = areAllSelectedPoliciesLoaded(selectedReports, allPolicies);
    const areSelectedReportsLoaded = areAllSelectedReportsLoaded(selectedReports, onyxReports);
    const hasSelectedDEWEnabledPolicy = selectedPolicies.some((policy) => hasDynamicExternalWorkflow(policy));

    const getApproverTypes = () => {
        const data: Array<ListItem<ApproverType>> = [];

        if (!areSelectedPoliciesLoadedForSelection) {
            return data;
        }

        if (hasAdminPermission && !hasSelectedDEWEnabledPolicy) {
            data.push({
                text: translate('iou.changeApprover.actions.addApprover'),
                keyForList: APPROVER_TYPE.ADD_APPROVER,
                alternateText: translate('iou.changeApprover.actions.addApproverSubtitle'),
                isSelected: false,
            });
        }

        const canReassign = canReassignAllReports({
            selectedReports,
            onyxReports,
            allPolicies,
            currentUserAccountID: currentUserDetails.accountID,
            areStrictPolicyRulesEnabled,
            isLoadingSecurityGroup,
        });

        const isAllowedToBypassApprovers =
            hasAdminPermission &&
            selectedReports.every((selectedReport) => {
                const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
                const report = selectedReport.reportID ? onyxReports?.[selectedReport.reportID] : undefined;

                return !!policy && !!report && isAllowedToApproveExpenseReport(report, currentUserDetails.accountID, policy);
            });

        if (isAllowedToBypassApprovers) {
            data.push({
                text: translate('iou.changeApprover.actions.bypassApprovers'),
                keyForList: APPROVER_TYPE.BYPASS_APPROVER,
                alternateText: translate('iou.changeApprover.actions.bypassApproversSubtitle'),
                isSelected: false,
            });
        }

        if (canReassign && !hasSelectedDEWEnabledPolicy) {
            data.push({
                text: translate('iou.changeApprover.actions.reassignApprover'),
                keyForList: APPROVER_TYPE.REASSIGN_APPROVER,
                alternateText: translate('iou.changeApprover.actions.reassignApproverSubtitle'),
                isSelected: false,
            });
        }

        const activeApproverType = getSelectedApproverType({approverTypes: data, selectedApproverType});
        return data.map((item) => ({...item, isSelected: item.keyForList === activeApproverType}));
    };
    const approverTypes = getApproverTypes();
    // Keep this selection inline so React Compiler preserves caching for selectedPolicies and approverTypes.
    const activeApproverType = approverTypes.some(({keyForList}) => keyForList === selectedApproverType)
        ? selectedApproverType
        : (approverTypes.at(0)?.keyForList ?? APPROVER_TYPE.ADD_APPROVER);

    const changeApprover = () => {
        // The confirm button stays visible on an empty menu, and the fallback selection would otherwise open a hidden option.
        if (!approverTypes.length) {
            return;
        }

        if (activeApproverType === APPROVER_TYPE.ADD_APPROVER) {
            const policiesToUpgrade = selectedPolicies.filter((policy) => !isControlPolicy(policy));
            if (policiesToUpgrade.length > 1) {
                // Bulk upgrade is not supported, so show a general page to guide the user to upgrade manually
                hasInitiatedUpgradeRef.current = true;
                Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(undefined, undefined, ROUTES.CHANGE_APPROVER_ADD_APPROVER_SEARCH_RHP), {forceReplace: true});
                return;
            }
            if (policiesToUpgrade.length === 1) {
                hasInitiatedUpgradeRef.current = true;
                Navigation.navigate(
                    ROUTES.WORKSPACE_UPGRADE.getRoute(
                        policiesToUpgrade.at(0)?.id,
                        CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.alias,
                        ROUTES.CHANGE_APPROVER_ADD_APPROVER_SEARCH_RHP,
                    ),
                    {forceReplace: true},
                );
                return;
            }

            Navigation.navigate(ROUTES.CHANGE_APPROVER_ADD_APPROVER_SEARCH_RHP);
            return;
        }

        if (activeApproverType === APPROVER_TYPE.REASSIGN_APPROVER) {
            Navigation.navigate(ROUTES.CHANGE_APPROVER_REASSIGN_APPROVER_SEARCH_RHP);
            return;
        }

        for (const selectedReport of selectedReports) {
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
            const report = selectedReport.reportID ? onyxReports?.[selectedReport.reportID] : undefined;
            if (!policy || !report) {
                continue;
            }

            const hasViolations = hasViolationsReportUtils(report.reportID, transactionViolations, currentUserDetails.accountID, currentUserDetails.email ?? '');
            assignReportToMe(
                report,
                currentUserDetails.accountID,
                currentUserDetails.email ?? '',
                policy,
                hasViolations,
                isASAPSubmitBetaEnabled,
                isTrackIntentUser,
                formatPhoneNumber,
                rules,
            );
        }

        // Note: This clears both reports and transactions
        clearSelectedTransactions();
    };

    // useLayoutEffect (not useEffect) so the RHP closes before the browser paints,
    // avoiding a single-frame flash of an empty list after reports are cleared.
    useLayoutEffect(() => {
        // An empty menu can mean permissions or reports are still loading, so wait before closing the flow. The loading
        // flag can still be false from an earlier visit while this visit's reports are being fetched.
        if (
            selectedReports.length &&
            (isLoadingBulkChangeApproverPage || !areSelectedPoliciesLoadedForSelection || !areSelectedReportsLoaded || (!hasAdminPermission && isLoadingSecurityGroup) || approverTypes.at(0))
        ) {
            return;
        }

        // Skip during an upgrade round-trip: selectedReports may be transiently empty while
        // navigating to WORKSPACE_UPGRADE, and closing the RHP would kill the Add Approver flow.
        if (hasInitiatedUpgradeRef.current) {
            return;
        }

        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.closeRHPFlow();
        });
    }, [approverTypes, areSelectedPoliciesLoadedForSelection, areSelectedReportsLoaded, selectedReports.length, isLoadingBulkChangeApproverPage, hasAdminPermission, isLoadingSecurityGroup]);

    const shouldAutoApply = shouldAutoApplyApprover({
        isLoadingBulkChangeApproverPage,
        selectedReports,
        onyxReports,
        approverTypes,
        selectedApproverType: activeApproverType,
        areSelectedPoliciesLoaded: areSelectedPoliciesLoadedForSelection,
    });

    useEffect(() => {
        if (hasAutoAppliedRef.current || !shouldAutoApply) {
            return;
        }

        hasAutoAppliedRef.current = true;
        changeApprover();
    }, [shouldAutoApply, changeApprover]);

    const confirmButtonOptions = {
        showButton: true,
        text: translate('iou.changeApprover.title'),
        onConfirm: changeApprover,
    };

    const listHeader =
        selectedPolicies.length === 1 ? (
            <View style={[styles.ph5, styles.mb5, styles.renderHTML, styles.flexRow]}>
                <RenderHTML
                    html={translate('iou.changeApprover.header', `${environmentURL}/${ROUTES.WORKSPACE_WORKFLOWS.getRoute(selectedPolicies.at(0)?.id, CONST.TAB.WORKFLOWS.APPROVALS)}`)}
                />
            </View>
        ) : (
            <Text style={[styles.ph5, styles.mb5]}>{translate('iou.changeApprover.bulkSubtitle')}</Text>
        );

    if (!isOffline && isLoadingBulkChangeApproverPage) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    return (
        <ScreenWrapper
            testID="SearchChangeApproverPage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            // Show the non-blocking offline indicator if reports are available in Onyx, otherwise show the blocking offline view because this page requires the Onyx data
            shouldShowOfflineIndicator={!isLoadingBulkChangeApproverPage}
        >
            <HeaderWithBackButton
                title={translate('iou.changeApprover.title')}
                onBackButtonPress={Navigation.goBack}
            />
            {!!isOffline && (!!isLoadingBulkChangeApproverPage || !areSelectedPoliciesLoadedForSelection || !areSelectedReportsLoaded) ? (
                <FullPageOfflineBlockingView>
                    <View />
                </FullPageOfflineBlockingView>
            ) : (
                <FullPageNotFoundView
                    shouldShow={!areSelectedPoliciesLoadedForSelection || !areSelectedReportsLoaded}
                    shouldShowBackButton={false}
                    shouldShowLink={false}
                >
                    <SelectionList
                        data={approverTypes}
                        ListItem={SingleSelectListItem}
                        alternateNumberOfSupportedLines={2}
                        onSelectRow={(option) => {
                            if (!option.keyForList) {
                                return;
                            }
                            setSelectedApproverType(option.keyForList);
                        }}
                        confirmButtonOptions={confirmButtonOptions}
                        shouldUpdateFocusedIndex
                        customListHeader={listHeader}
                        initiallyFocusedItemKey={activeApproverType}
                    />
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

export default SearchChangeApproverPage;
