/**
 * The shared surface for every screen in the test tools modal, so a second screen cannot drift out of step with the first.
 */
import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import SafeAreaConsumer from './SafeAreaConsumer';

type TestToolsScreenWrapperProps = {
    children: ReactNode;
};

function TestToolsScreenWrapper({children}: TestToolsScreenWrapperProps) {
    const styles = useThemeStyles();

    return <SafeAreaConsumer>{({safeAreaPaddingBottomStyle}) => <View style={[styles.h100, styles.defaultModalContainer, safeAreaPaddingBottomStyle]}>{children}</View>}</SafeAreaConsumer>;
}

export default TestToolsScreenWrapper;
