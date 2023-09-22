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
import Icon from './Icon';
import themeColors from '../styles/themes/default';
import * as Expensicons from './Icon/Expensicons';
import EReceiptBackground from '../../assets/images/eReceipt_background.svg';

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
    const {amount: transactionAmount, currency: transactionCurrency, merchant: transactionMerchant, created: transactionDate} = ReportUtils.getTransactionDetails(transaction);
    const formattedTransactionAmount = CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency);
    const thumbnailSource = tryResolveUrlFromApiRoot(thumbnail || '');
    const waypoints = lodashGet(transaction, 'comment.waypoints', {});
    return (
        <View style={[styles.flex1, styles.ph5, styles.pv5]}>
            <View style={styles.eReceiptPanel}>
                <View style={styles.eReceiptBackgroundContainer}>
                    <EReceiptBackground
                        style={styles.eReceiptBackground}
                        pointerEvents="none"
                    />
                </View>
                <View style={[styles.moneyRequestViewImage, styles.mh0, styles.mv0]}>
                    <ThumbnailImage
                        previewSourceURL={thumbnailSource}
                        style={[styles.w100, styles.h100]}
                        isAuthTokenRequired
                        shouldDynamicallyResize={false}
                    />
                </View>
                <View>
                    <Text style={styles.eReceiptAmount}>{formattedTransactionAmount}</Text>
                    <Text style={styles.eReceiptMerchant}>{transactionMerchant}</Text>
                </View>
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
                        <View key={key}>
                            <Text style={styles.eReceiptWaypointTitle}>{translate(descriptionKey)}</Text>
                            <Text style={styles.eReceiptWaypointAddress}>{waypoint.address || ''}</Text>
                        </View>
                    );
                })}
                <View>
                    <Text style={styles.eReceiptWaypointTitle}>{translate('common.date')}</Text>
                    <Text style={styles.eReceiptWaypointAddress}>{transactionDate}</Text>
                </View>
                <View style={[styles.flexRow, styles.justifyContentBetween]}>
                    <Icon
                        width={154}
                        height={34}
                        fill={themeColors.textBrand}
                        src={Expensicons.ExpensifyWordmark}
                    />
                    <Text style={styles.eReceiptGuaranteed}>{translate('eReceipt.guaranteed')}</Text>
                </View>
            </View>
        </View>
    );
}

export default EReceipt;
EReceipt.displayName = 'EReceipt';
EReceipt.propTypes = propTypes;
EReceipt.defaultProps = defaultProps;
