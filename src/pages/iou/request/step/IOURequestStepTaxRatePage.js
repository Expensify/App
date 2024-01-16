import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TaxPicker from '@components/TaxPicker';
import taxPropTypes from '@components/taxPropTypes';
import transactionPropTypes from '@components/transactionPropTypes';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as IOU from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

    /* Onyx Props */
    /** Collection of tax rates attached to a policy */
    policyTaxRates: taxPropTypes,

    /** The transaction object being modified in Onyx */
    transaction: transactionPropTypes,
};

const defaultProps = {
    policyTaxRates: {},
    transaction: {},
};

const getTaxAmount = (taxRates, selectedTaxRate, amount) => {
    const percentage = _.find(OptionsListUtils.transformedTaxRates(taxRates), (taxRate) => taxRate.modifiedName === selectedTaxRate).value;
    return TransactionUtils.calculateTaxAmount(percentage, amount);
};

function IOURequestStepTaxRatePage({
    route: {
        params: {backTo},
    },
    policyTaxRates,
    transaction,
}) {
    const {translate} = useLocalize();

    const navigateBack = () => {
        Navigation.goBack(backTo || ROUTES.HOME);
    };

    const defaultTaxKey = policyTaxRates.defaultExternalID;
    const defaultTaxName = (defaultTaxKey && `${policyTaxRates.taxes[defaultTaxKey].name} (${policyTaxRates.taxes[defaultTaxKey].value}) • ${translate('common.default')}`) || '';
    const selectedTaxRate = (transaction.taxRate && transaction.taxRate.text) || defaultTaxName;

    const updateTaxRates = (taxes) => {
        const taxAmount = getTaxAmount(policyTaxRates, taxes.text, transaction.amount);
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(taxAmount));
        IOU.setMoneyRequestTaxRate(transaction.transactionID, taxes);
        IOU.setMoneyRequestTaxAmount(transaction.transactionID, amountInSmallestCurrencyUnits);

        Navigation.goBack(backTo || ROUTES.HOME);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={IOURequestStepTaxRatePage.displayName}
        >
            {({insets}) => (
                <>
                    <HeaderWithBackButton
                        title={translate('iou.taxRate')}
                        onBackButtonPress={() => navigateBack()}
                    />
                    <TaxPicker
                        selectedTaxRate={selectedTaxRate}
                        policyTaxRates={policyTaxRates}
                        insets={insets}
                        onSubmit={updateTaxRates}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

IOURequestStepTaxRatePage.propTypes = propTypes;
IOURequestStepTaxRatePage.defaultProps = defaultProps;
IOURequestStepTaxRatePage.displayName = 'IOURequestStepTaxRatePage';

export default compose(
    withWritableReportOrNotFound,
    withFullTransactionOrNotFound,
    withOnyx({
        policyTaxRates: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAX_RATE}${report ? report.policyID : '0'}`,
        },
    }),
)(IOURequestStepTaxRatePage);
