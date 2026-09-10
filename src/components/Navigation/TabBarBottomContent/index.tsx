import type TabBarBottomContentProps from './types';

/**
 * The navigator's own bar (TabNavigatorBar) is the only tab bar on screen. Each screen mounts this slot, and every
 * preloaded screen is mounted at once, so rendering a bar here would stack one per screen behind the floating pill.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TabBarBottomContent(_props: TabBarBottomContentProps) {
    return null;
}

export default TabBarBottomContent;
