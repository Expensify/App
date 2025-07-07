"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var MultipleAvatars_1 = require("@components/MultipleAvatars");
var PressableWithoutFeedback_1 = require("@components/Pressable/PressableWithoutFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useViewportOffsetTop_1 = require("@hooks/useViewportOffsetTop");
var FormActions_1 = require("@libs/actions/FormActions");
var Link_1 = require("@libs/actions/Link");
var Member_1 = require("@libs/actions/Policy/Member");
var Policy_1 = require("@libs/actions/Policy/Policy");
var getIsNarrowLayout_1 = require("@libs/getIsNarrowLayout");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var updateMultilineInputRange_1 = require("@libs/updateMultilineInputRange");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var WorkspaceInviteMessageForm_1 = require("@src/types/form/WorkspaceInviteMessageForm");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var AccessOrNotFoundWrapper_1 = require("./AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("./withPolicyAndFullscreenLoading");
function WorkspaceInviteMessagePage(_a) {
    var policy = _a.policy, route = _a.route, currentUserPersonalDetails = _a.currentUserPersonalDetails;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.WORKSPACE_INVITE_MESSAGE_FORM_DRAFT, { canBeMissing: true }), formData = _b[0], formDataResult = _b[1];
    var viewportOffsetTop = (0, useViewportOffsetTop_1.default)();
    var _c = (0, react_1.useState)(), welcomeNote = _c[0], setWelcomeNote = _c[1];
    var _d = (0, useAutoFocusInput_1.default)(), inputCallbackRef = _d.inputCallbackRef, inputRef = _d.inputRef;
    var _e = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT).concat(route.params.policyID.toString()), {
        canBeMissing: true,
    }), invitedEmailsToAccountIDsDraft = _e[0], invitedEmailsToAccountIDsDraftResult = _e[1];
    var _f = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_INVITE_MESSAGE_DRAFT).concat(route.params.policyID.toString()), {
        canBeMissing: true,
    }), workspaceInviteMessageDraft = _f[0], workspaceInviteMessageDraftResult = _f[1];
    var _g = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_INVITE_ROLE_DRAFT).concat(route.params.policyID.toString()), { canBeMissing: true })[0], workspaceInviteRoleDraft = _g === void 0 ? CONST_1.default.POLICY.ROLE.USER : _g;
    var allPersonalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var isOnyxLoading = (0, isLoadingOnyxValue_1.default)(workspaceInviteMessageDraftResult, invitedEmailsToAccountIDsDraftResult, formDataResult);
    var welcomeNoteSubject = (0, react_1.useMemo)(function () { var _a, _b; return "# ".concat((_a = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.displayName) !== null && _a !== void 0 ? _a : '', " invited you to ").concat((_b = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _b !== void 0 ? _b : 'a workspace'); }, [policy === null || policy === void 0 ? void 0 : policy.name, currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.displayName]);
    var getDefaultWelcomeNote = (0, react_1.useCallback)(function () {
        var _a, _b;
        return (
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (_b = (_a = formData === null || formData === void 0 ? void 0 : formData[WorkspaceInviteMessageForm_1.default.WELCOME_MESSAGE]) !== null && _a !== void 0 ? _a : 
        // workspaceInviteMessageDraft can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        workspaceInviteMessageDraft) !== null && _b !== void 0 ? _b : translate('workspace.common.welcomeNote'));
    }, [workspaceInviteMessageDraft, translate, formData]);
    (0, react_1.useEffect)(function () {
        if (isOnyxLoading) {
            return;
        }
        if (!(0, EmptyObject_1.isEmptyObject)(invitedEmailsToAccountIDsDraft)) {
            setWelcomeNote(getDefaultWelcomeNote());
            return;
        }
        if ((0, EmptyObject_1.isEmptyObject)(policy)) {
            return;
        }
        Navigation_1.default.goBack(route.params.backTo);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isOnyxLoading]);
    var sendInvitation = function () {
        var _a, _b;
        react_native_1.Keyboard.dismiss();
        var policyMemberAccountIDs = Object.values((0, PolicyUtils_1.getMemberAccountIDsForWorkspace)(policy === null || policy === void 0 ? void 0 : policy.employeeList, false, false));
        // Please see https://github.com/Expensify/App/blob/main/README.md#Security for more details
        (0, Member_1.addMembersToWorkspace)(invitedEmailsToAccountIDsDraft !== null && invitedEmailsToAccountIDsDraft !== void 0 ? invitedEmailsToAccountIDsDraft : {}, "".concat(welcomeNoteSubject, "\n\n").concat(welcomeNote), route.params.policyID, policyMemberAccountIDs, workspaceInviteRoleDraft);
        (0, Policy_1.setWorkspaceInviteMessageDraft)(route.params.policyID, welcomeNote !== null && welcomeNote !== void 0 ? welcomeNote : null);
        (0, FormActions_1.clearDraftValues)(ONYXKEYS_1.default.FORMS.WORKSPACE_INVITE_MESSAGE_FORM);
        if ((_b = (_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo) === null || _b === void 0 ? void 0 : _b.endsWith('members')) {
            Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return Navigation_1.default.dismissModal(); });
            return;
        }
        if ((0, getIsNarrowLayout_1.default)()) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MEMBERS.getRoute(route.params.policyID), { forceReplace: true });
            return;
        }
        Navigation_1.default.setNavigationActionToMicrotaskQueue(function () {
            Navigation_1.default.dismissModal();
            react_native_1.InteractionManager.runAfterInteractions(function () {
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MEMBERS.getRoute(route.params.policyID));
            });
        });
    };
    /** Opens privacy url as an external link */
    var openPrivacyURL = function (event) {
        event === null || event === void 0 ? void 0 : event.preventDefault();
        (0, Link_1.openExternalLink)(CONST_1.default.OLD_DOT_PUBLIC_URLS.PRIVACY_URL);
    };
    var validate = function () {
        var errorFields = {};
        if ((0, EmptyObject_1.isEmptyObject)(invitedEmailsToAccountIDsDraft) && !isOnyxLoading) {
            errorFields.welcomeMessage = translate('workspace.inviteMessage.inviteNoMembersError');
        }
        return errorFields;
    };
    var policyName = policy === null || policy === void 0 ? void 0 : policy.name;
    (0, react_1.useEffect)(function () {
        return function () {
            (0, Member_1.clearWorkspaceInviteRoleDraft)(route.params.policyID);
        };
    }, [route.params.policyID]);
    return (<AccessOrNotFoundWrapper_1.default policyID={route.params.policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} fullPageNotFoundViewProps={{ subtitleKey: (0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: PolicyUtils_1.goBackFromInvalidPolicy }}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding testID={WorkspaceInviteMessagePage.displayName} shouldEnableMaxHeight style={{ marginTop: viewportOffsetTop }}>
                <HeaderWithBackButton_1.default title={translate('workspace.inviteMessage.confirmDetails')} subtitle={policyName} shouldShowBackButton onCloseButtonPress={function () { return Navigation_1.default.dismissModal(); }} onBackButtonPress={function () { return Navigation_1.default.goBack(route.params.backTo); }}/>
                <FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.WORKSPACE_INVITE_MESSAGE_FORM} validate={validate} onSubmit={sendInvitation} submitButtonText={translate('common.invite')} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding footerContent={<PressableWithoutFeedback_1.default onPress={openPrivacyURL} role={CONST_1.default.ROLE.LINK} accessibilityLabel={translate('common.privacy')} href={CONST_1.default.OLD_DOT_PUBLIC_URLS.PRIVACY_URL} style={[styles.mv2, styles.alignSelfStart]}>
                            <react_native_1.View style={[styles.flexRow]}>
                                <Text_1.default style={[styles.mr1, styles.label, styles.link]}>{translate('common.privacy')}</Text_1.default>
                            </react_native_1.View>
                        </PressableWithoutFeedback_1.default>}>
                    <react_native_1.View style={[styles.mv4, styles.justifyContentCenter, styles.alignItemsCenter]}>
                        <MultipleAvatars_1.default size={CONST_1.default.AVATAR_SIZE.LARGE} icons={(0, OptionsListUtils_1.getAvatarsForAccountIDs)(Object.values(invitedEmailsToAccountIDsDraft !== null && invitedEmailsToAccountIDsDraft !== void 0 ? invitedEmailsToAccountIDsDraft : {}), allPersonalDetails !== null && allPersonalDetails !== void 0 ? allPersonalDetails : {}, invitedEmailsToAccountIDsDraft !== null && invitedEmailsToAccountIDsDraft !== void 0 ? invitedEmailsToAccountIDsDraft : {})} shouldStackHorizontally shouldDisplayAvatarsInRows secondAvatarStyle={[styles.secondAvatarInline]}/>
                    </react_native_1.View>
                    <react_native_1.View style={[styles.mb5]}>
                        <Text_1.default>{translate('workspace.inviteMessage.inviteMessagePrompt')}</Text_1.default>
                    </react_native_1.View>
                    <react_native_1.View style={[styles.mb3]}>
                        <react_native_1.View style={[styles.mhn5, styles.mb3]}>
                            <MenuItemWithTopDescription_1.default title={translate("workspace.common.roleName", { role: workspaceInviteRoleDraft })} description={translate('common.role')} shouldShowRightIcon onPress={function () {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_INVITE_MESSAGE_ROLE.getRoute(route.params.policyID, Navigation_1.default.getActiveRoute()));
        }}/>
                        </react_native_1.View>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} role={CONST_1.default.ROLE.PRESENTATION} inputID={WorkspaceInviteMessageForm_1.default.WELCOME_MESSAGE} label={translate('workspace.inviteMessage.personalMessagePrompt')} accessibilityLabel={translate('workspace.inviteMessage.personalMessagePrompt')} autoCompleteType="off" type="markdown" autoCorrect={false} autoGrowHeight maxAutoGrowHeight={variables_1.default.textInputAutoGrowMaxHeight} value={welcomeNote} onChangeText={function (text) {
            setWelcomeNote(text);
        }} ref={function (element) {
            if (!element) {
                return;
            }
            if (!inputRef.current) {
                (0, updateMultilineInputRange_1.default)(element);
            }
            inputCallbackRef(element);
        }} shouldSaveDraft/>
                    </react_native_1.View>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceInviteMessagePage.displayName = 'WorkspaceInviteMessagePage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)((0, withCurrentUserPersonalDetails_1.default)(WorkspaceInviteMessagePage));
