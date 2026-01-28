import React, {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useSession} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {WorkspaceListItemType} from '@components/SelectionList/ListItem/types';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactions from '@hooks/useReportTransactions';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceList from '@hooks/useWorkspaceList';
import {changeReportPolicy, changeReportPolicyAndInviteSubmitter, moveIOUReportToPolicy, moveIOUReportToPolicyAndInviteSubmitter} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportChangeWorkspaceNavigatorParamList} from '@libs/Navigation/types';
import {getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import {isPolicyAdmin, isPolicyMember} from '@libs/PolicyUtils';
import {
    hasViolations as hasViolationsReportUtils,
    isExpenseReport,
    isIOUReport,
    isMoneyRequestReport,
    isMoneyRequestReportPendingDeletion,
    isSettled,
    isWorkspaceEligibleForReportChange,
} from '@libs/ReportUtils';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {DismissedProductTraining, PersonalDetailsList} from '@src/types/onyx';
import NotFoundPage from './ErrorPage/NotFoundPage';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type ReportChangeWorkspacePageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportChangeWorkspaceNavigatorParamList, typeof SCREENS.REPORT_CHANGE_WORKSPACE.ROOT>;

const changePolicyTrainingModalDismissedSelector = (nvpDismissedProductTraining: OnyxEntry<DismissedProductTraining>): boolean =>
    !!nvpDismissedProductTraining?.[CONST.CHANGE_POLICY_TRAINING_MODAL];

function ReportChangeWorkspacePage({report, route}: ReportChangeWorkspacePageProps) {
    const reportID = report?.reportID;
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const reportTransactions = useReportTransactions(reportID);

    const [policies, fetchStatus] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [reportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`, {canBeMissing: true});
    const [isChangePolicyTrainingModalDismissed = false] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true, selector: changePolicyTrainingModalDismissedSelector});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: false});
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const isReportLastVisibleArchived = useReportIsArchived(report?.parentReportID);
    const reportOwnerAccountID = report?.ownerAccountID;
    const submitterEmailSelector = useCallback(
        (personalDetailsList: OnyxEntry<PersonalDetailsList>) => personalDetailsList?.[reportOwnerAccountID ?? CONST.DEFAULT_NUMBER_ID]?.login,
        [reportOwnerAccountID],
    );
    const [submitterEmail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false, selector: submitterEmailSelector}, [submitterEmailSelector]);
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const isCustomReportNamesBetaEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_REPORT_NAMES);
    const session = useSession();
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');

    const selectPolicy = useCallback(
        (policyID?: string) => {
            const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
            if (!policyID || !policy) {
                return;
            }
            if (shouldRestrictUserBillableActions(policy.id)) {
                Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                return;
            }
            const {backTo} = route.params;
            Navigation.goBack(backTo);
            if (isIOUReport(reportID)) {
                const invite = moveIOUReportToPolicyAndInviteSubmitter(report, policy, formatPhoneNumber, reportTransactions, isCustomReportNamesBetaEnabled);
                if (!invite?.policyExpenseChatReportID) {
                    moveIOUReportToPolicy(report, policy, false, reportTransactions, isCustomReportNamesBetaEnabled);
                }
                // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
                // eslint-disable-next-line @typescript-eslint/no-deprecated
            } else if (isExpenseReport(report) && isPolicyAdmin(policy) && report.ownerAccountID && !isPolicyMember(policy, getLoginByAccountID(report.ownerAccountID))) {
                const employeeList = policy?.employeeList;
                changeReportPolicyAndInviteSubmitter(
                    report,
                    policy,
                    session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    session?.email ?? '',
                    hasViolations,
                    isChangePolicyTrainingModalDismissed,
                    isASAPSubmitBetaEnabled,
                    employeeList,
                    formatPhoneNumber,
                    isReportLastVisibleArchived,
                );
            } else {
                changeReportPolicy(
                    report,
                    policy,
                    session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                    session?.email ?? '',
                    hasViolations,
                    isChangePolicyTrainingModalDismissed,
                    isASAPSubmitBetaEnabled,
                    reportNextStep,
                    isReportLastVisibleArchived,
                );
            }
        },
        [
            policies,
            route.params,
            reportID,
            report,
            formatPhoneNumber,
            reportTransactions,
            isReportLastVisibleArchived,
            session?.accountID,
            session?.email,
            hasViolations,
            isASAPSubmitBetaEnabled,
            isCustomReportNamesBetaEnabled,
            reportNextStep,
            isChangePolicyTrainingModalDismissed,
        ],
    );

    const {data, shouldShowNoResultsFoundMessage, shouldShowSearchInput} = useWorkspaceList({
        policies,
        currentUserLogin: session?.email,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyIDs: report.policyID ? [report.policyID] : undefined,
        searchTerm: debouncedSearchTerm,
        localeCompare,
        additionalFilter: (newPolicy) => {
            const isReportSettled = isSettled(report);
            const isEligible = isWorkspaceEligibleForReportChange(submitterEmail, newPolicy, report);
            if (isReportSettled) {
                return isEligible && isPolicyAdmin(newPolicy, session?.email);
            }
            return isEligible;
        },
    });

    const textInputOptions = useMemo(
        () => ({
            label: shouldShowSearchInput ? translate('common.search') : undefined,
            value: searchTerm,
            onChangeText: setSearchTerm,
            headerMessage: shouldShowNoResultsFoundMessage ? translate('common.noResultsFound') : '',
        }),
        [searchTerm, setSearchTerm, shouldShowNoResultsFoundMessage, shouldShowSearchInput, translate],
    );

    if (!isMoneyRequestReport(report) || isMoneyRequestReportPendingDeletion(report)) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID="ReportChangeWorkspacePage"
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
                        <SelectionList<WorkspaceListItemType>
                            ListItem={UserListItem}
                            data={data}
                            onSelectRow={(option) => selectPolicy(option.policyID)}
                            textInputOptions={textInputOptions}
                            initiallyFocusedItemKey={report.policyID}
                            showLoadingPlaceholder={fetchStatus.status === 'loading' || !didScreenTransitionEnd}
                            disableMaintainingScrollPosition
                        />
                    )}
                </>
            )}
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(ReportChangeWorkspacePage);
