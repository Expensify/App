import ActivityIndicator from '@components/ActivityIndicator';

import useTheme from '@hooks/useTheme';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type BaseMenuItemSpinnerProps = {
    /** Matches the corresponding icon leaf's slot so loading does not shift the content. */
    style: StyleProp<ViewStyle>;
};

/** Shared spinner presentation for the leading icon slots. */
function BaseMenuItemSpinner({style}: BaseMenuItemSpinnerProps) {
    const theme = useTheme();

    return (
        <View style={style}>
            <ActivityIndicator color={theme.textSupporting} />
        </View>
    );
}

export default BaseMenuItemSpinner;
