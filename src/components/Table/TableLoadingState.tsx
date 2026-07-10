import ActivityIndicator from '@components/ActivityIndicator';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type TableLoadingStateProps = {
    isLoading: boolean;
    context: string;
};

export default function TableLoadingState({context, isLoading}: TableLoadingStateProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    if (!isLoading) {
        return null;
    }

    return (
        <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsCenter]}>
            <ActivityIndicator
                color={theme.spinner}
                style={[styles.pl3]}
                size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                reasonAttributes={{context, isLoading}}
            />
        </View>
    );
}
