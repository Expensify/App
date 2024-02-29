import React from 'react';
import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Tooltip from '@components/Tooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';

type IconButtonProps = {
    src: IconAsset;
    onPress?: (event?: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;
    fill?: string;
    tooltipText?: string;
    style?: StyleProp<ViewStyle>;
    hoverStyle?: StyleProp<ViewStyle>;
    small?: boolean;
    shouldForceRenderingTooltipBelow?: boolean;
};

function IconButton({src, fill = 'white', onPress = () => {}, style = {}, hoverStyle = {}, tooltipText = '', small = false, shouldForceRenderingTooltipBelow = false}: IconButtonProps) {
    const styles = useThemeStyles();
    return (
        <Tooltip
            text={tooltipText}
            shouldForceRenderingBelow={shouldForceRenderingTooltipBelow}
        >
            <Hoverable>
                {(isHovered) => (
                    <PressableWithoutFeedback
                        accessibilityLabel={tooltipText}
                        onPress={onPress}
                        style={[styles.videoIconButton, isHovered && [styles.videoIconButtonHovered, hoverStyle], style]}
                    >
                        <Icon
                            src={src}
                            fill={fill}
                            small={small}
                        />
                    </PressableWithoutFeedback>
                )}
            </Hoverable>
        </Tooltip>
    );
}

IconButton.displayName = 'IconButton';

export default IconButton;
