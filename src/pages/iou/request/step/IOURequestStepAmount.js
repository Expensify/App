import {useFocusEffect} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useRef} from 'react';
import {withOnyx} from 'react-native-onyx';
import taxPropTypes from '@components/taxPropTypes';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import {getRequestType} from '@libs/TransactionUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import MoneyRequestAmountForm from '@pages/iou/steps/MoneyRequestAmountForm';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /* Onyx Props */
    /** The report that the transaction belongs to */
    report: reportPropTypes,

    /** The transaction object being modified in Onyx */
    transaction: transactionPropTypes,

    /** The policy of the report */
    policy: PropTypes.shape({
        /**
         * Whether or not the policy has tax tracking enabled
         *
         * @deprecated - use tax.trackingEnabled instead
         */
        isTaxTrackingEnabled: PropTypes.bool,

        /** Whether or not the policy has tax tracking enabled */
        tax: PropTypes.shape({
            trackingEnabled: PropTypes.bool,
        }),

        /** Collection of tax rates attached to a policy */
        taxRates: taxPropTypes,
    }),
};

const defaultProps = {
    report: {},
    transaction: {},
    policy: {},
};

const getTaxAmount = (transaction, defaultTaxValue, amount) => {
    const percentage = (transaction.taxRate ? transaction.taxRate.data.value : defaultTaxValue) || '';
    return TransactionUtils.calculateTaxAmount(percentage, amount);
};

function IOURequestStepAmount({
    report,
    route: {
        params: {iouType, reportID, transactionID, backTo},
    },
    transaction,
    transaction: {currency},
    policy,
}) {
    const {translate} = useLocalize();
    const textInput = useRef(null);
    const focusTimeoutRef = useRef(null);
    const isSaveButtonPressed = useRef(false);
    const originalCurrency = useRef(null);
    const iouRequestType = getRequestType(transaction);

    const taxRates = lodashGet(policy, 'taxRates', {});
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(ReportUtils.getRootParentReport(report));
    const isTaxTrackingEnabled = isPolicyExpenseChat && lodashGet(policy, 'tax.trackingEnabled', policy.isTaxTrackingEnabled);

    useFocusEffect(
        useCallback(() => {
            focusTimeoutRef.current = setTimeout(() => textInput.current && textInput.current.focus(), CONST.ANIMATED_TRANSITION);
            return () => {
                if (!focusTimeoutRef.current) {
                    return;
                }
                clearTimeout(focusTimeoutRef.current);
            };
        }, []),
    );

    useEffect(() => {
        if (transaction.originalCurrency) {
            originalCurrency.current = transaction.originalCurrency;
        } else {
            originalCurrency.current = currency;
            IOU.setMoneyRequestOriginalCurrency_temporaryForRefactor(transactionID, currency);
        }
        return () => {
            if (isSaveButtonPressed.current) {
                return;
            }
            IOU.setMoneyRequestCurrency_temporaryForRefactor(transactionID, originalCurrency.current, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const navigateToCurrencySelectionPage = () => {
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CURRENCY.getRoute(iouType, transactionID, reportID, backTo ? 'confirm' : '', Navigation.getActiveRouteWithoutParams()));
    };

    /**
     * @param {Number} amount
     */
    const navigateToNextPage = ({amount}) => {
        isSaveButtonPressed.current = true;
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(amount));

        if ((iouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL || backTo) && isTaxTrackingEnabled) {
            const taxAmount = getTaxAmount(transaction, taxRates.defaultValue, amountInSmallestCurrencyUnits);
            const taxAmountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(taxAmount));
            IOU.setMoneyRequestTaxAmount(transaction.transactionID, taxAmountInSmallestCurrencyUnits);
        }

        IOU.setMoneyRequestAmount_temporaryForRefactor(transactionID, amountInSmallestCurrencyUnits, currency || CONST.CURRENCY.USD, true);

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // If a reportID exists in the report object, it's because the user started this flow from using the + button in the composer
        // inside a report. In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        if (report.reportID) {
            IOU.setMoneyRequestParticipantsFromReport(transactionID, report);
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(iouType, transactionID, reportID));
            return;
        }

        // If there was no reportID, then that means the user started this flow from the global + menu
        // and an optimistic reportID was generated. In that case, the next step is to select the participants for this request.
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('iou.amount')}
            onBackButtonPress={navigateBack}
            testID={IOURequestStepAmount.displayName}
            shouldShowWrapper={Boolean(backTo)}
            includeSafeAreaPaddingBottom
        >
            <MoneyRequestAmountForm
                isEditing={Boolean(backTo)}
                currency={currency}
                amount={transaction.amount}
                ref={(e) => (textInput.current = e)}
                onCurrencyButtonPress={navigateToCurrencySelectionPage}
                onSubmitButtonPress={navigateToNextPage}
                selectedTab={iouRequestType}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepAmount.propTypes = propTypes;
IOURequestStepAmount.defaultProps = defaultProps;
IOURequestStepAmount.displayName = 'IOURequestStepAmount';

export default compose(
    withWritableReportOrNotFound,
    withFullTransactionOrNotFound,
    withOnyx({
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
        },
    }),
)(IOURequestStepAmount);
