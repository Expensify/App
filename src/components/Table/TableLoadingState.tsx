import ActivityIndicator from '@components/ActivityIndicator';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type TableLoadingStateProps = {
    /** Describes where the component is rendered using component hierarchy. Use dot notation to show parent-child relationships  */
    context: string;
};

export default function TableLoadingState({context}: TableLoadingStateProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsCenter]}>
            <ActivityIndicator
                color={theme.spinner}
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                reasonAttributes={{context, isLoading: true}}
            />
        </View>
    );
}
