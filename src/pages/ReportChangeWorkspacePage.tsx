import React, {useCallback} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import type {WorkspaceListItem} from '@hooks/useWorkspaceList';
import useWorkspaceList from '@hooks/useWorkspaceList';
import {changeReportPolicy, changeReportPolicyAndInviteSubmitter, moveIOUReportToPolicy, moveIOUReportToPolicyAndInviteSubmitter} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportChangeWorkspaceNavigatorParamList} from '@libs/Navigation/types';
import {getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import {isPolicyAdmin, isPolicyMember} from '@libs/PolicyUtils';
import {isExpenseReport, isIOUReport, isMoneyRequestReport, isMoneyRequestReportPendingDeletion, isWorkspaceEligibleForReportChange} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import NotFoundPage from './ErrorPage/NotFoundPage';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type ReportChangeWorkspacePageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportChangeWorkspaceNavigatorParamList, typeof SCREENS.REPORT_CHANGE_WORKSPACE.ROOT>;

function ReportChangeWorkspacePage({report, route}: ReportChangeWorkspacePageProps) {
    const reportID = report?.reportID;
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();

    const [policies, fetchStatus] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [reportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: false});
    const isReportLastVisibleArchived = useReportIsArchived(report?.parentReportID);
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;

    const selectPolicy = useCallback(
        (policyID?: string) => {
            const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
            if (!policyID || !policy) {
                return;
            }
            const {backTo} = route.params;
            Navigation.goBack(backTo);
            if (isIOUReport(reportID)) {
                const invite = moveIOUReportToPolicyAndInviteSubmitter(reportID, policy?.id, formatPhoneNumber);
                if (!invite?.policyExpenseChatReportID) {
                    moveIOUReportToPolicy(reportID, policy?.id);
                }
                // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
                // eslint-disable-next-line deprecation/deprecation
            } else if (isExpenseReport(report) && isPolicyAdmin(policy) && report.ownerAccountID && !isPolicyMember(policy, getLoginByAccountID(report.ownerAccountID))) {
                const employeeList = policy?.employeeList;
                changeReportPolicyAndInviteSubmitter(report, policy, employeeList, formatPhoneNumber, isReportLastVisibleArchived);
            } else {
                changeReportPolicy(report, policy, reportNextStep, isReportLastVisibleArchived);
            }
        },
        [route.params, report, reportID, reportNextStep, policies, formatPhoneNumber, isReportLastVisibleArchived],
    );

    const {sections, shouldShowNoResultsFoundMessage, shouldShowSearchInput} = useWorkspaceList({
        policies,
        currentUserLogin: session?.email,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyIDs: report.policyID ? [report.policyID] : undefined,
        searchTerm: debouncedSearchTerm,
        localeCompare,
        additionalFilter: (newPolicy) => isWorkspaceEligibleForReportChange(newPolicy, report, policies),
    });

    if (!isMoneyRequestReport(report) || isMoneyRequestReportPendingDeletion(report)) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID={ReportChangeWorkspacePage.displayName}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            {({didScreenTransitionEnd}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('iou.changeWorkspace')}
                        onBackButtonPress={() => {
                            const {backTo} = route.params;
                            Navigation.goBack(backTo);
                        }}
                    />
                    {shouldShowLoadingIndicator ? (
                        <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                    ) : (
                        <SelectionList<WorkspaceListItem>
                            ListItem={UserListItem}
                            sections={sections}
                            onSelectRow={(option) => selectPolicy(option.policyID)}
                            textInputLabel={shouldShowSearchInput ? translate('common.search') : undefined}
                            textInputValue={searchTerm}
                            onChangeText={setSearchTerm}
                            headerMessage={shouldShowNoResultsFoundMessage ? translate('common.noResultsFound') : ''}
                            initiallyFocusedOptionKey={report.policyID}
                            showLoadingPlaceholder={fetchStatus.status === 'loading' || !didScreenTransitionEnd}
                        />
                    )}
                </>
            )}
        </ScreenWrapper>
    );
}

ReportChangeWorkspacePage.displayName = 'ReportChangeWorkspacePage';

export default withReportOrNotFound()(ReportChangeWorkspacePage);
