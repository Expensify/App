/**
 * On web-based platforms we're calling `onTabSelect` since the `react-native-tab-view` (`PanResponderAdapter`) implementation does not call the function on mount, only on tab switch.
 */
function onTabSelectHandler(index: number, onTabSelect?: ({index}: {index: number}) => void) {
    onTabSelect?.({index});
}
export default onTabSelectHandler;
