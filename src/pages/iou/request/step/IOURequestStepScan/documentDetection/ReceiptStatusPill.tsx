import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';

type ReceiptStatusPillProps = {
    /** Shown before the message, such as an icon or a spinner */
    children: ReactNode;

    message: string;

    /** Milliseconds before the pill fades in, so a status that clears quickly never flashes on screen */
    appearDelayMs?: number;
};

function ReceiptStatusPill({children, message, appearDelayMs = 0}: ReceiptStatusPillProps) {
    const styles = useThemeStyles();

    return (
        <View
            style={styles.receiptEnhancementToastContainer}
            pointerEvents="none"
        >
            <Animated.View
                entering={FadeIn.delay(appearDelayMs)}
                exiting={FadeOut}
                style={[styles.growlNotificationBox, styles.ph4, styles.pv3]}
                role={CONST.ROLE.STATUS}
                accessibilityLiveRegion="polite"
            >
                {children}
                <Text style={styles.productTrainingTooltipText}>{message}</Text>
            </Animated.View>
        </View>
    );
}

export default ReceiptStatusPill;
