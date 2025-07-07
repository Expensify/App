"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Avatar_1 = require("@components/Avatar");
var AvatarWithImagePicker_1 = require("@components/AvatarWithImagePicker");
var Button_1 = require("@components/Button");
var ConfirmModal_1 = require("@components/ConfirmModal");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Illustrations_1 = require("@components/Icon/Illustrations");
var LockedAccountModalProvider_1 = require("@components/LockedAccountModalProvider");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Section_1 = require("@components/Section");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePayAndDowngrade_1 = require("@hooks/usePayAndDowngrade");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeIllustrations_1 = require("@hooks/useThemeIllustrations");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Member_1 = require("@libs/actions/Policy/Member");
var Policy_1 = require("@libs/actions/Policy/Policy");
var CardUtils_1 = require("@libs/CardUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var StringUtils_1 = require("@libs/StringUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var UserUtils_1 = require("@libs/UserUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var withPolicy_1 = require("./withPolicy");
var WorkspacePageWithSections_1 = require("./WorkspacePageWithSections");
function WorkspaceOverviewPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var policyDraft = _a.policyDraft, policyProp = _a.policy, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var illustrations = (0, useThemeIllustrations_1.default)();
    var backTo = route.params.backTo;
    var _m = (0, useOnyx_1.default)(ONYXKEYS_1.default.CURRENCY_LIST, { canBeMissing: true })[0], currencyList = _m === void 0 ? {} : _m;
    var _o = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, {
        selector: function (session) { return session === null || session === void 0 ? void 0 : session.accountID; },
        canBeMissing: true,
    })[0], currentUserAccountID = _o === void 0 ? -1 : _o;
    var isComingFromGlobalReimbursementsFlow = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_COMING_FROM_GLOBAL_REIMBURSEMENTS_FLOW, { canBeMissing: true })[0];
    // When we create a new workspace, the policy prop will be empty on the first render. Therefore, we have to use policyDraft until policy has been set in Onyx.
    var policy = (policyDraft === null || policyDraft === void 0 ? void 0 : policyDraft.id) ? policyDraft : policyProp;
    var isPolicyAdmin = (0, PolicyUtils_1.isPolicyAdmin)(policy);
    var outputCurrency = (_b = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _b !== void 0 ? _b : '';
    var currencySymbol = (_d = (_c = currencyList === null || currencyList === void 0 ? void 0 : currencyList[outputCurrency]) === null || _c === void 0 ? void 0 : _c.symbol) !== null && _d !== void 0 ? _d : '';
    var formattedCurrency = !(0, EmptyObject_1.isEmptyObject)(policy) && !(0, EmptyObject_1.isEmptyObject)(currencyList) ? "".concat(outputCurrency, " - ").concat(currencySymbol) : '';
    // We need this to update translation for deleting a workspace when it has third party card feeds or expensify card assigned.
    var workspaceAccountID = (_e = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _e !== void 0 ? _e : CONST_1.default.DEFAULT_NUMBER_ID;
    var cardFeeds = (0, useCardFeeds_1.default)(policy === null || policy === void 0 ? void 0 : policy.id)[0];
    var cardsList = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(workspaceAccountID, "_").concat(CONST_1.default.EXPENSIFY_CARD.BANK), {
        selector: CardUtils_1.filterInactiveCards,
        canBeMissing: true,
    })[0];
    var hasCardFeedOrExpensifyCard = 
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    !(0, EmptyObject_1.isEmptyObject)(cardFeeds) || !(0, EmptyObject_1.isEmptyObject)(cardsList) || (((policy === null || policy === void 0 ? void 0 : policy.areExpensifyCardsEnabled) || (policy === null || policy === void 0 ? void 0 : policy.areCompanyCardsEnabled)) && (policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID));
    var _p = ((_g = (_f = policy === null || policy === void 0 ? void 0 : policy.address) === null || _f === void 0 ? void 0 : _f.addressStreet) !== null && _g !== void 0 ? _g : '').split('\n'), street1 = _p[0], street2 = _p[1];
    var formattedAddress = !(0, EmptyObject_1.isEmptyObject)(policy) && !(0, EmptyObject_1.isEmptyObject)(policy.address)
        ? "".concat(street1 === null || street1 === void 0 ? void 0 : street1.trim(), ", ").concat(street2 ? "".concat(street2.trim(), ", ") : '').concat(policy.address.city, ", ").concat(policy.address.state, " ").concat((_h = policy.address.zipCode) !== null && _h !== void 0 ? _h : '')
        : '';
    var onPressCurrency = (0, react_1.useCallback)(function () {
        if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policy.id));
    }, [policy === null || policy === void 0 ? void 0 : policy.id]);
    var onPressAddress = (0, react_1.useCallback)(function () {
        if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_OVERVIEW_ADDRESS.getRoute(policy.id));
    }, [policy === null || policy === void 0 ? void 0 : policy.id]);
    var onPressName = (0, react_1.useCallback)(function () {
        if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_OVERVIEW_NAME.getRoute(policy.id));
    }, [policy === null || policy === void 0 ? void 0 : policy.id]);
    var onPressDescription = (0, react_1.useCallback)(function () {
        if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_OVERVIEW_DESCRIPTION.getRoute(policy.id));
    }, [policy === null || policy === void 0 ? void 0 : policy.id]);
    var onPressShare = (0, react_1.useCallback)(function () {
        if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_OVERVIEW_SHARE.getRoute(policy.id));
    }, [policy === null || policy === void 0 ? void 0 : policy.id]);
    var onPressPlanType = (0, react_1.useCallback)(function () {
        if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_OVERVIEW_PLAN.getRoute(policy.id));
    }, [policy === null || policy === void 0 ? void 0 : policy.id]);
    var policyName = (_j = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _j !== void 0 ? _j : '';
    var policyDescription = (_k = policy === null || policy === void 0 ? void 0 : policy.description) !== null && _k !== void 0 ? _k : translate('workspace.common.defaultDescription');
    var policyCurrency = (_l = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _l !== void 0 ? _l : '';
    var readOnly = !(0, PolicyUtils_1.isPolicyAdmin)(policy);
    var isOwner = (0, PolicyUtils_1.isPolicyOwner)(policy, currentUserAccountID);
    var imageStyle = shouldUseNarrowLayout ? [styles.mhv12, styles.mhn5, styles.mbn5] : [styles.mhv8, styles.mhn8, styles.mbn5];
    var shouldShowAddress = !readOnly || !!formattedAddress;
    var _q = (0, react_1.useContext)(LockedAccountModalProvider_1.LockedAccountContext), isAccountLocked = _q.isAccountLocked, showLockedAccountModal = _q.showLockedAccountModal;
    var fetchPolicyData = (0, react_1.useCallback)(function () {
        if (policyDraft === null || policyDraft === void 0 ? void 0 : policyDraft.id) {
            return;
        }
        (0, Policy_1.openPolicyProfilePage)(route.params.policyID);
    }, [policyDraft === null || policyDraft === void 0 ? void 0 : policyDraft.id, route.params.policyID]);
    (0, useNetwork_1.default)({ onReconnect: fetchPolicyData });
    // We have the same focus effect in the WorkspaceInitialPage, this way we can get the policy data in narrow
    // as well as in the wide layout when looking at policy settings.
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        fetchPolicyData();
    }, [fetchPolicyData]));
    var DefaultAvatar = (0, react_1.useCallback)(function () { return (<Avatar_1.default containerStyles={styles.avatarXLarge} imageStyles={[styles.avatarXLarge, styles.alignSelfCenter]} 
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing cannot be used if left side can be empty string
    source={(policy === null || policy === void 0 ? void 0 : policy.avatarURL) || (0, ReportUtils_1.getDefaultWorkspaceAvatar)(policyName)} fallbackIcon={Expensicons_1.FallbackWorkspaceAvatar} size={CONST_1.default.AVATAR_SIZE.X_LARGE} name={policyName} avatarID={policy === null || policy === void 0 ? void 0 : policy.id} type={CONST_1.default.ICON_TYPE_WORKSPACE}/>); }, [policy === null || policy === void 0 ? void 0 : policy.avatarURL, policy === null || policy === void 0 ? void 0 : policy.id, policyName, styles.alignSelfCenter, styles.avatarXLarge]);
    var _r = (0, react_1.useState)(false), isDeleteModalOpen = _r[0], setIsDeleteModalOpen = _r[1];
    var _s = (0, usePayAndDowngrade_1.default)(setIsDeleteModalOpen), setIsDeletingPaidWorkspace = _s.setIsDeletingPaidWorkspace, isLoadingBill = _s.isLoadingBill;
    var confirmDeleteAndHideModal = (0, react_1.useCallback)(function () {
        if (!(policy === null || policy === void 0 ? void 0 : policy.id) || !policyName) {
            return;
        }
        (0, Policy_1.deleteWorkspace)(policy.id, policyName);
        setIsDeleteModalOpen(false);
        if (!shouldUseNarrowLayout) {
            (0, PolicyUtils_1.goBackFromInvalidPolicy)();
        }
    }, [policy === null || policy === void 0 ? void 0 : policy.id, policyName, shouldUseNarrowLayout]);
    var onDeleteWorkspace = (0, react_1.useCallback)(function () {
        if ((0, SubscriptionUtils_1.shouldCalculateBillNewDot)()) {
            setIsDeletingPaidWorkspace(true);
            (0, Policy_1.calculateBillNewDot)();
            return;
        }
        setIsDeleteModalOpen(true);
    }, [setIsDeletingPaidWorkspace]);
    var handleBackButtonPress = function () {
        if (isComingFromGlobalReimbursementsFlow) {
            (0, Policy_1.setIsComingFromGlobalReimbursementsFlow)(false);
            Navigation_1.default.goBack();
        }
        if (backTo) {
            Navigation_1.default.goBack(backTo);
            return;
        }
        Navigation_1.default.popToSidebar();
    };
    return (<WorkspacePageWithSections_1.default headerText={translate('workspace.common.profile')} route={route} 
    // When we create a new workspaces, the policy prop will not be set on the first render. Therefore, we have to delay rendering until it has been set in Onyx.
    shouldShowLoading={policy === undefined} shouldUseScrollView shouldShowOfflineIndicatorInWideScreen shouldShowNonAdmin icon={Illustrations_1.Building} shouldShowNotFoundPage={policy === undefined} onBackButtonPress={handleBackButtonPress} addBottomSafeAreaPadding>
            {function (hasVBA) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            return (<react_native_1.View style={[styles.flex1, styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section_1.default isCentralPane title="">
                        <react_native_1.Image style={react_native_1.StyleSheet.flatten([styles.wAuto, styles.h68, imageStyle])} source={illustrations.WorkspaceProfile} resizeMode="cover"/>
                        <AvatarWithImagePicker_1.default onViewPhotoPress={function () {
                    if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_AVATAR.getRoute(policy.id));
                }} source={(_a = policy === null || policy === void 0 ? void 0 : policy.avatarURL) !== null && _a !== void 0 ? _a : ''} avatarID={policy === null || policy === void 0 ? void 0 : policy.id} size={CONST_1.default.AVATAR_SIZE.X_LARGE} avatarStyle={styles.avatarXLarge} enablePreview DefaultAvatar={DefaultAvatar} type={CONST_1.default.ICON_TYPE_WORKSPACE} fallbackIcon={Expensicons_1.FallbackWorkspaceAvatar} style={[
                    ((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _b === void 0 ? void 0 : _b.avatarURL) !== null && _c !== void 0 ? _c : shouldUseNarrowLayout) ? styles.mb1 : styles.mb3,
                    shouldUseNarrowLayout ? styles.mtn17 : styles.mtn20,
                    styles.alignItemsStart,
                    styles.sectionMenuItemTopDescription,
                ]} editIconStyle={styles.smallEditIconWorkspace} isUsingDefaultAvatar={!(policy === null || policy === void 0 ? void 0 : policy.avatarURL)} onImageSelected={function (file) {
                    if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
                        return;
                    }
                    (0, Policy_1.updateWorkspaceAvatar)(policy.id, file);
                }} onImageRemoved={function () {
                    if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
                        return;
                    }
                    (0, Policy_1.deleteWorkspaceAvatar)(policy.id);
                }} editorMaskImage={Expensicons_1.ImageCropSquareMask} pendingAction={(_d = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _d === void 0 ? void 0 : _d.avatarURL} errors={(_e = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _e === void 0 ? void 0 : _e.avatarURL} onErrorClose={function () {
                    if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
                        return;
                    }
                    (0, Policy_1.clearAvatarErrors)(policy.id);
                }} previewSource={(0, UserUtils_1.getFullSizeAvatar)((_f = policy === null || policy === void 0 ? void 0 : policy.avatarURL) !== null && _f !== void 0 ? _f : '')} headerTitle={translate('workspace.common.workspaceAvatar')} originalFileName={policy === null || policy === void 0 ? void 0 : policy.originalFileName} disabled={readOnly} disabledStyle={styles.cursorDefault} errorRowStyles={styles.mt3}/>
                        <OfflineWithFeedback_1.default pendingAction={(_g = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _g === void 0 ? void 0 : _g.name}>
                            <MenuItemWithTopDescription_1.default title={policyName} titleStyle={styles.workspaceTitleStyle} description={translate('workspace.common.workspaceName')} shouldShowRightIcon={!readOnly} interactive={!readOnly} wrapperStyle={[styles.sectionMenuItemTopDescription, shouldUseNarrowLayout ? styles.mt3 : {}]} onPress={onPressName} shouldBreakWord numberOfLinesTitle={0}/>
                        </OfflineWithFeedback_1.default>
                        {(!StringUtils_1.default.isEmptyString((_h = policy === null || policy === void 0 ? void 0 : policy.description) !== null && _h !== void 0 ? _h : '') || !readOnly) && (<OfflineWithFeedback_1.default pendingAction={(_j = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _j === void 0 ? void 0 : _j.description} errors={(0, ErrorUtils_1.getLatestErrorField)(policy !== null && policy !== void 0 ? policy : {}, CONST_1.default.POLICY.COLLECTION_KEYS.DESCRIPTION)} onClose={function () {
                        if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
                            return;
                        }
                        (0, Policy_1.clearPolicyErrorField)(policy.id, CONST_1.default.POLICY.COLLECTION_KEYS.DESCRIPTION);
                    }}>
                                <MenuItemWithTopDescription_1.default title={policyDescription} description={translate('workspace.editor.descriptionInputLabel')} shouldShowRightIcon={!readOnly} interactive={!readOnly} wrapperStyle={styles.sectionMenuItemTopDescription} onPress={onPressDescription} shouldRenderAsHTML/>
                            </OfflineWithFeedback_1.default>)}
                        <OfflineWithFeedback_1.default pendingAction={(_k = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _k === void 0 ? void 0 : _k.outputCurrency} errors={(0, ErrorUtils_1.getLatestErrorField)(policy !== null && policy !== void 0 ? policy : {}, CONST_1.default.POLICY.COLLECTION_KEYS.GENERAL_SETTINGS)} onClose={function () {
                    if (!(policy === null || policy === void 0 ? void 0 : policy.id)) {
                        return;
                    }
                    (0, Policy_1.clearPolicyErrorField)(policy.id, CONST_1.default.POLICY.COLLECTION_KEYS.GENERAL_SETTINGS);
                }} errorRowStyles={[styles.mt2]}>
                            <react_native_1.View>
                                <MenuItemWithTopDescription_1.default title={formattedCurrency} description={translate('workspace.editor.currencyInputLabel')} shouldShowRightIcon={hasVBA ? false : !readOnly} interactive={hasVBA ? false : !readOnly} wrapperStyle={styles.sectionMenuItemTopDescription} onPress={onPressCurrency} hintText={hasVBA ? translate('workspace.editor.currencyInputDisabledText', { currency: policyCurrency }) : translate('workspace.editor.currencyInputHelpText')}/>
                            </react_native_1.View>
                        </OfflineWithFeedback_1.default>
                        {shouldShowAddress && (<OfflineWithFeedback_1.default pendingAction={(_l = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _l === void 0 ? void 0 : _l.address}>
                                <react_native_1.View>
                                    <MenuItemWithTopDescription_1.default title={formattedAddress} description={translate('common.companyAddress')} shouldShowRightIcon={!readOnly} interactive={!readOnly} wrapperStyle={styles.sectionMenuItemTopDescription} onPress={onPressAddress} copyValue={readOnly ? formattedAddress : undefined}/>
                                </react_native_1.View>
                            </OfflineWithFeedback_1.default>)}

                        {!readOnly && !!(policy === null || policy === void 0 ? void 0 : policy.type) && (<OfflineWithFeedback_1.default pendingAction={(_m = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _m === void 0 ? void 0 : _m.type}>
                                <react_native_1.View>
                                    <MenuItemWithTopDescription_1.default title={(0, PolicyUtils_1.getUserFriendlyWorkspaceType)(policy.type)} description={translate('workspace.common.planType')} shouldShowRightIcon wrapperStyle={styles.sectionMenuItemTopDescription} onPress={onPressPlanType}/>
                                </react_native_1.View>
                            </OfflineWithFeedback_1.default>)}
                        {!readOnly && (<react_native_1.View style={[styles.flexRow, styles.mt6, styles.mnw120]}>
                                {isPolicyAdmin && (<Button_1.default accessibilityLabel={translate('common.invite')} text={translate('common.invite')} onPress={function () {
                            if (isAccountLocked) {
                                showLockedAccountModal();
                                return;
                            }
                            (0, Member_1.clearInviteDraft)(route.params.policyID);
                            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_INVITE.getRoute(route.params.policyID, Navigation_1.default.getActiveRouteWithoutParams()));
                        }} icon={Expensicons_1.UserPlus} style={[styles.mr2]}/>)}
                                <Button_1.default accessibilityLabel={translate('common.share')} text={translate('common.share')} onPress={isAccountLocked ? showLockedAccountModal : onPressShare} icon={Expensicons_1.QrCode}/>
                                {isOwner && (<Button_1.default accessibilityLabel={translate('common.delete')} text={translate('common.delete')} style={[styles.ml2]} onPress={onDeleteWorkspace} icon={Expensicons_1.Trashcan} isLoading={isLoadingBill} iconStyles={isLoadingBill ? styles.opacity0 : undefined}/>)}
                            </react_native_1.View>)}
                    </Section_1.default>
                    <ConfirmModal_1.default title={translate('workspace.common.delete')} isVisible={isDeleteModalOpen} onConfirm={confirmDeleteAndHideModal} onCancel={function () { return setIsDeleteModalOpen(false); }} prompt={hasCardFeedOrExpensifyCard ? translate('workspace.common.deleteWithCardsConfirmation') : translate('workspace.common.deleteConfirmation')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
                </react_native_1.View>);
        }}
        </WorkspacePageWithSections_1.default>);
}
WorkspaceOverviewPage.displayName = 'WorkspaceOverviewPage';
exports.default = (0, withPolicy_1.default)(WorkspaceOverviewPage);
