"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ApprovalWorkflowSection_1 = require("@components/ApprovalWorkflowSection");
var ConfirmModal_1 = require("@components/ConfirmModal");
var BankIcons_1 = require("@components/Icon/BankIcons");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Illustrations_1 = require("@components/Icon/Illustrations");
var LockedAccountModalProvider_1 = require("@components/LockedAccountModalProvider");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var Workflow_1 = require("@libs/actions/Workflow");
var CardUtils_1 = require("@libs/CardUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PaymentUtils_1 = require("@libs/PaymentUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var WorkflowUtils_1 = require("@libs/WorkflowUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicy_1 = require("@pages/workspace/withPolicy");
var WorkspacePageWithSections_1 = require("@pages/workspace/WorkspacePageWithSections");
var ReimbursementAccount_1 = require("@userActions/ReimbursementAccount");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var ToggleSettingsOptionRow_1 = require("./ToggleSettingsOptionRow");
var WorkspaceAutoReportingFrequencyPage_1 = require("./WorkspaceAutoReportingFrequencyPage");
function WorkspaceWorkflowsPage(_a) {
    var _b, _c, _d, _e;
    var policy = _a.policy, route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply a correct padding style
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _f = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _f.shouldUseNarrowLayout, isSmallScreenWidth = _f.isSmallScreenWidth;
    var workspaceAccountID = (_b = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var cardFeeds = (0, useCardFeeds_1.default)(policy === null || policy === void 0 ? void 0 : policy.id)[0];
    var cardList = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST), { canBeMissing: false })[0];
    var workspaceCards = (0, CardUtils_1.getAllCardsForWorkspace)(workspaceAccountID, cardList, cardFeeds);
    var isSmartLimitEnabled = (0, CardUtils_1.isSmartLimitEnabled)(workspaceCards);
    var policyApproverEmail = policy === null || policy === void 0 ? void 0 : policy.approver;
    var _g = (0, react_1.useState)(false), isUpdateWorkspaceCurrencyModalOpen = _g[0], setIsUpdateWorkspaceCurrencyModalOpen = _g[1];
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var _h = (0, react_1.useMemo)(function () {
        var _a, _b;
        return (0, WorkflowUtils_1.convertPolicyEmployeesToApprovalWorkflows)({
            employees: (_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) !== null && _a !== void 0 ? _a : {},
            defaultApprover: (_b = policyApproverEmail !== null && policyApproverEmail !== void 0 ? policyApproverEmail : policy === null || policy === void 0 ? void 0 : policy.owner) !== null && _b !== void 0 ? _b : '',
            personalDetails: personalDetails !== null && personalDetails !== void 0 ? personalDetails : {},
        });
    }, [personalDetails, policy === null || policy === void 0 ? void 0 : policy.employeeList, policy === null || policy === void 0 ? void 0 : policy.owner, policyApproverEmail]), approvalWorkflows = _h.approvalWorkflows, availableMembers = _h.availableMembers, usedApproverEmails = _h.usedApproverEmails;
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var isAdvanceApproval = approvalWorkflows.length > 1 || ((_d = (_c = approvalWorkflows === null || approvalWorkflows === void 0 ? void 0 : approvalWorkflows.at(0)) === null || _c === void 0 ? void 0 : _c.approvers) !== null && _d !== void 0 ? _d : []).length > 1;
    var updateApprovalMode = isAdvanceApproval ? CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED : CONST_1.default.POLICY.APPROVAL_MODE.BASIC;
    var displayNameForAuthorizedPayer = (0, react_1.useMemo)(function () { var _a, _b, _c, _d, _e; return (_d = (_c = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _a === void 0 ? void 0 : _a.reimburser) !== null && _b !== void 0 ? _b : '')) === null || _c === void 0 ? void 0 : _c.displayName) !== null && _d !== void 0 ? _d : (_e = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _e === void 0 ? void 0 : _e.reimburser; }, [(_e = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _e === void 0 ? void 0 : _e.reimburser]);
    var onPressAutoReportingFrequency = (0, react_1.useCallback)(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute(route.params.policyID)); }, [route.params.policyID]);
    var fetchData = (0, react_1.useCallback)(function () {
        (0, Policy_1.openPolicyWorkflowsPage)(route.params.policyID);
    }, [route.params.policyID]);
    var confirmCurrencyChangeAndHideModal = (0, react_1.useCallback)(function () {
        if (!policy) {
            return;
        }
        setIsUpdateWorkspaceCurrencyModalOpen(false);
        if (isBetaEnabled(CONST_1.default.BETAS.GLOBAL_REIMBURSEMENTS_ON_ND)) {
            (0, Policy_1.setIsForcedToChangeCurrency)(true);
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policy.id));
        }
        else {
            (0, Policy_1.updateGeneralSettings)(policy.id, policy.name, CONST_1.default.CURRENCY.USD);
            (0, ReimbursementAccount_1.navigateToBankAccountRoute)(route.params.policyID, ROUTES_1.default.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID));
        }
    }, [isBetaEnabled, policy, route.params.policyID]);
    var isOffline = (0, useNetwork_1.default)({ onReconnect: fetchData }).isOffline;
    var isPolicyAdmin = (0, PolicyUtils_1.isPolicyAdmin)(policy);
    var _j = (0, react_1.useContext)(LockedAccountModalProvider_1.LockedAccountContext), isAccountLocked = _j.isAccountLocked, showLockedAccountModal = _j.showLockedAccountModal;
    (0, react_1.useEffect)(function () {
        react_native_1.InteractionManager.runAfterInteractions(function () {
            fetchData();
        });
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // User should be allowed to add new Approval Workflow only if he's upgraded to Control Plan, otherwise redirected to the Upgrade Page
    var addApprovalAction = (0, react_1.useCallback)(function () {
        (0, Workflow_1.setApprovalWorkflow)(__assign(__assign({}, WorkflowUtils_1.INITIAL_APPROVAL_WORKFLOW), { availableMembers: availableMembers, usedApproverEmails: usedApproverEmails }));
        if (!(0, PolicyUtils_1.isControlPolicy)(policy)) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(route.params.policyID, CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.approvals.alias, ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(route.params.policyID)));
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(route.params.policyID));
    }, [policy, route.params.policyID, availableMembers, usedApproverEmails]);
    var optionItems = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
        var _x = (_a = policy === null || policy === void 0 ? void 0 : policy.achAccount) !== null && _a !== void 0 ? _a : {}, addressName = _x.addressName, bankName = _x.bankName, bankAccountID = _x.bankAccountID;
        var shouldShowBankAccount = !!bankAccountID && (policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) === CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;
        var bankIcon = (0, BankIcons_1.default)({ bankName: bankName, isCard: false, styles: styles });
        var hasReimburserError = !!((_b = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _b === void 0 ? void 0 : _b.reimburser);
        var hasApprovalError = !!((_c = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _c === void 0 ? void 0 : _c.approvalMode);
        var hasDelayedSubmissionError = !!((_e = (_d = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _d === void 0 ? void 0 : _d.autoReporting) !== null && _e !== void 0 ? _e : (_f = policy === null || policy === void 0 ? void 0 : policy.errorFields) === null || _f === void 0 ? void 0 : _f.autoReportingFrequency);
        return [
            {
                title: translate('workflowsPage.delaySubmissionTitle'),
                subtitle: translate('workflowsPage.delaySubmissionDescription'),
                switchAccessibilityLabel: translate('workflowsPage.delaySubmissionDescription'),
                onToggle: function (isEnabled) {
                    (0, Policy_1.setWorkspaceAutoReportingFrequency)(route.params.policyID, isEnabled ? CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY : CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
                },
                subMenuItems: (<MenuItemWithTopDescription_1.default title={(0, WorkspaceAutoReportingFrequencyPage_1.getAutoReportingFrequencyDisplayNames)(translate)[(_g = (0, PolicyUtils_1.getCorrectedAutoReportingFrequency)(policy)) !== null && _g !== void 0 ? _g : CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY]} titleStyle={styles.textNormalThemeText} descriptionTextStyle={styles.textLabelSupportingNormal} onPress={onPressAutoReportingFrequency} 
                // Instant submit is the equivalent of delayed submissions being turned off, so we show the feature as disabled if the frequency is instant
                description={translate('workflowsPage.submissionFrequency')} shouldShowRightIcon wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3]} brickRoadIndicator={hasDelayedSubmissionError ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>),
                isActive: (_h = ((policy === null || policy === void 0 ? void 0 : policy.autoReportingFrequency) !== CONST_1.default.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT && !hasDelayedSubmissionError)) !== null && _h !== void 0 ? _h : false,
                pendingAction: (_k = (_j = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _j === void 0 ? void 0 : _j.autoReporting) !== null && _k !== void 0 ? _k : (_l = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _l === void 0 ? void 0 : _l.autoReportingFrequency,
                errors: (0, ErrorUtils_1.getLatestErrorField)(policy !== null && policy !== void 0 ? policy : {}, CONST_1.default.POLICY.COLLECTION_KEYS.AUTOREPORTING),
                onCloseError: function () { return (0, Policy_1.clearPolicyErrorField)(route.params.policyID, CONST_1.default.POLICY.COLLECTION_KEYS.AUTOREPORTING); },
            },
            {
                title: translate('workflowsPage.addApprovalsTitle'),
                subtitle: isSmartLimitEnabled ? translate('workspace.moreFeatures.workflows.disableApprovalPrompt') : translate('workflowsPage.addApprovalsDescription'),
                switchAccessibilityLabel: isSmartLimitEnabled ? translate('workspace.moreFeatures.workflows.disableApprovalPrompt') : translate('workflowsPage.addApprovalsDescription'),
                onToggle: function (isEnabled) {
                    var _a;
                    (0, Policy_1.setWorkspaceApprovalMode)(route.params.policyID, (_a = policy === null || policy === void 0 ? void 0 : policy.owner) !== null && _a !== void 0 ? _a : '', isEnabled ? updateApprovalMode : CONST_1.default.POLICY.APPROVAL_MODE.OPTIONAL);
                },
                subMenuItems: (<>
                        {approvalWorkflows.map(function (workflow, index) { return (<OfflineWithFeedback_1.default 
                    // eslint-disable-next-line react/no-array-index-key
                    key={"workflow-".concat(index)} pendingAction={workflow.pendingAction}>
                                <ApprovalWorkflowSection_1.default approvalWorkflow={workflow} onPress={function () { var _a, _b; return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(route.params.policyID, (_b = (_a = workflow.approvers.at(0)) === null || _a === void 0 ? void 0 : _a.email) !== null && _b !== void 0 ? _b : '')); }}/>
                            </OfflineWithFeedback_1.default>); })}
                        <MenuItem_1.default title={translate('workflowsPage.addApprovalButton')} titleStyle={styles.textStrong} icon={Expensicons_1.Plus} iconHeight={20} iconWidth={20} style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]} onPress={addApprovalAction}/>
                    </>),
                disabled: isSmartLimitEnabled,
                isActive: (_m = ([CONST_1.default.POLICY.APPROVAL_MODE.BASIC, CONST_1.default.POLICY.APPROVAL_MODE.ADVANCED].some(function (approvalMode) { return approvalMode === (policy === null || policy === void 0 ? void 0 : policy.approvalMode); }) && !hasApprovalError)) !== null && _m !== void 0 ? _m : false,
                pendingAction: (_o = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _o === void 0 ? void 0 : _o.approvalMode,
                errors: (0, ErrorUtils_1.getLatestErrorField)(policy !== null && policy !== void 0 ? policy : {}, CONST_1.default.POLICY.COLLECTION_KEYS.APPROVAL_MODE),
                onCloseError: function () { return (0, Policy_1.clearPolicyErrorField)(route.params.policyID, CONST_1.default.POLICY.COLLECTION_KEYS.APPROVAL_MODE); },
            },
            {
                title: translate('workflowsPage.makeOrTrackPaymentsTitle'),
                subtitle: translate('workflowsPage.makeOrTrackPaymentsDescription'),
                switchAccessibilityLabel: translate('workflowsPage.makeOrTrackPaymentsDescription'),
                onToggle: function (isEnabled) {
                    var _a, _b, _c;
                    var newReimbursementChoice;
                    if (!isEnabled) {
                        newReimbursementChoice = CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
                    }
                    else if (!!(policy === null || policy === void 0 ? void 0 : policy.achAccount) && !(0, Policy_1.isCurrencySupportedForDirectReimbursement)(((_a = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _a !== void 0 ? _a : ''))) {
                        newReimbursementChoice = CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL;
                    }
                    else {
                        newReimbursementChoice = CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;
                    }
                    var newReimburserEmail = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.achAccount) === null || _b === void 0 ? void 0 : _b.reimburser) !== null && _c !== void 0 ? _c : policy === null || policy === void 0 ? void 0 : policy.owner;
                    (0, Policy_1.setWorkspaceReimbursement)(route.params.policyID, newReimbursementChoice, newReimburserEmail !== null && newReimburserEmail !== void 0 ? newReimburserEmail : '');
                },
                subMenuItems: !isOffline && (policy === null || policy === void 0 ? void 0 : policy.isLoadingWorkspaceReimbursement) === true ? (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} color={theme.spinner} style={styles.mt7}/>) : (<>
                            {shouldShowBankAccount && (<react_native_1.View style={[styles.sectionMenuItemTopDescription, styles.mt5, styles.pb1, styles.pt1]}>
                                    <Text_1.default style={[styles.textLabelSupportingNormal, styles.colorMuted]}>{translate('workflowsPayerPage.paymentAccount')}</Text_1.default>
                                </react_native_1.View>)}
                            <MenuItem_1.default title={shouldShowBankAccount ? addressName : translate('workflowsPage.connectBankAccount')} titleStyle={shouldShowBankAccount ? undefined : styles.textLabelSupportingEmptyValue} description={(0, PaymentUtils_1.getPaymentMethodDescription)(CONST_1.default.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT, (_p = policy === null || policy === void 0 ? void 0 : policy.achAccount) !== null && _p !== void 0 ? _p : {})} onPress={function () {
                        var _a, _b;
                        if (isAccountLocked) {
                            showLockedAccountModal();
                            return;
                        }
                        if (!(0, Policy_1.isCurrencySupportedForGlobalReimbursement)(((_a = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _a !== void 0 ? _a : ''), (_b = isBetaEnabled(CONST_1.default.BETAS.GLOBAL_REIMBURSEMENTS_ON_ND)) !== null && _b !== void 0 ? _b : false)) {
                            setIsUpdateWorkspaceCurrencyModalOpen(true);
                            return;
                        }
                        (0, ReimbursementAccount_1.navigateToBankAccountRoute)(route.params.policyID, ROUTES_1.default.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID));
                    }} icon={shouldShowBankAccount ? bankIcon.icon : undefined} iconHeight={(_q = bankIcon.iconHeight) !== null && _q !== void 0 ? _q : bankIcon.iconSize} iconWidth={(_r = bankIcon.iconWidth) !== null && _r !== void 0 ? _r : bankIcon.iconSize} iconStyles={bankIcon.iconStyles} disabled={isOffline || !isPolicyAdmin} shouldGreyOutWhenDisabled={!((_s = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _s === void 0 ? void 0 : _s.reimbursementChoice)} shouldShowRightIcon={!isOffline && isPolicyAdmin} wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3]} displayInDefaultIconColor brickRoadIndicator={hasReimburserError ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                            {shouldShowBankAccount && (<OfflineWithFeedback_1.default pendingAction={(_t = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _t === void 0 ? void 0 : _t.reimburser} shouldDisableOpacity={isOffline && !!((_u = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _u === void 0 ? void 0 : _u.reimbursementChoice) && !!((_v = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _v === void 0 ? void 0 : _v.reimburser)} errors={(0, ErrorUtils_1.getLatestErrorField)(policy !== null && policy !== void 0 ? policy : {}, CONST_1.default.POLICY.COLLECTION_KEYS.REIMBURSER)} onClose={function () { return (0, Policy_1.clearPolicyErrorField)(policy === null || policy === void 0 ? void 0 : policy.id, CONST_1.default.POLICY.COLLECTION_KEYS.REIMBURSER); }} errorRowStyles={[styles.ml7]}>
                                    <MenuItemWithTopDescription_1.default title={displayNameForAuthorizedPayer !== null && displayNameForAuthorizedPayer !== void 0 ? displayNameForAuthorizedPayer : ''} titleStyle={styles.textNormalThemeText} descriptionTextStyle={styles.textLabelSupportingNormal} description={translate('workflowsPayerPage.payer')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_WORKFLOWS_PAYER.getRoute(route.params.policyID)); }} shouldShowRightIcon wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3]} brickRoadIndicator={hasReimburserError ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}/>
                                </OfflineWithFeedback_1.default>)}
                        </>),
                isEndOptionRow: true,
                isActive: (policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) !== CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
                pendingAction: (_w = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _w === void 0 ? void 0 : _w.reimbursementChoice,
                errors: (0, ErrorUtils_1.getLatestErrorField)(policy !== null && policy !== void 0 ? policy : {}, CONST_1.default.POLICY.COLLECTION_KEYS.REIMBURSEMENT_CHOICE),
                onCloseError: function () { return (0, Policy_1.clearPolicyErrorField)(route.params.policyID, CONST_1.default.POLICY.COLLECTION_KEYS.REIMBURSEMENT_CHOICE); },
            },
        ];
    }, [
        policy,
        styles,
        translate,
        onPressAutoReportingFrequency,
        isSmartLimitEnabled,
        approvalWorkflows,
        addApprovalAction,
        isOffline,
        theme.spinner,
        isPolicyAdmin,
        displayNameForAuthorizedPayer,
        route.params.policyID,
        updateApprovalMode,
        isBetaEnabled,
        isAccountLocked,
        showLockedAccountModal,
    ]);
    var renderOptionItem = function (item, index) { return (<Section_1.default containerStyles={isSmallScreenWidth ? styles.p5 : styles.p8} key={"toggleSettingOptionItem-".concat(index)} renderTitle={function () { return <react_native_1.View />; }}>
            <ToggleSettingsOptionRow_1.default title={item.title} titleStyle={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, styles.mb1]} subtitle={item.subtitle} subtitleStyle={[styles.textLabelSupportingEmptyValue, styles.lh20]} switchAccessibilityLabel={item.switchAccessibilityLabel} onToggle={item.onToggle} subMenuItems={item.subMenuItems} isActive={item.isActive} pendingAction={item.pendingAction} errors={item.errors} onCloseError={item.onCloseError} disabled={item.disabled}/>
        </Section_1.default>); };
    var updateWorkspaceCurrencyPrompt = (<Text_1.default>
            {translate('workspace.bankAccount.yourWorkspace')}{' '}
            <TextLink_1.default href={CONST_1.default.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}>{translate('workspace.bankAccount.listOfSupportedCurrencies')}</TextLink_1.default>.
        </Text_1.default>);
    var isPaidGroupPolicy = (0, PolicyUtils_1.isPaidGroupPolicy)(policy);
    var isLoading = !!((policy === null || policy === void 0 ? void 0 : policy.isLoading) && (policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) === undefined);
    return (<AccessOrNotFoundWrapper_1.default policyID={route.params.policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}>
            <WorkspacePageWithSections_1.default headerText={translate('workspace.common.workflows')} icon={Illustrations_1.Workflows} route={route} shouldShowOfflineIndicatorInWideScreen shouldShowNotFoundPage={!isPaidGroupPolicy || !isPolicyAdmin} isLoading={isLoading} shouldShowLoading={isLoading} shouldUseScrollView addBottomSafeAreaPadding>
                <react_native_1.View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    {optionItems.map(renderOptionItem)}
                    {isBetaEnabled(CONST_1.default.BETAS.GLOBAL_REIMBURSEMENTS_ON_ND) ? (<ConfirmModal_1.default title={translate('workspace.bankAccount.workspaceCurrencyNotSupported')} isVisible={isUpdateWorkspaceCurrencyModalOpen} onConfirm={confirmCurrencyChangeAndHideModal} onCancel={function () { return setIsUpdateWorkspaceCurrencyModalOpen(false); }} prompt={updateWorkspaceCurrencyPrompt} confirmText={translate('workspace.bankAccount.updateWorkspaceCurrency')} cancelText={translate('common.cancel')}/>) : (<ConfirmModal_1.default title={translate('workspace.bankAccount.workspaceCurrency')} isVisible={isUpdateWorkspaceCurrencyModalOpen} onConfirm={confirmCurrencyChangeAndHideModal} onCancel={function () { return setIsUpdateWorkspaceCurrencyModalOpen(false); }} prompt={translate('workspace.bankAccount.updateCurrencyPrompt')} confirmText={translate('workspace.bankAccount.updateToUSD')} cancelText={translate('common.cancel')} danger/>)}
                </react_native_1.View>
            </WorkspacePageWithSections_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceWorkflowsPage.displayName = 'WorkspaceWorkflowsPage';
exports.default = (0, withPolicy_1.default)(WorkspaceWorkflowsPage);
