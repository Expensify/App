import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmedRoute from '@components/ConfirmedRoute';
import useThemeStyles from '@hooks/useThemeStyles';
import {isFetchingWaypointsFromServer} from '@libs/TransactionUtils';
import {init as initMapboxToken, stop as stopMapboxToken} from '@userActions/MapboxToken';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type {Transaction} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type DistanceMapSectionProps = {
    transaction: OnyxEntry<Transaction>;
    isDistanceRequest: boolean;
    isManualDistanceRequest: boolean;
    isOdometerDistanceRequest: boolean;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    isReadOnly: boolean;
};

function DistanceMapSection({transaction, isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest, iouType, isReadOnly}: DistanceMapSectionProps) {
    const styles = useThemeStyles();

    const hasPendingWaypoints = transaction && isFetchingWaypointsFromServer(transaction);
    const hasErrors = !isEmptyObject(transaction?.errors) || !isEmptyObject(transaction?.errorFields?.route) || !isEmptyObject(transaction?.errorFields?.waypoints);
    const shouldShowMap =
        isDistanceRequest && !isManualDistanceRequest && !isOdometerDistanceRequest && [hasErrors, hasPendingWaypoints, iouType !== CONST.IOU.TYPE.SPLIT, !isReadOnly].some(Boolean);

    // Mapbox token lifecycle is gated here so it only runs when the map is visible
    useEffect(() => {
        if (!shouldShowMap) {
            return;
        }
        initMapboxToken();
        return stopMapboxToken;
    }, [shouldShowMap]);

    if (!shouldShowMap) {
        return null;
    }

    return (
        <View style={styles.confirmationListMapItem}>
            <ConfirmedRoute transaction={transaction ?? ({} as Transaction)} />
        </View>
    );
}

export default DistanceMapSection;
