import {delegateEmailSelector} from '@selectors/Account';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useSearchStateContext} from '@components/Search/SearchContext';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useThemeStyles from '@hooks/useThemeStyles';
import {search} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultApprover, getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import {hasViolations as hasViolationsReportUtils, isExpenseReport, isMoneyRequestReportPendingDeletion} from '@libs/ReportUtils';
import {submitReport} from '@userActions/IOU/ReportWorkflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceMemberItem = ListItem & {email: string};

type ReportSubmitToContentProps = {
    report: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    isLoadingReportData: OnyxEntry<boolean>;
    onDismiss: () => void;
    /** When true, shows a compact title row (e.g. inside a popover). */
    shouldShowTitle?: boolean;
    /** Called after submit API path invokes success (e.g. primary-action payment animation). */
    onSubmitSuccess?: () => void;
    /** When false, skips closing the RHP stack after submit (e.g. submit-to popover on report screen). */
    shouldDismissRHPAfterSubmit?: boolean;
};

function ReportSubmitToContent({report, policy, isLoadingReportData, onDismiss, shouldShowTitle = false, onSubmitSuccess, shouldDismissRHPAfterSubmit = true}: ReportSubmitToContentProps) {
    const styles = useThemeStyles();
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
                onSubmitSuccess?.();
                onDismiss();
                if (shouldDismissRHPAfterSubmit) {
                    Navigation.dismissToPreviousRHP();
                }
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
        onDismiss,
        onSubmitSuccess,
        shouldDismissRHPAfterSubmit,
    ]);

    const onSelectMember = useCallback((item: WorkspaceMemberItem) => {
        setUserSelectedManagerEmail(item.email);
    }, []);

    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isExpenseReport(report) || isMoneyRequestReportPendingDeletion(report);

    const confirmButtonOptions = useMemo(
        () => ({
            showButton: true,
            text: translate('common.confirm'),
            onConfirm: handleSubmit,
        }),
        [handleSubmit, translate],
    );

    if (shouldShowNotFoundView) {
        return (
            <View style={[styles.ph5, styles.pv4]}>
                <Text style={[styles.textNormal]}>{translate('notFound.noAccess')}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.w100, styles.flexColumn, shouldShowTitle && styles.gap2]}>
            {!!shouldShowTitle && <Text style={[styles.textStrong, styles.ph3, styles.pt3]}>{translate('common.submitTo')}</Text>}
            <SelectionList
                data={workspaceMembers}
                ListItem={SingleSelectListItem}
                onSelectRow={onSelectMember}
                confirmButtonOptions={confirmButtonOptions}
                shouldUpdateFocusedIndex
                initiallyFocusedItemKey={workspaceMembers.find((m) => m.isSelected)?.keyForList}
                disableMaintainingScrollPosition
                addBottomSafeAreaPadding={!shouldShowTitle}
            />
        </View>
    );
}

export type {ReportSubmitToContentProps};
export default ReportSubmitToContent;
