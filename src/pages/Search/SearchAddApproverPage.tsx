import lodashIntersection from 'lodash/intersection';
import lodashPick from 'lodash/pick';
import React, {useEffect, useState} from 'react';
import ApproverSelectionList from '@components/ApproverSelectionList';
import type {SelectionListApprover} from '@components/ApproverSelectionList';
import Badge from '@components/Badge';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {addReportApprover} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import {getDisplayNameForParticipant, hasViolations as hasViolationsReportUtils, isAllowedToApproveExpenseReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SearchAddApproverPage() {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const [selectedApproverEmail, setSelectedApproverEmail] = useState<string | undefined>(undefined);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportNextSteps] = useOnyx(ONYXKEYS.COLLECTION.NEXT_STEP);
    const {clearSelectedTransactions} = useSearchActionsContext();
    const {selectedReports} = useSearchStateContext();
    const [isSaving, setIsSaving] = useState(false);

    const currentUserDetails = useCurrentUserPersonalDetails();

    // Get all possible approvers from all selected reports' policies
    // An approver must be able to approve ALL selected reports
    const getAllApprovers = () => {
        if (selectedReports.length === 0) {
            return [];
        }

        const uniquePolicyIds = Array.from(new Set(selectedReports.map((selectedReport) => selectedReport.policyID)));
        const employeeLists = uniquePolicyIds.map((policyID) => allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.employeeList).filter((employeeList) => !!employeeList);
        const firstWorkspaceEmployees = employeeLists.at(0);
        const intersectedEmployees = firstWorkspaceEmployees ? lodashPick(firstWorkspaceEmployees, lodashIntersection(...employeeLists.map(Object.keys))) : {};
        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(intersectedEmployees, true, false);
        // We get the intersection here as we only want to show members who belong to all workspaces when adding an additional approver
        return Object.values(intersectedEmployees)
            .map((employee): SelectionListApprover | null => {
                const isAdmin = employee?.role === CONST.REPORT.ROLE.ADMIN;
                const email = employee?.email;

                if (!email) {
                    return null;
                }
                const accountID = policyMemberEmailsToAccountIDs[email];
                const isPendingDelete = employee?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

                if (!accountID || isPendingDelete) {
                    return null;
                }

                const isApproverOfAllReports = selectedReports.every((selectedReport) => {
                    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReport.reportID}`];

                    if (!report) {
                        return false;
                    }

                    return report.managerID === accountID;
                });
                if (isApproverOfAllReports) {
                    return null;
                }

                const canApproveAllReports = selectedReports.every((selectedReport) => {
                    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
                    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReport.reportID}`];

                    if (!report || !policy) {
                        return false;
                    }

                    if (report.managerID === accountID) {
                        return true;
                    }

                    return isAllowedToApproveExpenseReport(report, accountID, policy);
                });

                if (!canApproveAllReports) {
                    return null;
                }

                const {avatar} = personalDetails?.[accountID] ?? {};
                const displayName = getDisplayNameForParticipant({accountID, formatPhoneNumber, personalDetailsData: personalDetails});
                return {
                    text: displayName,
                    alternateText: email,
                    keyForList: email,
                    isSelected: selectedApproverEmail === email,
                    login: email,
                    value: accountID,
                    icons: [{source: avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
                    rightElement: isAdmin ? <Badge text={translate('common.admin')} /> : undefined,
                };
            })
            .filter((approver): approver is SelectionListApprover => !!approver);
    };
    const allApprovers = getAllApprovers();

    const addApprover = () => {
        const employeeAccountID = allApprovers.find((approver) => approver.login === selectedApproverEmail)?.value;
        if (!selectedApproverEmail || !employeeAccountID) {
            return;
        }

        setIsSaving(true);
        for (const selectedReport of selectedReports) {
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReport.reportID}`];

            if (!report || !policy || report.managerID === employeeAccountID) {
                continue;
            }

            const hasViolations = hasViolationsReportUtils(report.reportID, transactionViolations, currentUserDetails.accountID, currentUserDetails.email ?? '');
            const reportNextStep = allReportNextSteps?.[`${ONYXKEYS.COLLECTION.NEXT_STEP}${selectedReport.reportID}`];
            addReportApprover(
                report,
                selectedApproverEmail,
                Number(employeeAccountID),
                currentUserDetails.accountID,
                currentUserDetails.email ?? '',
                policy,
                hasViolations,
                isASAPSubmitBetaEnabled,
                reportNextStep,
            );
        }

        // This actually clears selected reports as well
        clearSelectedTransactions();
    };

    const button = (
        <FormAlertWithSubmitButton
            isDisabled={!selectedApproverEmail}
            buttonText={translate('common.save')}
            onSubmit={addApprover}
            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
            enabledWhenOffline
            shouldBlendOpacity
        />
    );

    const toggleApprover = (approvers: SelectionListApprover[]) => {
        setSelectedApproverEmail(approvers.at(0)?.login ?? undefined);
    };

    useEffect(() => {
        if (selectedReports.length) {
            return;
        }

        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.closeRHPFlow();
        });
    }, [selectedReports.length]);

    if (isSaving) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ApproverSelectionList
            testID="SearchAddApproverPage"
            headerTitle={translate('iou.changeApprover.actions.addApprover')}
            onBackButtonPress={Navigation.goBack}
            subtitle={
                <Text style={[styles.ph5, styles.pb3]}>
                    {translate(selectedReports.length === 1 ? 'iou.changeApprover.addApprover.subtitle' : 'iou.changeApprover.addApprover.bulkSubtitle')}
                </Text>
            }
            isLoadingReportData={false}
            policy={allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReports.at(0)?.policyID}`]}
            initiallyFocusedOptionKey={selectedApproverEmail}
            shouldShowNotFoundViewLink={false}
            shouldShowNotFoundView={false}
            allApprovers={allApprovers}
            listEmptyContentSubtitle={translate(selectedReports.length === 1 ? 'workflowsPage.emptyContent.approverSubtitle' : 'workflowsPage.emptyContent.bulkApproverSubtitle')}
            allowMultipleSelection={false}
            onSelectApprover={toggleApprover}
            footerContent={button}
        />
    );
}

export default SearchAddApproverPage;
