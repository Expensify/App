import {differenceInDays} from 'date-fns';
import React from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchContext} from '@components/Search/SearchContext';
import useAllTransactions from '@hooks/useAllTransactions';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {resetSplitExpensesByDateRange} from '@libs/actions/IOU';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SplitExpenseParamList} from '@libs/Navigation/types';
import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/SplitExpenseEditDateForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type SplitExpenseCreateDateRagePageProps = PlatformStackScreenProps<SplitExpenseParamList, typeof SCREENS.MONEY_REQUEST.SPLIT_EXPENSE_CREATE_DATE_RANGE>;

function SplitExpenseCreateDateRagePage({route}: SplitExpenseCreateDateRagePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {state} = useSearchContext();
    const {currentSearchResults} = state;

    const {reportID, transactionID, backTo} = route.params;

    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {canBeMissing: false});
    const allTransactions = useAllTransactions();

    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`];
    const originalTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`];

    const report = getReportOrDraftReport(reportID);
    const currentReport = report ?? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`];

    const policy = usePolicy(currentReport?.policyID);
    const currentPolicy = Object.keys(policy?.employeeList ?? {}).length
        ? policy
        : currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(currentReport?.policyID)}`];
    const {login, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const updateDate = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.SPLIT_EXPENSE_EDIT_DATES>) => {
        resetSplitExpensesByDateRange(transaction, value[INPUT_IDS.START_DATE], value[INPUT_IDS.END_DATE]);
        Navigation.goBack(backTo);
    };

    const isSplitAvailable = report && transaction && isSplitAction(currentReport, [transaction], originalTransaction, login ?? '', currentUserAccountID, currentPolicy);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.SPLIT_EXPENSE_EDIT_DATES>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SPLIT_EXPENSE_EDIT_DATES> = {};
        if (!values[INPUT_IDS.START_DATE]) {
            errors[INPUT_IDS.START_DATE] = translate('common.error.fieldRequired');
        }
        if (!values[INPUT_IDS.END_DATE]) {
            errors[INPUT_IDS.END_DATE] = translate('common.error.fieldRequired');
        }

        if (values[INPUT_IDS.START_DATE] && values[INPUT_IDS.END_DATE]) {
            const startDate = new Date(values[INPUT_IDS.START_DATE]);
            const endDate = new Date(values[INPUT_IDS.END_DATE]);

            if (endDate < startDate) {
                errors[INPUT_IDS.END_DATE] = translate('iou.error.endDateBeforeStartDate');
            } else if (endDate.getTime() === startDate.getTime()) {
                errors[INPUT_IDS.END_DATE] = translate('iou.error.endDateSameAsStartDate');
            } else if (differenceInDays(endDate, startDate) + 1 > CONST.IOU.SPLITS_LIMIT) {
                errors[INPUT_IDS.END_DATE] = translate('iou.error.dateRangeExceedsMaxDays');
            }
        }

        return errors;
    };

    const handleBackPress = () => {
        Navigation.goBack(backTo);
    };

    return (
        <ScreenWrapper testID="SplitExpenseCreateDateRagePage">
            <FullPageNotFoundView shouldShow={!reportID || isEmptyObject(draftTransaction) || !isSplitAvailable}>
                <View style={[styles.flex1]}>
                    <HeaderWithBackButton
                        title={translate('iou.splitDates')}
                        onBackButtonPress={handleBackPress}
                    />
                    <FormProvider
                        style={[styles.flexGrow1, styles.ph5]}
                        formID={ONYXKEYS.FORMS.SPLIT_EXPENSE_EDIT_DATES}
                        onSubmit={updateDate}
                        submitButtonText={translate('common.save')}
                        enabledWhenOffline
                        shouldHideFixErrorsAlert
                        validate={validate}
                    >
                        <InputWrapper
                            InputComponent={DatePicker}
                            inputID={INPUT_IDS.START_DATE}
                            label={translate('iou.startDate')}
                            maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                            minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                            defaultValue={draftTransaction?.comment?.splitsStartDate}
                            autoFocus
                        />
                        <InputWrapper
                            InputComponent={DatePicker}
                            inputID={INPUT_IDS.END_DATE}
                            label={translate('iou.endDate')}
                            maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                            minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                            defaultValue={draftTransaction?.comment?.splitsEndDate}
                        />
                    </FormProvider>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default SplitExpenseCreateDateRagePage;
