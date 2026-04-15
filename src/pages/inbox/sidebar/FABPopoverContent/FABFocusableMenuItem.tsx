import React from 'react';
import FocusableMenuItem from '@components/FocusableMenuItem';
import type {MenuItemProps} from '@components/MenuItem';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import useFABMenuItem from './useFABMenuItem';

type FABFocusableMenuItemProps = Omit<MenuItemProps, 'focused' | 'onFocus' | 'wrapperStyle' | 'shouldCheckActionAllowedOnPress' | 'role' | 'onPress'> & {
    itemId: string;
    isVisible?: boolean;
    onPress?: () => void;
    shouldCallAfterModalHide?: boolean;
};

function FABFocusableMenuItem({itemId, isVisible = true, onPress, shouldCallAfterModalHide, ...props}: FABFocusableMenuItemProps) {
    const {itemIndex, isFocused, wrapperStyle, setFocusedIndex, onItemPress} = useFABMenuItem(itemId, isVisible);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    if (!isVisible) {
        return null;
    }

    return (
        <FocusableMenuItem
            // FABFocusableMenuItemProps is a strict subset of MenuItemProps — spreading forwards all remaining props safely
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(props as MenuItemProps)}
            focused={isFocused}
            onFocus={() => setFocusedIndex(itemIndex)}
            wrapperStyle={[wrapperStyle, !shouldUseNarrowLayout && styles.compactPopoverMenuItem]}
            iconStyles={!shouldUseNarrowLayout ? [{width: variables.iconSizeNormal}] : undefined}
            shouldCheckActionAllowedOnPress={false}
            role={CONST.ROLE.BUTTON}
            onPress={onPress ? () => onItemPress(onPress, {shouldCallAfterModalHide}) : undefined}
        />
    );
}

export default FABFocusableMenuItem;
