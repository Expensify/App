import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import type {CurrentMoney} from '@pages/iou/MoneyRequestAmountForm';
import MoneyRequestAmountForm from '@pages/iou/MoneyRequestAmountForm';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Policy, PolicyCategories, PolicyTagList, TaxRatesWithDefault, Transaction} from '@src/types/onyx';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

type IOURequestStepTaxAmountPageOnyxProps = {
    policy: OnyxEntry<Policy>;
    policyCategories: OnyxEntry<PolicyCategories>;

    /** Collection of tag list on a policy */
    policyTags: OnyxEntry<PolicyTagList>;
};

type IOURequestStepTaxAmountPageProps = IOURequestStepTaxAmountPageOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_TAX_AMOUNT> & {
        transaction: OnyxEntry<Transaction>;
    };

function getTaxAmount(transaction: OnyxEntry<Transaction>, taxRates: TaxRatesWithDefault | undefined, isEditing: boolean): number | undefined {
    if (!transaction?.amount) {
        return;
    }
    const transactionTaxAmount = TransactionUtils.getAmount(transaction);
    const transactionTaxCode = transaction?.taxCode ?? '';
    const defaultTaxValue = taxRates?.defaultValue;
    const moneyRequestTaxPercentage = (transaction?.taxRate ? transaction?.taxRate?.data?.value : defaultTaxValue) ?? '';
    const editingTaxPercentage = (transactionTaxCode ? taxRates?.taxes[transactionTaxCode]?.value : moneyRequestTaxPercentage) ?? '';
    const taxPercentage = isEditing ? editingTaxPercentage : moneyRequestTaxPercentage;
    return CurrencyUtils.convertToBackendAmount(TransactionUtils.calculateTaxAmount(taxPercentage, transactionTaxAmount));
}

function IOURequestStepTaxAmountPage({
    route: {
        params: {action, iouType, reportID, transactionID, backTo, currency: selectedCurrency = ''},
    },
    transaction,
    report,
    policy,
    policyTags,
    policyCategories,
}: IOURequestStepTaxAmountPageProps) {
    const {translate} = useLocalize();
    const textInput = useRef<BaseTextInputRef | null>();
    const isEditing = action === CONST.IOU.ACTION.EDIT;

    const focusTimeoutRef = useRef<NodeJS.Timeout>();

    const transactionDetails = ReportUtils.getTransactionDetails(transaction);
    const currency = CurrencyUtils.isValidCurrencyCode(selectedCurrency) ? selectedCurrency : transactionDetails?.currency;
    const taxRates = policy?.taxRates;

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
        // If the expense being created is a distance expense, don't allow the user to choose the currency.
        // Only USD is allowed for distance expenses.
        // Remove query from the route and encode it.
        Navigation.navigate(
            ROUTES.MONEY_REQUEST_STEP_CURRENCY.getRoute(
                CONST.IOU.ACTION.CREATE,
                iouType,
                transactionID,
                reportID,
                backTo ? 'confirm' : '',
                currency,
                Navigation.getActiveRouteWithoutParams(),
            ),
        );
    };

    const updateTaxAmount = (currentAmount: CurrentMoney) => {
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(currentAmount.amount));

        if (isEditing) {
            if (amountInSmallestCurrencyUnits === TransactionUtils.getTaxAmount(transaction, false)) {
                navigateBack();
                return;
            }
            IOU.updateMoneyRequestTaxAmount(transactionID, report?.reportID ?? '', amountInSmallestCurrencyUnits, policy, policyTags, policyCategories);
            navigateBack();
            return;
        }

        IOU.setMoneyRequestTaxAmount(transactionID, amountInSmallestCurrencyUnits, true);

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        IOU.setMoneyRequestCurrency(transactionID, currency || CONST.CURRENCY.USD);

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
            shouldShowWrapper={Boolean(backTo || isEditing)}
            includeSafeAreaPaddingBottom
        >
            <MoneyRequestAmountForm
                isEditing={Boolean(backTo || isEditing)}
                currency={currency}
                amount={transactionDetails?.taxAmount}
                taxAmount={getTaxAmount(transaction, taxRates, Boolean(backTo || isEditing))}
                ref={(e) => (textInput.current = e)}
                onCurrencyButtonPress={navigateToCurrencySelectionPage}
                onSubmitButtonPress={updateTaxAmount}
                isCurrencyPressable={!isEditing}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepTaxAmountPage.displayName = 'IOURequestStepTaxAmountPage';

const IOURequestStepTaxAmountPageWithOnyx = withOnyx<IOURequestStepTaxAmountPageProps, IOURequestStepTaxAmountPageOnyxProps>({
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
    },
    policyCategories: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${report ? report.policyID : '0'}`,
    },
    policyTags: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAGS}${report ? report.policyID : '0'}`,
    },
})(IOURequestStepTaxAmountPage);

// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTaxAmountPageWithWritableReportOrNotFound = withWritableReportOrNotFound(IOURequestStepTaxAmountPageWithOnyx);
// eslint-disable-next-line rulesdir/no-negated-variables
const IOURequestStepTaxAmountPageWithFullTransactionOrNotFound = withFullTransactionOrNotFound(IOURequestStepTaxAmountPageWithWritableReportOrNotFound);

export default IOURequestStepTaxAmountPageWithFullTransactionOrNotFound;
