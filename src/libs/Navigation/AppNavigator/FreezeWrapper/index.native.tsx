import type ChildrenProps from '@src/types/utils/ChildrenProps';

// On native, background tabs are not frozen: the native tab bar shows a tab before JS can unfreeze it, so a frozen
// tab would flash an empty screen on every switch.
// On web, react-native-screens only sets `display: none` without actually freezing the React tree,
// so the web FreezeWrapper uses `react-freeze` to suspend rendering of background tabs.
function FreezeWrapper({children}: ChildrenProps) {
    return children;
}

export default FreezeWrapper;
