import React, {useState} from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type {Transaction} from '@src/types/onyx';
import EReceipt from './EReceipt';
import type {TransactionListItemType} from './SelectionList/types';

type EReceiptWithSizeCalculationProps = {
    transactionID: string | undefined;

    transactionItem?: TransactionListItemType | Transaction;
};

function EReceiptWithSizeCalculation(props: EReceiptWithSizeCalculationProps) {
    const [scaleFactor, setScaleFactor] = useState(0);
    const styles = useThemeStyles();

    const onLayout = (e: LayoutChangeEvent) => {
        const {width} = e.nativeEvent.layout;
        setScaleFactor(width / variables.eReceiptBGHWidth);
    };

    return scaleFactor ? (
        <View style={[styles.overflowHidden, styles.w100, styles.h100, styles.userSelectNone]}>
            <View
                onLayout={onLayout}
                // We are applying transform of 0 translateZ to avoid a sub-pixel rendering error of a thin 1px line
                // appearing on EReceipts on web, specifically in chrome. More details in https://github.com/Expensify/App/pull/59944#issuecomment-2797249923.
                style={[styles.w100, styles.h100, {transform: `scale(${scaleFactor}) ${styles.translateZ0.transform as string}`, transformOrigin: 'top left'}]}
            >
                <EReceipt
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    isThumbnail
                />
            </View>
        </View>
    ) : (
        <View
            style={[styles.w100, styles.h100]}
            onLayout={onLayout}
        />
    );
}

EReceiptWithSizeCalculation.displayName = 'EReceiptWithSizeCalculation';

export default EReceiptWithSizeCalculation;
