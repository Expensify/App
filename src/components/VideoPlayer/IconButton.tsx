import React from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

type IconButtonProps = WithSentryLabel & {
    src: IconAsset;
    onPress?: (event?: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;
    fill?: string;
    tooltipText?: string;
    style?: StyleProp<ViewStyle>;
    hoverStyle?: StyleProp<ViewStyle>;
    small?: boolean;
    shouldForceRenderingTooltipBelow?: boolean;
};

function IconButton({src, fill = 'white', onPress, style, hoverStyle, tooltipText = '', small = false, shouldForceRenderingTooltipBelow = false, sentryLabel}: IconButtonProps) {
    const styles = useThemeStyles();
    return (
        <Tooltip
            text={tooltipText}
            shouldForceRenderingBelow={shouldForceRenderingTooltipBelow}
        >
            <PressableWithFeedback
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
