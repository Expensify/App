import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useSearchResultsContext} from '@components/Search/SearchContext';

import useAllTransactions from '@hooks/useAllTransactions';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import useReportOrReportDraft from '@hooks/useReportOrReportDraft';
import useSplitEffectivePolicy from '@hooks/useSplitEffectivePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {resetSplitExpensesByDateRange} from '@libs/actions/IOU/SplitExpenseItems';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';
import {isSplitAction} from '@libs/ReportSecondaryActionUtils';
import {isSelfDM} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/SplitExpenseEditDateForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {differenceInDays} from 'date-fns';
import React from 'react';
import {View} from 'react-native';

type DynamicSplitExpenseCreateDateRangePageProps = PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.DYNAMIC_SPLIT_EXPENSE_CREATE_DATE_RANGE>;

function DynamicSplitExpenseCreateDateRangePage({route}: DynamicSplitExpenseCreateDateRangePageProps) {
    const {getCurrencySymbol, getCurrencyDecimals} = useCurrencyListActions();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {currentSearchResults} = useSearchResultsContext();

    const {splitReportID: reportID, originalTransactionID: transactionID} = route.params;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.MONEY_REQUEST_SPLIT_EXPENSE_CREATE_DATE_RANGE.path);

    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`);
    const allTransactions = useAllTransactions();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`];
    const originalTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`];

    const report = useReportOrReportDraft(reportID);
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];
    const currentReport = report ?? currentSearchResults?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`];

    const personalPolicy = usePersonalPolicy();
    const effectivePolicy = useSplitEffectivePolicy(currentReport, draftTransaction, transaction);

    const {login, accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const updateDate = (value: FormOnyxValues<typeof ONYXKEYS.FORMS.SPLIT_EXPENSE_EDIT_DATES>) => {
        resetSplitExpensesByDateRange({
            transaction,
            draftTransaction,
            transactionReport: currentReport,
            startDate: value[INPUT_IDS.START_DATE],
            endDate: value[INPUT_IDS.END_DATE],
            policy: effectivePolicy,
            isSelfDMSplit: isSelfDM(currentReport) || isSelfDM(parentReport),
            personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
            getCurrencySymbol,
            getCurrencyDecimals,
            policies: allPolicies,
        });
        Navigation.goBack(backPath);
    };

    const isSplitAvailable = report && transaction && isSplitAction(currentReport, [transaction], originalTransaction, login ?? '', currentUserAccountID, effectivePolicy, parentReport);

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
        Navigation.goBack(backPath);
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
                            defaultValue={draftTransaction?.comment?.splitsStartDate}
                        />
                        <InputWrapper
                            InputComponent={DatePicker}
                            inputID={INPUT_IDS.END_DATE}
                            label={translate('iou.endDate')}
                            maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                            defaultValue={draftTransaction?.comment?.splitsEndDate}
                        />
                    </FormProvider>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default DynamicSplitExpenseCreateDateRangePage;
