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
var OnboardingWrapper_1 = require("@components/OnboardingWrapper");
var BaseOnboardingWorkspaces_1 = require("./BaseOnboardingWorkspaces");
function OnboardingWorkspaces(_a) {
    var rest = __rest(_a, []);
    return (<OnboardingWrapper_1.default>
            <BaseOnboardingWorkspaces_1.default shouldUseNativeStyles={false} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}/>
        </OnboardingWrapper_1.default>);
}
OnboardingWorkspaces.displayName = 'OnboardingWorkspaces';
exports.default = OnboardingWorkspaces;
