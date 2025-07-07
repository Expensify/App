"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var ReportUtils_1 = require("@libs/ReportUtils");
var UserUtils_1 = require("@libs/UserUtils");
var AttachmentModalContainer_1 = require("@pages/media/AttachmentModalScreen/AttachmentModalContainer");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function WorkspaceAvatarModalContent(_a) {
    var _b, _c, _d;
    var navigation = _a.navigation, route = _a.route;
    var policyID = route.params.policyID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: false })[0];
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { initialValue: true, canBeMissing: true })[0];
    var avatarURL = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.avatarURL) !== null && _b !== void 0 ? _b : '') !== null && _c !== void 0 ? _c : (0, ReportUtils_1.getDefaultWorkspaceAvatar)((_d = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _d !== void 0 ? _d : '');
    var contentProps = (0, react_1.useMemo)(function () {
        var _a;
        return ({
            source: (0, UserUtils_1.getFullSizeAvatar)(avatarURL, 0),
            headerTitle: policy === null || policy === void 0 ? void 0 : policy.name,
            isWorkspaceAvatar: true,
            originalFileName: (_a = policy === null || policy === void 0 ? void 0 : policy.originalFileName) !== null && _a !== void 0 ? _a : policy === null || policy === void 0 ? void 0 : policy.id,
            shouldShowNotFoundPage: !Object.keys(policy !== null && policy !== void 0 ? policy : {}).length && !isLoadingApp,
            isLoading: !Object.keys(policy !== null && policy !== void 0 ? policy : {}).length && !!isLoadingApp,
            maybeIcon: true,
        });
    }, [avatarURL, isLoadingApp, policy]);
    return (<AttachmentModalContainer_1.default navigation={navigation} contentProps={contentProps}/>);
}
WorkspaceAvatarModalContent.displayName = 'WorkspaceAvatarModalContent';
exports.default = WorkspaceAvatarModalContent;
