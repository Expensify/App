import HorizontalSafeArea from '@components/HorizontalSafeArea';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React from 'react';

/** The tab host spans the whole window so the tab bar can sit in the side inset, so each tab keeps out of it instead. */
function TabScreenHorizontalSafeArea({children}: ChildrenProps) {
    return <HorizontalSafeArea>{children}</HorizontalSafeArea>;
}

export default TabScreenHorizontalSafeArea;
