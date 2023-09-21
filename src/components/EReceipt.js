import React from 'react';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import Text from './Text';
import styles from '../styles/styles';
import transactionPropTypes from './transactionPropTypes';
import * as ReceiptUtils from '../libs/ReceiptUtils';
import * as ReportUtils from '../libs/ReportUtils';
import * as CurrencyUtils from '../libs/CurrencyUtils';
import * as TransactionUtils from '../libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '../libs/tryResolveUrlFromApiRoot';
import ThumbnailImage from './ThumbnailImage';
import useLocalize from '../hooks/useLocalize';

const propTypes = {
    /** The transaction for the eReceipt */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};

function EReceipt({transaction}) {
    const {translate} = useLocalize();
    const {thumbnail} = ReceiptUtils.getThumbnailAndImageURIs(transaction.receipt.source, transaction.filename);
    const {amount: transactionAmount, currency: transactionCurrency, merchant: transactionMerchant} = ReportUtils.getTransactionDetails(transaction);
    const formattedTransactionAmount = CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency);
    const thumbnailSource = tryResolveUrlFromApiRoot(thumbnail || '');
    const waypoints = lodashGet(transaction, 'comment.waypoints', {});
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
            <Text style={styles.eReceiptMerchant}>{transactionMerchant}</Text>
            <>
                {_.map(waypoints, (waypoint, key) => {
                    const index = TransactionUtils.getWaypointIndex(key);
                    let descriptionKey = 'distance.waypointDescription.';
                    if (index === 0) {
                        descriptionKey += 'start';
                    } else if (index === _.size(waypoints) - 1) {
                        descriptionKey += 'finish';
                    } else {
                        descriptionKey += 'stop';
                    }
                    return (
                        <View>
                            <Text>{translate(descriptionKey)}</Text>
                            <Text>{waypoint.address || ''}</Text>
                        </View>
                    );
                })}
            </>
        </>
    );
}

export default EReceipt;
EReceipt.displayName = 'EReceipt';
EReceipt.propTypes = propTypes;
EReceipt.defaultProps = defaultProps;
