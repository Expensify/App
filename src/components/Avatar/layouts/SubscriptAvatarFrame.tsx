import useStyleUtils from '@hooks/useStyleUtils';

import type CONST from '@src/CONST';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

type SubscriptAvatarFrameProps = {
    /** Size of the subscript stack */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    containerStyle?: StyleProp<ViewStyle>;

    /** Content of the primary slot */
    primary: ReactNode;

    /** Content of the subscript slot */
    secondary?: ReactNode;
};

/**
 * `SubscriptAvatarFrame` is the outer container of a subscript avatar stack. Slot content — including the subscript
 * positioning wrapper, which the tooltip must wrap from the outside — is supplied by the caller.
 */
function SubscriptAvatarFrame({size, containerStyle, primary, secondary}: SubscriptAvatarFrameProps) {
    const StyleUtils = useStyleUtils();

    return (
        <View
            style={[StyleUtils.getContainerStyles(size), containerStyle]}
            testID="ReportActionAvatars-Subscript"
        >
            {primary}
            {secondary}
        </View>
    );
}

export default SubscriptAvatarFrame;
