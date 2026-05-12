import {useFocusEffect} from '@react-navigation/native';
import React, {useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useRestartOnReceiptFailure from '@hooks/useRestartOnReceiptFailure';
import useShowNotFoundPageInIOUStep from '@hooks/useShowNotFoundPageInIOUStep';
import {setMoneyRequestAmount, setMoneyRequestMerchant, setMoneyRequestTimeRate} from '@libs/actions/IOU';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import {shouldUseTransactionDraft} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import {computeTimeAmount, formatTimeMerchant} from '@libs/TimeTrackingUtils';
import type {CurrentMoney} from '@pages/iou/MoneyRequestAmountForm';
import MoneyRequestAmountForm from '@pages/iou/MoneyRequestAmountForm';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepTimeRateProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_TIME_RATE> & {
    transaction: OnyxEntry<Transaction>;
};

function IOURequestStepTimeRate({
    route: {
        params: {action, iouType, reportID, reportActionID, transactionID},
    },
    transaction,
    report,
}: IOURequestStepTimeRateProps) {
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const textInput = useRef<BaseTextInputRef | null>(null);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useRestartOnReceiptFailure(transaction, reportID, iouType, action);

    const shouldShowNotFoundPage = useShowNotFoundPageInIOUStep(action, iouType, reportActionID, report, transaction);

    const isTransactionDraft = shouldUseTransactionDraft(action);
    const currency = transaction?.currency;
    const count = transaction?.comment?.units?.count;

    useFocusEffect(() => {
        focusTimeoutRef.current = setTimeout(() => textInput.current?.focus(), CONST.ANIMATED_TRANSITION + 100);
        return () => {
            if (!focusTimeoutRef.current) {
                return;
            }
            clearTimeout(focusTimeoutRef.current);
        };
    });

    const navigateBack = () => {
        Navigation.goBack(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(action, iouType, transactionID, reportID));
    };

    const saveRate = (currentMoney: CurrentMoney) => {
        const rate = convertToBackendAmount(Number.parseFloat(currentMoney.amount));
        if (count === undefined || !currency) {
            return;
        }

        setMoneyRequestAmount(transactionID, computeTimeAmount(rate, count), currency);
        setMoneyRequestMerchant(transactionID, formatTimeMerchant(count, rate, currency, translate, convertToDisplayString), isTransactionDraft);
        setMoneyRequestTimeRate(transactionID, rate, isTransactionDraft);

        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.rate')}
            onBackButtonPress={navigateBack}
            testID="IOURequestStepTimeRate"
            shouldShowWrapper
            includeSafeAreaPaddingBottom
            shouldShowNotFoundPage={shouldShowNotFoundPage}
        >
            <MoneyRequestAmountForm
                isEditing
                amount={transaction?.comment?.units?.rate}
                currency={currency}
                isCurrencyPressable={false}
                ref={(e: BaseTextInputRef | null) => {
                    textInput.current = e;
                }}
                onSubmitButtonPress={saveRate}
            />
        </StepScreenWrapper>
    );
}

const IOURequestStepTimeRateWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepTimeRate);

const IOURequestStepTimeRateWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepTimeRateWithFullTransactionOrNotFound);

export default IOURequestStepTimeRateWithWritableReportOrNotFound;
