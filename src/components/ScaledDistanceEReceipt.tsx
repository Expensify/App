import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {Transaction} from '@src/types/onyx';

import type {LayoutChangeEvent} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

import DistanceEReceipt from './DistanceEReceipt';

// The card lays out at a fixed width and the map inside it is a 1024px thumbnail, so past roughly three times
// that width the map is the first thing to blur. Text keeps scaling cleanly either way.
const MAX_SCALE = 3;

type ScaledDistanceEReceiptProps = {
    /** The transaction for the distance expense */
    transaction: Transaction;
};

/**
 * Draws the distance e-receipt at the size of whatever space it is given. The card itself is laid out at a fixed
 * width, so on a full screen it would otherwise sit small in the middle, and a card taller than the screen would
 * run off the bottom. Scaling covers both.
 */
function ScaledDistanceEReceipt({transaction}: ScaledDistanceEReceiptProps) {
    const styles = useThemeStyles();
    const [boxWidth, setBoxWidth] = useState(0);
    const [boxHeight, setBoxHeight] = useState(0);
    const [cardHeight, setCardHeight] = useState(0);

    // Falls back to the card's own size until the first layout, so a platform that never reports one still
    // renders a readable receipt rather than nothing.
    const scale = boxWidth && boxHeight && cardHeight ? Math.min(boxWidth / variables.eReceiptHoverCardWidth, boxHeight / cardHeight, MAX_SCALE) : 1;

    const onBoxLayout = (event: LayoutChangeEvent) => {
        setBoxWidth(event.nativeEvent.layout.width);
        setBoxHeight(event.nativeEvent.layout.height);
    };

    const onCardLayout = (event: LayoutChangeEvent) => {
        setCardHeight(event.nativeEvent.layout.height);
    };

    return (
        <View
            style={[styles.flex1, styles.w100, styles.justifyContentCenter, styles.alignItemsCenter, styles.overflowHidden]}
            onLayout={onBoxLayout}
        >
            <View
                style={[{width: variables.eReceiptHoverCardWidth}, {transform: [{scale}]}]}
                onLayout={onCardLayout}
            >
                <DistanceEReceipt transaction={transaction} />
            </View>
        </View>
    );
}

export default ScaledDistanceEReceipt;
