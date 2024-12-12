import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ExtraContentProps} from '@libs/Navigation/PlatformStackNavigation/types';

function SearchRoute({searchRoute, descriptors}: ExtraContentProps) {
    const styles = useThemeStyles();

    if (!searchRoute) {
        return null;
    }

    const key = searchRoute.key;
    const descriptor = descriptors[key];

    if (!descriptor) {
        return null;
    }

    return <View style={styles.dNone}>{descriptor.render()}</View>;
}

export default SearchRoute;
