import {useLayoutEffect} from 'react';
import type {ViewStyle} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import {useFABMenuContext} from './FABMenuContext';

type FABMenuItemResult = {
    itemIndex: number;
    isFocused: boolean;
    wrapperStyle: ViewStyle;
};

/**
 * Handles registration of a FAB menu item for arrow-key focus management.
 * Pass `isVisible` for items that conditionally render — registration mirrors visibility.
 * Returns itemIndex, isFocused, and the pre-computed wrapperStyle for FocusableMenuItem.
 */
function useFABMenuItem(itemId: string, isVisible = true): FABMenuItemResult {
    const {registerItem, unregisterItem, registeredItems, focusedIndex} = useFABMenuContext();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    useLayoutEffect(() => {
        if (!isVisible) {
            return;
        }
        registerItem(itemId);
        return () => unregisterItem(itemId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible]);

    const itemIndex = registeredItems.indexOf(itemId);
    const isFocused = focusedIndex === itemIndex;
    const wrapperStyle = StyleUtils.getItemBackgroundColorStyle(false, isFocused, false, theme.activeComponentBG, theme.hoverComponentBG);

    return {itemIndex, isFocused, wrapperStyle};
}

export default useFABMenuItem;
