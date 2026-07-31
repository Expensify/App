import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {Icon as IconType} from '@src/types/onyx/OnyxCommon';

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

    /** Primary icon — only its type is read, for the workspace border radius */
    primaryIcon?: IconType;

    /** Secondary icon — only its type is read, for the workspace border radius */
    secondaryIcon?: IconType;

    /** Resolved background/border style for the secondary avatar container */
    secondaryContainerStyle: StyleProp<ViewStyle>;

    /** Content of the primary slot */
    primary: ReactNode;

    /** Content of the secondary slot */
    secondary: ReactNode;
};

/**
 * `DiagonalAvatarsFrame` is the positioning skeleton of a diagonal avatar stack — the primary slot in the top-left
 * and the secondary slot in the bottom-right. Slot content (tooltips, avatars, pressables) is supplied by the caller.
 */
function DiagonalAvatarsFrame({size, iconCount, containerStyle, primaryIcon, secondaryIcon, secondaryContainerStyle, primary, secondary}: DiagonalAvatarsFrameProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const {singleAvatarStyleKey, secondAvatarStyleKey} = getDiagonalAvatarSizing(size, false);

    return (
        <View style={[containerStyle, iconCount === 2 && size === CONST.AVATAR_SIZE.XXXX_LARGE && styles.mr0]}>
            <View
                style={[styles[singleAvatarStyleKey], primaryIcon?.type === CONST.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, primaryIcon.type)]}
                testID="ReportActionAvatars-MultipleAvatars"
            >
                {primary}
                <View
                    style={[
                        styles[secondAvatarStyleKey],
                        secondaryContainerStyle,
                        secondaryIcon?.type === CONST.ICON_TYPE_WORKSPACE && StyleUtils.getAvatarBorderRadius(size, secondaryIcon.type),
                    ]}
                >
                    {secondary}
                </View>
            </View>
        </View>
    );
}

export default DiagonalAvatarsFrame;
