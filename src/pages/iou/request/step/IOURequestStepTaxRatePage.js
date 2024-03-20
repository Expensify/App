import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
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
import IOURequestStepRoutePropTypes from './IOURequestStepRoutePropTypes';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';

const propTypes = {
    /** Navigation route context info provided by react navigation */
    route: IOURequestStepRoutePropTypes.isRequired,

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
    policy: {},
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
    policy,
    transaction,
}) {
    const {translate} = useLocalize();

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };
    const taxRates = lodashGet(policy, 'taxRates', {});
    const defaultTaxKey = taxRates.defaultExternalID;
    const selectedTaxRate = (transaction.taxRate && transaction.taxRate.keyForList) || defaultTaxKey;

    const updateTaxRates = (taxes) => {
        const taxAmount = getTaxAmount(taxRates, taxes.text, transaction.amount);
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(taxAmount));
        IOU.setMoneyRequestTaxRate(transaction.transactionID, taxes);
        IOU.setMoneyRequestTaxAmount(transaction.transactionID, amountInSmallestCurrencyUnits);

        Navigation.goBack(backTo);
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
                        taxRates={taxRates}
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
        policy: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report ? report.policyID : '0'}`,
        },
    }),
)(IOURequestStepTaxRatePage);
