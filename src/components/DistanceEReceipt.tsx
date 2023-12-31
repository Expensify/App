import React, {useMemo} from 'react';
import {ScrollView, View} from 'react-native';
import EReceiptBackground from '@assets/images/eReceipt_background.svg';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as ReceiptUtils from '@libs/ReceiptUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import {TranslationPaths} from '@src/languages/types';
import {Transaction} from '@src/types/onyx';
import {WaypointCollection} from '@src/types/onyx/Transaction';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import ImageSVG from './ImageSVG';
import PendingMapView from './MapView/PendingMapView';
import Text from './Text';
import ThumbnailImage from './ThumbnailImage';

type DistanceEReceiptProps = {
    /** The transaction for the distance request */
    transaction: Transaction;
};

function DistanceEReceipt({transaction}: DistanceEReceiptProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {thumbnail = ''} = TransactionUtils.hasReceipt(transaction) ? ReceiptUtils.getThumbnailAndImageURIs(transaction) : {};
    const {amount: transactionAmount, currency: transactionCurrency, merchant: transactionMerchant, created: transactionDate} = ReportUtils.getTransactionDetails(transaction) ?? {};
    const formattedTransactionAmount = transactionAmount ? CurrencyUtils.convertToDisplayString(transactionAmount, transactionCurrency) : translate('common.tbd');
    const thumbnailSource = tryResolveUrlFromApiRoot((thumbnail as string) || '');
    const waypoints = useMemo(() => transaction?.comment?.waypoints ?? {}, [transaction?.comment?.waypoints]);
    const sortedWaypoints = useMemo<WaypointCollection>(
        () =>
            // The waypoint keys are sometimes out of order
            Object.keys(waypoints)
                .sort((keyA, keyB) => TransactionUtils.getWaypointIndex(keyA) - TransactionUtils.getWaypointIndex(keyB))
                .map((key) => ({[key]: waypoints[key]}))
                .reduce((result, obj) => (obj ? Object.assign(result, obj) : result), {}),
        [waypoints],
    );
    return (
        <View style={[styles.flex1, styles.alignItemsCenter]}>
            <ScrollView
                style={styles.w100}
                contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter]}
            >
                <View style={styles.eReceiptPanel}>
                    <ImageSVG
                        src={EReceiptBackground}
                        style={styles.eReceiptBackground}
                        pointerEvents="none"
                    />

                    <View style={[styles.moneyRequestViewImage, styles.mh0, styles.mt0, styles.mb5, styles.borderNone]}>
                        {isOffline === true || !thumbnailSource ? (
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
                        {Object.entries(sortedWaypoints).map(([key, waypoint]) => {
                            const index = TransactionUtils.getWaypointIndex(key);
                            let descriptionKey = 'distance.waypointDescription.';
                            if (index === 0) {
                                descriptionKey += 'start';
                            } else if (index === Object.keys(waypoints).length - 1) {
                                descriptionKey += 'finish';
                            } else {
                                descriptionKey += 'stop';
                            }
                            return (
                                <View
                                    style={styles.gap1}
                                    key={key}
                                >
                                    <Text style={styles.eReceiptWaypointTitle}>{translate(descriptionKey as TranslationPaths)}</Text>
                                    {waypoint?.name && <Text style={styles.eReceiptWaypointAddress}>{waypoint.name}</Text>}
                                    {waypoint?.address && <Text style={styles.textLabelSupporting}>{waypoint.address}</Text>}
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
                            src={Expensicons.ExpensifyWordmark}
                        />

                        <Text style={styles.eReceiptGuaranteed}>{translate('eReceipt.guaranteed')}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

DistanceEReceipt.displayName = 'DistanceEReceipt';

export default DistanceEReceipt;
