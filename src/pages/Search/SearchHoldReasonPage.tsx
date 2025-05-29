import React, {useCallback, useEffect} from 'react';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useSearchContext} from '@components/Search/SearchContext';
import useLocalize from '@hooks/useLocalize';
import {clearErrorFields, clearErrors} from '@libs/actions/FormActions';
import {holdMoneyRequestOnSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
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
    const isOnSearchHoldReason = route.name !== SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP;
    const contextValue = useSearchContext();

    const onSubmit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_HOLD_FORM>) => {
            if (isOnSearchHoldReason) {
                const {selectedTransactionsID, setSelectedTransactions} = contextValue;
                selectedTransactionsID.forEach((transactionID) => {
                    const {childReportID} = getIOUActionForReportID(route.params.reportID, transactionID) ?? {};
                    return childReportID && putOnHold(transactionID, values.comment, childReportID);
                });
                setSelectedTransactions([]);
            } else {
                const {currentSearchHash, selectedTransactions, clearSelectedTransactions} = contextValue;
                holdMoneyRequestOnSearch(currentSearchHash, Object.keys(selectedTransactions), values.comment);
                clearSelectedTransactions();
            }
            Navigation.goBack();
        },
        [contextValue, route.params?.reportID, isOnSearchHoldReason],
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
