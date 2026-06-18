import Icon from '@components/Icon';
import type {PressableRef} from '@components/Pressable/GenericPressable/types';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';

import useThemeStyles from '@hooks/useThemeStyles';

import mergeRefs from '@libs/mergeRefs';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {Ref} from 'react';
import type {GestureResponderEvent, StyleProp, View, ViewStyle} from 'react-native';

import React from 'react';

type IconButtonProps = WithSentryLabel & {
    src: IconAsset;
    onPress?: (event?: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;
    fill?: string;
    tooltipText?: string;
    style?: StyleProp<ViewStyle>;
    hoverStyle?: StyleProp<ViewStyle>;
    small?: boolean;
    shouldForceRenderingTooltipBelow?: boolean;
    /** Forwarded to the underlying pressable so callers can use the button as a popover anchor. */
    ref?: PressableRef | Ref<View>;
};

function IconButton({src, fill = 'white', onPress, style, hoverStyle, tooltipText = '', small = false, shouldForceRenderingTooltipBelow = false, sentryLabel, ref}: IconButtonProps) {
    const styles = useThemeStyles();
    return (
        <Tooltip
            text={tooltipText}
            shouldForceRenderingBelow={shouldForceRenderingTooltipBelow}
        >
            <PressableWithFeedback
                ref={mergeRefs(ref)}
                accessibilityLabel={tooltipText}
                onPress={onPress}
                style={[styles.videoIconButton, style]}
                hoverStyle={[styles.videoIconButtonHovered, hoverStyle]}
                role={CONST.ROLE.BUTTON}
                sentryLabel={sentryLabel}
            >
                <Icon
                    src={src}
                    fill={fill}
                    small={small}
                />
            </PressableWithFeedback>
        </Tooltip>
    );
}

export default IconButton;
