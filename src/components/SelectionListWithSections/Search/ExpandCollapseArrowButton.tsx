import React from 'react';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ExpandCollapseArrowButtonProps = {
    isExpanded?: boolean;

    onPress: () => void;
};

function ExpandCollapseArrowButton({isExpanded, onPress}: ExpandCollapseArrowButtonProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['UpArrow', 'DownArrow']);

    return (
        <PressableWithFeedback
            onPress={onPress}
            style={[styles.pl3, styles.justifyContentCenter, styles.alignItemsEnd]}
            accessibilityRole={CONST.ROLE.BUTTON}
            accessibilityLabel={isExpanded ? CONST.ACCESSIBILITY_LABELS.COLLAPSE : CONST.ACCESSIBILITY_LABELS.EXPAND}
        >
            {({hovered}) => (
                <Icon
                    src={isExpanded ? icons.UpArrow : icons.DownArrow}
                    fill={theme.icon}
                    additionalStyles={!hovered && styles.opacitySemiTransparent}
                    small
                />
            )}
        </PressableWithFeedback>
    );
}

export default ExpandCollapseArrowButton;
