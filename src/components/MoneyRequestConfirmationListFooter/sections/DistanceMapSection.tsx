import React from 'react';
import {View} from 'react-native';
import ConfirmedRoute from '@components/ConfirmedRoute';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import {distanceMapSliceSelector} from '@components/MoneyRequestConfirmationList/sections/selectors';
import useTransactionSelector from '@components/MoneyRequestConfirmationList/sections/useTransactionSelector';
import shouldShowDistanceMap from '@components/MoneyRequestConfirmationListFooter/shouldShowDistanceMap';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Transaction} from '@src/types/onyx';

type DistanceMapSectionProps = {
    /** Whether the active transaction is a distance request (gate for showing the map) */
    isDistanceRequest: boolean;

    /** Whether the active transaction is a manual distance request (suppresses the map) */
    isManualDistanceRequest: boolean;

    /** Whether the active transaction is an odometer-driven distance request (suppresses the map) */
    isOdometerDistanceRequest: boolean;
};

/**
 * Two-level guard: the outer component uses the prop-only portion of `shouldShowDistanceMap`'s
 * gate (no transaction reads) to short-circuit on every non-distance / manual / odometer flow.
 * The inner component is the only place that subscribes to the transaction slice, so flows where
 * the map can never render avoid the extra Onyx subscriptions.
 */
function DistanceMapSection({isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest}: DistanceMapSectionProps) {
    if (!isDistanceRequest || isManualDistanceRequest || isOdometerDistanceRequest) {
        return null;
    }
    return <DistanceMapSectionContent />;
}

function DistanceMapSectionContent() {
    const styles = useThemeStyles();
    const {iouType, transactionID, isReadOnly} = useConfirmationFields();
    const transaction = useTransactionSelector(transactionID, distanceMapSliceSelector);

    // The outer gate has already guaranteed `isDistanceRequest && !manual && !odometer`,
    // so the remaining work is the transaction-dependent half of `shouldShowDistanceMap`.
    const shouldShowMap = shouldShowDistanceMap({
        transaction,
        isDistanceRequest: true,
        isManualDistanceRequest: false,
        isOdometerDistanceRequest: false,
        iouType,
        isReadOnly,
    });

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
