import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type {ScrollAwayHeaderContainerProps} from './types';

/** The header never scrolls away on native. */
function ScrollAwayHeaderContainer({children}: ScrollAwayHeaderContainerProps) {
    const styles = useThemeStyles();

    return <View style={styles.flex1}>{children}</View>;
}

export default ScrollAwayHeaderContainer;
