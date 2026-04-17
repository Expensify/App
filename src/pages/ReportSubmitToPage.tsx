import {delegateEmailSelector} from '@selectors/Account';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchStateContext} from '@components/Search/SearchContext';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useThemeStyles from '@hooks/useThemeStyles';
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
    const styles = useThemeStyles();
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
        return submitsTo || getDefaultApprover(policy) || '';
    }, [policy, currentUserDetails.login]);

    const [managerEmail, setManagerEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        setManagerEmail(prepopulatedEmail);
    }, [prepopulatedEmail]);

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
        if (!trimmed) {
            setEmailError(translate('common.error.fieldRequired'));
            return;
        }
        if (!Str.isValidEmail(trimmed)) {
            setEmailError(translate('messages.errorMessageInvalidEmail'));
            return;
        }
        setEmailError('');
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
        translate,
        currentSearchQueryJSON,
        isOffline,
        currentSearchKey,
        shouldCalculateTotals,
        currentSearchResults?.search?.isLoading,
    ]);

    const listHeader = useMemo(
        () => (
            <View style={[styles.ph5, styles.pb4]}>
                <Text style={[styles.textLabelSupporting, styles.mb3]}>{translate('iou.submitReportTo.subtitle')}</Text>
                <Text style={[styles.textLabel, styles.mb2]}>{translate('iou.submitReportTo.emailLabel')}</Text>
                <TextInput
                    value={managerEmail}
                    onChangeText={(text) => {
                        setManagerEmail(text);
                        if (emailError) {
                            setEmailError('');
                        }
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                />
                {!!emailError && (
                    <FormHelpMessage
                        isError
                        style={[styles.mt2]}
                        message={emailError}
                    />
                )}
                <Text style={[styles.textLabel, styles.mt5, styles.mb2]}>{translate('iou.submitReportTo.workspaceMembers')}</Text>
            </View>
        ),
        [styles.ph5, styles.pb4, styles.textLabelSupporting, styles.mb3, styles.textLabel, styles.mb2, styles.mt5, styles.mt2, translate, managerEmail, emailError],
    );

    const onSelectMember = useCallback((item: WorkspaceMemberItem) => {
        setManagerEmail(item.email);
        setEmailError('');
    }, []);

    // eslint-disable-next-line rulesdir/no-negated-variables
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
                ListItem={RadioListItem}
                onSelectRow={onSelectMember}
                customListHeader={listHeader}
                confirmButtonOptions={confirmButtonOptions}
                shouldUpdateFocusedIndex
                initiallyFocusedItemKey={workspaceMembers.find((m) => m.isSelected)?.keyForList}
            />
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(ReportSubmitToPage);
