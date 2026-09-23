import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

import getDiagonalAvatarSizing from './getDiagonalAvatarSizing';

type DiagonalAvatarsFrameProps = {
    /** Size of the diagonal stack */
    size: ValueOf<typeof CONST.AVATAR_SIZE>;

    /** Total number of icons the stack represents (drives right-margin removal at xxxx-large) */
    iconCount: number;

    /** Resolved style for the outer stack container, e.g. `StyleUtils.getContainerStyles(size)` */
    containerStyle: StyleProp<ViewStyle>;

    /** Extra style for the primary avatar container, e.g. the workspace border radius */
    primaryContainerStyle?: StyleProp<ViewStyle>;

    /** Resolved style for the secondary avatar container, e.g. its background/border and the workspace border radius */
    secondaryContainerStyle: StyleProp<ViewStyle>;

    /** Content of the primary slot */
    primary: ReactNode;

    /** Content of the secondary slot */
    secondary: ReactNode;
};

/**
 * `DiagonalAvatarsFrame` is the positioning skeleton of a diagonal avatar stack — the primary slot in the top-left
 * and the secondary slot in the bottom-right. Slot content (tooltips, avatars, pressables) and icon-dependent
 * styling (like the workspace border radius) are supplied by the caller.
 */
function DiagonalAvatarsFrame({size, iconCount, containerStyle, primaryContainerStyle, secondaryContainerStyle, primary, secondary}: DiagonalAvatarsFrameProps) {
    const styles = useThemeStyles();

    const {singleAvatarStyleKey, secondAvatarStyleKey} = getDiagonalAvatarSizing(size);

    return (
        <View style={[containerStyle, iconCount === 2 && size === CONST.AVATAR_SIZE.XXXX_LARGE && styles.mr0]}>
            <View
                style={[styles[singleAvatarStyleKey], primaryContainerStyle]}
                testID="ReportActionAvatars-MultipleAvatars"
            >
                {primary}
                <View style={[styles[secondAvatarStyleKey], secondaryContainerStyle]}>{secondary}</View>
            </View>
        </View>
    );
}

export default DiagonalAvatarsFrame;
