"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Explanation: Different Mapbox libraries are required for web and native mobile platforms.
// This is why we have separate components for web and native to handle the specific implementations.
// For the web version, we use the Mapbox Web library called react-map-gl, while for the native mobile version,
// we utilize a different Mapbox library @rnmapbox/maps tailored for mobile development.
var native_1 = require("@react-navigation/native");
var mapbox_gl_1 = require("mapbox-gl");
require("mapbox-gl/dist/mapbox-gl.css");
var react_1 = require("react");
var react_map_gl_1 = require("react-map-gl");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Expensicons = require("@components/Icon/Expensicons");
var Pressable_1 = require("@components/Pressable");
var Text_1 = require("@components/Text");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DistanceRequestUtils_1 = require("@libs/DistanceRequestUtils");
var getCurrentPosition_types_1 = require("@libs/getCurrentPosition/getCurrentPosition.types");
var UserLocation_1 = require("@userActions/UserLocation");
var CONST_1 = require("@src/CONST");
var useLocalize_1 = require("@src/hooks/useLocalize");
var useNetwork_1 = require("@src/hooks/useNetwork");
var getCurrentPosition_1 = require("@src/libs/getCurrentPosition");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Direction_1 = require("./Direction");
require("./mapbox.css");
var PendingMapView_1 = require("./PendingMapView");
var responder_1 = require("./responder");
var utils_1 = require("./utils");
var MapViewImpl = (0, react_1.forwardRef)(function (_a, ref) {
    var _b, _c, _d, _e;
    var style = _a.style, styleURL = _a.styleURL, waypoints = _a.waypoints, mapPadding = _a.mapPadding, accessToken = _a.accessToken, directionCoordinates = _a.directionCoordinates, _f = _a.initialState, initialState = _f === void 0 ? { location: CONST_1.default.MAPBOX.DEFAULT_COORDINATE, zoom: CONST_1.default.MAPBOX.DEFAULT_ZOOM } : _f, _g = _a.interactive, interactive = _g === void 0 ? true : _g, distanceInMeters = _a.distanceInMeters, unit = _a.unit;
    var userLocation = (0, useOnyx_1.default)(ONYXKEYS_1.default.USER_LOCATION)[0];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var translate = (0, useLocalize_1.default)().translate;
    var _h = (0, react_1.useState)(unit), distanceUnit = _h[0], setDistanceUnit = _h[1];
    (0, react_1.useEffect)(function () {
        if (!unit || distanceUnit) {
            return;
        }
        setDistanceUnit(unit);
    }, [unit, distanceUnit]);
    var toggleDistanceUnit = (0, react_1.useCallback)(function () {
        setDistanceUnit(function (currentUnit) {
            return currentUnit === CONST_1.default.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS ? CONST_1.default.CUSTOM_UNITS.DISTANCE_UNIT_MILES : CONST_1.default.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS;
        });
    }, []);
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _j = (0, react_1.useState)(null), mapRef = _j[0], setMapRef = _j[1];
    var initialLocation = (0, react_1.useMemo)(function () { return ({ longitude: initialState.location[0], latitude: initialState.location[1] }); }, [initialState]);
    var currentPosition = userLocation !== null && userLocation !== void 0 ? userLocation : initialLocation;
    var prevUserPosition = (0, usePrevious_1.default)(currentPosition);
    var _k = (0, react_1.useState)(false), userInteractedWithMap = _k[0], setUserInteractedWithMap = _k[1];
    var _l = (0, react_1.useState)(false), shouldResetBoundaries = _l[0], setShouldResetBoundaries = _l[1];
    var setRef = (0, react_1.useCallback)(function (newRef) { return setMapRef(newRef); }, []);
    var shouldInitializeCurrentPosition = (0, react_1.useRef)(true);
    // Determines if map can be panned to user's detected
    // location without bothering the user. It will return
    // false if user has already started dragging the map or
    // if there are one or more waypoints present.
    var shouldPanMapToCurrentPosition = (0, react_1.useCallback)(function () { return !userInteractedWithMap && (!waypoints || waypoints.length === 0); }, [userInteractedWithMap, waypoints]);
    var setCurrentPositionToInitialState = (0, react_1.useCallback)(function (error) {
        if ((error === null || error === void 0 ? void 0 : error.code) !== getCurrentPosition_types_1.GeolocationErrorCode.PERMISSION_DENIED || !initialLocation) {
            return;
        }
        (0, UserLocation_1.clearUserLocation)();
    }, [initialLocation]);
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        if (isOffline) {
            return;
        }
        if (!shouldInitializeCurrentPosition.current) {
            return;
        }
        shouldInitializeCurrentPosition.current = false;
        if (!shouldPanMapToCurrentPosition()) {
            setCurrentPositionToInitialState();
            return;
        }
        (0, getCurrentPosition_1.default)(function (params) {
            var currentCoords = { longitude: params.coords.longitude, latitude: params.coords.latitude };
            (0, UserLocation_1.setUserLocation)(currentCoords);
        }, setCurrentPositionToInitialState);
    }, [isOffline, shouldPanMapToCurrentPosition, setCurrentPositionToInitialState]));
    (0, react_1.useEffect)(function () {
        if (!currentPosition || !mapRef) {
            return;
        }
        if (!shouldPanMapToCurrentPosition()) {
            return;
        }
        // Avoid animating the navigation to the same location
        var shouldAnimate = prevUserPosition.longitude !== currentPosition.longitude || prevUserPosition.latitude !== currentPosition.latitude;
        mapRef.flyTo({
            center: [currentPosition.longitude, currentPosition.latitude],
            zoom: CONST_1.default.MAPBOX.DEFAULT_ZOOM,
            animate: shouldAnimate,
        });
    }, [currentPosition, mapRef, prevUserPosition, shouldPanMapToCurrentPosition]);
    var resetBoundaries = (0, react_1.useCallback)(function () {
        var _a;
        if (!waypoints || waypoints.length === 0) {
            return;
        }
        if (!mapRef) {
            return;
        }
        if (waypoints.length === 1) {
            mapRef.flyTo({
                center: (_a = waypoints.at(0)) === null || _a === void 0 ? void 0 : _a.coordinate,
                zoom: CONST_1.default.MAPBOX.SINGLE_MARKER_ZOOM,
            });
            return;
        }
        var map = mapRef.getMap();
        var _b = utils_1.default.getBounds(waypoints.map(function (waypoint) { return waypoint.coordinate; }), directionCoordinates), northEast = _b.northEast, southWest = _b.southWest;
        map.fitBounds([northEast, southWest], { padding: mapPadding });
    }, [waypoints, mapRef, mapPadding, directionCoordinates]);
    (0, react_1.useEffect)(resetBoundaries, [resetBoundaries]);
    (0, react_1.useEffect)(function () {
        if (!shouldResetBoundaries) {
            return;
        }
        resetBoundaries();
        setShouldResetBoundaries(false);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- this effect only needs to run when the boundaries reset is forced
    }, [shouldResetBoundaries]);
    (0, react_1.useEffect)(function () {
        if (!mapRef) {
            return;
        }
        var resizeObserver = new ResizeObserver(function () {
            mapRef.resize();
            setShouldResetBoundaries(true);
        });
        resizeObserver.observe(mapRef.getContainer());
        return function () {
            resizeObserver === null || resizeObserver === void 0 ? void 0 : resizeObserver.disconnect();
        };
    }, [mapRef]);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        flyTo: function (location, zoomLevel, animationDuration) {
            if (zoomLevel === void 0) { zoomLevel = CONST_1.default.MAPBOX.DEFAULT_ZOOM; }
            return mapRef === null || mapRef === void 0 ? void 0 : mapRef.flyTo({
                center: location,
                zoom: zoomLevel,
                duration: animationDuration,
            });
        },
        fitBounds: function (northEast, southWest) { return mapRef === null || mapRef === void 0 ? void 0 : mapRef.fitBounds([northEast, southWest]); },
    }); }, [mapRef]);
    var centerMap = (0, react_1.useCallback)(function () {
        var _a, _b, _c, _d;
        if (!mapRef) {
            return;
        }
        var waypointCoordinates = (_a = waypoints === null || waypoints === void 0 ? void 0 : waypoints.map(function (waypoint) { return waypoint.coordinate; })) !== null && _a !== void 0 ? _a : [];
        if (waypointCoordinates.length > 1 || (directionCoordinates !== null && directionCoordinates !== void 0 ? directionCoordinates : []).length > 1) {
            var _e = utils_1.default.getBounds((_b = waypoints === null || waypoints === void 0 ? void 0 : waypoints.map(function (waypoint) { return waypoint.coordinate; })) !== null && _b !== void 0 ? _b : [], directionCoordinates), northEast = _e.northEast, southWest = _e.southWest;
            var map = mapRef === null || mapRef === void 0 ? void 0 : mapRef.getMap();
            map === null || map === void 0 ? void 0 : map.fitBounds([southWest, northEast], { padding: mapPadding, animate: true, duration: CONST_1.default.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME });
            return;
        }
        mapRef.flyTo({
            center: [(_c = currentPosition === null || currentPosition === void 0 ? void 0 : currentPosition.longitude) !== null && _c !== void 0 ? _c : 0, (_d = currentPosition === null || currentPosition === void 0 ? void 0 : currentPosition.latitude) !== null && _d !== void 0 ? _d : 0],
            zoom: CONST_1.default.MAPBOX.SINGLE_MARKER_ZOOM,
            bearing: 0,
            animate: true,
            duration: CONST_1.default.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME,
        });
    }, [directionCoordinates, currentPosition, mapRef, waypoints, mapPadding]);
    var initialViewState = (0, react_1.useMemo)(function () {
        if (!interactive) {
            if (!waypoints) {
                return undefined;
            }
            var _a = utils_1.default.getBounds(waypoints.map(function (waypoint) { return waypoint.coordinate; }), directionCoordinates), northEast = _a.northEast, southWest = _a.southWest;
            return {
                zoom: initialState.zoom,
                bounds: [northEast, southWest],
            };
        }
        return {
            longitude: currentPosition === null || currentPosition === void 0 ? void 0 : currentPosition.longitude,
            latitude: currentPosition === null || currentPosition === void 0 ? void 0 : currentPosition.latitude,
            zoom: initialState.zoom,
        };
    }, [waypoints, directionCoordinates, interactive, currentPosition, initialState.zoom]);
    var distanceSymbolCoordinate = (0, react_1.useMemo)(function () {
        if (!(directionCoordinates === null || directionCoordinates === void 0 ? void 0 : directionCoordinates.length) || !(waypoints === null || waypoints === void 0 ? void 0 : waypoints.length)) {
            return;
        }
        var _a = utils_1.default.getBounds(waypoints.map(function (waypoint) { return waypoint.coordinate; }), directionCoordinates), northEast = _a.northEast, southWest = _a.southWest;
        var boundsCenter = utils_1.default.getBoundsCenter({ northEast: northEast, southWest: southWest });
        return utils_1.default.findClosestCoordinateOnLineFromCenter(boundsCenter, directionCoordinates);
    }, [waypoints, directionCoordinates]);
    return !isOffline && !!accessToken && !!initialViewState ? (<react_native_1.View style={style} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...responder_1.default.panHandlers}>
                <react_map_gl_1.default onDrag={function () { return setUserInteractedWithMap(true); }} ref={setRef} mapLib={mapbox_gl_1.default} mapboxAccessToken={accessToken} initialViewState={initialViewState} style={__assign(__assign({}, StyleUtils.getTextColorStyle(theme.mapAttributionText)), { zIndex: -1 })} mapStyle={styleURL} interactive={interactive}>
                    {interactive && (<react_map_gl_1.Marker key="Current-position" longitude={(_b = currentPosition === null || currentPosition === void 0 ? void 0 : currentPosition.longitude) !== null && _b !== void 0 ? _b : 0} latitude={(_c = currentPosition === null || currentPosition === void 0 ? void 0 : currentPosition.latitude) !== null && _c !== void 0 ? _c : 0}>
                            <react_native_1.View style={styles.currentPositionDot}/>
                        </react_map_gl_1.Marker>)}
                    {!!distanceSymbolCoordinate && !!distanceInMeters && !!distanceUnit && (<react_map_gl_1.Marker key="distance-label" longitude={(_d = distanceSymbolCoordinate.at(0)) !== null && _d !== void 0 ? _d : 0} latitude={(_e = distanceSymbolCoordinate.at(1)) !== null && _e !== void 0 ? _e : 0}>
                            <Pressable_1.PressableWithoutFeedback accessibilityLabel={CONST_1.default.ROLE.BUTTON} role={CONST_1.default.ROLE.BUTTON} onPress={toggleDistanceUnit}>
                                <react_native_1.View style={styles.distanceLabelWrapper}>
                                    <Text_1.default style={styles.distanceLabelText}> {DistanceRequestUtils_1.default.getDistanceForDisplayLabel(distanceInMeters, distanceUnit)}</Text_1.default>
                                </react_native_1.View>
                            </Pressable_1.PressableWithoutFeedback>
                        </react_map_gl_1.Marker>)}
                    {waypoints === null || waypoints === void 0 ? void 0 : waypoints.map(function (_a) {
            var _b, _c;
            var coordinate = _a.coordinate, markerComponent = _a.markerComponent, id = _a.id;
            var MarkerComponent = markerComponent;
            if (utils_1.default.areSameCoordinate([coordinate[0], coordinate[1]], [(_b = currentPosition === null || currentPosition === void 0 ? void 0 : currentPosition.longitude) !== null && _b !== void 0 ? _b : 0, (_c = currentPosition === null || currentPosition === void 0 ? void 0 : currentPosition.latitude) !== null && _c !== void 0 ? _c : 0]) && interactive) {
                return null;
            }
            return (<react_map_gl_1.Marker key={id} longitude={coordinate[0]} latitude={coordinate[1]}>
                                <MarkerComponent />
                            </react_map_gl_1.Marker>);
        })}
                    {!!directionCoordinates && <Direction_1.default coordinates={directionCoordinates}/>}
                </react_map_gl_1.default>
                {interactive && (<react_native_1.View style={[styles.pAbsolute, styles.p5, styles.t0, styles.r0, { zIndex: 1 }]}>
                        <Button_1.default onPress={centerMap} iconFill={theme.icon} icon={Expensicons.Crosshair} accessibilityLabel={translate('common.center')}/>
                    </react_native_1.View>)}
            </react_native_1.View>) : (<PendingMapView_1.default title={translate('distance.mapPending.title')} subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.onlineSubtitle')} style={styles.mapEditView}/>);
});
exports.default = MapViewImpl;
