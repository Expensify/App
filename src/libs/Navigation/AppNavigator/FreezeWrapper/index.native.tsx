import type ChildrenProps from '@src/types/utils/ChildrenProps';

// On native, tab-level freezing is handled by the TabNavigator's `freezeOnBlur: true` option,
// which uses react-native-screens to natively freeze inactive tabs.
// On web, react-native-screens only sets `display: none` without actually freezing the React tree,
// so the web FreezeWrapper uses `react-freeze` to suspend rendering of background tabs.
function FreezeWrapper({children}: ChildrenProps) {
    return children;
}

export default FreezeWrapper;
