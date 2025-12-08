import React, {useCallback, useEffect} from 'react';
import {OnyxEntry} from 'react-native-onyx/dist/types';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import {useSearchContext} from '@components/Search/SearchContext';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList, SearchReportActionsParamList} from '@libs/Navigation/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import {clearErrorFields, clearErrors} from '@userActions/FormActions';
import {rejectMoneyRequest} from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MoneyRequestRejectReasonForm';
import {Report} from '@src/types/onyx';
import RejectReasonFormView from './RejectReasonFormView';

type RejectReasonPageProps =
    | PlatformStackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.REJECT>
    | PlatformStackScreenProps<SearchReportActionsParamList, typeof SCREENS.SEARCH.TRANSACTION_HOLD_REASON_RHP>;

const reportPolicySelector = (report: OnyxEntry<Report>) => ({policyID: report?.policyID});

function RejectReasonPage({route}: RejectReasonPageProps) {
    const {translate} = useLocalize();

    const {transactionID, reportID, backTo} = route.params;
    const {removeTransaction} = useSearchContext();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {canBeMissing: false, selector: reportPolicySelector});
    const policy = usePolicy(report?.policyID);

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => {
        const urlToNavigateBack = rejectMoneyRequest(transactionID, reportID, values.comment, policy);
        removeTransaction(transactionID);
        Navigation.dismissModal();
        if (urlToNavigateBack) {
            Navigation.isNavigationReady().then(() => Navigation.goBack(urlToNavigateBack));
        }
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM>) => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM> = getFieldRequiredErrors(values, [INPUT_IDS.COMMENT]);

            if (!values.comment) {
                errors.comment = translate('common.error.fieldRequired');
            }
            return errors;
        },
        [translate],
    );

    useEffect(() => {
        clearErrors(ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM);
        clearErrorFields(ONYXKEYS.FORMS.MONEY_REQUEST_REJECT_FORM);
    }, []);

    return (
        <RejectReasonFormView
            onSubmit={onSubmit}
            validate={validate}
            backTo={backTo}
        />
    );
}

RejectReasonPage.displayName = 'RejectReasonPage';

export default RejectReasonPage;
