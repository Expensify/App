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
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var ConfirmModal_1 = require("@components/ConfirmModal");
var DecisionModal_1 = require("@components/DecisionModal");
var Consumer_1 = require("@components/DragAndDrop/Consumer");
var Provider_1 = require("@components/DragAndDrop/Provider");
var DropZoneUI_1 = require("@components/DropZone/DropZoneUI");
var Expensicons = require("@components/Icon/Expensicons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Search_1 = require("@components/Search");
var SearchContext_1 = require("@components/Search/SearchContext");
var SearchFiltersBar_1 = require("@components/Search/SearchPageHeader/SearchFiltersBar");
var SearchPageHeader_1 = require("@components/Search/SearchPageHeader/SearchPageHeader");
var PlaybackContext_1 = require("@components/VideoPlayerContexts/PlaybackContext");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useFilesValidation_1 = require("@hooks/useFilesValidation");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var App_1 = require("@libs/actions/App");
var Report_1 = require("@libs/actions/Report");
var Search_2 = require("@libs/actions/Search");
var IOUUtils_1 = require("@libs/IOUUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var variables_1 = require("@styles/variables");
var IOU_1 = require("@userActions/IOU");
var TransactionEdit_1 = require("@userActions/TransactionEdit");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SearchPageNarrow_1 = require("./SearchPageNarrow");
function SearchPage(_a) {
    var _b, _c;
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply the correct modal type for the decision modal
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _d = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _d.shouldUseNarrowLayout, isSmallScreenWidth = _d.isSmallScreenWidth;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var _e = (0, SearchContext_1.useSearchContext)(), selectedTransactions = _e.selectedTransactions, clearSelectedTransactions = _e.clearSelectedTransactions, selectedReports = _e.selectedReports, lastSearchType = _e.lastSearchType, setLastSearchType = _e.setLastSearchType, isExportMode = _e.isExportMode, setExportMode = _e.setExportMode;
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var selectionMode = (0, useOnyx_1.default)(ONYXKEYS_1.default.MOBILE_SELECTION_MODE, { canBeMissing: true })[0];
    var _f = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_LAST_PAYMENT_METHOD, { canBeMissing: true })[0], lastPaymentMethods = _f === void 0 ? {} : _f;
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: false })[0];
    var activePolicy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(activePolicyID), { canBeMissing: true })[0];
    var _g = (0, react_1.useState)(false), isOfflineModalVisible = _g[0], setIsOfflineModalVisible = _g[1];
    var _h = (0, react_1.useState)(false), isDownloadErrorModalVisible = _h[0], setIsDownloadErrorModalVisible = _h[1];
    var _j = (0, react_1.useState)(false), isDeleteExpensesConfirmModalVisible = _j[0], setIsDeleteExpensesConfirmModalVisible = _j[1];
    var _k = (0, react_1.useState)(false), isDownloadExportModalVisible = _k[0], setIsDownloadExportModalVisible = _k[1];
    var q = route.params.q;
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var queryJSON = (0, react_1.useMemo)(function () { return (0, SearchQueryUtils_1.buildSearchQueryJSON)(q); }, [q]);
    // eslint-disable-next-line rulesdir/no-default-id-values
    var currentSearchResults = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat((_b = queryJSON === null || queryJSON === void 0 ? void 0 : queryJSON.hash) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID), { canBeMissing: true })[0];
    var _l = (0, react_1.useState)(undefined), lastNonEmptySearchResults = _l[0], setLastNonEmptySearchResults = _l[1];
    (0, react_1.useEffect)(function () {
        (0, App_1.confirmReadyToOpenApp)();
    }, []);
    (0, react_1.useEffect)(function () {
        var _a;
        if (!((_a = currentSearchResults === null || currentSearchResults === void 0 ? void 0 : currentSearchResults.search) === null || _a === void 0 ? void 0 : _a.type)) {
            return;
        }
        setLastSearchType(currentSearchResults.search.type);
        if (currentSearchResults.data) {
            setLastNonEmptySearchResults(currentSearchResults);
        }
    }, [lastSearchType, queryJSON, setLastSearchType, currentSearchResults]);
    var _m = queryJSON !== null && queryJSON !== void 0 ? queryJSON : {}, status = _m.status, hash = _m.hash;
    var selectedTransactionsKeys = Object.keys(selectedTransactions !== null && selectedTransactions !== void 0 ? selectedTransactions : {});
    var headerButtonsOptions = (0, react_1.useMemo)(function () {
        if (selectedTransactionsKeys.length === 0 || !status || !hash) {
            return [];
        }
        var options = [];
        var isAnyTransactionOnHold = Object.values(selectedTransactions).some(function (transaction) { return transaction.isHeld; });
        var downloadButtonOption = {
            icon: Expensicons.Download,
            text: translate('common.download'),
            value: CONST_1.default.SEARCH.BULK_ACTION_TYPES.EXPORT,
            shouldCloseModalOnSelect: true,
            onSelected: function () {
                var _a;
                if (isOffline) {
                    setIsOfflineModalVisible(true);
                    return;
                }
                if (isExportMode) {
                    setIsDownloadExportModalVisible(true);
                    return;
                }
                var reportIDList = (_a = selectedReports === null || selectedReports === void 0 ? void 0 : selectedReports.filter(function (report) { return !!report; }).map(function (report) { return report.reportID; })) !== null && _a !== void 0 ? _a : [];
                (0, Search_2.exportSearchItemsToCSV)({
                    query: status,
                    jsonQuery: JSON.stringify(queryJSON),
                    reportIDList: reportIDList,
                    transactionIDList: selectedTransactionsKeys,
                }, function () {
                    setIsDownloadErrorModalVisible(true);
                });
                clearSelectedTransactions();
            },
        };
        if (isExportMode) {
            return [downloadButtonOption];
        }
        var shouldShowApproveOption = !isOffline &&
            !isAnyTransactionOnHold &&
            (selectedReports.length
                ? selectedReports.every(function (report) { return report.action === CONST_1.default.SEARCH.ACTION_TYPES.APPROVE; })
                : selectedTransactionsKeys.every(function (id) { return selectedTransactions[id].action === CONST_1.default.SEARCH.ACTION_TYPES.APPROVE; }));
        if (shouldShowApproveOption) {
            options.push({
                icon: Expensicons.ThumbsUp,
                text: translate('search.bulkActions.approve'),
                value: CONST_1.default.SEARCH.BULK_ACTION_TYPES.APPROVE,
                shouldCloseModalOnSelect: true,
                onSelected: function () {
                    var _a;
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }
                    var transactionIDList = selectedReports.length ? undefined : Object.keys(selectedTransactions);
                    var reportIDList = !selectedReports.length
                        ? Object.values(selectedTransactions).map(function (transaction) { return transaction.reportID; })
                        : ((_a = selectedReports === null || selectedReports === void 0 ? void 0 : selectedReports.filter(function (report) { return !!report; }).map(function (report) { return report.reportID; })) !== null && _a !== void 0 ? _a : []);
                    (0, Search_2.approveMoneyRequestOnSearch)(hash, reportIDList, transactionIDList);
                    react_native_1.InteractionManager.runAfterInteractions(function () {
                        clearSelectedTransactions();
                    });
                },
            });
        }
        var shouldShowPayOption = !isOffline &&
            !isAnyTransactionOnHold &&
            (selectedReports.length
                ? selectedReports.every(function (report) { return report.action === CONST_1.default.SEARCH.ACTION_TYPES.PAY && report.policyID && (0, Search_2.getLastPolicyPaymentMethod)(report.policyID, lastPaymentMethods); })
                : selectedTransactionsKeys.every(function (id) {
                    return selectedTransactions[id].action === CONST_1.default.SEARCH.ACTION_TYPES.PAY &&
                        selectedTransactions[id].policyID &&
                        (0, Search_2.getLastPolicyPaymentMethod)(selectedTransactions[id].policyID, lastPaymentMethods);
                }));
        if (shouldShowPayOption) {
            options.push({
                icon: Expensicons.MoneyBag,
                text: translate('search.bulkActions.pay'),
                value: CONST_1.default.SEARCH.BULK_ACTION_TYPES.PAY,
                shouldCloseModalOnSelect: true,
                onSelected: function () {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }
                    var activeRoute = Navigation_1.default.getActiveRoute();
                    var transactionIDList = selectedReports.length ? undefined : Object.keys(selectedTransactions);
                    var items = selectedReports.length ? selectedReports : Object.values(selectedTransactions);
                    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
                        var item = items_1[_i];
                        var itemPolicyID = item.policyID;
                        var lastPolicyPaymentMethod = (0, Search_2.getLastPolicyPaymentMethod)(itemPolicyID, lastPaymentMethods);
                        if (!lastPolicyPaymentMethod) {
                            Navigation_1.default.navigate(ROUTES_1.default.SEARCH_REPORT.getRoute({
                                reportID: item.reportID,
                                backTo: activeRoute,
                            }));
                            return;
                        }
                        var hasPolicyVBBA = (0, PolicyUtils_1.hasVBBA)(itemPolicyID);
                        if (lastPolicyPaymentMethod !== CONST_1.default.IOU.PAYMENT_TYPE.ELSEWHERE && !hasPolicyVBBA) {
                            Navigation_1.default.navigate(ROUTES_1.default.SEARCH_REPORT.getRoute({
                                reportID: item.reportID,
                                backTo: activeRoute,
                            }));
                            return;
                        }
                    }
                    var paymentData = (selectedReports.length
                        ? selectedReports.map(function (report) { return ({
                            reportID: report.reportID,
                            amount: report.total,
                            paymentType: (0, Search_2.getLastPolicyPaymentMethod)(report.policyID, lastPaymentMethods),
                        }); })
                        : Object.values(selectedTransactions).map(function (transaction) { return ({
                            reportID: transaction.reportID,
                            amount: transaction.amount,
                            paymentType: (0, Search_2.getLastPolicyPaymentMethod)(transaction.policyID, lastPaymentMethods),
                        }); }));
                    (0, Search_2.payMoneyRequestOnSearch)(hash, paymentData, transactionIDList);
                    react_native_1.InteractionManager.runAfterInteractions(function () {
                        clearSelectedTransactions();
                    });
                },
            });
        }
        options.push(downloadButtonOption);
        var shouldShowHoldOption = !isOffline && selectedTransactionsKeys.every(function (id) { return selectedTransactions[id].canHold; });
        if (shouldShowHoldOption) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: translate('search.bulkActions.hold'),
                value: CONST_1.default.SEARCH.BULK_ACTION_TYPES.HOLD,
                shouldCloseModalOnSelect: true,
                onSelected: function () {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }
                    Navigation_1.default.navigate(ROUTES_1.default.TRANSACTION_HOLD_REASON_RHP);
                },
            });
        }
        var shouldShowUnholdOption = !isOffline && selectedTransactionsKeys.every(function (id) { return selectedTransactions[id].canUnhold; });
        if (shouldShowUnholdOption) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: translate('search.bulkActions.unhold'),
                value: CONST_1.default.SEARCH.BULK_ACTION_TYPES.UNHOLD,
                shouldCloseModalOnSelect: true,
                onSelected: function () {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }
                    (0, Search_2.unholdMoneyRequestOnSearch)(hash, selectedTransactionsKeys);
                    react_native_1.InteractionManager.runAfterInteractions(function () {
                        clearSelectedTransactions();
                    });
                },
            });
        }
        var canAllTransactionsBeMoved = selectedTransactionsKeys.every(function (id) { return selectedTransactions[id].canChangeReport; });
        if (canAllTransactionsBeMoved) {
            options.push({
                text: translate('iou.moveExpenses', { count: selectedTransactionsKeys.length }),
                icon: Expensicons.DocumentMerge,
                value: CONST_1.default.SEARCH.BULK_ACTION_TYPES.CHANGE_REPORT,
                shouldCloseModalOnSelect: true,
                onSelected: function () { return Navigation_1.default.navigate(ROUTES_1.default.MOVE_TRANSACTIONS_SEARCH_RHP); },
            });
        }
        var shouldShowDeleteOption = !isOffline && selectedTransactionsKeys.every(function (id) { return selectedTransactions[id].canDelete; });
        if (shouldShowDeleteOption) {
            options.push({
                icon: Expensicons.Trashcan,
                text: translate('search.bulkActions.delete'),
                value: CONST_1.default.SEARCH.BULK_ACTION_TYPES.DELETE,
                shouldCloseModalOnSelect: true,
                onSelected: function () {
                    if (isOffline) {
                        setIsOfflineModalVisible(true);
                        return;
                    }
                    setIsDeleteExpensesConfirmModalVisible(true);
                },
            });
        }
        if (options.length === 0) {
            var emptyOptionStyle = {
                interactive: false,
                iconFill: theme.icon,
                iconHeight: variables_1.default.iconSizeLarge,
                iconWidth: variables_1.default.iconSizeLarge,
                numberOfLinesTitle: 2,
                titleStyle: __assign(__assign(__assign({}, styles.colorMuted), styles.fontWeightNormal), styles.textWrap),
            };
            options.push(__assign({ icon: Expensicons.Exclamation, text: translate('search.bulkActions.noOptionsAvailable'), value: undefined }, emptyOptionStyle));
        }
        return options;
    }, [
        selectedTransactionsKeys,
        status,
        hash,
        selectedTransactions,
        translate,
        isExportMode,
        isOffline,
        selectedReports,
        queryJSON,
        clearSelectedTransactions,
        lastPaymentMethods,
        theme.icon,
        styles.colorMuted,
        styles.fontWeightNormal,
        styles.textWrap,
    ]);
    var handleDeleteExpenses = function () {
        if (selectedTransactionsKeys.length === 0 || !hash) {
            return;
        }
        setIsDeleteExpensesConfirmModalVisible(false);
        (0, Search_2.deleteMoneyRequestOnSearch)(hash, selectedTransactionsKeys);
        // Translations copy for delete modal depends on amount of selected items,
        // We need to wait for modal to fully disappear before clearing them to avoid translation flicker between singular vs plural
        react_native_1.InteractionManager.runAfterInteractions(function () {
            clearSelectedTransactions();
        });
    };
    var saveFileAndInitMoneyRequest = function (files) {
        var newReportID = (0, ReportUtils_1.generateReportID)();
        var initialTransaction = (0, IOU_1.initMoneyRequest)({
            isFromGlobalCreate: true,
            reportID: newReportID,
            newIouRequestType: CONST_1.default.IOU.REQUEST_TYPE.SCAN,
        });
        var newReceiptFiles = [];
        files.forEach(function (file, index) {
            var _a, _b;
            var source = URL.createObjectURL(file);
            var transaction = index === 0
                ? initialTransaction
                : (0, TransactionEdit_1.buildOptimisticTransactionAndCreateDraft)({
                    initialTransaction: initialTransaction,
                    currentUserPersonalDetails: currentUserPersonalDetails,
                    reportID: newReportID,
                });
            var transactionID = (_a = transaction.transactionID) !== null && _a !== void 0 ? _a : CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID;
            newReceiptFiles.push({
                file: file,
                source: source,
                transactionID: transactionID,
            });
            (0, IOU_1.setMoneyRequestReceipt)(transactionID, source, (_b = file.name) !== null && _b !== void 0 ? _b : '', true);
        });
        if ((0, PolicyUtils_1.isPaidGroupPolicy)(activePolicy) && (activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.isPolicyExpenseChatEnabled) && !(0, SubscriptionUtils_1.shouldRestrictUserBillableActions)(activePolicy.id)) {
            var activePolicyExpenseChat_1 = (0, ReportUtils_1.getPolicyExpenseChat)(currentUserPersonalDetails.accountID, activePolicy === null || activePolicy === void 0 ? void 0 : activePolicy.id);
            var setParticipantsPromises = newReceiptFiles.map(function (receiptFile) { return (0, IOU_1.setMoneyRequestParticipantsFromReport)(receiptFile.transactionID, activePolicyExpenseChat_1); });
            Promise.all(setParticipantsPromises).then(function () {
                var _a;
                return Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST_1.default.IOU.ACTION.CREATE, CONST_1.default.IOU.TYPE.SUBMIT, (_a = initialTransaction === null || initialTransaction === void 0 ? void 0 : initialTransaction.transactionID) !== null && _a !== void 0 ? _a : CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, activePolicyExpenseChat_1 === null || activePolicyExpenseChat_1 === void 0 ? void 0 : activePolicyExpenseChat_1.reportID));
            });
        }
        else {
            (0, IOUUtils_1.navigateToParticipantPage)(CONST_1.default.IOU.TYPE.CREATE, CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, newReportID);
        }
    };
    var _o = (0, useFilesValidation_1.default)(saveFileAndInitMoneyRequest), validateFiles = _o.validateFiles, PDFValidationComponent = _o.PDFValidationComponent, ErrorModal = _o.ErrorModal;
    var initScanRequest = function (e) {
        var _a, _b;
        var files = Array.from((_b = (_a = e === null || e === void 0 ? void 0 : e.dataTransfer) === null || _a === void 0 ? void 0 : _a.files) !== null && _b !== void 0 ? _b : []);
        if (files.length === 0) {
            return;
        }
        files.forEach(function (file) {
            // eslint-disable-next-line no-param-reassign
            file.uri = URL.createObjectURL(file);
        });
        validateFiles(files);
    };
    var createExportAll = (0, react_1.useCallback)(function () {
        var _a;
        if (selectedTransactionsKeys.length === 0 || !status || !hash) {
            return [];
        }
        setIsDownloadExportModalVisible(false);
        var reportIDList = (_a = selectedReports === null || selectedReports === void 0 ? void 0 : selectedReports.filter(function (report) { return !!report; }).map(function (report) { return report.reportID; })) !== null && _a !== void 0 ? _a : [];
        (0, Search_2.queueExportSearchItemsToCSV)({
            query: status,
            jsonQuery: JSON.stringify(queryJSON),
            reportIDList: reportIDList,
            transactionIDList: selectedTransactionsKeys,
        });
        setExportMode(false);
        clearSelectedTransactions();
    }, [selectedTransactionsKeys, status, hash, selectedReports, queryJSON, setExportMode, clearSelectedTransactions]);
    var handleOnBackButtonPress = function () { return Navigation_1.default.goBack(ROUTES_1.default.SEARCH_ROOT.getRoute({ query: (0, SearchQueryUtils_1.buildCannedSearchQuery)() })); };
    var resetVideoPlayerData = (0, PlaybackContext_1.usePlaybackContext)().resetVideoPlayerData;
    var shouldShowOfflineIndicator = (_c = currentSearchResults === null || currentSearchResults === void 0 ? void 0 : currentSearchResults.data) !== null && _c !== void 0 ? _c : lastNonEmptySearchResults;
    // Handles video player cleanup:
    // 1. On mount: Resets player if navigating from report screen
    // 2. On unmount: Stops video when leaving this screen
    // in narrow layout, the reset will be handled by the attachment modal, so we don't need to do it here to preserve autoplay
    (0, react_1.useEffect)(function () {
        if (shouldUseNarrowLayout) {
            return;
        }
        resetVideoPlayerData();
        return function () {
            if (shouldUseNarrowLayout) {
                return;
            }
            resetVideoPlayerData();
        };
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    var handleSearchAction = (0, react_1.useCallback)(function (value) {
        if (typeof value === 'string') {
            (0, Report_1.searchInServer)(value);
        }
        else {
            (0, Search_2.search)(value);
        }
    }, []);
    if (shouldUseNarrowLayout) {
        return (<>
                <Provider_1.default isDisabled={!isBetaEnabled(CONST_1.default.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP)}>
                    {PDFValidationComponent}
                    <SearchPageNarrow_1.default queryJSON={queryJSON} headerButtonsOptions={headerButtonsOptions} lastNonEmptySearchResults={lastNonEmptySearchResults} currentSearchResults={currentSearchResults}/>
                    <Consumer_1.default onDrop={initScanRequest}>
                        <DropZoneUI_1.default icon={Expensicons.SmartScan} dropTitle={translate('dropzone.scanReceipts')} dropStyles={styles.receiptDropOverlay(true)} dropTextStyles={styles.receiptDropText} dropInnerWrapperStyles={styles.receiptDropInnerWrapper(true)} dropWrapperStyles={{ marginBottom: variables_1.default.bottomTabHeight }}/>
                    </Consumer_1.default>
                    {ErrorModal}
                </Provider_1.default>
                {!!selectionMode && (selectionMode === null || selectionMode === void 0 ? void 0 : selectionMode.isEnabled) && (<react_native_1.View>
                        <ConfirmModal_1.default isVisible={isDeleteExpensesConfirmModalVisible} onConfirm={handleDeleteExpenses} onCancel={function () {
                    setIsDeleteExpensesConfirmModalVisible(false);
                }} title={translate('iou.deleteExpense', { count: selectedTransactionsKeys.length })} prompt={translate('iou.deleteConfirmation', { count: selectedTransactionsKeys.length })} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
                        <DecisionModal_1.default title={translate('common.youAppearToBeOffline')} prompt={translate('common.offlinePrompt')} isSmallScreenWidth={isSmallScreenWidth} onSecondOptionSubmit={function () { return setIsOfflineModalVisible(false); }} secondOptionText={translate('common.buttonConfirm')} isVisible={isOfflineModalVisible} onClose={function () { return setIsOfflineModalVisible(false); }}/>
                        <DecisionModal_1.default title={translate('common.downloadFailedTitle')} prompt={translate('common.downloadFailedDescription')} isSmallScreenWidth={isSmallScreenWidth} onSecondOptionSubmit={function () { return setIsDownloadErrorModalVisible(false); }} secondOptionText={translate('common.buttonConfirm')} isVisible={isDownloadErrorModalVisible} onClose={function () { return setIsDownloadErrorModalVisible(false); }}/>
                    </react_native_1.View>)}
            </>);
    }
    return (<ScreenWrapper_1.default testID={Search_1.default.displayName} shouldEnableMaxHeight headerGapStyles={[styles.searchHeaderGap, styles.h0]}>
            <FullPageNotFoundView_1.default shouldForceFullScreen shouldShow={!queryJSON} onBackButtonPress={handleOnBackButtonPress} shouldShowLink={false}>
                {!!queryJSON && (<react_native_1.View style={styles.searchSplitContainer}>
                        <ScreenWrapper_1.default testID={Search_1.default.displayName} shouldShowOfflineIndicatorInWideScreen={!!shouldShowOfflineIndicator} offlineIndicatorStyle={styles.mtAuto}>
                            <Provider_1.default isDisabled={!isBetaEnabled(CONST_1.default.BETAS.NEWDOT_MULTI_FILES_DRAG_AND_DROP)}>
                                {PDFValidationComponent}
                                <SearchPageHeader_1.default queryJSON={queryJSON} headerButtonsOptions={headerButtonsOptions} handleSearch={handleSearchAction}/>
                                <SearchFiltersBar_1.default queryJSON={queryJSON} headerButtonsOptions={headerButtonsOptions}/>
                                <Search_1.default key={queryJSON.hash} queryJSON={queryJSON} currentSearchResults={currentSearchResults} lastNonEmptySearchResults={lastNonEmptySearchResults} handleSearch={handleSearchAction}/>
                                <Consumer_1.default onDrop={initScanRequest}>
                                    <DropZoneUI_1.default icon={Expensicons.SmartScan} dropTitle={translate('dropzone.scanReceipts')} dropStyles={styles.receiptDropOverlay(true)} dropTextStyles={styles.receiptDropText} dropInnerWrapperStyles={styles.receiptDropInnerWrapper(true)}/>
                                </Consumer_1.default>
                            </Provider_1.default>
                        </ScreenWrapper_1.default>
                        {ErrorModal}
                    </react_native_1.View>)}
                <ConfirmModal_1.default isVisible={isDeleteExpensesConfirmModalVisible} onConfirm={handleDeleteExpenses} onCancel={function () {
            setIsDeleteExpensesConfirmModalVisible(false);
        }} title={translate('iou.deleteExpense', { count: selectedTransactionsKeys.length })} prompt={translate('iou.deleteConfirmation', { count: selectedTransactionsKeys.length })} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
                <ConfirmModal_1.default isVisible={isDownloadExportModalVisible} onConfirm={createExportAll} onCancel={function () {
            setIsDownloadExportModalVisible(false);
        }} title={translate('search.exportSearchResults.title')} prompt={translate('search.exportSearchResults.description')} confirmText={translate('search.exportSearchResults.title')} cancelText={translate('common.cancel')}/>
                <DecisionModal_1.default title={translate('common.youAppearToBeOffline')} prompt={translate('common.offlinePrompt')} isSmallScreenWidth={isSmallScreenWidth} onSecondOptionSubmit={function () { return setIsOfflineModalVisible(false); }} secondOptionText={translate('common.buttonConfirm')} isVisible={isOfflineModalVisible} onClose={function () { return setIsOfflineModalVisible(false); }}/>
                <DecisionModal_1.default title={translate('common.downloadFailedTitle')} prompt={translate('common.downloadFailedDescription')} isSmallScreenWidth={isSmallScreenWidth} onSecondOptionSubmit={function () { return setIsDownloadErrorModalVisible(false); }} secondOptionText={translate('common.buttonConfirm')} isVisible={isDownloadErrorModalVisible} onClose={function () { return setIsDownloadErrorModalVisible(false); }}/>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
SearchPage.displayName = 'SearchPage';
SearchPage.whyDidYouRender = true;
exports.default = SearchPage;
