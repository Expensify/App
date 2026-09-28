import ApproverSelectionList from '@components/ApproverSelectionList';
import type {SelectionListApprover} from '@components/ApproverSelectionList';
import Badge from '@components/Badge';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';
import usePressLoading from '@hooks/usePressLoading';
import useReportTransactions from '@hooks/useReportTransactions';
import useReportTransactionViolations from '@hooks/useReportTransactionViolations';
import useThemeStyles from '@hooks/useThemeStyles';

import {addReportApprover} from '@libs/actions/IOU/ReportWorkflow';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportChangeApproverParamList} from '@libs/Navigation/types';
import {getMemberAccountIDsForWorkspace, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {
    getDisplayNameForParticipant,
    hasViolations as hasViolationsReportUtils,
    isAllowedToApproveExpenseReport,
    isMoneyRequestReport,
    isMoneyRequestReportPendingDeletion,
    isProcessingReport,
} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useState} from 'react';

import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';

import withReportOrNotFound from './inbox/report/withReportOrNotFound';

type ReportReassignApproverPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportChangeApproverParamList, typeof SCREENS.REPORT_CHANGE_APPROVER.REASSIGN_APPROVER>;

function ReportReassignApproverPage({report, policy, isLoadingReportData}: ReportReassignApproverPageProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const [personalDetails] = useAllPersonalDetails();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);
    const [selectedMemberEmail, setSelectedMemberEmail] = useState<string>();
    const {isLoading, startWithLoading} = usePressLoading();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const reportTransactions = useReportTransactions(report?.reportID);
    const [transactionViolations] = useReportTransactionViolations(reportTransactions);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations, currentUserDetails.accountID, currentUserDetails.login ?? '', undefined, reportTransactions);

    const isApprovalEnabled = !!policy?.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    const shouldShowNotFoundView =
        (isEmptyObject(policy) && !isLoadingReportData) ||
        !isPolicyAdmin(policy) ||
        isPendingDeletePolicy(policy) ||
        !isMoneyRequestReport(report) ||
        isMoneyRequestReportPendingDeletion(report) ||
        !isProcessingReport(report) ||
        !isApprovalEnabled;

    const employeeList = policy?.employeeList;
    const allApprovers = (() => {
        if (!employeeList) {
            return [];
        }

        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(employeeList, undefined, true, false);
        // Resolve the translation once, not per member.
        const hiddenText = translate('common.hidden');
        const memberOptions = Object.values(employeeList)
            .map((employee): SelectionListApprover | null => {
                const email = employee.email;
                if (!email) {
                    return null;
                }

                const accountID = policyMemberEmailsToAccountIDs[email];

                // Filter out the current approver, members pending deletion, members who cannot approve the report, and members we cannot map to an account
                if (
                    !accountID ||
                    report.managerID === accountID ||
                    employee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
                    !isAllowedToApproveExpenseReport(report, accountID, policy)
                ) {
                    return null;
                }

                const displayName = getDisplayNameForParticipant({accountID, personalDetailsData: personalDetails, formatPhoneNumber, hiddenTranslation: hiddenText});
                const {avatar} = personalDetails?.[accountID] ?? {};
                return {
                    text: displayName,
                    alternateText: email,
                    keyForList: email,
                    login: email,
                    value: accountID,
                    isSelected: selectedMemberEmail === email,
                    icons: [{source: avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
                    rightElement: employee.role === CONST.POLICY.ROLE.ADMIN ? <Badge text={translate('common.admin')} /> : undefined,
                };
            })
            .filter((member): member is SelectionListApprover => !!member);

        return memberOptions;
    })();

    const save = () => {
        const newApproverAccountID = allApprovers.find((member) => member.login === selectedMemberEmail)?.value;
        if (!selectedMemberEmail || !newApproverAccountID) {
            return;
        }
        startWithLoading(() => {
            addReportApprover({
                report,
                newApproverEmail: selectedMemberEmail,
                newApproverAccountID: Number(newApproverAccountID),
                accountID: currentUserDetails.accountID,
                email: currentUserDetails.email ?? '',
                policy,
                rules,
                hasViolations,
                isASAPSubmitBetaEnabled: isBetaEnabled(CONST.BETAS.ASAP_SUBMIT),
                isTrackIntentUser,
                formatPhoneNumber,
                isReassignment: true,
            });
            Navigation.dismissToPreviousRHP();
        });
    };

    const footerContent = (
        <FormAlertWithSubmitButton
            isDisabled={!selectedMemberEmail}
            buttonText={translate('common.save')}
            onSubmit={save}
            isLoading={isLoading}
            shouldShowLoadingImmediatelyOnPress={false}
            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
            enabledWhenOffline
            blendButtonOpacity
        />
    );

    const toggleApprover = (approvers: SelectionListApprover[]) => {
        const selectedApprover = approvers.at(0);
        if (!selectedApprover?.keyForList) {
            setSelectedMemberEmail(undefined);
            return;
        }
        setSelectedMemberEmail(selectedApprover.keyForList);
    };

    return (
        <ApproverSelectionList
            testID="ReportReassignApproverPage"
            headerTitle={translate('iou.changeApprover.actions.reassignApprover')}
            onBackButtonPress={() => {
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.REPORT_CHANGE_APPROVER.path, ROUTES.REPORT_WITH_ID.getRoute(report.reportID)), {compareParams: false});
            }}
            subtitle={<Text style={[styles.ph5, styles.pb3]}>{translate('iou.changeApprover.actions.reassignApproverPageHeader')}</Text>}
            isLoadingReportData={isLoadingReportData}
            policy={policy}
            shouldShowNotFoundViewLink={false}
            shouldShowNotFoundView={shouldShowNotFoundView}
            allApprovers={allApprovers}
            listEmptyContentSubtitle={translate('workflowsPage.emptyContent.approverSubtitle')}
            allowMultipleSelection={false}
            onSelectApprover={toggleApprover}
            footerContent={footerContent}
            shouldShowLoadingPlaceholder={isLoadingReportData}
        />
    );
}

export default withReportOrNotFound()(ReportReassignApproverPage);

export {ReportReassignApproverPage};
