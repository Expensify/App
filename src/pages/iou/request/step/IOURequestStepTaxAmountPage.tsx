import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as TransactionUtils from '@libs/TransactionUtils';
import type {CurrentMoney} from '@pages/iou/steps/MoneyRequestAmountForm';
import MoneyRequestAmountForm from '@pages/iou/steps/MoneyRequestAmountForm';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy, Transaction} from '@src/types/onyx';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepTaxAmountPageOnyxProps = {
    policy: OnyxEntry<Policy>;
};

type IOURequestStepTaxAmountPageProps = IOURequestStepTaxAmountPageOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_TAX_AMOUNT> & {
        transaction: OnyxEntry<Transaction>;
    };

function getTaxAmount(transaction: OnyxEntry<Transaction>, defaultTaxValue: string | undefined): number | undefined {
    if (!transaction?.amount) {
        return;
    }
    const percentage = (transaction?.taxRate ? transaction?.taxRate?.data?.value : defaultTaxValue) ?? '';
    return CurrencyUtils.convertToBackendAmount(TransactionUtils.calculateTaxAmount(percentage, transaction?.amount));
}

function IOURequestStepTaxAmountPage({
    route: {
        params: {iouType, reportID, transactionID, backTo},
    },
    transaction,
    report,
    policy,
}: IOURequestStepTaxAmountPageProps) {
    const {translate} = useLocalize();
    const textInput = useRef<BaseTextInputRef | null>();
    const isEditing = Navigation.getActiveRoute().includes('taxAmount');

    const focusTimeoutRef = useRef<NodeJS.Timeout>();

    const isSaveButtonPressed = useRef(false);
    const originalCurrency = useRef<string>();
    const taxRates = policy?.taxRates;

    useEffect(() => {
        if (transaction?.originalCurrency) {
            originalCurrency.current = transaction.originalCurrency;
        } else if (transaction?.currency) {
            originalCurrency.current = transaction.currency;
            IOU.setMoneyRequestOriginalCurrency_temporaryForRefactor(transactionID, transaction?.currency);
        }
        return () => {
            if (isSaveButtonPressed.current || !originalCurrency.current) {
                return;
            }
            IOU.setMoneyRequestCurrency_temporaryForRefactor(transactionID, originalCurrency.current, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => textInput.current?.focus(), CONST.ANIMATED_TRANSITION);
            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, []),
    );

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const navigateToCurrencySelectionPage = () => {
        // If the money request being created is a distance request, don't allow the user to choose the currency.
        // Only USD is allowed for distance requests.
        // Remove query from the route and encode it.
        Navigation.navigate(
            ROUTES.MONEY_REQUEST_STEP_CURRENCY.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, backTo ? 'confirm' : '', Navigation.getActiveRouteWithoutParams()),
        );
    };

    const updateTaxAmount = (currentAmount: CurrentMoney) => {
        isSaveButtonPressed.current = true;
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(currentAmount.amount));
        IOU.setMoneyRequestTaxAmount(transactionID, amountInSmallestCurrencyUnits, true);

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        IOU.setMoneyRequestCurrency_temporaryForRefactor(transactionID, transaction?.currency || CONST.CURRENCY.USD, true);

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // If a reportID exists in the report object, it's because the user started this flow from using the + button in the composer
        // inside a report. In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        if (report?.reportID) {
            // TODO: Is this really needed at all?
            IOU.setMoneyRequestParticipantsFromReport(transactionID, report);
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID));
            return;
        }

        // If there was no reportID, then that means the user started this flow from the global + menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this request.
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.taxAmount')}
            onBackButtonPress={navigateBack}
            testID={IOURequestStepTaxAmountPage.displayName}
            shouldShowWrapper={Boolean(backTo)}
            includeSafeAreaPaddingBottom
        >
            <MoneyRequestAmountForm
                isEditing={isEditing}
                currency={transaction?.currency}
                amount={transaction?.taxAmount}
                taxAmount={getTaxAmount(transaction, taxRates?.defaultValue)}
                ref={(e) => (textInput.current = e)}
                onCurrencyButtonPress={navigateToCurrencySelectionPage}
                onSubmitButtonPress={updateTaxAmount}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepTaxAmountPage.displayName = 'IOURequestStepTaxAmountPage';

const IOURequestStepTaxAmountPageWithOnyx = withOnyx<IOURequestStepTaxAmountPageProps, IOURequestStepTaxAmountPageOnyxProps>({
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
    },
})(IOURequestStepTaxAmountPage);

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTaxAmountPageWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepTaxAmountPageWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTaxAmountPageWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepTaxAmountPageWithWritableReportOrNotFound);

export default IOURequestStepTaxAmountPageWithFullTransactionOrNotFound;
