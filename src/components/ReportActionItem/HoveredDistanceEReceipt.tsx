import DistanceEReceipt from '@components/DistanceEReceipt';

import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {Transaction} from '@src/types/onyx';

import type {LayoutChangeEvent} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

type HoveredDistanceEReceiptProps = {
    /** The transaction for the distance expense */
    transaction: Transaction;
};

function HoveredDistanceEReceipt({transaction}: HoveredDistanceEReceiptProps) {
    const styles = useThemeStyles();
    const [boxWidth, setBoxWidth] = useState(0);
    const [boxHeight, setBoxHeight] = useState(0);
    const [cardHeight, setCardHeight] = useState(0);

    const scale = boxWidth && boxHeight && cardHeight ? Math.min(boxWidth / variables.eReceiptHoverCardWidth, boxHeight / cardHeight) : 0;

    const onOverlayLayout = (event: LayoutChangeEvent) => {
        setBoxWidth(event.nativeEvent.layout.width);
        setBoxHeight(event.nativeEvent.layout.height);
    };

    const onCardLayout = (event: LayoutChangeEvent) => {
        setCardHeight(event.nativeEvent.layout.height);
    };

    return (
        <View
            style={[styles.pAbsolute, styles.t0, styles.l0, styles.r0, styles.b0, styles.justifyContentCenter, styles.alignItemsCenter, styles.overflowHidden, styles.eReceiptHoverFill]}
            onLayout={onOverlayLayout}
            pointerEvents="none"
        >
            <View
                style={[{width: variables.eReceiptHoverCardWidth}, scale ? {transform: [{scale}]} : styles.opacity0]}
                onLayout={onCardLayout}
            >
                <DistanceEReceipt transaction={transaction} />
            </View>
        </View>
    );
}

export default HoveredDistanceEReceipt;
