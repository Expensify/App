import {useFocusEffect} from '@react-navigation/native';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import taxPropTypes from '@components/taxPropTypes';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as IOUUtils from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as TransactionUtils from '@libs/TransactionUtils';
import MoneyRequestAmountForm from '@pages/iou/steps/MoneyRequestAmountForm';
import reportPropTypes from '@pages/reportPropTypes';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
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

    /* Onyx Props */
    /** The policy of the report */
    policy: PropTypes.shape({
        /** Collection of tax rates attached to a policy */
        taxRates: taxPropTypes,
    }),
};

const defaultProps = {
    report: {},
    transaction: {},
    policy: {},
};

const getTaxAmount = (transaction, defaultTaxValue) => {
    const percentage = (transaction.taxRate ? transaction.taxRate.data.value : defaultTaxValue) || '';
    return CurrencyUtils.convertToBackendAmount(Number.parseFloat(TransactionUtils.calculateTaxAmount(percentage, transaction.amount)));
};

function IOURequestStepTaxAmountPage({
    route: {
        params: {iouType, reportID, transactionID, backTo},
    },
    transaction,
    transaction: {currency},
    report,
    policy,
}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const textInput = useRef(null);
    const isEditing = Navigation.getActiveRoute().includes('taxAmount');

    const focusTimeoutRef = useRef(null);

    const isSaveButtonPressed = useRef(false);
    const originalCurrency = useRef(null);
    const taxRates = lodashGet(policy, 'taxRates', {});

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

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const navigateToCurrencySelectionPage = () => {
        // If the money request being created is a distance request, don't allow the user to choose the currency.
        // Only USD is allowed for distance requests.
        // Remove query from the route and encode it.
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CURRENCY.getRoute(iouType, transactionID, reportID, backTo ? 'confirm' : '', Navigation.getActiveRouteWithoutParams()));
    };

    const updateTaxAmount = (currentAmount) => {
        isSaveButtonPressed.current = true;
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(currentAmount.amount));
        IOU.setMoneyRequestTaxAmount(transactionID, amountInSmallestCurrencyUnits);

        IOU.setMoneyRequestCurrency_temporaryForRefactor(transactionID, currency || CONST.CURRENCY.USD, true);

        if (backTo) {
            Navigation.goBack(backTo);
            return;
        }

        // If a reportID exists in the report object, it's because the user started this flow from using the + button in the composer
        // inside a report. In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
        // to the confirm step.
        if (report.reportID) {
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
            currency={currency}
            amount={transaction.taxAmount}
            taxAmount={getTaxAmount(transaction, taxRates.defaultValue)}
            transaction={transaction}
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

IOURequestStepTaxAmountPage.propTypes = propTypes;
IOURequestStepTaxAmountPage.defaultProps = defaultProps;
IOURequestStepTaxAmountPage.displayName = 'IOURequestStepTaxAmountPage';

export default compose(
    withWritableReportOrNotFound,
    withFullTransactionOrNotFound,
    withOnyx({
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
        },
    }),
)(IOURequestStepTaxAmountPage);
