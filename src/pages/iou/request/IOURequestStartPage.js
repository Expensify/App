"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Provider_1 = require("@components/DragAndDrop/Provider");
var FocusTrapContainerElement_1 = require("@components/FocusTrap/FocusTrapContainerElement");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ProductTrainingContext_1 = require("@components/ProductTrainingContext");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TabSelector_1 = require("@components/TabSelector/TabSelector");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var usePolicy_1 = require("@hooks/usePolicy");
var usePrevious_1 = require("@hooks/usePrevious");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Welcome_1 = require("@libs/actions/Welcome");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OnyxTabNavigator_1 = require("@libs/Navigation/OnyxTabNavigator");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var Performance_1 = require("@libs/Performance");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var IOU_1 = require("@userActions/IOU");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var IOURequestStepAmount_1 = require("./step/IOURequestStepAmount");
var IOURequestStepDestination_1 = require("./step/IOURequestStepDestination");
var IOURequestStepDistance_1 = require("./step/IOURequestStepDistance");
var IOURequestStepPerDiemWorkspace_1 = require("./step/IOURequestStepPerDiemWorkspace");
var IOURequestStepScan_1 = require("./step/IOURequestStepScan");
function IOURequestStartPage(_a) {
    var _b;
    var route = _a.route, _c = _a.route.params, iouType = _c.iouType, reportID = _c.reportID, navigation = _a.navigation, 
    // This is currently only being used for testing
    _d = _a.defaultSelectedTab, 
    // This is currently only being used for testing
    defaultSelectedTab = _d === void 0 ? CONST_1.default.TAB_REQUEST.SCAN : _d;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseTab = iouType !== CONST_1.default.IOU.TYPE.SEND && iouType !== CONST_1.default.IOU.TYPE.PAY && iouType !== CONST_1.default.IOU.TYPE.INVOICE;
    var _e = (0, react_1.useState)(false), isDraggingOver = _e[0], setIsDraggingOver = _e[1];
    var report = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID), { canBeMissing: true })[0];
    var policy = (0, usePolicy_1.default)(report === null || report === void 0 ? void 0 : report.policyID);
    var _f = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SELECTED_TAB).concat(CONST_1.default.TAB.IOU_REQUEST_TYPE), { canBeMissing: true }), selectedTab = _f[0], selectedTabResult = _f[1];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var isLoadingSelectedTab = shouldUseTab ? (0, isLoadingOnyxValue_1.default)(selectedTabResult) : false;
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT).concat(route === null || route === void 0 ? void 0 : route.params.transactionID), { canBeMissing: true })[0];
    var allPolicies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: false })[0];
    var optimisticTransactions = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT, {
        selector: function (items) { return Object.values(items !== null && items !== void 0 ? items : {}); },
        canBeMissing: true,
    })[0];
    var _g = (0, react_1.useState)((optimisticTransactions !== null && optimisticTransactions !== void 0 ? optimisticTransactions : []).length > 1), isMultiScanEnabled = _g[0], setIsMultiScanEnabled = _g[1];
    var tabTitles = (_b = {},
        _b[CONST_1.default.IOU.TYPE.REQUEST] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.SUBMIT] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.SEND] = translate('iou.paySomeone', { name: (0, ReportUtils_1.getPayeeName)(report) }),
        _b[CONST_1.default.IOU.TYPE.PAY] = translate('iou.paySomeone', { name: (0, ReportUtils_1.getPayeeName)(report) }),
        _b[CONST_1.default.IOU.TYPE.SPLIT] = translate('iou.splitExpense'),
        _b[CONST_1.default.IOU.TYPE.SPLIT_EXPENSE] = translate('iou.splitExpense'),
        _b[CONST_1.default.IOU.TYPE.TRACK] = translate('iou.createExpense'),
        _b[CONST_1.default.IOU.TYPE.INVOICE] = translate('workspace.invoices.sendInvoice'),
        _b[CONST_1.default.IOU.TYPE.CREATE] = translate('iou.createExpense'),
        _b);
    var isFromGlobalCreate = (0, EmptyObject_1.isEmptyObject)(report === null || report === void 0 ? void 0 : report.reportID);
    var perDiemCustomUnits = (0, PolicyUtils_1.getPerDiemCustomUnits)(allPolicies, session === null || session === void 0 ? void 0 : session.email);
    var doesPerDiemPolicyExist = perDiemCustomUnits.length > 0;
    var moreThanOnePerDiemExist = perDiemCustomUnits.length > 1;
    var currentPolicyPerDiemUnit = (0, PolicyUtils_1.getPerDiemCustomUnit)(policy);
    var doesCurrentPolicyPerDiemExist = !(0, EmptyObject_1.isEmptyObject)(currentPolicyPerDiemUnit) && !!currentPolicyPerDiemUnit.enabled;
    var shouldShowPerDiemOption = iouType !== CONST_1.default.IOU.TYPE.SPLIT && iouType !== CONST_1.default.IOU.TYPE.TRACK && ((!isFromGlobalCreate && doesCurrentPolicyPerDiemExist) || (isFromGlobalCreate && doesPerDiemPolicyExist));
    var transactionRequestType = (0, react_1.useMemo)(function () {
        if (!(transaction === null || transaction === void 0 ? void 0 : transaction.iouRequestType)) {
            if (shouldUseTab) {
                if (selectedTab === CONST_1.default.TAB_REQUEST.PER_DIEM && !shouldShowPerDiemOption) {
                    return undefined;
                }
                return selectedTab;
            }
            return CONST_1.default.IOU.REQUEST_TYPE.MANUAL;
        }
        return transaction.iouRequestType;
    }, [transaction === null || transaction === void 0 ? void 0 : transaction.iouRequestType, shouldUseTab, selectedTab, shouldShowPerDiemOption]);
    var prevTransactionReportID = (0, usePrevious_1.default)(transaction === null || transaction === void 0 ? void 0 : transaction.reportID);
    (0, react_1.useEffect)(function () {
        Performance_1.default.markEnd(CONST_1.default.TIMING.OPEN_CREATE_EXPENSE);
    }, []);
    var navigateBack = function () {
        Navigation_1.default.closeRHPFlow();
    };
    var resetIOUTypeIfChanged = (0, react_1.useCallback)(function (newIOUType) {
        if ((transaction === null || transaction === void 0 ? void 0 : transaction.iouRequestType) === newIOUType) {
            return;
        }
        setIsMultiScanEnabled(false);
        (0, IOU_1.initMoneyRequest)({
            reportID: reportID,
            policy: policy,
            isFromGlobalCreate: isFromGlobalCreate,
            currentIouRequestType: transaction === null || transaction === void 0 ? void 0 : transaction.iouRequestType,
            newIouRequestType: newIOUType,
        });
    }, [policy, reportID, isFromGlobalCreate, transaction]);
    // Clear out the temporary expense if the reportID in the URL has changed from the transaction's reportID.
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        // The test transaction can change the reportID of the transaction on the flow so we should prevent the reportID from being reverted again.
        if ((transaction === null || transaction === void 0 ? void 0 : transaction.reportID) === reportID || isLoadingSelectedTab || !transactionRequestType || prevTransactionReportID !== (transaction === null || transaction === void 0 ? void 0 : transaction.reportID)) {
            return;
        }
        resetIOUTypeIfChanged(transactionRequestType);
    }, [transaction === null || transaction === void 0 ? void 0 : transaction.reportID, reportID, resetIOUTypeIfChanged, transactionRequestType, isLoadingSelectedTab, prevTransactionReportID]));
    var _h = (0, react_1.useState)(null), headerWithBackBtnContainerElement = _h[0], setHeaderWithBackButtonContainerElement = _h[1];
    var _j = (0, react_1.useState)(null), tabBarContainerElement = _j[0], setTabBarContainerElement = _j[1];
    var _k = (0, react_1.useState)(null), activeTabContainerElement = _k[0], setActiveTabContainerElement = _k[1];
    var focusTrapContainerElements = (0, react_1.useMemo)(function () {
        return [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement].filter(function (element) { return !!element; });
    }, [headerWithBackBtnContainerElement, tabBarContainerElement, activeTabContainerElement]);
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var manualDistanceTrackingEnabled = isBetaEnabled(CONST_1.default.BETAS.MANUAL_DISTANCE);
    var setTestReceiptAndNavigateRef = (0, react_1.useRef)(function () { });
    var _l = (0, ProductTrainingContext_1.useProductTrainingContext)(CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP, !(0, OptionsListUtils_1.getIsUserSubmittedExpenseOrScannedReceipt)() && isBetaEnabled(CONST_1.default.BETAS.NEWDOT_MANAGER_MCTEST) && selectedTab === CONST_1.default.TAB_REQUEST.SCAN, {
        onConfirm: function () {
            var _a;
            (_a = setTestReceiptAndNavigateRef === null || setTestReceiptAndNavigateRef === void 0 ? void 0 : setTestReceiptAndNavigateRef.current) === null || _a === void 0 ? void 0 : _a.call(setTestReceiptAndNavigateRef);
        },
        onDismiss: function () {
            (0, Welcome_1.dismissProductTraining)(CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP, true);
        },
    }), shouldShowProductTrainingTooltip = _l.shouldShowProductTrainingTooltip, renderProductTrainingTooltip = _l.renderProductTrainingTooltip;
    return (<AccessOrNotFoundWrapper_1.default reportID={reportID} iouType={iouType} policyID={policy === null || policy === void 0 ? void 0 : policy.id} accessVariants={[CONST_1.default.IOU.ACCESS_VARIANTS.CREATE]} allPolicies={allPolicies}>
            <ScreenWrapper_1.default shouldEnableKeyboardAvoidingView={false} shouldEnableMinHeight={(0, DeviceCapabilities_1.canUseTouchScreen)()} headerGapStyles={isDraggingOver ? [isBetaEnabled(CONST_1.default.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP) ? styles.dropWrapper : styles.receiptDropHeaderGap] : []} testID={IOURequestStartPage.displayName} focusTrapSettings={{ containerElements: focusTrapContainerElements }}>
                <Provider_1.default setIsDraggingOver={setIsDraggingOver} isDisabled={selectedTab !== CONST_1.default.TAB_REQUEST.SCAN}>
                    <react_native_1.View style={styles.flex1}>
                        <FocusTrapContainerElement_1.default onContainerElementChanged={setHeaderWithBackButtonContainerElement} style={[styles.w100]}>
                            <HeaderWithBackButton_1.default title={tabTitles[iouType]} onBackButtonPress={navigateBack}/>
                        </FocusTrapContainerElement_1.default>

                        {shouldUseTab ? (<OnyxTabNavigator_1.default id={CONST_1.default.TAB.IOU_REQUEST_TYPE} defaultSelectedTab={defaultSelectedTab} onTabSelected={resetIOUTypeIfChanged} tabBar={TabSelector_1.default} onTabBarFocusTrapContainerElementChanged={setTabBarContainerElement} onActiveTabFocusTrapContainerElementChanged={setActiveTabContainerElement} shouldShowLabelWhenInactive={!shouldShowPerDiemOption} shouldShowProductTrainingTooltip={shouldShowProductTrainingTooltip} renderProductTrainingTooltip={renderProductTrainingTooltip} lazyLoadEnabled disableSwipe={isMultiScanEnabled && selectedTab === CONST_1.default.TAB_REQUEST.SCAN}>
                                <OnyxTabNavigator_1.TopTab.Screen name={CONST_1.default.TAB_REQUEST.MANUAL}>
                                    {function () { return (<OnyxTabNavigator_1.TabScreenWithFocusTrapWrapper>
                                            <IOURequestStepAmount_1.default shouldKeepUserInput route={route} navigation={navigation}/>
                                        </OnyxTabNavigator_1.TabScreenWithFocusTrapWrapper>); }}
                                </OnyxTabNavigator_1.TopTab.Screen>
                                <OnyxTabNavigator_1.TopTab.Screen name={CONST_1.default.TAB_REQUEST.SCAN}>
                                    {function () { return (<OnyxTabNavigator_1.TabScreenWithFocusTrapWrapper>
                                            <IOURequestStepScan_1.default route={route} navigation={navigation} onLayout={function (setTestReceiptAndNavigate) {
                    setTestReceiptAndNavigateRef.current = setTestReceiptAndNavigate;
                }} isMultiScanEnabled={isMultiScanEnabled} setIsMultiScanEnabled={setIsMultiScanEnabled}/>
                                        </OnyxTabNavigator_1.TabScreenWithFocusTrapWrapper>); }}
                                </OnyxTabNavigator_1.TopTab.Screen>
                                {!manualDistanceTrackingEnabled && (<OnyxTabNavigator_1.TopTab.Screen name={CONST_1.default.TAB_REQUEST.DISTANCE}>
                                        {function () { return (<OnyxTabNavigator_1.TabScreenWithFocusTrapWrapper>
                                                <IOURequestStepDistance_1.default route={route} navigation={navigation}/>
                                            </OnyxTabNavigator_1.TabScreenWithFocusTrapWrapper>); }}
                                    </OnyxTabNavigator_1.TopTab.Screen>)}
                                {!!shouldShowPerDiemOption && (<OnyxTabNavigator_1.TopTab.Screen name={CONST_1.default.TAB_REQUEST.PER_DIEM}>
                                        {function () {
                    var _a;
                    return (<OnyxTabNavigator_1.TabScreenWithFocusTrapWrapper>
                                                {moreThanOnePerDiemExist && !doesCurrentPolicyPerDiemExist ? (<IOURequestStepPerDiemWorkspace_1.default route={route} navigation={navigation}/>) : (<IOURequestStepDestination_1.default openedFromStartPage explicitPolicyID={moreThanOnePerDiemExist ? undefined : (_a = perDiemCustomUnits.at(0)) === null || _a === void 0 ? void 0 : _a.policyID} route={route} navigation={navigation}/>)}
                                            </OnyxTabNavigator_1.TabScreenWithFocusTrapWrapper>);
                }}
                                    </OnyxTabNavigator_1.TopTab.Screen>)}
                            </OnyxTabNavigator_1.default>) : (<FocusTrapContainerElement_1.default onContainerElementChanged={setActiveTabContainerElement} style={[styles.flexColumn, styles.flex1]}>
                                <IOURequestStepAmount_1.default route={route} navigation={navigation} shouldKeepUserInput/>
                            </FocusTrapContainerElement_1.default>)}
                    </react_native_1.View>
                </Provider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
IOURequestStartPage.displayName = 'IOURequestStartPage';
exports.default = IOURequestStartPage;
