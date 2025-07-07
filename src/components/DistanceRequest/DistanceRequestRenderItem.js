"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
function DistanceRequestRenderItem(_a) {
    var _b, _c;
    var waypoints = _a.waypoints, _d = _a.item, item = _d === void 0 ? '' : _d, onSecondaryInteraction = _a.onSecondaryInteraction, getIndex = _a.getIndex, _e = _a.isActive, isActive = _e === void 0 ? false : _e, _f = _a.onPress, onPress = _f === void 0 ? function () { } : _f, _g = _a.disabled, disabled = _g === void 0 ? false : _g;
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var numberOfWaypoints = Object.keys(waypoints !== null && waypoints !== void 0 ? waypoints : {}).length;
    var lastWaypointIndex = numberOfWaypoints - 1;
    var index = (_b = getIndex === null || getIndex === void 0 ? void 0 : getIndex()) !== null && _b !== void 0 ? _b : -1;
    var descriptionKey = 'distance.waypointDescription.';
    var waypointIcon;
    if (index === 0) {
        descriptionKey += 'start';
        waypointIcon = Expensicons.DotIndicatorUnfilled;
    }
    else if (index === lastWaypointIndex) {
        descriptionKey += 'stop';
        waypointIcon = Expensicons.Location;
    }
    else {
        descriptionKey += 'stop';
        waypointIcon = Expensicons.DotIndicator;
    }
    var waypoint = (_c = waypoints === null || waypoints === void 0 ? void 0 : waypoints["waypoint".concat(index)]) !== null && _c !== void 0 ? _c : {};
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var title = waypoint.name || waypoint.address;
    return (<MenuItemWithTopDescription_1.default description={translate(descriptionKey)} title={title} icon={Expensicons.DragHandles} iconFill={theme.icon} secondaryIcon={waypointIcon} secondaryIconFill={theme.icon} shouldShowRightIcon onPress={function () { return onPress(index); }} onSecondaryInteraction={onSecondaryInteraction} focused={isActive} key={item} disabled={disabled}/>);
}
DistanceRequestRenderItem.displayName = 'DistanceRequestRenderItem';
exports.default = DistanceRequestRenderItem;
