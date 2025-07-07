"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var useNetwork_1 = require("@hooks/useNetwork");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var TransactionUtils = require("@libs/TransactionUtils");
var MapboxToken = require("@userActions/MapboxToken");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var DistanceMapView_1 = require("./DistanceMapView");
var Expensicons = require("./Icon/Expensicons");
var ImageSVG_1 = require("./ImageSVG");
var PendingMapView_1 = require("./MapView/PendingMapView");
function ConfirmedRoute(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var mapboxAccessToken = _a.mapboxAccessToken, transaction = _a.transaction, isSmallerIcon = _a.isSmallerIcon, _k = _a.shouldHaveBorderRadius, shouldHaveBorderRadius = _k === void 0 ? true : _k, _l = _a.requireRouteToDisplayMap, requireRouteToDisplayMap = _l === void 0 ? false : _l, interactive = _a.interactive;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var route = ((_b = transaction === null || transaction === void 0 ? void 0 : transaction.routes) !== null && _b !== void 0 ? _b : {}).route0;
    var waypoints = (_d = (_c = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _c === void 0 ? void 0 : _c.waypoints) !== null && _d !== void 0 ? _d : {};
    var coordinates = (_f = (_e = route === null || route === void 0 ? void 0 : route.geometry) === null || _e === void 0 ? void 0 : _e.coordinates) !== null && _f !== void 0 ? _f : [];
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var getMarkerComponent = (0, react_1.useCallback)(function (icon) { return (<ImageSVG_1.default src={icon} width={CONST_1.default.MAP_MARKER_SIZE} height={CONST_1.default.MAP_MARKER_SIZE} fill={theme.icon}/>); }, [theme]);
    var getWaypointMarkers = (0, react_1.useCallback)(function (waypointsData) {
        var numberOfWaypoints = Object.keys(waypointsData).length;
        var lastWaypointIndex = numberOfWaypoints - 1;
        return Object.entries(waypointsData)
            .map(function (_a) {
            var key = _a[0], waypoint = _a[1];
            if (!(waypoint === null || waypoint === void 0 ? void 0 : waypoint.lat) || !(waypoint === null || waypoint === void 0 ? void 0 : waypoint.lng)) {
                return;
            }
            var index = TransactionUtils.getWaypointIndex(key);
            var MarkerComponent;
            if (index === 0) {
                MarkerComponent = Expensicons.DotIndicatorUnfilled;
            }
            else if (index === lastWaypointIndex) {
                MarkerComponent = Expensicons.Location;
            }
            else {
                MarkerComponent = Expensicons.DotIndicator;
            }
            return {
                id: "".concat(waypoint.lng, ",").concat(waypoint.lat, ",").concat(index),
                coordinate: [waypoint.lng, waypoint.lat],
                markerComponent: function () { return getMarkerComponent(MarkerComponent); },
            };
        })
            .filter(function (waypoint) { return !!waypoint; });
    }, [getMarkerComponent]);
    var waypointMarkers = getWaypointMarkers(waypoints);
    (0, react_1.useEffect)(function () {
        MapboxToken.init();
        return MapboxToken.stop;
    }, []);
    var shouldDisplayMap = !requireRouteToDisplayMap || !!coordinates.length;
    return !isOffline && !!(mapboxAccessToken === null || mapboxAccessToken === void 0 ? void 0 : mapboxAccessToken.token) && shouldDisplayMap ? (<DistanceMapView_1.default interactive={interactive} accessToken={(_g = mapboxAccessToken === null || mapboxAccessToken === void 0 ? void 0 : mapboxAccessToken.token) !== null && _g !== void 0 ? _g : ''} mapPadding={CONST_1.default.MAPBOX.PADDING} pitchEnabled={false} initialState={{
            zoom: CONST_1.default.MAPBOX.DEFAULT_ZOOM,
            location: (_j = (_h = waypointMarkers === null || waypointMarkers === void 0 ? void 0 : waypointMarkers.at(0)) === null || _h === void 0 ? void 0 : _h.coordinate) !== null && _j !== void 0 ? _j : CONST_1.default.MAPBOX.DEFAULT_COORDINATE,
        }} directionCoordinates={coordinates} style={[styles.mapView, shouldHaveBorderRadius && styles.br4]} waypoints={waypointMarkers} styleURL={CONST_1.default.MAPBOX.STYLE_URL} requireRouteToDisplayMap={requireRouteToDisplayMap}/>) : (<PendingMapView_1.default isSmallerIcon={isSmallerIcon} style={!shouldHaveBorderRadius && StyleUtils.getBorderRadiusStyle(0)}/>);
}
exports.default = (0, react_native_onyx_1.withOnyx)({
    mapboxAccessToken: {
        key: ONYXKEYS_1.default.MAPBOX_ACCESS_TOKEN,
    },
})(ConfirmedRoute);
ConfirmedRoute.displayName = 'ConfirmedRoute';
