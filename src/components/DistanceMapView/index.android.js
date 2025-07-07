"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Expensicons = require("@components/Icon/Expensicons");
var MapView_1 = require("@components/MapView");
var PendingMapView_1 = require("@components/MapView/PendingMapView");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function DistanceMapView(_a) {
    var overlayStyle = _a.overlayStyle, requireRouteToDisplayMap = _a.requireRouteToDisplayMap, rest = __rest(_a, ["overlayStyle", "requireRouteToDisplayMap"]);
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, react_1.useState)(false), isMapReady = _b[0], setIsMapReady = _b[1];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    return (<>
            <MapView_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest} onMapReady={function () {
            if (isMapReady) {
                return;
            }
            setIsMapReady(true);
        }}/>
            {!isMapReady && (<react_native_1.View style={[styles.mapViewOverlay, overlayStyle, requireRouteToDisplayMap && StyleUtils.getBorderRadiusStyle(0)]}>
                    {/* The "map pending" text should only be shown in the IOU create flow. In the created IOU preview, only the icon should be shown. */}
                    {!requireRouteToDisplayMap ? (<BlockingView_1.default icon={Expensicons.EmptyStateRoutePending} title={translate('distance.mapPending.title')} subtitle={isOffline ? translate('distance.mapPending.subtitle') : translate('distance.mapPending.onlineSubtitle')} shouldShowLink={false} iconColor={theme.border}/>) : (<PendingMapView_1.default isSmallerIcon style={StyleUtils.getBorderRadiusStyle(0)}/>)}
                </react_native_1.View>)}
        </>);
}
DistanceMapView.displayName = 'DistanceMapView';
exports.default = DistanceMapView;
