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

function DistanceMapSection({isDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest}: DistanceMapSectionProps) {
    const styles = useThemeStyles();
    const {iouType, transactionID, isReadOnly} = useConfirmationFields();
    const transaction = useTransactionSelector(transactionID, distanceMapSliceSelector);

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
