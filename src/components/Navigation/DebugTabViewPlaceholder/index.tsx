import DebugTabView from '@components/Navigation/DebugTabView';
import type NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';

import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type Props = {
    selectedTab: ValueOf<typeof NAVIGATION_TABS>;
};

function DebugTabViewPlaceholder({selectedTab}: Props) {
    const styles = useThemeStyles();
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);

    if (!isDebugModeEnabled) {
        return null;
    }

    return (
        <View style={styles.visibilityHidden}>
            <DebugTabView selectedTab={selectedTab} />
        </View>
    );
}

export default DebugTabViewPlaceholder;
