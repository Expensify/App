import useThemeStyles from '@hooks/useThemeStyles';

import type {PropsWithChildren} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type AvatarContainerProps = PropsWithChildren<{
    /** Extra styles to pass to the wrapping View */
    containerStyles?: StyleProp<ViewStyle>;

    /** Test ID used to locate the avatar in tests */
    testID?: string;
}>;

/** Shared root wrapper for avatar components. Applies container styles, disables pointer events and exposes the test ID. */
function AvatarContainer({containerStyles, testID = 'Avatar', children}: AvatarContainerProps) {
    const styles = useThemeStyles();

    return (
        <View
            style={[containerStyles, styles.pointerEventsNone]}
            testID={testID}
        >
            {children}
        </View>
    );
}

export default AvatarContainer;
