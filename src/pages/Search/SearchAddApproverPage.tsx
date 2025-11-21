import _ from 'lodash';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import ApproverSelectionList from '@components/ApproverSelectionList';
import Badge from '@components/Badge';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import {useSearchContext} from '@components/Search/SearchContext';
import Text from '@components/Text';
import type {SelectionListApprover} from '@components/WorkspaceMembersSelectionList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
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
    const {translate} = useLocalize();
    const [selectedApproverEmail, setSelectedApproverEmail] = useState<string | undefined>(undefined);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const {selectedReports} = useSearchContext();

    const currentUserDetails = useCurrentUserPersonalDetails();

    // Get all possible approvers from all selected reports' policies
    // An approver must be able to approve ALL selected reports
    const allApprovers = useMemo(() => {
        if (selectedReports.length === 0) {
            return [];
        }

        const uniquePolicyIds = _.uniq(selectedReports.map((selectedReport) => selectedReport.policyID));
        const employeeLists = uniquePolicyIds.map((policyID) => allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.employeeList).filter((employeeList) => !!employeeList);
        const intersectedEmployees = employeeLists.length === 0 ? {} : _.pick(employeeLists[0], _.intersection(...employeeLists.map(Object.keys)));
        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(intersectedEmployees, true, false);
        return Object.values(intersectedEmployees)
            .map((employee): SelectionListApprover | null => {
                const isAdmin = employee?.role === CONST.REPORT.ROLE.ADMIN;
                const email = employee?.email;

                if (!email) {
                    return null;
                }
                const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? CONST.DEFAULT_NUMBER_ID);
                const isPendingDelete = intersectedEmployees?.[accountID]?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

                if (isPendingDelete) {
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

                    return isAllowedToApproveExpenseReport(report, accountID, policy);
                });

                if (!canApproveAllReports) {
                    return null;
                }

                const {avatar} = personalDetails?.[accountID] ?? {};
                const displayName = getDisplayNameForParticipant({accountID, personalDetailsData: personalDetails});
                return {
                    text: displayName,
                    alternateText: email,
                    keyForList: email,
                    isSelected: selectedApproverEmail === email,
                    login: email,
                    value: accountID,
                    icons: [{source: avatar ?? FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
                    rightElement: isAdmin ? <Badge text={translate('common.admin')} /> : undefined,
                };
            })
            .filter((approver): approver is SelectionListApprover => !!approver);
    }, [selectedReports, allPolicies, allReports, personalDetails, selectedApproverEmail, translate]);

    const addApprover = useCallback(() => {
        const employeeAccountID = allApprovers.find((approver) => approver.login === selectedApproverEmail)?.value;
        if (!selectedApproverEmail || !employeeAccountID) {
            return;
        }

        selectedReports.forEach((selectedReport) => {
            const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReport.policyID}`];
            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selectedReport.reportID}`];

            if (!report || !policy || report.managerID === employeeAccountID) {
                return;
            }

            const hasViolations = hasViolationsReportUtils(report.reportID, transactionViolations);
            addReportApprover(
                report,
                selectedApproverEmail,
                Number(employeeAccountID),
                currentUserDetails.accountID,
                currentUserDetails.email ?? '',
                policy,
                hasViolations,
                isASAPSubmitBetaEnabled,
            );
        });

        Navigation.closeRHPFlow();
    }, [
        allApprovers,
        selectedApproverEmail,
        selectedReports,
        allPolicies,
        allReports,
        transactionViolations,
        currentUserDetails.accountID,
        currentUserDetails.email,
        isASAPSubmitBetaEnabled,
    ]);

    const button = useMemo(() => {
        return (
            <FormAlertWithSubmitButton
                isDisabled={!selectedApproverEmail}
                buttonText={translate('common.save')}
                onSubmit={addApprover}
                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                enabledWhenOffline
                shouldBlendOpacity
            />
        );
    }, [addApprover, selectedApproverEmail, styles.flexBasisAuto, styles.flexGrow0, styles.flexReset, styles.flexShrink0, translate]);

    const toggleApprover = useCallback((approvers: SelectionListApprover[]) => {
        setSelectedApproverEmail(approvers.length ? approvers.at(0)?.login : undefined);
    }, []);

    useEffect(() => {
        if (selectedReports.length === 0) {
            Navigation.closeRHPFlow();
        }
    }, [selectedReports]);

    return (
        <ApproverSelectionList
            testID={SearchAddApproverPage.displayName}
            headerTitle={translate('iou.changeApprover.actions.addApprover')}
            onBackButtonPress={Navigation.goBack}
            subtitle={
                <Text style={[styles.ph5, styles.pb3]}>
                    {selectedReports.length === 1 ? translate('iou.changeApprover.addApprover.subtitle') : translate('iou.changeApprover.addApprover.bulkSubtitle')}
                </Text>
            }
            isLoadingReportData={false}
            policy={allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReports[0]?.policyID}`]}
            initiallyFocusedOptionKey={selectedApproverEmail}
            shouldShowNotFoundViewLink={false}
            shouldShowNotFoundView={false}
            allApprovers={allApprovers}
            listEmptyContentSubtitle={translate('workflowsPage.emptyContent.bulkApproverSubtitle')}
            allowMultipleSelection={false}
            onSelectApprover={toggleApprover}
            footerContent={button}
        />
    );
}

SearchAddApproverPage.displayName = 'SearchAddApproverPage';

export default SearchAddApproverPage;
