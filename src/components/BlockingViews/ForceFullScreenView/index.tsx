import {useRoute} from '@react-navigation/native';
import React, {useContext, useEffect} from 'react';
import {View} from 'react-native';
import {FullScreenBlockingViewContext} from '@components/FullScreenBlockingViewContextProvider';
import useThemeStyles from '@hooks/useThemeStyles';
import type ForceFullScreenViewProps from './types';

function ForceFullScreenView({children, shouldForceFullScreen = false}: ForceFullScreenViewProps) {
    const route = useRoute();
    const styles = useThemeStyles();
    const {addRouteKey, removeRouteKey} = useContext(FullScreenBlockingViewContext);

    useEffect(() => {
        if (!shouldForceFullScreen) {
            return;
        }

        addRouteKey(route.key);

        return () => removeRouteKey(route.key);
    }, [addRouteKey, removeRouteKey, route.key, shouldForceFullScreen]);

    if (shouldForceFullScreen) {
        return <View style={styles.forcedBlockingViewContainer}>{children}</View>;
    }

    return children;
}

ForceFullScreenView.displayName = 'ForceFullScreenView';

export default ForceFullScreenView;
