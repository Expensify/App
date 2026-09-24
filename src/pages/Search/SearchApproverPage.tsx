import ApproverSelectionList from '@components/ApproverSelectionList';
import type {SelectionListApprover} from '@components/ApproverSelectionList';
import Badge from '@components/Badge';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import {useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import usePressLoading from '@hooks/usePressLoading';
import useThemeStyles from '@hooks/useThemeStyles';

import {addReportApprover} from '@libs/actions/IOU/ReportWorkflow';
import Navigation from '@libs/Navigation/Navigation';
import {getMemberAccountIDsForWorkspace, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {getDisplayNameForParticipant, hasViolations as hasViolationsReportUtils, isAllowedToApproveExpenseReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import lodashIntersection from 'lodash/intersection';
import lodashPick from 'lodash/pick';
import React, {useEffect, useState} from 'react';

type SearchApproverPageProps = {
    isReassignment?: boolean;
};

function SearchApproverPage({isReassignment = false}: SearchApproverPageProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const [selectedApproverEmail, setSelectedApproverEmail] = useState<string | undefined>(undefined);
    const [personalDetails] = useAllPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {selectedReports} = useSearchSelectionContext();
    const {isLoading, startWithLoading} = usePressLoading();

    const currentUserDetails = useCurrentUserPersonalDetails();
    const isLoadingReportData = selectedReports.some(
        (selectedReport) => !allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReport.reportID}`] || !allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`],
    );

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
        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(intersectedEmployees, undefined, true, false);
        // We get the intersection here because the selected approver must belong to every workspace
        // Resolve the translation once, not per member.
        const hiddenText = translate('common.hidden');
        return Object.values(intersectedEmployees)
            .map((employee): SelectionListApprover | null => {
                const email = employee?.email;

                if (!email) {
                    return null;
                }
                const accountID = policyMemberEmailsToAccountIDs[email];
                if (!accountID) {
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
                    const policyEmployee = policy?.employeeList?.[email];

                    if (!report || !policy || !policyEmployee || policyEmployee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
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
                const displayName = getDisplayNameForParticipant({accountID, formatPhoneNumber, personalDetailsData: personalDetails, hiddenTranslation: hiddenText});
                return {
                    text: displayName,
                    alternateText: email,
                    keyForList: email,
                    isSelected: selectedApproverEmail === email,
                    login: email,
                    value: accountID,
                    icons: [{source: avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
                    rightElement: employee.role === CONST.POLICY.ROLE.ADMIN ? <Badge text={translate('common.admin')} /> : undefined,
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

        startWithLoading(() => {
            for (const selectedReport of selectedReports) {
                const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
                const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReport.reportID}`];

                if (!report || !policy || report.managerID === employeeAccountID) {
                    continue;
                }

                const hasViolations = hasViolationsReportUtils(report.reportID, transactionViolations, currentUserDetails.accountID, currentUserDetails.email ?? '');
                addReportApprover({
                    report,
                    newApproverEmail: selectedApproverEmail,
                    newApproverAccountID: Number(employeeAccountID),
                    accountID: currentUserDetails.accountID,
                    email: currentUserDetails.email ?? '',
                    policy,
                    rules,
                    hasViolations,
                    isASAPSubmitBetaEnabled,
                    isTrackIntentUser,
                    formatPhoneNumber,
                    isReassignment,
                });
            }

            // Note: This clears both reports and transactions
            clearSelectedTransactions();
        });
    };

    const button = (
        <FormAlertWithSubmitButton
            isDisabled={!selectedApproverEmail}
            buttonText={translate('common.save')}
            onSubmit={addApprover}
            isLoading={isLoading}
            shouldShowLoadingImmediatelyOnPress={false}
            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
            enabledWhenOffline
            blendButtonOpacity
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

    const canReassignAllReports = selectedReports.every((selectedReport) => {
        const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
        return !!policy && isPolicyAdmin(policy) && !isPendingDeletePolicy(policy);
    });

    if (isLoading) {
        return <FullScreenLoadingIndicator />;
    }

    let subtitleKey: 'iou.changeApprover.actions.reassignApproverPageHeader' | 'iou.changeApprover.addApprover.subtitle' | 'iou.changeApprover.addApprover.bulkSubtitle';
    if (isReassignment) {
        subtitleKey = 'iou.changeApprover.actions.reassignApproverPageHeader';
    } else if (selectedReports.length === 1) {
        subtitleKey = 'iou.changeApprover.addApprover.subtitle';
    } else {
        subtitleKey = 'iou.changeApprover.addApprover.bulkSubtitle';
    }

    return (
        <ApproverSelectionList
            testID={isReassignment ? 'SearchReassignApproverPage' : 'SearchAddApproverPage'}
            headerTitle={translate(isReassignment ? 'iou.changeApprover.actions.reassignApprover' : 'iou.changeApprover.actions.addApprover')}
            onBackButtonPress={Navigation.goBack}
            subtitle={<Text style={[styles.ph5, styles.pb3]}>{translate(subtitleKey)}</Text>}
            isLoadingReportData={isLoadingReportData}
            policy={allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReports.at(0)?.policyID}`]}
            shouldShowNotFoundViewLink={false}
            shouldShowNotFoundView={isReassignment && !canReassignAllReports}
            allApprovers={allApprovers}
            listEmptyContentSubtitle={translate(selectedReports.length === 1 ? 'workflowsPage.emptyContent.approverSubtitle' : 'workflowsPage.emptyContent.bulkApproverSubtitle')}
            allowMultipleSelection={false}
            onSelectApprover={toggleApprover}
            footerContent={button}
            shouldShowLoadingPlaceholder={isLoadingReportData}
        />
    );
}

export default SearchApproverPage;
