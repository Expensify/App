import ActivityIndicator from '@components/ActivityIndicator';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

// Neutral placeholder shown under the RHP while a destination is pre-mounted. A native
// swipe-dismiss reveals this instead of the pre-inserted destination. Never linked/deep-linkable.
function PreMountBufferPage() {
    const styles = useThemeStyles();
    return (
        <View style={[styles.flex1, styles.appBG, styles.alignItemsCenter, styles.justifyContentCenter]}>
            <ActivityIndicator
                size="large"
                extraLoadingContext={{context: 'PreMountBufferPage'}}
            />
        </View>
    );
}

PreMountBufferPage.displayName = 'PreMountBufferPage';

export default PreMountBufferPage;
