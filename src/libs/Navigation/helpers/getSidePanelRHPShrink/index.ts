import calculateMaxSidePanelRHPShrink from '@libs/Navigation/helpers/calculateMaxSidePanelRHPShrink';

// The offset is a react-native Animated node driven by the Side Panel and the value feeds react-navigation card styles.
// eslint-disable-next-line no-restricted-imports
import type {Animated} from 'react-native';

/** Room the super wide RHP gives the Side Panel, capped at the spare above the wide RHP width so the card never clips its own panes. */
function getSidePanelRHPShrink(sidePanelOffset: Animated.Value, windowWidth: number) {
    const paneSpare = calculateMaxSidePanelRHPShrink(windowWidth);
    const cap = Math.max(paneSpare, 1);

    return sidePanelOffset.interpolate({
        inputRange: [0, cap, cap + 1],
        outputRange: [0, paneSpare, paneSpare],
    });
}

export default getSidePanelRHPShrink;
