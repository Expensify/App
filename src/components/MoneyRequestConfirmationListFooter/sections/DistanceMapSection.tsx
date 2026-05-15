import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmedRoute from '@components/ConfirmedRoute';
import shouldShowDistanceMap from '@components/MoneyRequestConfirmationListFooter/shouldShowDistanceMap';
import useThemeStyles from '@hooks/useThemeStyles';
import type CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

type DistanceMapSectionProps = {
    /** Active transaction (drives the rendered route + waypoint pending/error state) */
    transaction: OnyxEntry<Transaction>;

    /** Whether the active transaction is a distance request (gate for showing the map) */
    isDistanceRequest: boolean;

    /** Whether the active transaction is a manual distance request (suppresses the map) */
    isManualDistanceRequest: boolean;

    /** Whether the active transaction is an odometer-driven distance request (suppresses the map) */
    isOdometerDistanceRequest: boolean;

    /** Type of IOU being confirmed (splits never show the map) */
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;

    /** Whether the surface is read-only (read-only without errors/pending hides the map) */
    isReadOnly: boolean;
};

function DistanceMapSection({transaction, isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest, iouType, isReadOnly}: DistanceMapSectionProps) {
    const styles = useThemeStyles();

    const shouldShowMap = shouldShowDistanceMap({transaction, isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest, iouType, isReadOnly});

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
