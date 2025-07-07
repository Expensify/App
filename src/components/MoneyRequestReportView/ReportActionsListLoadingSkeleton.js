"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var ReportActionsSkeletonView_1 = require("@components/ReportActionsSkeletonView");
function ReportActionsListLoadingSkeleton() {
    return (<react_native_reanimated_1.default.View entering={react_native_reanimated_1.FadeIn} exiting={react_native_reanimated_1.FadeOut}>
            <ReportActionsSkeletonView_1.default possibleVisibleContentItems={3}/>
        </react_native_reanimated_1.default.View>);
}
ReportActionsListLoadingSkeleton.displayName = 'ReportActionsListLoadingSkeleton';
exports.default = ReportActionsListLoadingSkeleton;
