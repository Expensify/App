"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useViewportOffsetTop_1 = require("@hooks/useViewportOffsetTop");
var Member_1 = require("@libs/actions/Policy/Member");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var AccessOrNotFoundWrapper_1 = require("./AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("./withPolicyAndFullscreenLoading");
function WorkspaceInviteMessageRolePage(_a) {
    var _b;
    var policy = _a.policy, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _c = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_INVITE_ROLE_DRAFT).concat(route.params.policyID), {
        canBeMissing: true,
    }), _d = _c[0], role = _d === void 0 ? CONST_1.default.POLICY.ROLE.USER : _d, roleResult = _c[1];
    var viewportOffsetTop = (0, useViewportOffsetTop_1.default)();
    var isOnyxLoading = (0, isLoadingOnyxValue_1.default)(roleResult);
    var roleItems = (0, react_1.useMemo)(function () { return [
        {
            value: CONST_1.default.POLICY.ROLE.ADMIN,
            text: translate('common.admin'),
            alternateText: translate('workspace.common.adminAlternateText'),
            isSelected: role === CONST_1.default.POLICY.ROLE.ADMIN,
            keyForList: CONST_1.default.POLICY.ROLE.ADMIN,
        },
        {
            value: CONST_1.default.POLICY.ROLE.AUDITOR,
            text: translate('common.auditor'),
            alternateText: translate('workspace.common.auditorAlternateText'),
            isSelected: role === CONST_1.default.POLICY.ROLE.AUDITOR,
            keyForList: CONST_1.default.POLICY.ROLE.AUDITOR,
        },
        {
            value: CONST_1.default.POLICY.ROLE.USER,
            text: translate('common.member'),
            alternateText: translate('workspace.common.memberAlternateText'),
            isSelected: role === CONST_1.default.POLICY.ROLE.USER,
            keyForList: CONST_1.default.POLICY.ROLE.USER,
        },
    ]; }, [role, translate]);
    return (<AccessOrNotFoundWrapper_1.default policyID={route.params.policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} fullPageNotFoundViewProps={{ subtitleKey: (0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: PolicyUtils_1.goBackFromInvalidPolicy }}>
            <ScreenWrapper_1.default testID={WorkspaceInviteMessageRolePage.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight style={{ marginTop: viewportOffsetTop }}>
                <HeaderWithBackButton_1.default title={translate('common.role')} onBackButtonPress={function () { return Navigation_1.default.goBack(route.params.backTo); }}/>
                {!isOnyxLoading && (<react_native_1.View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                        <SelectionList_1.default sections={[{ data: roleItems }]} ListItem={RadioListItem_1.default} onSelectRow={function (_a) {
                var value = _a.value;
                (0, Member_1.setWorkspaceInviteRoleDraft)(route.params.policyID, value);
                Navigation_1.default.setNavigationActionToMicrotaskQueue(function () {
                    Navigation_1.default.goBack(route.params.backTo);
                });
            }} isAlternateTextMultilineSupported shouldSingleExecuteRowSelect initiallyFocusedOptionKey={(_b = roleItems.find(function (item) { return item.isSelected; })) === null || _b === void 0 ? void 0 : _b.keyForList} addBottomSafeAreaPadding/>
                    </react_native_1.View>)}
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceInviteMessageRolePage.displayName = 'WorkspaceInviteMessageRolePage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceInviteMessageRolePage);
