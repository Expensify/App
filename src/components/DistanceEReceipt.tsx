import React, {useMemo} from 'react';
import {View} from 'react-native';
import EReceiptBackground from '@assets/images/eReceipt_background.svg';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import {getTransactionDetails} from '@libs/ReportUtils';
import {getWaypointIndex, hasReceipt, isFetchingWaypointsFromServer} from '@libs/TransactionUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import type {TranslationPaths} from '@src/languages/types';
import type {Transaction} from '@src/types/onyx';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import Icon from './Icon';
import ImageSVG from './ImageSVG';
import PendingMapView from './MapView/PendingMapView';
import ReceiptImage from './ReceiptImage';
import ScrollView from './ScrollView';
import Text from './Text';

type DistanceEReceiptProps = {
    /** The transaction for the distance expense */
    transaction: Transaction;

    /** Whether the distanceEReceipt is shown as hover preview */
    hoverPreview?: boolean;
};

function DistanceEReceipt({transaction, hoverPreview = false}: DistanceEReceiptProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ExpensifyWordmark']);
    const thumbnail = hasReceipt(transaction) ? getThumbnailAndImageURIs(transaction).thumbnail : null;
    const {amount: transactionAmount, currency: transactionCurrency, merchant: transactionMerchant, created: transactionDate} = getTransactionDetails(transaction) ?? {};
    const formattedTransactionAmount = convertToDisplayString(transactionAmount, transactionCurrency);
    const thumbnailSource = tryResolveUrlFromApiRoot(thumbnail ?? '');
    const waypoints = useMemo(() => transaction?.comment?.waypoints ?? {}, [transaction?.comment?.waypoints]);
    const sortedWaypoints = useMemo<WaypointCollection>(
        () =>
            // The waypoint keys are sometimes out of order
            Object.keys(waypoints)
                .sort((keyA, keyB) => getWaypointIndex(keyA) - getWaypointIndex(keyB))
                .map((key) => ({[key]: waypoints[key]}))
                .reduce((result, obj) => (obj ? Object.assign(result, obj) : result), {}),
        [waypoints],
    );
    return (
        <View style={[styles.flex1, styles.alignItemsCenter, hoverPreview && styles.mhv5]}>
            <ScrollView
                style={styles.w100}
                contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter]}
            >
                <View style={styles.eReceiptPanel}>
                    <ImageSVG
                        src={EReceiptBackground}
                        style={styles.eReceiptBackground}
                        pointerEvents="none"
                        // Temporary solution only, since other cache policies are causing memory leaks on iOS
                        cachePolicy="none"
                    />

                    <View style={[styles.moneyRequestViewImage, styles.mh0, styles.mt0, styles.mb5, styles.borderNone]}>
                        {isFetchingWaypointsFromServer(transaction) || !thumbnailSource ? (
                            <PendingMapView />
                        ) : (
                            <ReceiptImage
                                source={thumbnailSource}
                                shouldUseThumbnailImage
                                shouldUseInitialObjectPosition
                                isAuthTokenRequired
                            />
                        )}
                    </View>
                    <View style={[styles.mb10, styles.gap5, styles.ph2, styles.flexColumn, styles.alignItemsCenter]}>
                        {transactionAmount !== null && transactionAmount !== undefined && <Text style={styles.eReceiptAmount}>{formattedTransactionAmount}</Text>}
                        <Text style={styles.eReceiptMerchant}>{transactionMerchant !== translate('iou.fieldPending') ? transactionMerchant : transaction.merchant}</Text>
                    </View>
                    <View style={[styles.mb10, styles.gap5, styles.ph2]}>
                        {Object.entries(sortedWaypoints).map(([key, waypoint]) => {
                            const index = getWaypointIndex(key);
                            let descriptionKey: TranslationPaths = 'distance.waypointDescription.stop';
                            if (index === 0) {
                                descriptionKey = 'distance.waypointDescription.start';
                            }

                            return (
                                <View
                                    style={styles.gap1}
                                    key={key}
                                >
                                    <Text style={styles.eReceiptWaypointTitle}>{translate(descriptionKey)}</Text>
                                    {!!waypoint?.name && <Text style={styles.eReceiptWaypointAddress}>{waypoint.name}</Text>}
                                    {!!waypoint?.address && <Text style={styles.eReceiptGuaranteed}>{waypoint.address}</Text>}
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
                            src={icons.ExpensifyWordmark}
                            // Temporary solution only, since other cache policies are causing memory leaks on iOS
                            cachePolicy="none"
                        />

                        <Text style={styles.eReceiptGuaranteed}>{translate('eReceipt.guaranteed')}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

export default DistanceEReceipt;
