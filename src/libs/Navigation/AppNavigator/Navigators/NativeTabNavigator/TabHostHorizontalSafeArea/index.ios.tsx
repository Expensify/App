import type ChildrenProps from '@src/types/utils/ChildrenProps';

/**
 * UIKit lays the tab bar out as a column in the side inset on a foldable iPhone, so the tab host spans the whole window
 * and each tab keeps out of the horizontal safe area itself (see TabScreenHorizontalSafeArea).
 */
function TabHostHorizontalSafeArea({children}: ChildrenProps) {
    return children;
}

export default TabHostHorizontalSafeArea;
