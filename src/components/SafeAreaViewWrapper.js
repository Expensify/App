import React from 'react';
import {View} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import styles, {getSafeAreaPadding} from '../styles/styles';
import CustomStatusBar from './CustomStatusBar';

export default props => (
    <>
        <CustomStatusBar />
        <SafeAreaInsetsContext.Consumer style={[styles.flex1]}>
            {insets => (
                <View
                    style={[
                        ...(props.style || []),
                        styles.appContentWrapper,
                        styles.flex1,
                        getSafeAreaPadding(insets),
                    ]}
                >
                    {props.children(insets)}
                </View>
            )}
        </SafeAreaInsetsContext.Consumer>
    </>
);
