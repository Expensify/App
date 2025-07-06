/**
 * On native we're returning no-op since the tab select functionality is handled
 * internally by `react-native-tab-view` (`PagerViewAdapter`) for both mount and tab switch.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onTabSelectHandler(index: number, onTabSelect?: ({index}: {index: number}) => void) {}
export default onTabSelectHandler;
