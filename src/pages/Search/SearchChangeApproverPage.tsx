import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {assignReportToMe} from '@libs/actions/IOU/ReportWorkflow';
import {openBulkChangeApproverPage} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils, isAllowedToApproveExpenseReport} from '@libs/ReportUtils';
import {APPROVER_TYPE} from '@pages/DynamicReportChangeApproverPage';
import type {ApproverType} from '@pages/DynamicReportChangeApproverPage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';

type SelectedReportRef = {reportID: string | undefined};

/**
 * Decides whether the bulk change-approver page should auto-apply the only
 * available approver option. Mirrors the single-report flow, but guards the
 * decision until all selected reports are actually loaded in Onyx — otherwise
 * the permission check that drives `approverTypes` can report a stale value.
 */
function shouldAutoApplyApprover({
    isLoadingBulkChangeApproverPage,
    selectedReports,
    onyxReports,
    approverTypes,
    selectedApproverType,
}: {
    isLoadingBulkChangeApproverPage: boolean;
    selectedReports: SelectedReportRef[];
    onyxReports: Record<string, Report> | undefined;
    approverTypes: Array<{keyForList: ApproverType}>;
    selectedApproverType: ApproverType | undefined;
}): boolean {
    if (isLoadingBulkChangeApproverPage || selectedReports.length === 0) {
        return false;
    }

    const allReportsLoaded = selectedReports.every((selectedReport) => selectedReport.reportID && onyxReports?.[selectedReport.reportID]);
    if (!allReportsLoaded) {
        return false;
    }

    return approverTypes.length === 1 && selectedApproverType === approverTypes.at(0)?.keyForList;
}

export {shouldAutoApplyApprover};

function SearchChangeApproverPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {environmentURL} = useEnvironment();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const [selectedApproverType, setSelectedApproverType] = useState<ApproverType>(APPROVER_TYPE.ADD_APPROVER);
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allReportNextSteps] = useOnyx(ONYXKEYS.COLLECTION.NEXT_STEP);
    const {clearSelectedTransactions} = useSearchActionsContext();
    const {selectedReports} = useSearchStateContext();
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

    const hasAutoAppliedRef = useRef(false);
    const prevSelectedReportsLength = useRef(0);
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

    const changeApprover = () => {
        if (selectedApproverType === APPROVER_TYPE.ADD_APPROVER) {
            const policiesToUpgrade = selectedPolicies.filter((policy) => !isControlPolicy(policy));
            if (policiesToUpgrade.length > 1) {
                // Bulk upgrade is not supported, so show a general page to guide the user to upgrade manually
                Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(undefined, undefined, ROUTES.CHANGE_APPROVER_SEARCH_RHP));
                return;
            }
            if (policiesToUpgrade.length === 1) {
                Navigation.navigate(
                    ROUTES.WORKSPACE_UPGRADE.getRoute(policiesToUpgrade.at(0)?.id, CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.alias, ROUTES.CHANGE_APPROVER_SEARCH_RHP),
                );
                return;
            }

            Navigation.navigate(ROUTES.CHANGE_APPROVER_ADD_APPROVER_SEARCH_RHP);
            return;
        }

        for (const selectedReport of selectedReports) {
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
            const report = selectedReport.reportID ? onyxReports?.[selectedReport.reportID] : undefined;
            if (!policy || !report) {
                continue;
            }

            if (report.managerID !== currentUserDetails.accountID) {
                const hasViolations = hasViolationsReportUtils(report.reportID, transactionViolations, currentUserDetails.accountID, currentUserDetails.email ?? '');
                const reportNextStep = allReportNextSteps?.[`${ONYXKEYS.COLLECTION.NEXT_STEP}${selectedReport.reportID}`];
                assignReportToMe(report, currentUserDetails.accountID, currentUserDetails.email ?? '', policy, hasViolations, isASAPSubmitBetaEnabled, reportNextStep);
            }
        }

        // Note: This clears both reports and transactions
        clearSelectedTransactions();
    };

    const getApproverTypes = () => {
        const data: Array<ListItem<ApproverType>> = [
            {
                text: translate('iou.changeApprover.actions.addApprover'),
                keyForList: APPROVER_TYPE.ADD_APPROVER,
                alternateText: translate('iou.changeApprover.actions.addApproverSubtitle'),
                isSelected: selectedApproverType === APPROVER_TYPE.ADD_APPROVER,
            },
        ];

        const hasPermission = selectedReports.every((selectedReport) => {
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
            const report = selectedReport.reportID ? onyxReports?.[selectedReport.reportID] : undefined;

            if (!policy || !report) {
                return false;
            }

            return isPolicyAdmin(policy) && isAllowedToApproveExpenseReport(report, currentUserDetails.accountID, policy);
        });

        const shouldShowBypassApproversOption =
            hasPermission &&
            selectedReports.some((selectedReport) => {
                const report = selectedReport.reportID ? onyxReports?.[selectedReport.reportID] : undefined;

                if (!report) {
                    return false;
                }

                return report.managerID !== currentUserDetails.accountID;
            });

        if (shouldShowBypassApproversOption) {
            data.push({
                text: translate('iou.changeApprover.actions.bypassApprovers'),
                keyForList: APPROVER_TYPE.BYPASS_APPROVER,
                alternateText: translate('iou.changeApprover.actions.bypassApproversSubtitle'),
                isSelected: selectedApproverType === APPROVER_TYPE.BYPASS_APPROVER,
            });
        }

        return data;
    };
    const approverTypes = getApproverTypes();

    // useLayoutEffect (not useEffect) so the RHP closes before the browser paints,
    // avoiding a single-frame flash of an empty list after reports are cleared.
    useLayoutEffect(() => {
        if (selectedReports.length && approverTypes.at(0)) {
            return;
        }

        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.closeRHPFlow();
        });
    }, [approverTypes, selectedReports.length]);

    const shouldAutoApply = shouldAutoApplyApprover({
        isLoadingBulkChangeApproverPage,
        selectedReports,
        onyxReports,
        approverTypes,
        selectedApproverType,
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
                <RenderHTML html={translate('iou.changeApprover.header', `${environmentURL}/${ROUTES.WORKSPACE_WORKFLOWS.getRoute(selectedPolicies.at(0)?.id)}`)} />
            </View>
        ) : (
            <Text style={[styles.ph5, styles.mb5]}>{translate('iou.changeApprover.bulkSubtitle')}</Text>
        );

    if (!isOffline && isLoadingBulkChangeApproverPage) {
        return (
            <FullScreenLoadingIndicator
                shouldUseGoBackButton
                reasonAttributes={{context: 'SearchChangeApproverPage'}}
            />
        );
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
            {!!isLoadingBulkChangeApproverPage && !!isOffline ? (
                <FullPageOfflineBlockingView>
                    <View />
                </FullPageOfflineBlockingView>
            ) : (
                <SelectionList
                    data={approverTypes}
                    ListItem={RadioListItem}
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
                    initiallyFocusedItemKey={selectedApproverType}
                />
            )}
        </ScreenWrapper>
    );
}

export default SearchChangeApproverPage;
