"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getBackgroundColor(_a) {
    var routesLength = _a.routesLength, tabIndex = _a.tabIndex, affectedTabs = _a.affectedTabs, theme = _a.theme, position = _a.position, isActive = _a.isActive;
    if (routesLength > 1) {
        var inputRange = Array.from({ length: routesLength }, function (_, i) { return i; });
        if (position) {
            return position.interpolate({
                inputRange: inputRange,
                outputRange: inputRange.map(function (i) {
                    return affectedTabs.includes(tabIndex) && i === tabIndex ? theme.border : theme.appBG;
                }),
            });
        }
        return affectedTabs.includes(tabIndex) && isActive ? theme.border : theme.appBG;
    }
    return theme.border;
}
exports.default = getBackgroundColor;
