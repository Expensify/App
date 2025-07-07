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
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var Button_1 = require("@components/Button");
var ButtonDisabledWhenOffline_1 = require("@components/Button/ButtonDisabledWhenOffline");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var LockedAccountModalProvider_1 = require("@components/LockedAccountModalProvider");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useExpensifyCardFeeds_1 = require("@hooks/useExpensifyCardFeeds");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeIllustrations_1 = require("@hooks/useThemeIllustrations");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var Workflow_1 = require("@libs/actions/Workflow");
var CardUtils_1 = require("@libs/CardUtils");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var shouldRenderTransferOwnerButton_1 = require("@libs/shouldRenderTransferOwnerButton");
var WorkflowUtils_1 = require("@libs/WorkflowUtils");
var Navigation_1 = require("@navigation/Navigation");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var WorkspaceMemberRoleSelectionModal_1 = require("@pages/workspace/WorkspaceMemberRoleSelectionModal");
var variables_1 = require("@styles/variables");
var Card_1 = require("@userActions/Card");
var Member_1 = require("@userActions/Policy/Member");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceMemberDetailsPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    var personalDetails = _a.personalDetails, policy = _a.policy, route = _a.route;
    var policyID = route.params.policyID;
    var workspaceAccountID = (_b = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var styles = (0, useThemeStyles_1.default)();
    var _t = (0, useLocalize_1.default)(), formatPhoneNumber = _t.formatPhoneNumber, translate = _t.translate;
    var StyleUtils = (0, useStyleUtils_1.default)();
    var illustrations = (0, useThemeIllustrations_1.default)();
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var cardList = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST), { canBeMissing: true })[0];
    var customCardNames = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, { canBeMissing: true })[0];
    var expensifyCardSettings = (0, useExpensifyCardFeeds_1.default)(policyID);
    var _u = (0, react_1.useState)(false), isRemoveMemberConfirmModalVisible = _u[0], setIsRemoveMemberConfirmModalVisible = _u[1];
    var _v = (0, react_1.useState)(false), isRoleSelectionModalVisible = _v[0], setIsRoleSelectionModalVisible = _v[1];
    var accountID = Number(route.params.accountID);
    var memberLogin = (_d = (_c = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) === null || _c === void 0 ? void 0 : _c.login) !== null && _d !== void 0 ? _d : '';
    var member = (_e = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _e === void 0 ? void 0 : _e[memberLogin];
    var prevMember = (0, usePrevious_1.default)(member);
    var details = (_f = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) !== null && _f !== void 0 ? _f : {};
    var fallbackIcon = (_g = details.fallbackIcon) !== null && _g !== void 0 ? _g : '';
    var displayName = formatPhoneNumber((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(details));
    var isSelectedMemberOwner = (policy === null || policy === void 0 ? void 0 : policy.owner) === details.login;
    var isSelectedMemberCurrentUser = accountID === (currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID);
    var isCurrentUserAdmin = ((_l = (_h = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _h === void 0 ? void 0 : _h[(_k = (_j = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.accountID]) === null || _j === void 0 ? void 0 : _j.login) !== null && _k !== void 0 ? _k : '']) === null || _l === void 0 ? void 0 : _l.role) === CONST_1.default.POLICY.ROLE.ADMIN;
    var isCurrentUserOwner = (policy === null || policy === void 0 ? void 0 : policy.owner) === (currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.login);
    var ownerDetails = (0, react_1.useMemo)(function () { var _a, _b; return (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[(_a = policy === null || policy === void 0 ? void 0 : policy.ownerAccountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID]) !== null && _b !== void 0 ? _b : {}; }, [personalDetails, policy === null || policy === void 0 ? void 0 : policy.ownerAccountID]);
    var policyOwnerDisplayName = (_o = (_m = formatPhoneNumber((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(ownerDetails))) !== null && _m !== void 0 ? _m : policy === null || policy === void 0 ? void 0 : policy.owner) !== null && _o !== void 0 ? _o : '';
    var hasMultipleFeeds = Object.keys((0, CardUtils_1.getCompanyFeeds)(cardFeeds, false, true)).length > 0;
    var workspaceCards = (0, CardUtils_1.getAllCardsForWorkspace)(workspaceAccountID, cardList, cardFeeds, expensifyCardSettings);
    var isSMSLogin = expensify_common_1.Str.isSMSLogin(memberLogin);
    var phoneNumber = (0, PersonalDetailsUtils_1.getPhoneNumber)(details);
    var _w = (0, react_1.useContext)(LockedAccountModalProvider_1.LockedAccountContext), isAccountLocked = _w.isAccountLocked, showLockedAccountModal = _w.showLockedAccountModal;
    var policyApproverEmail = policy === null || policy === void 0 ? void 0 : policy.approver;
    var approvalWorkflows = (0, react_1.useMemo)(function () {
        var _a, _b;
        return (0, WorkflowUtils_1.convertPolicyEmployeesToApprovalWorkflows)({
            employees: (_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) !== null && _a !== void 0 ? _a : {},
            defaultApprover: (_b = policyApproverEmail !== null && policyApproverEmail !== void 0 ? policyApproverEmail : policy === null || policy === void 0 ? void 0 : policy.owner) !== null && _b !== void 0 ? _b : '',
            personalDetails: personalDetails !== null && personalDetails !== void 0 ? personalDetails : {},
        });
    }, [personalDetails, policy === null || policy === void 0 ? void 0 : policy.employeeList, policy === null || policy === void 0 ? void 0 : policy.owner, policyApproverEmail]).approvalWorkflows;
    (0, react_1.useEffect)(function () {
        (0, Member_1.openPolicyMemberProfilePage)(policyID, accountID);
    }, [policyID, accountID]);
    var memberCards = (0, react_1.useMemo)(function () {
        if (!workspaceCards) {
            return [];
        }
        return Object.values(workspaceCards !== null && workspaceCards !== void 0 ? workspaceCards : {}).filter(function (card) { return card.accountID === accountID; });
    }, [accountID, workspaceCards]);
    var confirmModalPrompt = (0, react_1.useMemo)(function () {
        var isApprover = (0, Member_1.isApprover)(policy, accountID);
        if (!isApprover) {
            return translate('workspace.people.removeMemberPrompt', { memberName: displayName });
        }
        return translate('workspace.people.removeMembersWarningPrompt', {
            memberName: displayName,
            ownerName: policyOwnerDisplayName,
        });
    }, [accountID, policy, displayName, policyOwnerDisplayName, translate]);
    var roleItems = (0, react_1.useMemo)(function () { return [
        {
            value: CONST_1.default.POLICY.ROLE.ADMIN,
            text: translate('common.admin'),
            alternateText: translate('workspace.common.adminAlternateText'),
            isSelected: (member === null || member === void 0 ? void 0 : member.role) === CONST_1.default.POLICY.ROLE.ADMIN,
            keyForList: CONST_1.default.POLICY.ROLE.ADMIN,
        },
        {
            value: CONST_1.default.POLICY.ROLE.AUDITOR,
            text: translate('common.auditor'),
            alternateText: translate('workspace.common.auditorAlternateText'),
            isSelected: (member === null || member === void 0 ? void 0 : member.role) === CONST_1.default.POLICY.ROLE.AUDITOR,
            keyForList: CONST_1.default.POLICY.ROLE.AUDITOR,
        },
        {
            value: CONST_1.default.POLICY.ROLE.USER,
            text: translate('common.member'),
            alternateText: translate('workspace.common.memberAlternateText'),
            isSelected: (member === null || member === void 0 ? void 0 : member.role) === CONST_1.default.POLICY.ROLE.USER,
            keyForList: CONST_1.default.POLICY.ROLE.USER,
        },
    ]; }, [member === null || member === void 0 ? void 0 : member.role, translate]);
    (0, react_1.useEffect)(function () {
        if (!prevMember || (prevMember === null || prevMember === void 0 ? void 0 : prevMember.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE || (member === null || member === void 0 ? void 0 : member.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }
        Navigation_1.default.goBack();
    }, [member, prevMember]);
    var askForConfirmationToRemove = function () {
        setIsRemoveMemberConfirmModalVisible(true);
    };
    // Function to remove a member and close the modal
    var removeMemberAndCloseModal = (0, react_1.useCallback)(function () {
        var _a;
        (0, Member_1.removeMembers)([accountID], policyID);
        var previousEmployeesCount = Object.keys((_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) !== null && _a !== void 0 ? _a : {}).length;
        var remainingEmployeeCount = previousEmployeesCount - 1;
        if (remainingEmployeeCount === 1 && (policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval)) {
            // We can't let the "Prevent Self Approvals" enabled if there's only one workspace user
            (0, Policy_1.setPolicyPreventSelfApproval)(route.params.policyID, false);
        }
        setIsRemoveMemberConfirmModalVisible(false);
    }, [accountID, policy === null || policy === void 0 ? void 0 : policy.employeeList, policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval, policyID, route.params.policyID]);
    var removeUser = (0, react_1.useCallback)(function () {
        var ownerEmail = ownerDetails === null || ownerDetails === void 0 ? void 0 : ownerDetails.login;
        var removedApprover = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID];
        // If the user is not an approver, proceed with member removal
        if (!(0, Member_1.isApprover)(policy, accountID) || !(removedApprover === null || removedApprover === void 0 ? void 0 : removedApprover.login) || !ownerEmail) {
            removeMemberAndCloseModal();
            return;
        }
        // Update approval workflows after approver removal
        var updatedWorkflows = (0, WorkflowUtils_1.updateWorkflowDataOnApproverRemoval)({
            approvalWorkflows: approvalWorkflows,
            removedApprover: removedApprover,
            ownerDetails: ownerDetails,
        });
        updatedWorkflows.forEach(function (workflow) {
            if (workflow === null || workflow === void 0 ? void 0 : workflow.removeApprovalWorkflow) {
                var removeApprovalWorkflow = workflow.removeApprovalWorkflow, updatedWorkflow = __rest(workflow, ["removeApprovalWorkflow"]);
                (0, Workflow_1.removeApprovalWorkflow)(policyID, updatedWorkflow);
            }
            else {
                (0, Workflow_1.updateApprovalWorkflow)(policyID, workflow, [], []);
            }
        });
        // Remove the member and close the modal
        removeMemberAndCloseModal();
    }, [accountID, approvalWorkflows, ownerDetails, personalDetails, policy, policyID, removeMemberAndCloseModal]);
    var navigateToProfile = (0, react_1.useCallback)(function () {
        Navigation_1.default.navigate(ROUTES_1.default.PROFILE.getRoute(accountID, Navigation_1.default.getActiveRoute()));
    }, [accountID]);
    var navigateToDetails = (0, react_1.useCallback)(function (card) {
        if (card.bank === CONST_1.default.EXPENSIFY_CARD.BANK) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(policyID, card.cardID.toString(), Navigation_1.default.getActiveRoute()));
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, card.cardID.toString(), card.bank, Navigation_1.default.getActiveRoute()));
    }, [policyID]);
    var handleIssueNewCard = (0, react_1.useCallback)(function () {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        if (hasMultipleFeeds) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MEMBER_NEW_CARD.getRoute(policyID, accountID));
            return;
        }
        var activeRoute = Navigation_1.default.getActiveRoute();
        (0, Card_1.setIssueNewCardStepAndData)({
            step: CONST_1.default.EXPENSIFY_CARD.STEP.CARD_TYPE,
            data: {
                assigneeEmail: memberLogin,
            },
            isEditing: false,
            policyID: policyID,
        });
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID, activeRoute));
    }, [accountID, hasMultipleFeeds, memberLogin, policyID, isAccountLocked, showLockedAccountModal]);
    var openRoleSelectionModal = (0, react_1.useCallback)(function () {
        setIsRoleSelectionModalVisible(true);
    }, []);
    var changeRole = (0, react_1.useCallback)(function (_a) {
        var value = _a.value;
        setIsRoleSelectionModalVisible(false);
        (0, Member_1.updateWorkspaceMembersRole)(policyID, [accountID], value);
    }, [accountID, policyID]);
    var startChangeOwnershipFlow = (0, react_1.useCallback)(function () {
        (0, Member_1.clearWorkspaceOwnerChangeFlow)(policyID);
        (0, Member_1.requestWorkspaceOwnerChange)(policyID);
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(policyID, accountID, 'amountOwed'));
    }, [accountID, policyID]);
    // eslint-disable-next-line rulesdir/no-negated-variables
    var shouldShowNotFoundPage = !member || (member.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE && (prevMember === null || prevMember === void 0 ? void 0 : prevMember.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    if (shouldShowNotFoundPage) {
        return <NotFoundPage_1.default />;
    }
    var shouldShowCardsSection = Object.values(expensifyCardSettings !== null && expensifyCardSettings !== void 0 ? expensifyCardSettings : {}).some(function (cardSettings) { return (0, CardUtils_1.isExpensifyCardFullySetUp)(policy, cardSettings); }) || hasMultipleFeeds;
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding testID={WorkspaceMemberDetailsPage.displayName}>
                <HeaderWithBackButton_1.default title={displayName} subtitle={policy === null || policy === void 0 ? void 0 : policy.name}/>
                <ScrollView_1.default addBottomSafeAreaPadding>
                    <react_native_1.View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone, styles.justifyContentStart]}>
                        <react_native_1.View style={[styles.avatarSectionWrapper, styles.pb0]}>
                            <OfflineWithFeedback_1.default pendingAction={(_p = details.pendingFields) === null || _p === void 0 ? void 0 : _p.avatar}>
                                <Avatar_1.default containerStyles={[styles.avatarXLarge, styles.mb4, styles.noOutline]} imageStyles={[styles.avatarXLarge]} source={details.avatar} avatarID={accountID} type={CONST_1.default.ICON_TYPE_AVATAR} size={CONST_1.default.AVATAR_SIZE.X_LARGE} fallbackIcon={fallbackIcon}/>
                            </OfflineWithFeedback_1.default>
                            {!!((_q = details.displayName) !== null && _q !== void 0 ? _q : '') && (<Text_1.default style={[styles.textHeadline, styles.pre, styles.mb8, styles.w100, styles.textAlignCenter]} numberOfLines={1}>
                                    {displayName}
                                </Text_1.default>)}
                            {isSelectedMemberOwner && isCurrentUserAdmin && !isCurrentUserOwner ? ((0, shouldRenderTransferOwnerButton_1.default)() && (<ButtonDisabledWhenOffline_1.default text={translate('workspace.people.transferOwner')} onPress={startChangeOwnershipFlow} icon={Expensicons.Transfer} style={styles.mb5}/>)) : (<Button_1.default text={translate('workspace.people.removeWorkspaceMemberButtonTitle')} onPress={isAccountLocked ? showLockedAccountModal : askForConfirmationToRemove} isDisabled={isSelectedMemberOwner || isSelectedMemberCurrentUser} icon={Expensicons.RemoveMembers} style={styles.mb5}/>)}
                            <ConfirmModal_1.default danger title={translate('workspace.people.removeMemberTitle')} isVisible={isRemoveMemberConfirmModalVisible} onConfirm={removeUser} onCancel={function () { return setIsRemoveMemberConfirmModalVisible(false); }} prompt={confirmModalPrompt} confirmText={translate('common.remove')} cancelText={translate('common.cancel')}/>
                        </react_native_1.View>
                        <react_native_1.View style={styles.w100}>
                            <MenuItemWithTopDescription_1.default title={isSMSLogin ? formatPhoneNumber(phoneNumber !== null && phoneNumber !== void 0 ? phoneNumber : '') : memberLogin} copyValue={isSMSLogin ? formatPhoneNumber(phoneNumber !== null && phoneNumber !== void 0 ? phoneNumber : '') : memberLogin} description={translate(isSMSLogin ? 'common.phoneNumber' : 'common.email')} interactive={false}/>
                            <MenuItemWithTopDescription_1.default disabled={isSelectedMemberOwner || isSelectedMemberCurrentUser} title={translate("workspace.common.roleName", { role: member === null || member === void 0 ? void 0 : member.role })} description={translate('common.role')} shouldShowRightIcon onPress={openRoleSelectionModal}/>
                            {(0, PolicyUtils_1.isControlPolicy)(policy) && (<>
                                    <OfflineWithFeedback_1.default pendingAction={(_r = member === null || member === void 0 ? void 0 : member.pendingFields) === null || _r === void 0 ? void 0 : _r.employeeUserID}>
                                        <MenuItemWithTopDescription_1.default description={translate('workspace.common.customField1')} title={member === null || member === void 0 ? void 0 : member.employeeUserID} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_CUSTOM_FIELDS.getRoute(policyID, accountID, 'customField1')); }}/>
                                    </OfflineWithFeedback_1.default>
                                    <OfflineWithFeedback_1.default pendingAction={(_s = member === null || member === void 0 ? void 0 : member.pendingFields) === null || _s === void 0 ? void 0 : _s.employeePayrollID}>
                                        <MenuItemWithTopDescription_1.default description={translate('workspace.common.customField2')} title={member === null || member === void 0 ? void 0 : member.employeePayrollID} shouldShowRightIcon onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_CUSTOM_FIELDS.getRoute(policyID, accountID, 'customField2')); }}/>
                                    </OfflineWithFeedback_1.default>
                                </>)}
                            <MenuItem_1.default style={styles.mb5} title={translate('common.profile')} icon={Expensicons.Info} onPress={navigateToProfile} shouldShowRightIcon/>
                            <WorkspaceMemberRoleSelectionModal_1.default isVisible={isRoleSelectionModalVisible} items={roleItems} onRoleChange={changeRole} onClose={function () { return setIsRoleSelectionModalVisible(false); }}/>
                            {shouldShowCardsSection && (<>
                                    <react_native_1.View style={[styles.ph5, styles.pv3]}>
                                        <Text_1.default style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText, styles.textLabelSupporting])}>
                                            {translate('walletPage.assignedCards')}
                                        </Text_1.default>
                                    </react_native_1.View>
                                    {memberCards.map(function (memberCard) {
                var _a, _b, _c, _d, _e, _f, _g;
                var isCardDeleted = memberCard.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                var plaidUrl = (0, CardUtils_1.getPlaidInstitutionIconUrl)(memberCard === null || memberCard === void 0 ? void 0 : memberCard.bank);
                return (<OfflineWithFeedback_1.default key={"".concat((_a = memberCard.nameValuePairs) === null || _a === void 0 ? void 0 : _a.cardTitle, "_").concat(memberCard.cardID)} errorRowStyles={styles.ph5} errors={memberCard.errors} pendingAction={memberCard.pendingAction}>
                                                <MenuItem_1.default key={memberCard.cardID} title={(_d = (_c = (_b = memberCard.nameValuePairs) === null || _b === void 0 ? void 0 : _b.cardTitle) !== null && _c !== void 0 ? _c : customCardNames === null || customCardNames === void 0 ? void 0 : customCardNames[memberCard.cardID]) !== null && _d !== void 0 ? _d : (0, CardUtils_1.maskCardNumber)((_e = memberCard === null || memberCard === void 0 ? void 0 : memberCard.cardName) !== null && _e !== void 0 ? _e : '', memberCard.bank)} description={(_f = memberCard === null || memberCard === void 0 ? void 0 : memberCard.lastFourPAN) !== null && _f !== void 0 ? _f : (0, CardUtils_1.lastFourNumbersFromCardName)(memberCard === null || memberCard === void 0 ? void 0 : memberCard.cardName)} badgeText={memberCard.bank === CONST_1.default.EXPENSIFY_CARD.BANK ? (0, CurrencyUtils_1.convertToDisplayString)((_g = memberCard.nameValuePairs) === null || _g === void 0 ? void 0 : _g.unapprovedExpenseLimit) : ''} icon={(0, CardUtils_1.getCardFeedIcon)(memberCard.bank, illustrations)} plaidUrl={plaidUrl} displayInDefaultIconColor iconStyles={styles.cardIcon} iconType={plaidUrl ? CONST_1.default.ICON_TYPE_PLAID : CONST_1.default.ICON_TYPE_ICON} iconWidth={variables_1.default.cardIconWidth} iconHeight={variables_1.default.cardIconHeight} onPress={function () { return navigateToDetails(memberCard); }} shouldRemoveHoverBackground={isCardDeleted} disabled={isCardDeleted} shouldShowRightIcon={!isCardDeleted} style={[isCardDeleted ? styles.offlineFeedback.deleted : {}]}/>
                                            </OfflineWithFeedback_1.default>);
            })}
                                    <MenuItem_1.default title={translate('workspace.expensifyCard.newCard')} icon={Expensicons.Plus} onPress={handleIssueNewCard}/>
                                </>)}
                        </react_native_1.View>
                    </react_native_1.View>
                </ScrollView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceMemberDetailsPage.displayName = 'WorkspaceMemberDetailsPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceMemberDetailsPage);
