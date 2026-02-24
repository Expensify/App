import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import useThemeStyles from '@hooks/useThemeStyles';

export default function LoadingView() {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flex1, styles.justifyContentCenter, styles.alignItemsCenter]}>
            <ActivityIndicator size={25} />
        </View>
    );
}
