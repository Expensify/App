import React, {useCallback, useEffect} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SearchContext, TMoneyRequestReportContext} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import {clearErrorFields, clearErrors} from '@libs/actions/FormActions';
import {holdMoneyRequestOnSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import type {SearchReportParamList} from '@navigation/types';
import HoldReasonFormView from '@pages/iou/HoldReasonFormView';
import {putOnHold} from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestHoldReasonForm';

type Props = PlatformStackScreenProps<SearchReportParamList, typeof SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP | typeof SCREENS.SEARCH.MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS>;

function SearchHoldReasonPage({route}: Props) {
    const {translate} = useLocalize();
    const {backTo = ''} = route.params ?? {};
    const shouldUseMoneyRequestContext = route.name !== SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP;
    const contextValue = useSearchContext(shouldUseMoneyRequestContext);

    const onSubmit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            if (shouldUseMoneyRequestContext) {
                const {selectedTransactionsID, setSelectedTransactionsID} = contextValue as TMoneyRequestReportContext;
                selectedTransactionsID.forEach((transactionID) => putOnHold(transactionID, values.comment, route.params.reportID));
                setSelectedTransactionsID([]);
            } else {
                const {currentSearchHash, selectedTransactions, clearSelectedTransactions} = contextValue as SearchContext;
                holdMoneyRequestOnSearch(currentSearchHash, Object.keys(selectedTransactions), values.comment);
                clearSelectedTransactions();
            }
            Navigation.goBack();
        },
        [contextValue, route.params?.reportID, shouldUseMoneyRequestContext],
    );

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM> = getFieldRequiredErrors(values, [INPUT_IDS.COMMENT]);

            if (!values.comment) {
                errors.comment = translate('common.error.fieldRequired');
            }

            return errors;
        },
        [translate],
    );

    useEffect(() => {
        clearErrors(ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM);
        clearErrorFields(ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM);
    }, []);

    return (
        <HoldReasonFormView
            onSubmit={onSubmit}
            validate={validate}
            backTo={backTo}
        />
    );
}

SearchHoldReasonPage.displayName = 'SearchHoldReasonPage';

export default SearchHoldReasonPage;
