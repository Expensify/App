"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Member_1 = require("@libs/actions/Policy/Member");
var navigateAfterJoinRequest_1 = require("@libs/navigateAfterJoinRequest");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
function WorkspaceJoinUserPage(_a) {
    var _b, _c;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = (_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.policyID;
    var _d = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: true }), policy = _d[0], policyResult = _d[1];
    var isPolicyLoading = (0, isLoadingOnyxValue_1.default)(policyResult);
    var inviterEmail = (_c = route === null || route === void 0 ? void 0 : route.params) === null || _c === void 0 ? void 0 : _c.email;
    var isUnmounted = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        if (isUnmounted.current || isPolicyLoading) {
            return;
        }
        if (!(0, EmptyObject_1.isEmptyObject)(policy) && !(policy === null || policy === void 0 ? void 0 : policy.isJoinRequestPending) && !(0, PolicyUtils_1.isPendingDeletePolicy)(policy)) {
            Navigation_1.default.isNavigationReady().then(function () {
                if (Navigation_1.default.getShouldPopToSidebar()) {
                    Navigation_1.default.popToSidebar();
                }
                else {
                    Navigation_1.default.goBack();
                }
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_INITIAL.getRoute(policyID));
            });
            return;
        }
        (0, Member_1.inviteMemberToWorkspace)(policyID, inviterEmail);
        Navigation_1.default.isNavigationReady().then(function () {
            if (isUnmounted.current) {
                return;
            }
            (0, navigateAfterJoinRequest_1.default)();
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we only want to run this once after the policy loads
    }, [isPolicyLoading]);
    (0, react_1.useEffect)(function () { return function () {
        isUnmounted.current = true;
    }; }, []);
    return (<ScreenWrapper_1.default testID={WorkspaceJoinUserPage.displayName}>
            <FullscreenLoadingIndicator_1.default style={[styles.flex1, styles.pRelative]}/>
        </ScreenWrapper_1.default>);
}
WorkspaceJoinUserPage.displayName = 'WorkspaceJoinUserPage';
exports.default = WorkspaceJoinUserPage;
