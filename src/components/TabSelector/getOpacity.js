"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getOpacity(_a) {
    var routesLength = _a.routesLength, tabIndex = _a.tabIndex, active = _a.active, affectedTabs = _a.affectedTabs, position = _a.position, isActive = _a.isActive;
    var activeValue = active ? 1 : 0;
    var inactiveValue = active ? 0 : 1;
    if (routesLength > 1) {
        var inputRange = Array.from({ length: routesLength }, function (_, i) { return i; });
        if (position) {
            return position.interpolate({
                inputRange: inputRange,
                outputRange: inputRange.map(function (i) { return (affectedTabs.includes(tabIndex) && i === tabIndex ? activeValue : inactiveValue); }),
            });
        }
        return affectedTabs.includes(tabIndex) && isActive ? activeValue : inactiveValue;
    }
    return activeValue;
}
exports.default = getOpacity;
