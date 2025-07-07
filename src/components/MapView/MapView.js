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
var native_1 = require("@react-navigation/native");
var maps_1 = require("@rnmapbox/maps");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var UserLocation_1 = require("@libs/actions/UserLocation");
var DistanceRequestUtils_1 = require("@libs/DistanceRequestUtils");
var getCurrentPosition_1 = require("@libs/getCurrentPosition");
var getCurrentPosition_types_1 = require("@libs/getCurrentPosition/getCurrentPosition.types");
var colors_1 = require("@styles/theme/colors");
var CONST_1 = require("@src/CONST");
var useLocalize_1 = require("@src/hooks/useLocalize");
var useNetwork_1 = require("@src/hooks/useNetwork");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Direction_1 = require("./Direction");
var PendingMapView_1 = require("./PendingMapView");
var responder_1 = require("./responder");
var ToggleDistanceUnitButton_1 = require("./ToggleDistanceUnitButton");
var utils_1 = require("./utils");
var MapView = (0, react_1.forwardRef)(function (_a, ref) {
    var _b, _c;
    var accessToken = _a.accessToken, style = _a.style, mapPadding = _a.mapPadding, styleURL = _a.styleURL, pitchEnabled = _a.pitchEnabled, initialState = _a.initialState, waypoints = _a.waypoints, directionCoordinates = _a.directionCoordinates, onMapReady = _a.onMapReady, _d = _a.interactive, interactive = _d === void 0 ? true : _d, distanceInMeters = _a.distanceInMeters, unit = _a.unit;
    var userLocation = (0, useOnyx_1.default)(ONYXKEYS_1.default.USER_LOCATION)[0];
    var navigation = (0, native_1.useNavigation)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var cameraRef = (0, react_1.useRef)(null);
    var _e = (0, react_1.useState)(false), isIdle = _e[0], setIsIdle = _e[1];
    var initialLocation = (0, react_1.useMemo)(function () { return initialState && { longitude: initialState.location[0], latitude: initialState.location[1] }; }, [initialState]);
    var currentPosition = userLocation !== null && userLocation !== void 0 ? userLocation : initialLocation;
    var _f = (0, react_1.useState)(false), userInteractedWithMap = _f[0], setUserInteractedWithMap = _f[1];
    var shouldInitializeCurrentPosition = (0, react_1.useRef)(true);
    var _g = (0, react_1.useState)(false), isAccessTokenSet = _g[0], setIsAccessTokenSet = _g[1];
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
    var distanceLabelText = (0, react_1.useMemo)(function () { return DistanceRequestUtils_1.default.getDistanceForDisplayLabel(distanceInMeters !== null && distanceInMeters !== void 0 ? distanceInMeters : 0, distanceUnit !== null && distanceUnit !== void 0 ? distanceUnit : CONST_1.default.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS); }, [distanceInMeters, distanceUnit]);
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
        if (!currentPosition || !cameraRef.current) {
            return;
        }
        if (!shouldPanMapToCurrentPosition()) {
            return;
        }
        cameraRef.current.setCamera({
            zoomLevel: CONST_1.default.MAPBOX.DEFAULT_ZOOM,
            animationDuration: 1500,
            centerCoordinate: [currentPosition.longitude, currentPosition.latitude],
        });
    }, [currentPosition, shouldPanMapToCurrentPosition]);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        flyTo: function (location, zoomLevel, animationDuration) {
            var _a;
            if (zoomLevel === void 0) { zoomLevel = CONST_1.default.MAPBOX.DEFAULT_ZOOM; }
            return (_a = cameraRef.current) === null || _a === void 0 ? void 0 : _a.setCamera({ zoomLevel: zoomLevel, centerCoordinate: location, animationDuration: animationDuration });
        },
        fitBounds: function (northEast, southWest, paddingConfig, animationDuration) { var _a; return (_a = cameraRef.current) === null || _a === void 0 ? void 0 : _a.fitBounds(northEast, southWest, paddingConfig, animationDuration); },
    }); }, []);
    // When the page loses focus, we temporarily set the "idled" state to false.
    // When the page regains focus, the onIdled method of the map will set the actual "idled" state,
    // which in turn triggers the callback.
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        var _a, _b, _c;
        if (!waypoints || waypoints.length === 0 || !isIdle) {
            return;
        }
        if (waypoints.length === 1) {
            (_a = cameraRef.current) === null || _a === void 0 ? void 0 : _a.setCamera({
                zoomLevel: CONST_1.default.MAPBOX.SINGLE_MARKER_ZOOM,
                animationDuration: 1500,
                centerCoordinate: (_b = waypoints.at(0)) === null || _b === void 0 ? void 0 : _b.coordinate,
            });
        }
        else {
            var _d = utils_1.default.getBounds(waypoints.map(function (waypoint) { return waypoint.coordinate; }), directionCoordinates), southWest = _d.southWest, northEast = _d.northEast;
            (_c = cameraRef.current) === null || _c === void 0 ? void 0 : _c.fitBounds(northEast, southWest, mapPadding, 1000);
        }
    }, [mapPadding, waypoints, isIdle, directionCoordinates]));
    (0, react_1.useEffect)(function () {
        var unsubscribe = navigation.addListener('blur', function () {
            setIsIdle(false);
        });
        return unsubscribe;
    }, [navigation]);
    (0, react_1.useEffect)(function () {
        (0, maps_1.setAccessToken)(accessToken).then(function (token) {
            if (!token) {
                return;
            }
            setIsAccessTokenSet(true);
        });
    }, [accessToken]);
    var setMapIdle = function (e) {
        if (e.gestures.isGestureActive) {
            return;
        }
        setIsIdle(true);
        if (onMapReady) {
            onMapReady();
        }
    };
    var centerMap = (0, react_1.useCallback)(function () {
        var _a, _b, _c, _d, _e, _f;
        var waypointCoordinates = (_a = waypoints === null || waypoints === void 0 ? void 0 : waypoints.map(function (waypoint) { return waypoint.coordinate; })) !== null && _a !== void 0 ? _a : [];
        if (waypointCoordinates.length > 1 || (directionCoordinates !== null && directionCoordinates !== void 0 ? directionCoordinates : []).length > 1) {
            var _g = utils_1.default.getBounds((_b = waypoints === null || waypoints === void 0 ? void 0 : waypoints.map(function (waypoint) { return waypoint.coordinate; })) !== null && _b !== void 0 ? _b : [], directionCoordinates), southWest = _g.southWest, northEast = _g.northEast;
            (_c = cameraRef.current) === null || _c === void 0 ? void 0 : _c.fitBounds(southWest, northEast, mapPadding, CONST_1.default.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME);
            return;
        }
        (_d = cameraRef === null || cameraRef === void 0 ? void 0 : cameraRef.current) === null || _d === void 0 ? void 0 : _d.setCamera({
            heading: 0,
            centerCoordinate: [(_e = currentPosition === null || currentPosition === void 0 ? void 0 : currentPosition.longitude) !== null && _e !== void 0 ? _e : 0, (_f = currentPosition === null || currentPosition === void 0 ? void 0 : currentPosition.latitude) !== null && _f !== void 0 ? _f : 0],
            animationDuration: CONST_1.default.MAPBOX.ANIMATION_DURATION_ON_CENTER_ME,
            zoomLevel: CONST_1.default.MAPBOX.SINGLE_MARKER_ZOOM,
        });
    }, [directionCoordinates, currentPosition, mapPadding, waypoints]);
    var centerCoordinate = (0, react_1.useMemo)(function () { return (currentPosition ? [currentPosition.longitude, currentPosition.latitude] : initialState === null || initialState === void 0 ? void 0 : initialState.location); }, [currentPosition, initialState === null || initialState === void 0 ? void 0 : initialState.location]);
    var waypointsBounds = (0, react_1.useMemo)(function () {
        if (!waypoints) {
            return undefined;
        }
        var _a = utils_1.default.getBounds(waypoints.map(function (waypoint) { return waypoint.coordinate; }), directionCoordinates), northEast = _a.northEast, southWest = _a.southWest;
        return { ne: northEast, sw: southWest };
    }, [waypoints, directionCoordinates]);
    var defaultSettings = (0, react_1.useMemo)(function () {
        if (interactive) {
            if (!centerCoordinate) {
                return undefined;
            }
            return {
                zoomLevel: initialState === null || initialState === void 0 ? void 0 : initialState.zoom,
                centerCoordinate: centerCoordinate,
            };
        }
        if (!waypointsBounds) {
            return undefined;
        }
        return {
            bounds: waypointsBounds,
        };
    }, [interactive, centerCoordinate, waypointsBounds, initialState === null || initialState === void 0 ? void 0 : initialState.zoom]);
    var initCenterCoordinate = (0, react_1.useMemo)(function () { return (interactive ? centerCoordinate : undefined); }, [interactive, centerCoordinate]);
    var initBounds = (0, react_1.useMemo)(function () { return (interactive ? undefined : waypointsBounds); }, [interactive, waypointsBounds]);
    var distanceSymbolCoordinate = (0, react_1.useMemo)(function () {
        if (!(directionCoordinates === null || directionCoordinates === void 0 ? void 0 : directionCoordinates.length) || !(waypoints === null || waypoints === void 0 ? void 0 : waypoints.length)) {
            return;
        }
        var _a = utils_1.default.getBounds(waypoints.map(function (waypoint) { return waypoint.coordinate; }), directionCoordinates), northEast = _a.northEast, southWest = _a.southWest;
        var boundsCenter = utils_1.default.getBoundsCenter({ northEast: northEast, southWest: southWest });
        return utils_1.default.findClosestCoordinateOnLineFromCenter(boundsCenter, directionCoordinates);
    }, [waypoints, directionCoordinates]);
    return !isOffline && isAccessTokenSet && !!defaultSettings ? (<react_native_1.View style={[style, !interactive ? styles.pointerEventsNone : {}]}>
                <maps_1.default.MapView style={{ flex: 1 }} styleURL={styleURL} onMapIdle={setMapIdle} onTouchStart={function () { return setUserInteractedWithMap(true); }} pitchEnabled={pitchEnabled} attributionPosition={__assign(__assign({}, styles.r2), styles.b2)} scaleBarEnabled={false} 
    // We use scaleBarPosition with top: -32 to hide the scale bar on iOS because scaleBarEnabled={false} not work on iOS
    scaleBarPosition={__assign(__assign({}, styles.tn8), { left: 0 })} compassEnabled compassPosition={__assign(__assign({}, styles.l2), styles.t5)} logoPosition={__assign(__assign({}, styles.l2), styles.b2)} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...responder_1.default.panHandlers}>
                    <maps_1.default.Camera ref={cameraRef} defaultSettings={defaultSettings} 
    // Include centerCoordinate here as well to address the issue of incorrect coordinates
    // displayed after the first render when the app's storage is cleared.
    centerCoordinate={initCenterCoordinate} bounds={initBounds}/>
                    {interactive && (<maps_1.default.ShapeSource id="user-location" shape={{
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [(_b = currentPosition === null || currentPosition === void 0 ? void 0 : currentPosition.longitude) !== null && _b !== void 0 ? _b : 0, (_c = currentPosition === null || currentPosition === void 0 ? void 0 : currentPosition.latitude) !== null && _c !== void 0 ? _c : 0],
                        },
                        properties: {},
                    },
                ],
            }}>
                            <maps_1.default.CircleLayer id="user-location-layer" sourceID="user-location" style={{
                circleColor: colors_1.default.blue400,
                circleRadius: 8,
            }}/>
                        </maps_1.default.ShapeSource>)}
                    {waypoints === null || waypoints === void 0 ? void 0 : waypoints.map(function (_a) {
            var _b, _c;
            var coordinate = _a.coordinate, markerComponent = _a.markerComponent, id = _a.id;
            var MarkerComponent = markerComponent;
            if (utils_1.default.areSameCoordinate([coordinate[0], coordinate[1]], [(_b = currentPosition === null || currentPosition === void 0 ? void 0 : currentPosition.longitude) !== null && _b !== void 0 ? _b : 0, (_c = currentPosition === null || currentPosition === void 0 ? void 0 : currentPosition.latitude) !== null && _c !== void 0 ? _c : 0]) && interactive) {
                return null;
            }
            return (<maps_1.MarkerView id={id} key={id} coordinate={coordinate}>
                                <MarkerComponent />
                            </maps_1.MarkerView>);
        })}

                    {!!directionCoordinates && <Direction_1.default coordinates={directionCoordinates}/>}
                    {!!distanceSymbolCoordinate && !!distanceInMeters && !!distanceUnit && (<maps_1.MarkerView coordinate={distanceSymbolCoordinate} id="distance-label" key="distance-label">
                            <react_native_1.View style={{ zIndex: 1 }}>
                                <ToggleDistanceUnitButton_1.default accessibilityRole={CONST_1.default.ROLE.BUTTON} accessibilityLabel="distance-label" onPress={toggleDistanceUnit}>
                                    <react_native_1.View style={[styles.distanceLabelWrapper]}>
                                        <Text_1.default style={styles.distanceLabelText}> {distanceLabelText}</Text_1.default>
                                    </react_native_1.View>
                                </ToggleDistanceUnitButton_1.default>
                            </react_native_1.View>
                        </maps_1.MarkerView>)}
                </maps_1.default.MapView>
                {interactive && (<react_native_1.View style={[styles.pAbsolute, styles.p5, styles.t0, styles.r0, { zIndex: 1 }]}>
                        <Button_1.default onPress={centerMap} iconFill={theme.icon} icon={Expensicons.Crosshair} accessibilityLabel={translate('common.center')}/>
                    </react_native_1.View>)}
            </react_native_1.View>) : (<PendingMapView_1.default title={translate('distance.mapPending.title')} subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.onlineSubtitle')} style={styles.mapEditView}/>);
});
exports.default = (0, react_1.memo)(MapView);
