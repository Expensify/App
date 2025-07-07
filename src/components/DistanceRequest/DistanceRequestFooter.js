"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var DistanceMapView_1 = require("@components/DistanceMapView");
var Expensicons = require("@components/Icon/Expensicons");
var ImageSVG_1 = require("@components/ImageSVG");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DistanceRequestUtils_1 = require("@libs/DistanceRequestUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var MAX_WAYPOINTS = 25;
function DistanceRequestFooter(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var waypoints = _a.waypoints, transaction = _a.transaction, navigateToWaypointEditPage = _a.navigateToWaypointEditPage, policy = _a.policy;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID)[0];
    var activePolicy = (0, usePolicy_1.default)(activePolicyID);
    var mapboxAccessToken = (0, useOnyx_1.default)(ONYXKEYS_1.default.MAPBOX_ACCESS_TOKEN)[0];
    var numberOfWaypoints = Object.keys(waypoints !== null && waypoints !== void 0 ? waypoints : {}).length;
    var numberOfFilledWaypoints = Object.values(waypoints !== null && waypoints !== void 0 ? waypoints : {}).filter(function (waypoint) { return waypoint === null || waypoint === void 0 ? void 0 : waypoint.address; }).length;
    var lastWaypointIndex = numberOfWaypoints - 1;
    var defaultMileageRate = DistanceRequestUtils_1.default.getDefaultMileageRate(policy !== null && policy !== void 0 ? policy : activePolicy);
    var policyCurrency = (_e = (_c = (_b = (policy !== null && policy !== void 0 ? policy : activePolicy)) === null || _b === void 0 ? void 0 : _b.outputCurrency) !== null && _c !== void 0 ? _c : (_d = (0, PolicyUtils_1.getPersonalPolicy)()) === null || _d === void 0 ? void 0 : _d.outputCurrency) !== null && _e !== void 0 ? _e : CONST_1.default.CURRENCY.USD;
    var mileageRate = (0, TransactionUtils_1.isCustomUnitRateIDForP2P)(transaction) ? DistanceRequestUtils_1.default.getRateForP2P(policyCurrency, transaction) : defaultMileageRate;
    var unit = (mileageRate !== null && mileageRate !== void 0 ? mileageRate : {}).unit;
    var getMarkerComponent = (0, react_1.useCallback)(function (icon) { return (<ImageSVG_1.default src={icon} width={CONST_1.default.MAP_MARKER_SIZE} height={CONST_1.default.MAP_MARKER_SIZE} fill={theme.icon}/>); }, [theme]);
    var waypointMarkers = (0, react_1.useMemo)(function () {
        return Object.entries(waypoints !== null && waypoints !== void 0 ? waypoints : {})
            .map(function (_a) {
            var key = _a[0], waypoint = _a[1];
            if (!(waypoint === null || waypoint === void 0 ? void 0 : waypoint.lat) || !(waypoint === null || waypoint === void 0 ? void 0 : waypoint.lng)) {
                return;
            }
            var index = (0, TransactionUtils_1.getWaypointIndex)(key);
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
    }, [waypoints, lastWaypointIndex, getMarkerComponent]);
    return (<>
            {numberOfFilledWaypoints >= 2 && (<react_native_1.View style={[styles.flexRow, styles.justifyContentCenter, styles.pt1]}>
                    <Button_1.default small icon={Expensicons.Plus} onPress={function () { var _a, _b; return navigateToWaypointEditPage(Object.keys((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.waypoints) !== null && _b !== void 0 ? _b : {}).length); }} text={translate('distance.addStop')} isDisabled={numberOfWaypoints === MAX_WAYPOINTS} innerStyles={[styles.pl10, styles.pr10]}/>
                </react_native_1.View>)}
            <react_native_1.View style={styles.mapViewContainer}>
                <DistanceMapView_1.default accessToken={(_f = mapboxAccessToken === null || mapboxAccessToken === void 0 ? void 0 : mapboxAccessToken.token) !== null && _f !== void 0 ? _f : ''} mapPadding={CONST_1.default.MAPBOX.PADDING} pitchEnabled={false} initialState={{
            zoom: CONST_1.default.MAPBOX.DEFAULT_ZOOM,
            location: (_h = (_g = waypointMarkers === null || waypointMarkers === void 0 ? void 0 : waypointMarkers.at(0)) === null || _g === void 0 ? void 0 : _g.coordinate) !== null && _h !== void 0 ? _h : CONST_1.default.MAPBOX.DEFAULT_COORDINATE,
        }} directionCoordinates={(_m = (_l = (_k = (_j = transaction === null || transaction === void 0 ? void 0 : transaction.routes) === null || _j === void 0 ? void 0 : _j.route0) === null || _k === void 0 ? void 0 : _k.geometry) === null || _l === void 0 ? void 0 : _l.coordinates) !== null && _m !== void 0 ? _m : []} style={[styles.mapView, styles.mapEditView]} waypoints={waypointMarkers} styleURL={CONST_1.default.MAPBOX.STYLE_URL} overlayStyle={styles.mapEditView} distanceInMeters={(0, TransactionUtils_1.getDistanceInMeters)(transaction, undefined)} unit={unit}/>
            </react_native_1.View>
        </>);
}
DistanceRequestFooter.displayName = 'DistanceRequestFooter';
exports.default = DistanceRequestFooter;
