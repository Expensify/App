"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var AttachmentModal_1 = require("@components/AttachmentModal");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils = require("@libs/ReportUtils");
var UserUtils = require("@libs/UserUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function WorkspaceAvatar(_a) {
    var _b, _c, _d, _e, _f;
    var policy = _a.policy, _g = _a.isLoadingApp, isLoadingApp = _g === void 0 ? true : _g;
    var avatarURL = ((_b = policy === null || policy === void 0 ? void 0 : policy.avatarURL) !== null && _b !== void 0 ? _b : '') ? ((_c = policy === null || policy === void 0 ? void 0 : policy.avatarURL) !== null && _c !== void 0 ? _c : '') : ReportUtils.getDefaultWorkspaceAvatar((_d = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _d !== void 0 ? _d : '');
    return (<AttachmentModal_1.default headerTitle={(_e = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _e !== void 0 ? _e : ''} defaultOpen source={UserUtils.getFullSizeAvatar(avatarURL, 0)} onModalClose={Navigation_1.default.goBack} isWorkspaceAvatar originalFileName={(_f = policy === null || policy === void 0 ? void 0 : policy.originalFileName) !== null && _f !== void 0 ? _f : policy === null || policy === void 0 ? void 0 : policy.id} shouldShowNotFoundPage={!Object.keys(policy !== null && policy !== void 0 ? policy : {}).length && !isLoadingApp} isLoading={!Object.keys(policy !== null && policy !== void 0 ? policy : {}).length && !!isLoadingApp} maybeIcon/>);
}
WorkspaceAvatar.displayName = 'WorkspaceAvatar';
exports.default = (0, react_native_onyx_1.withOnyx)({
    policy: {
        key: function (_a) {
            var _b;
            var route = _a.route;
            return "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat((_b = route.params.policyID) !== null && _b !== void 0 ? _b : '-1');
        },
    },
    isLoadingApp: {
        key: ONYXKEYS_1.default.IS_LOADING_APP,
    },
})(WorkspaceAvatar);
