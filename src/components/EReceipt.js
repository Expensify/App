import React from 'react';
import {View} from 'react-native';
import Text from './Text';
import styles from '../styles/styles';
import transactionPropTypes from './transactionPropTypes';
import * as ReceiptUtils from '../libs/ReceiptUtils';
import * as ReportUtils from '../libs/ReportUtils';
import * as CurrencyUtils from '../libs/CurrencyUtils';
import tryResolveUrlFromApiRoot from '../libs/tryResolveUrlFromApiRoot';
import ThumbnailImage from './ThumbnailImage';

const propTypes = {
    /** The transaction for the eReceipt */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};

function EReceipt({transaction}) {
    const {thumbnail} = ReceiptUtils.getThumbnailAndImageURIs(transaction.receipt.source, transaction.filename);
    const {amount: transactionAmount, currency: transactionCurrency, merchant: transactionMerchant} = ReportUtils.getTransactionDetails(transaction);
    const formattedTransactionAmount = CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency);
    const thumbnailSource = tryResolveUrlFromApiRoot(thumbnail || '');
    return (
        <>
            <View style={styles.moneyRequestViewImage}>
                <ThumbnailImage
                    previewSourceURL={thumbnailSource}
                    style={[styles.w100, styles.h100]}
                    isAuthTokenRequired
                    shouldDynamicallyResize={false}
                />
            </View>
            <Text style={styles.eReceiptAmount}>{formattedTransactionAmount}</Text>
            <Text style={styles.textHeadline}>{transactionMerchant}</Text>
        </>
    );
}

export default EReceipt;
EReceipt.displayName = 'EReceipt';
EReceipt.propTypes = propTypes;
EReceipt.defaultProps = defaultProps;
