import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as TransactionUtils from '@libs/TransactionUtils';
import MoneyRequestAmountForm from '@pages/iou/steps/MoneyRequestAmountForm';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Transaction} from '@src/types/onyx';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepTaxAmountPageOnyxProps = {
    policy: OnyxEntry<Policy>;
};

type IOURequestStepTaxAmountPageProps = {
    transaction: OnyxEntry<Transaction>;
} & IOURequestStepTaxAmountPageOnyxProps &
    WithWritableReportOrNotFoundProps;

const getTaxAmount = (transaction: OnyxEntry<Transaction>, defaultTaxValue: string | undefined) => {
    if (!transaction?.amount) {
        return;
    }
    const percentage = (transaction?.taxRate ? transaction?.taxRate?.data?.value : defaultTaxValue) ?? '';
    return CurrencyUtils.convertToBackendAmount(TransactionUtils.calculateTaxAmount(percentage, transaction?.amount));
};

function IOURequestStepTaxAmountPage({
    route: {
        params: {iouType, reportID, transactionID, backTo},
    },
    transaction,
    report,
    policy,
}: IOURequestStepTaxAmountPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
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
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CURRENCY.getRoute(iouType, transactionID, reportID, backTo ? 'confirm' : '', Navigation.getActiveRouteWithoutParams()));
    };

    const updateTaxAmount = (currentAmount: {amount: string}) => {
        isSaveButtonPressed.current = true;
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(currentAmount.amount));
        IOU.setMoneyRequestTaxAmount(transactionID, amountInSmallestCurrencyUnits);

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
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(iouType, transactionID, reportID));
            return;
        }

        // If there was no reportID, then that means the user started this flow from the global + menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this request.
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
    };

    const content = (
        <MoneyRequestAmountForm
            isEditing={isEditing}
            currency={transaction?.currency}
            amount={transaction?.taxAmount}
            taxAmount={getTaxAmount(transaction, taxRates?.defaultValue)}
            ref={(e) => (textInput.current = e)}
            onCurrencyButtonPress={navigateToCurrencySelectionPage}
            onSubmitButtonPress={updateTaxAmount}
        />
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableKeyboardAvoidingView={false}
            testID={IOURequestStepTaxAmountPage.displayName}
        >
            {({safeAreaPaddingBottomStyle}) => (
                <FullPageNotFoundView shouldShow={!IOUUtils.isValidMoneyRequestType(iouType)}>
                    <View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                        <HeaderWithBackButton
                            title={translate('iou.taxAmount')}
                            onBackButtonPress={navigateBack}
                        />
                        {content}
                    </View>
                </FullPageNotFoundView>
            )}
        </ScreenWrapper>
    );
}

IOURequestStepTaxAmountPage.displayName = 'IOURequestStepTaxAmountPage';

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTaxAmountPageWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepTaxAmountPage);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTaxAmountPageWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepTaxAmountPageWithWritableReportOrNotFound);

export default withOnyx<IOURequestStepTaxAmountPageProps, IOURequestStepTaxAmountPageOnyxProps>({
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
    },
    // @ts-expect-error TODO: Remove this once withFullTransactionOrNotFound (https://github.com/Expensify/App/issues/36123) is migrated to TypeScript.
})(IOURequestStepTaxAmountPageWithFullTransactionOrNotFound);
