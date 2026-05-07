import {useLayoutEffect} from 'react';
import type {ViewStyle} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import {useFABMenuContext} from './FABMenuContext';

type FABMenuItemResult = {
    itemIndex: number;
    isFocused: boolean;
    wrapperStyle: ViewStyle;
    setFocusedIndex: (index: number) => void;
    onItemPress: (onSelected: () => void, options?: {shouldCallAfterModalHide?: boolean}) => void;
};

/**
 * Handles registration of a FAB menu item for arrow-key focus management.
 * Pass `isVisible` for items that conditionally render — registration mirrors visibility.
 * Returns itemIndex, isFocused, wrapperStyle, setFocusedIndex, and onItemPress — everything
 * a menu item needs to render and interact, with no direct context access required.
 */
function useFABMenuItem(itemId: string, isVisible = true): FABMenuItemResult {
    const {registerItem, unregisterItem, registeredItems, focusedIndex, setFocusedIndex, onItemPress} = useFABMenuContext();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    useLayoutEffect(() => {
        if (!isVisible) {
            return;
        }
        registerItem(itemId);
        return () => unregisterItem(itemId);
    }, [isVisible, itemId, registerItem, unregisterItem]);

    const itemIndex = registeredItems.indexOf(itemId);
    const isFocused = focusedIndex !== -1 && focusedIndex === itemIndex;
    const wrapperStyle = StyleUtils.getItemBackgroundColorStyle(false, isFocused, false, theme.activeComponentBG, theme.hoverComponentBG);

    return {itemIndex, isFocused, wrapperStyle, setFocusedIndex, onItemPress};
}

export default useFABMenuItem;
