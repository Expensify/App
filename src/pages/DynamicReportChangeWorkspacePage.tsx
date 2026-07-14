import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useSession} from '@components/OnyxListItemProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {WorkspaceListItemType} from '@components/SelectionList/ListItem/types';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import usePermissions from '@hooks/usePermissions';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactions from '@hooks/useReportTransactions';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceList from '@hooks/useWorkspaceList';

import {changeReportPolicy, changeReportPolicyAndInviteSubmitter, moveIOUReportToPolicy, moveIOUReportToPolicyAndInviteSubmitter} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportChangeWorkspaceNavigatorParamList} from '@libs/Navigation/types';
import {isPolicyAdmin, isPolicyMember} from '@libs/PolicyUtils';
import {
    getAllPolicyExpenseChatReportActions,
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
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {doesPersonalDetailExistSelector, personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import type {DismissedProductTraining} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React from 'react';
import {View} from 'react-native';

import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';

import NotFoundPage from './ErrorPage/NotFoundPage';
import withReportOrNotFound from './inbox/report/withReportOrNotFound';

type DynamicReportChangeWorkspacePageProps = WithReportOrNotFoundProps &
    PlatformStackScreenProps<ReportChangeWorkspaceNavigatorParamList, typeof SCREENS.REPORT_CHANGE_WORKSPACE.DYNAMIC_ROOT>;

const changePolicyTrainingModalDismissedSelector = (nvpDismissedProductTraining: OnyxEntry<DismissedProductTraining>): boolean =>
    !!nvpDismissedProductTraining?.[CONST.CHANGE_POLICY_TRAINING_MODAL];

function DynamicReportChangeWorkspacePage({report}: DynamicReportChangeWorkspacePageProps) {
    const reportID = report?.reportID;
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const {translate, formatPhoneNumber, localeCompare} = useLocalize();
    const reportTransactions = useReportTransactions(reportID);

    const reportPreviewAction = useParentReportAction(report);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [policies, fetchStatus] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [reportNextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`);
    const [isChangePolicyTrainingModalDismissed = false] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {selector: changePolicyTrainingModalDismissedSelector});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const isReportLastVisibleArchived = useReportIsArchived(report?.parentReportID);
    const [submitterLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(report?.ownerAccountID)}, [report?.ownerAccountID]);
    const [doesSubmitterPersonalDetailExist] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: doesPersonalDetailExistSelector(report?.ownerAccountID)}, [report?.ownerAccountID]);
    const [managerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(report?.managerID)}, [report?.managerID]);
    const shouldShowLoadingIndicator = isLoadingApp && !isOffline;
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const session = useSession();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [userBillingGracePeriods] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const navigateBackFromChangeWorkspacePath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_CHANGE_WORKSPACE.path);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const selectPolicy = (policyID?: string) => {
        const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
        if (!policyID || !policy) {
            return;
        }
        if (shouldRestrictUserBillableActions(policy, ownerBillingGracePeriodEnd, userBillingGracePeriods, amountOwed, currentUserPersonalDetails.accountID)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
            return;
        }
        Navigation.goBack(navigateBackFromChangeWorkspacePath);
        const filteredReportActions = getAllPolicyExpenseChatReportActions(allReports, allReportActions);
        if (isIOUReport(reportID)) {
            const invite = moveIOUReportToPolicyAndInviteSubmitter(
                report,
                policy,
                formatPhoneNumber,
                filteredReportActions,
                reportPreviewAction,
                session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
                submitterLogin,
                doesSubmitterPersonalDetailExist ?? false,
                reportTransactions,
            );
            if (!invite?.policyExpenseChatReportID) {
                moveIOUReportToPolicy(report, policy, reportPreviewAction, false, reportTransactions);
            }
            return;
            // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        }

        if (isExpenseReport(report) && isPolicyAdmin(policy) && report.ownerAccountID && !isPolicyMember(policy, submitterLogin)) {
            const employeeList = policy?.employeeList;
            changeReportPolicyAndInviteSubmitter({
                report,
                parentReport,
                policy,
                personalDetails: {[report.ownerAccountID]: {accountID: report.ownerAccountID}},
                currentUser: {
                    accountID: currentUserPersonalDetails.accountID,
                    displayName: currentUserPersonalDetails.displayName,
                    email: currentUserPersonalDetails.email,
                    avatar: currentUserPersonalDetails.avatar,
                },
                submitterLogin,
                managerLogin,
                hasViolationsParam: hasViolations,
                isChangePolicyTrainingModalDismissed,
                isASAPSubmitBetaEnabled,
                employeeList,
                formatPhoneNumber,
                isReportLastVisibleArchived,
                reportNextStep,
                reportActionsList: filteredReportActions,
                reportPreviewAction,
                isTrackIntentUser,
            });
            return;
        }

        changeReportPolicy({
            report,
            parentReport,
            policy,
            currentUserAccountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            email: session?.email ?? '',
            ownerLogin: submitterLogin,
            managerLogin,
            hasViolationsParam: hasViolations,
            isChangePolicyTrainingModalDismissed,
            isASAPSubmitBetaEnabled,
            reportNextStep,
            isReportLastVisibleArchived,
            reportPreviewAction,
            isTrackIntentUser,
        });
    };

    const {data, shouldShowNoResultsFoundMessage, shouldShowSearchInput} = useWorkspaceList({
        policies,
        currentUserLogin: session?.email,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyIDs: report.policyID ? [report.policyID] : undefined,
        searchTerm: debouncedSearchTerm,
        localeCompare,
        additionalFilter: (newPolicy) => {
            const isReportSettled = isSettled(report);
            const isEligible = isWorkspaceEligibleForReportChange(submitterLogin, newPolicy, report);
            if (isReportSettled) {
                return isEligible && isPolicyAdmin(newPolicy, session?.email);
            }
            return isEligible;
        },
    });

    const textInputOptions = {
        label: shouldShowSearchInput ? translate('common.search') : undefined,
        value: searchTerm,
        onChangeText: setSearchTerm,
        headerMessage: shouldShowNoResultsFoundMessage ? translate('common.noResultsFound') : '',
    };

    if (!isMoneyRequestReport(report) || isMoneyRequestReportPendingDeletion(report)) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID="DynamicReportChangeWorkspacePage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            {({didScreenTransitionEnd}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('iou.changeWorkspace')}
                        onBackButtonPress={() => {
                            Navigation.goBack(navigateBackFromChangeWorkspacePath);
                        }}
                    />
                    {shouldShowLoadingIndicator ? (
                        <View style={[styles.flex1, styles.fullScreenLoading]}>
                            <ActivityIndicator
                                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                                reasonAttributes={{context: 'DynamicReportChangeWorkspacePage', isLoadingApp: !!isLoadingApp}}
                            />
                        </View>
                    ) : (
                        <SelectionList<WorkspaceListItemType>
                            ListItem={UserListItem}
                            data={data}
                            onSelectRow={(option) => selectPolicy(option.policyID)}
                            textInputOptions={textInputOptions}
                            initiallyFocusedItemKey={report.policyID}
                            shouldShowLoadingPlaceholder={fetchStatus.status === 'loading' || !didScreenTransitionEnd}
                            disableMaintainingScrollPosition
                        />
                    )}
                </>
            )}
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(DynamicReportChangeWorkspacePage);
