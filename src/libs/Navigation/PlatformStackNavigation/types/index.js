"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRouteBasedScreenOptions = isRouteBasedScreenOptions;
// The "screenOptions" and "defaultScreenOptions" can either be an object of navigation options or
// a factory function that returns the navigation options based on route and navigation props.
// These types are used to represent the screen options and their factory functions.
function isRouteBasedScreenOptions(screenOptions) {
    return typeof screenOptions === 'function';
}
__exportStar(require("./NavigationBuilder"), exports);
__exportStar(require("./NavigationOptions"), exports);
__exportStar(require("./NavigatorComponent"), exports);
