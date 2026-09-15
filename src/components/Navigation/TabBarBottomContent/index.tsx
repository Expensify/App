import type {FC} from 'react';

import type TabBarBottomContentProps from './types';

/**
 * Bottom slot that every tab root screen reserves for the tab bar. The navigator owns the only bar there is,
 * so the slot renders nothing: one bar per preloaded screen would stack glass capsules behind the visible one.
 * The slot itself stays because ScreenWrapper keys the placement of the bottom-docked offline indicator on it.
 */
function TabBarBottomContent() {
    return null;
}

const tabBarBottomContent: FC<TabBarBottomContentProps> = TabBarBottomContent;

export default tabBarBottomContent;
