import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import type {WorkspaceListItem} from '@hooks/useWorkspaceList';
import useWorkspaceList from '@hooks/useWorkspaceList';
import {changeReportPolicy, moveIOUReportToPolicy, moveIOUReportToPolicyAndInviteSubmitter} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportChangeWorkspaceNavigatorParamList} from '@libs/Navigation/types';
import {getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import {getPolicy, isPolicyAdmin, isPolicyMember, isWorkspaceEligibleForReportChange} from '@libs/PolicyUtils';
import {isIOUReport, isMoneyRequestReport, isMoneyRequestReportPendingDeletion} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import NotFoundPage from './ErrorPage/NotFoundPage';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type ReportChangeWorkspacePageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportChangeWorkspaceNavigatorParamList, typeof SCREENS.REPORT_CHANGE_WORKSPACE.ROOT>;

function ReportChangeWorkspacePage({report}: ReportChangeWorkspacePageProps) {
    const reportID = report?.reportID;
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate} = useLocalize();

    const [policies, fetchStatus] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const oldPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;

    const selectPolicy = useCallback(
        (policyID?: string) => {
            if (!policyID) {
                return;
            }
            Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(reportID));
            if (isIOUReport(reportID) && isPolicyAdmin(getPolicy(policyID)) && report.ownerAccountID && !isPolicyMember(getLoginByAccountID(report.ownerAccountID), policyID)) {
                moveIOUReportToPolicyAndInviteSubmitter(reportID, policyID);
            } else if (isIOUReport(reportID) && isPolicyMember(currentUserLogin, policyID)) {
                moveIOUReportToPolicy(reportID, policyID);
            } else {
                changeReportPolicy(reportID, policyID);
            }
        },
        [currentUserLogin, report, reportID],
    );

    const {sections, shouldShowNoResultsFoundMessage, shouldShowSearchInput} = useWorkspaceList({
        policies,
        currentUserLogin,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyID: report.policyID,
        searchTerm: debouncedSearchTerm,
        additionalFilter: (newPolicy) => isWorkspaceEligibleForReportChange(newPolicy, report, oldPolicy, currentUserLogin),
    });

    if (!isMoneyRequestReport(report) || isMoneyRequestReportPendingDeletion(report) || (!report.total && !report.unheldTotal)) {
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
                        onBackButtonPress={Navigation.goBack}
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
