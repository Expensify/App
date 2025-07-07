"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * On native we're returning no-op since the tab select functionality is handled
 * internally by `react-native-tab-view` (`PagerViewAdapter`) for both mount and tab switch.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onTabSelectHandler(index, onTabSelect) { }
exports.default = onTabSelectHandler;
