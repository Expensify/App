import {delegateEmailSelector} from '@selectors/Account';
import React, {useCallback, useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchStateContext} from '@components/Search/SearchContext';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import {search} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportSubmitToNavigatorParamList} from '@libs/Navigation/types';
import {getDefaultApprover, getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils, isExpenseReport, isMoneyRequestReportPendingDeletion} from '@libs/ReportUtils';
import {submitReport} from '@userActions/IOU/ReportWorkflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import NotFoundPage from './ErrorPage/NotFoundPage';
import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';
import withReportOrNotFound from './inbox/report/withReportOrNotFound';

type WorkspaceMemberItem = ListItem & {email: string};

type ReportSubmitToPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportSubmitToNavigatorParamList, typeof SCREENS.REPORT_SUBMIT_TO.ROOT>;

function ReportSubmitToPage({report, policy, isLoadingReportData}: ReportSubmitToPageProps) {
    const {translate} = useLocalize();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const {isBetaEnabled} = usePermissions();
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${report?.reportID}`);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const {isOffline} = useNetwork();
    const {currentSearchQueryJSON, currentSearchKey, currentSearchResults} = useSearchStateContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);

    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations, currentUserDetails.accountID, currentUserDetails.login ?? '');

    const prepopulatedEmail = useMemo(() => {
        const login = currentUserDetails.login ?? '';
        const submitsTo = policy?.employeeList?.[login]?.submitsTo?.trim();
        return submitsTo ?? getDefaultApprover(policy) ?? '';
    }, [policy, currentUserDetails.login]);

    const [userSelectedManagerEmail, setUserSelectedManagerEmail] = useState<string | undefined>();
    const managerEmail = userSelectedManagerEmail ?? prepopulatedEmail;

    const workspaceMembers = useMemo((): WorkspaceMemberItem[] => {
        const employeeList = policy?.employeeList;
        if (!employeeList) {
            return [];
        }
        const emailsToAccountIDs = getMemberAccountIDsForWorkspace(employeeList, true, false);
        return Object.values(employeeList).flatMap((employee): WorkspaceMemberItem[] => {
            const email = employee.email?.trim();
            if (!email || employee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return [];
            }
            const accountID = emailsToAccountIDs[email];
            if (!accountID) {
                return [];
            }
            const details = personalDetails?.[accountID];
            const displayName = details?.displayName ?? details?.login ?? email;
            return [
                {
                    text: displayName,
                    alternateText: email,
                    keyForList: email,
                    email,
                    isSelected: managerEmail.trim().toLowerCase() === email.toLowerCase(),
                },
            ];
        });
    }, [policy?.employeeList, personalDetails, managerEmail]);

    const handleSubmit = useCallback(() => {
        const trimmed = managerEmail.trim();
        if (!report) {
            return;
        }
        submitReport({
            expenseReport: report,
            policy,
            currentUserAccountIDParam: currentUserDetails.accountID,
            currentUserEmailParam: currentUserDetails.email ?? '',
            hasViolations,
            isASAPSubmitBetaEnabled,
            expenseReportCurrentNextStepDeprecated: nextStep,
            userBillingGracePeriodEnds,
            amountOwed,
            ownerBillingGracePeriodEnd,
            delegateEmail,
            managerEmail: trimmed,
            onSubmitted: () => {
                if (currentSearchQueryJSON && !isOffline) {
                    search({
                        searchKey: currentSearchKey,
                        shouldCalculateTotals,
                        offset: 0,
                        queryJSON: currentSearchQueryJSON,
                        isOffline,
                        isLoading: !!currentSearchResults?.search?.isLoading,
                    });
                }
                Navigation.dismissToPreviousRHP();
            },
        });
    }, [
        managerEmail,
        report,
        policy,
        currentUserDetails.accountID,
        currentUserDetails.email,
        hasViolations,
        isASAPSubmitBetaEnabled,
        nextStep,
        userBillingGracePeriodEnds,
        amountOwed,
        ownerBillingGracePeriodEnd,
        delegateEmail,
        currentSearchQueryJSON,
        isOffline,
        currentSearchKey,
        shouldCalculateTotals,
        currentSearchResults?.search?.isLoading,
    ]);

    const onSelectMember = useCallback((item: WorkspaceMemberItem) => {
        setUserSelectedManagerEmail(item.email);
    }, []);

    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isExpenseReport(report) || isMoneyRequestReportPendingDeletion(report);

    const confirmButtonOptions = useMemo(
        () => ({
            showButton: true,
            text: translate('common.submit'),
            onConfirm: handleSubmit,
        }),
        [handleSubmit, translate],
    );

    if (shouldShowNotFoundView) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID="ReportSubmitToPage"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.submitTo')}
                onBackButtonPress={Navigation.goBack}
            />
            <SelectionList
                data={workspaceMembers}
                ListItem={SingleSelectListItem}
                onSelectRow={onSelectMember}
                confirmButtonOptions={confirmButtonOptions}
                shouldUpdateFocusedIndex
                initiallyFocusedItemKey={workspaceMembers.find((m) => m.isSelected)?.keyForList}
                disableMaintainingScrollPosition
                addBottomSafeAreaPadding
            />
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(ReportSubmitToPage);
