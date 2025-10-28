import React, {useCallback, useMemo, useState} from 'react';
import ApproverSelectionList from '@components/ApproverSelectionList';
import Badge from '@components/Badge';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import Text from '@components/Text';
import type {SelectionListApprover} from '@components/WorkspaceMembersSelectionList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {addReportApprover} from '@libs/actions/IOU';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportChangeApproverParamList} from '@libs/Navigation/types';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import {
    getDisplayNameForParticipant,
    hasViolations as hasViolationsReportUtils,
    isAllowedToApproveExpenseReport,
    isMoneyRequestReport,
    isMoneyRequestReportPendingDeletion,
} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type ReportAddApproverPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportChangeApproverParamList, typeof SCREENS.REPORT_CHANGE_APPROVER.ADD_APPROVER>;

function ReportAddApproverPage({report, isLoadingReportData, policy}: ReportAddApproverPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [selectedApproverEmail, setSelectedApproverEmail] = useState<string | undefined>(undefined);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations);

    const currentUserDetails = useCurrentUserPersonalDetails();

    const employeeList = policy?.employeeList;
    const allApprovers = useMemo(() => {
        if (!employeeList) {
            return [];
        }

        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(employeeList, true, false);
        return Object.values(employeeList)
            .map((employee): SelectionListApprover | null => {
                const isAdmin = employee?.role === CONST.REPORT.ROLE.ADMIN;
                const email = employee.email;

                if (!email) {
                    return null;
                }
                const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? CONST.DEFAULT_NUMBER_ID);
                const isPendingDelete = employeeList?.[accountID]?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

                // Filter the current report approver and members which are pending for deletion
                if (report.managerID === accountID || isPendingDelete || !isAllowedToApproveExpenseReport(report, accountID, policy)) {
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
    }, [employeeList, report, policy, personalDetails, selectedApproverEmail, translate]);

    const addApprover = useCallback(() => {
        const employeeAccountID = allApprovers.find((approver) => approver.login === selectedApproverEmail)?.value;
        if (!selectedApproverEmail || !employeeAccountID) {
            return;
        }
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
        Navigation.dismissModal();
    }, [allApprovers, selectedApproverEmail, report, currentUserDetails.accountID, currentUserDetails.email, policy, hasViolations, isASAPSubmitBetaEnabled]);

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

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = !isMoneyRequestReport(report) || isMoneyRequestReportPendingDeletion(report);

    return (
        <ApproverSelectionList
            testID={ReportAddApproverPage.displayName}
            headerTitle={translate('iou.changeApprover.actions.addApprover')}
            onBackButtonPress={() => {
                Navigation.goBack(ROUTES.REPORT_CHANGE_APPROVER.getRoute(report.reportID), {compareParams: false});
            }}
            subtitle={<Text style={[styles.ph5, styles.pb3]}>{translate('iou.changeApprover.addApprover.subtitle')}</Text>}
            isLoadingReportData={isLoadingReportData}
            policy={policy}
            initiallyFocusedOptionKey={selectedApproverEmail}
            shouldShowNotFoundViewLink={false}
            shouldShowNotFoundView={shouldShowNotFoundView}
            allApprovers={allApprovers}
            listEmptyContentSubtitle={translate('workflowsPage.emptyContent.approverSubtitle')}
            allowMultipleSelection={false}
            onSelectApprover={toggleApprover}
            footerContent={button}
        />
    );
}

ReportAddApproverPage.displayName = 'ReportAddApproverPage';

export default withReportOrNotFound()(ReportAddApproverPage);
