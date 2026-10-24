import HorizontalSafeArea from '@components/HorizontalSafeArea';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React from 'react';

/**
 * Material pads the bar's items for the system bars only, not the display cutout, so the tab host sits inside the
 * horizontal safe area like every other root screen.
 */
function TabHostHorizontalSafeArea({children}: ChildrenProps) {
    return <HorizontalSafeArea>{children}</HorizontalSafeArea>;
}

export default TabHostHorizontalSafeArea;
