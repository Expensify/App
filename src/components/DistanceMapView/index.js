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
var MapView_1 = require("@components/MapView");
function DistanceMapView(_a) {
    var overlayStyle = _a.overlayStyle, rest = __rest(_a, ["overlayStyle"]);
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MapView_1.default {...rest}/>;
}
DistanceMapView.displayName = 'DistanceMapView';
exports.default = DistanceMapView;
