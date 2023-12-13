import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TaxPicker from '@components/TaxPicker';
import taxPropTypes from '@components/taxPropTypes';
import compose from '@libs/compose';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {iouDefaultProps, iouPropTypes} from '@pages/iou/propTypes';
import * as IOU from '@userActions/IOU';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** The type of IOU report, i.e. bill, request, send */
            iouType: PropTypes.string,

            /** The report ID of the IOU */
            reportID: PropTypes.string,
        }),
    }).isRequired,
    policyTaxRates: taxPropTypes,

    /** Holds data related to Money Request view state, rather than the underlying Money Request data. */
    iou: iouPropTypes,

    transactionsDraft: PropTypes.shape({
        taxRate: PropTypes.string,
    }),
};

const defaultProps = {
    policyTaxRates: {},
    iou: iouDefaultProps,
    transactionsDraft: {
        taxRate: null,
    },
};

// this is the formulae to calculate tax
const calculateAmount = (taxRates, selectedTaxRate, amount) => {
    const percentage = _.find(taxRates, (taxRate) => taxRate.name === selectedTaxRate).value;
    const divisor = percentage.slice(0, -1) / 100 + 1; // slice to remove % at the end; converts "10%" to "10"
    return parseInt(Math.round(amount - amount / divisor), 10) / 100; // returns The expense amount of transaction
};

function IOURequestStepTaxRatePage({route, iou, policyTaxRates, transactionsDraft}) {
    const iouType = lodashGet(route, 'params.iouType', '');
    const reportID = lodashGet(route, 'params.reportID', '');

    function navigateBack() {
        Navigation.goBack(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, reportID));
    }

    const updateTaxRates = (taxes) => {
        const taxAmount = calculateAmount(policyTaxRates.taxes, taxes.text, iou.amount);
        const amountInSmallestCurrencyUnits = CurrencyUtils.convertToBackendAmount(Number.parseFloat(taxAmount));
        IOU.setMoneyRequestTaxRate(iou.transactionID, taxes.text);
        IOU.setMoneyRequestTaxAmount(iou.transactionID, amountInSmallestCurrencyUnits);

        Navigation.goBack(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, reportID));
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
                        title="Tax Rate"
                        onBackButtonPress={() => navigateBack()}
                    />
                    <TaxPicker
                        selectedTaxRate={transactionsDraft.taxRate}
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
    withOnyx({
        iou: {
            key: ONYXKEYS.IOU,
        },
    }),
    // eslint-disable-next-line rulesdir/no-multiple-onyx-in-file
    withOnyx({
        report: {
            key: ({route, iou}) => {
                const reportID = IOU.getIOUReportID(iou, route);

                return `${ONYXKEYS.COLLECTION.REPORT}${reportID}`;
            },
        },
    }),
    withOnyx({
        policyTaxRates: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY_TAX_RATE}${report ? report.policyID : '0'}`,
        },
    }),
    withOnyx({
        transactionsDraft: {
            key: ({iou}) => `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${iou.transactionID}`,
        },
    }),
)(IOURequestStepTaxRatePage);
