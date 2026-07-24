import ConfirmedRoute from '@components/ConfirmedRoute';
import {useConfirmationFields} from '@components/MoneyRequestConfirmationFields/context';
import {distanceMapSliceSelector} from '@components/MoneyRequestConfirmationList/sections/selectors';
import useTransactionSelector from '@components/MoneyRequestConfirmationList/sections/useTransactionSelector';
import shouldShowDistanceMap from '@components/MoneyRequestConfirmationListFooter/shouldShowDistanceMap';

import useThemeStyles from '@hooks/useThemeStyles';

import type {Transaction} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

/**
 * Two-level guard: the outer component uses the context-level discriminators (no transaction reads)
 * to short-circuit on every non-distance / manual / odometer flow. The inner component is the only
 * place that subscribes to the transaction slice, so flows where the map can never render avoid the
 * extra Onyx subscriptions.
 */
function DistanceMapSection() {
    const {isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest} = useConfirmationFields();
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
