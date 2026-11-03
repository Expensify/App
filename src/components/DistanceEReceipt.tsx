import useThemeStyles from '@hooks/useThemeStyles';

import type {Transaction} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

import DistanceEReceiptPanel from './DistanceEReceiptPanel';
import ScrollView from './ScrollView';

type DistanceEReceiptProps = {
    /** The transaction for the distance expense */
    transaction: Transaction;

    /** Whether the distanceEReceipt is shown as hover preview */
    hoverPreview?: boolean;
};

function DistanceEReceipt({transaction, hoverPreview = false}: DistanceEReceiptProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flex1, styles.alignItemsCenter, hoverPreview && styles.mhv5]}>
            <ScrollView
                style={styles.w100}
                contentContainerStyle={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter]}
            >
                <DistanceEReceiptPanel transaction={transaction} />
            </ScrollView>
        </View>
    );
}

export default DistanceEReceipt;
