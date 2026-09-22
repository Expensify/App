import ActivityIndicator from '@components/ActivityIndicator';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

export default function TableLoadingState() {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsCenter]}>
            <ActivityIndicator
                color={theme.spinner}
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
            />
        </View>
    );
}
