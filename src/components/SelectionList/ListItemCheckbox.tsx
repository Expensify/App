import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type ListItemCheckboxProps = {
    accessibilityLabel?: string;
    isSelected: boolean;
    isDisabled: boolean;
    isDisabledCheckbox: boolean;
    onPress: () => void;
};

function ListItemCheckbox({accessibilityLabel, isSelected, isDisabled, isDisabledCheckbox, onPress}: ListItemCheckboxProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    return (
        <PressableWithFeedback
            accessibilityLabel={accessibilityLabel ?? ''}
            role={CONST.ROLE.BUTTON}
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            disabled={isDisabled || isDisabledCheckbox}
            onPress={onPress}
            style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), isDisabledCheckbox && styles.cursorDisabled]}
        >
            <View style={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!isSelected, !!isDisabled)]}>
                {isSelected && (
                    <Icon
                        src={Expensicons.Checkmark}
                        fill={theme.textLight}
                        height={14}
                        width={14}
                    />
                )}
            </View>
        </PressableWithFeedback>
    );
}

ListItemCheckbox.displayName = 'ListItemCheckbox';

export default ListItemCheckbox;
