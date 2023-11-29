import lodashGet from 'lodash/get';
import React, {useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import _ from 'underscore';
import EReceiptBackground from '@assets/images/eReceipt_background.svg';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PendingMapView from './MapView/PendingMapView';
import Text from './Text';
import ThumbnailImage from './ThumbnailImage';
import transactionPropTypes from './transactionPropTypes';

const propTypes = {
    /** The transaction for the distance request */
    transaction: transactionPropTypes,
};

const defaultProps = {
    transaction: {},
};

function DistanceEReceipt({transaction}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {thumbnail} = TransactionUtils.hasReceipt(transaction) ? ReceiptUtils.getThumbnailAndImageURIs(transaction) : {};
    const {amount: transactionAmount, currency: transactionCurrency, merchant: transactionMerchant, created: transactionDate} = ReportUtils.getTransactionDetails(transaction);
    const formattedTransactionAmount = transactionAmount ? CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency) : translate('common.tbd');
    const thumbnailSource = tryResolveUrlFromApiRoot(thumbnail || '');
    const waypoints = lodashGet(transaction, 'comment.waypoints', {});
    const sortedWaypoints = useMemo(
        () =>
            // The waypoint keys are sometimes out of order
            _.chain(waypoints)
                .keys()
                .sort((keyA, keyB) => TransactionUtils.getWaypointIndex(keyA) - TransactionUtils.getWaypointIndex(keyB))
                .map((key) => ({[key]: waypoints[key]}))
                .reduce((result, obj) => (obj ? _.assign(result, obj) : result), {})
                .value(),
        [waypoints],
    );
    return (
        <View style={[styles.flex1, styles.alignItemsCenter]}>
            <ScrollView
                style={styles.w100}
                contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter]}
            >
                <View style={styles.eReceiptPanel}>
                    <EReceiptBackground
                        style={styles.eReceiptBackground}
                        pointerEvents="none"
                    />
                    <View style={[styles.moneyRequestViewImage, styles.mh0, styles.mt0, styles.mb5, styles.borderNone]}>
                        {isOffline || !thumbnailSource ? (
                            <PendingMapView />
                        ) : (
                            <ThumbnailImage
                                previewSourceURL={thumbnailSource}
                                style={[styles.w100, styles.h100]}
                                isAuthTokenRequired
                                shouldDynamicallyResize={false}
                            />
                        )}
                    </View>
                    <View style={[styles.mb10, styles.gap5, styles.ph2, styles.flexColumn, styles.alignItemsCenter]}>
                        <Text style={styles.eReceiptAmount}>{formattedTransactionAmount}</Text>
                        <Text style={styles.eReceiptMerchant}>{transactionMerchant}</Text>
                    </View>
                    <View style={[styles.mb10, styles.gap5, styles.ph2]}>
                        {_.map(sortedWaypoints, (waypoint, key) => {
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
                                <View
                                    style={styles.gap1}
                                    key={key}
                                >
                                    <Text style={styles.eReceiptWaypointTitle}>{translate(descriptionKey)}</Text>
                                    {waypoint.name && <Text style={styles.eReceiptWaypointAddress}>{waypoint.name}</Text>}
                                    {waypoint.address && <Text style={styles.textLabelSupporting}>{waypoint.address}</Text>}
                                </View>
                            );
                        })}
                        <View style={styles.gap1}>
                            <Text style={styles.eReceiptWaypointTitle}>{translate('common.date')}</Text>
                            <Text style={styles.eReceiptWaypointAddress}>{transactionDate}</Text>
                        </View>
                    </View>
                    <View style={[styles.ph2, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                        <Icon
                            width={86}
                            height={19.25}
                            fill={theme.textBrand}
                            src={Expensicons.ExpensifyWordmark}
                        />

                        <Text style={styles.eReceiptGuaranteed}>{translate('eReceipt.guaranteed')}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

export default DistanceEReceipt;
DistanceEReceipt.displayName = 'DistanceEReceipt';
DistanceEReceipt.propTypes = propTypes;
DistanceEReceipt.defaultProps = defaultProps;
