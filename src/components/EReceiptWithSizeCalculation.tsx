import React, {useState} from 'react';
import {View} from 'react-native';
import type {LayoutChangeEvent} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type {Transaction} from '@src/types/onyx';
import EReceipt from './EReceipt';
import PerDiemEReceipt from './PerDiemEReceipt';
import type {TransactionListItemType} from './SelectionListWithSections/types';

type EReceiptWithSizeCalculationProps = {
    /* TransactionID of the transaction this EReceipt corresponds to */
    transactionID: string | undefined;

    /** The transaction data in search */
    transactionItem?: TransactionListItemType | Transaction;

    /** Whether the eReceipt should preserve aspect ratio */
    shouldUseAspectRatio?: boolean;

    /** Callback to be called when the image loads */
    onLoad?: () => void;

    /** Determines which receipt component to render */
    receiptType?: 'default' | 'perDiem';
};

const eReceiptAspectRatio = variables.eReceiptBGHWidth / variables.eReceiptBGHeight;

function EReceiptWithSizeCalculation(props: EReceiptWithSizeCalculationProps) {
    const [scaleFactor, setScaleFactor] = useState(0);
    const styles = useThemeStyles();

    const onLayout = (e: LayoutChangeEvent) => {
        const {width} = e.nativeEvent.layout;
        setScaleFactor(width / variables.eReceiptBGHWidth);
    };

    if (props.receiptType === 'perDiem' && !props.transactionID) {
        return null;
    }

    return scaleFactor ? (
        <View style={[styles.overflowHidden, styles.w100, styles.h100, styles.userSelectNone]}>
            <View
                onLayout={onLayout}
                // We are applying transform of 0 translateZ to avoid a sub-pixel rendering error of a thin 1px line
                // appearing on EReceipts on web, specifically in chrome. More details in https://github.com/Expensify/App/pull/59944#issuecomment-2797249923.
                style={[
                    styles.w100,
                    styles.h100,
                    {transform: `scale(${scaleFactor}) ${styles.translateZ0.transform as string}`, transformOrigin: 'top left'},
                    (props.receiptType === 'perDiem' ? true : props.shouldUseAspectRatio) && {aspectRatio: eReceiptAspectRatio},
                ]}
            >
                {props.receiptType === 'perDiem' && props.transactionID ? (
                    <PerDiemEReceipt transactionID={props.transactionID} />
                ) : (
                    <EReceipt
                        transactionID={props.transactionID}
                        transactionItem={props.transactionItem}
                        onLoad={props.onLoad}
                        isThumbnail
                    />
                )}
            </View>
        </View>
    ) : (
        <View
            style={[styles.w100, styles.h100]}
            onLayout={onLayout}
        />
    );
}

export default EReceiptWithSizeCalculation;
