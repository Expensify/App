import type {EdgeInsets} from 'react-native-safe-area-context';

/**
 * UIKit adds the area of the tab bar to the safe area of each tab screen. A bar along the bottom adds its height to the
 * bottom inset; a bar laid out as a column sits in the side inset and adds nothing.
 *
 * Until a tab screen reports its inset, guess: a column sits in a side inset of its own, while a notched phone in
 * landscape has the same inset on both sides and keeps its bar along the bottom.
 */
function getIsTabBarVertical(tabScreenBottomInset: number | undefined, windowInsets: EdgeInsets): boolean {
    if (tabScreenBottomInset === undefined) {
        return windowInsets.left !== windowInsets.right;
    }
    return tabScreenBottomInset === windowInsets.bottom;
}

export default getIsTabBarVertical;
