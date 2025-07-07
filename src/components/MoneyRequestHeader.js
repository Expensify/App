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
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLoadingBarVisibility_1 = require("@hooks/useLoadingBarVisibility");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useTransactionViolations_1 = require("@hooks/useTransactionViolations");
var IOU_1 = require("@libs/actions/IOU");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var ReportPrimaryActionUtils_1 = require("@libs/ReportPrimaryActionUtils");
var ReportSecondaryActionUtils_1 = require("@libs/ReportSecondaryActionUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var variables_1 = require("@styles/variables");
var Transaction_1 = require("@userActions/Transaction");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var BrokenConnectionDescription_1 = require("./BrokenConnectionDescription");
var Button_1 = require("./Button");
var ButtonWithDropdownMenu_1 = require("./ButtonWithDropdownMenu");
var ConfirmModal_1 = require("./ConfirmModal");
var DecisionModal_1 = require("./DecisionModal");
var HeaderWithBackButton_1 = require("./HeaderWithBackButton");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var LoadingBar_1 = require("./LoadingBar");
var MoneyRequestHeaderStatusBar_1 = require("./MoneyRequestHeaderStatusBar");
var MoneyRequestReportTransactionsNavigation_1 = require("./MoneyRequestReportView/MoneyRequestReportTransactionsNavigation");
var SearchContext_1 = require("./Search/SearchContext");
function MoneyRequestHeader(_a) {
    var _b, _c;
    var _d, _e;
    var report = _a.report, parentReportAction = _a.parentReportAction, policy = _a.policy, onBackButtonPress = _a.onBackButtonPress;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use a correct layout for the hold expense modal https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _f = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _f.shouldUseNarrowLayout, isSmallScreenWidth = _f.isSmallScreenWidth;
    var route = (0, native_1.useRoute)();
    var parentReport = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.parentReportID), {
        canBeMissing: false,
    })[0];
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat((0, ReportActionsUtils_1.isMoneyRequestAction)(parentReportAction) ? ((_e = (_d = (0, ReportActionsUtils_1.getOriginalMessage)(parentReportAction)) === null || _d === void 0 ? void 0 : _d.IOUTransactionID) !== null && _e !== void 0 ? _e : CONST_1.default.DEFAULT_NUMBER_ID) : CONST_1.default.DEFAULT_NUMBER_ID), { canBeMissing: true })[0];
    var transactionViolations = (0, useTransactionViolations_1.default)(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID);
    var _g = (0, react_1.useState)(false), isDeleteModalVisible = _g[0], setIsDeleteModalVisible = _g[1];
    var _h = (0, react_1.useState)(false), downloadErrorModalVisible = _h[0], setDownloadErrorModalVisible = _h[1];
    var _j = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_DISMISSED_HOLD_USE_EXPLANATION, { initialValue: true, canBeMissing: false }), dismissedHoldUseExplanation = _j[0], dismissedHoldUseExplanationResult = _j[1];
    var shouldShowLoadingBar = (0, useLoadingBarVisibility_1.default)();
    var isLoadingHoldUseExplained = (0, isLoadingOnyxValue_1.default)(dismissedHoldUseExplanationResult);
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isOnHold = (0, TransactionUtils_1.isOnHold)(transaction);
    var isDuplicate = (0, TransactionUtils_1.isDuplicate)(transaction);
    var reportID = report === null || report === void 0 ? void 0 : report.reportID;
    var removeTransaction = (0, SearchContext_1.useSearchContext)().removeTransaction;
    var isReportInRHP = route.name === SCREENS_1.default.SEARCH.REPORT_RHP;
    var shouldDisplayTransactionNavigation = !!(reportID && isReportInRHP);
    var hasPendingRTERViolation = (0, TransactionUtils_1.hasPendingRTERViolation)(transactionViolations);
    var shouldShowBrokenConnectionViolation = (0, TransactionUtils_1.shouldShowBrokenConnectionViolation)(parentReport, policy, transactionViolations);
    // If the parent report is a selfDM, it should always be opened in the Inbox tab
    var shouldOpenParentReportInCurrentTab = !(0, ReportUtils_1.isSelfDM)(parentReport);
    var markAsCash = (0, react_1.useCallback)(function () {
        (0, Transaction_1.markAsCash)(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID, reportID);
    }, [reportID, transaction === null || transaction === void 0 ? void 0 : transaction.transactionID]);
    var getStatusIcon = function (src) { return (<Icon_1.default src={src} height={variables_1.default.iconSizeSmall} width={variables_1.default.iconSizeSmall} fill={theme.icon}/>); };
    var getStatusBarProps = function () {
        if (isOnHold) {
            return { icon: getStatusIcon(Expensicons.Stopwatch), description: translate('iou.expenseOnHold') };
        }
        if (isDuplicate) {
            return { icon: getStatusIcon(Expensicons.Flag), description: translate('iou.expenseDuplicate') };
        }
        if ((0, TransactionUtils_1.isExpensifyCardTransaction)(transaction) && (0, TransactionUtils_1.isPending)(transaction)) {
            return { icon: getStatusIcon(Expensicons.CreditCardHourglass), description: translate('iou.transactionPendingDescription') };
        }
        if (shouldShowBrokenConnectionViolation) {
            return {
                icon: getStatusIcon(Expensicons.Hourglass),
                description: (<BrokenConnectionDescription_1.default transactionID={transaction === null || transaction === void 0 ? void 0 : transaction.transactionID} report={parentReport} policy={policy}/>),
            };
        }
        if (hasPendingRTERViolation) {
            return { icon: getStatusIcon(Expensicons.Hourglass), description: translate('iou.pendingMatchWithCreditCardDescription') };
        }
        if ((0, TransactionUtils_1.isScanning)(transaction)) {
            return { icon: getStatusIcon(Expensicons.ReceiptScan), description: translate('iou.receiptScanInProgressDescription') };
        }
    };
    var statusBarProps = getStatusBarProps();
    (0, react_1.useEffect)(function () {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isLoadingHoldUseExplained || dismissedHoldUseExplanation || !isOnHold) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.PROCESS_MONEY_REQUEST_HOLD.getRoute(Navigation_1.default.getReportRHPActiveRoute()));
    }, [dismissedHoldUseExplanation, isLoadingHoldUseExplained, isOnHold]);
    var primaryAction = (0, react_1.useMemo)(function () {
        if (!report || !parentReport || !transaction) {
            return '';
        }
        return (0, ReportPrimaryActionUtils_1.getTransactionThreadPrimaryAction)(report, parentReport, transaction, transactionViolations, policy);
    }, [parentReport, policy, report, transaction, transactionViolations]);
    var primaryActionImplementation = (_b = {},
        _b[CONST_1.default.REPORT.TRANSACTION_PRIMARY_ACTIONS.REMOVE_HOLD] = (<Button_1.default success text={translate('iou.unhold')} onPress={function () {
                (0, ReportUtils_1.changeMoneyRequestHoldStatus)(parentReportAction);
            }}/>),
        _b[CONST_1.default.REPORT.TRANSACTION_PRIMARY_ACTIONS.REVIEW_DUPLICATES] = (<Button_1.default success text={translate('iou.reviewDuplicates')} onPress={function () {
                if (!reportID) {
                    return;
                }
                Navigation_1.default.navigate(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(reportID, Navigation_1.default.getReportRHPActiveRoute()));
            }}/>),
        _b[CONST_1.default.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_CASH] = (<Button_1.default success text={translate('iou.markAsCash')} onPress={markAsCash}/>),
        _b);
    var secondaryActions = (0, react_1.useMemo)(function () {
        var reportActions = !!parentReport && (0, ReportActionsUtils_1.getReportActions)(parentReport);
        if (!transaction || !reportActions) {
            return [];
        }
        return (0, ReportSecondaryActionUtils_1.getSecondaryTransactionThreadActions)(parentReport, transaction, Object.values(reportActions), policy);
    }, [parentReport, policy, transaction]);
    var secondaryActionsImplementation = (_c = {},
        _c[CONST_1.default.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD] = {
            text: translate('iou.hold'),
            icon: Expensicons.Stopwatch,
            value: CONST_1.default.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD,
            onSelected: function () {
                if (!parentReportAction) {
                    throw new Error('Parent action does not exist');
                }
                (0, ReportUtils_1.changeMoneyRequestHoldStatus)(parentReportAction);
            },
        },
        _c[CONST_1.default.REPORT.TRANSACTION_SECONDARY_ACTIONS.SPLIT] = {
            text: translate('iou.split'),
            icon: Expensicons.ArrowSplit,
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.SPLIT,
            onSelected: function () {
                (0, IOU_1.initSplitExpense)(transaction, reportID !== null && reportID !== void 0 ? reportID : String(CONST_1.default.DEFAULT_NUMBER_ID));
            },
        },
        _c[CONST_1.default.REPORT.TRANSACTION_SECONDARY_ACTIONS.VIEW_DETAILS] = {
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS,
            text: translate('iou.viewDetails'),
            icon: Expensicons.Info,
            onSelected: function () {
                (0, ReportUtils_1.navigateToDetailsPage)(report, Navigation_1.default.getReportRHPActiveRoute());
            },
        },
        _c[CONST_1.default.REPORT.TRANSACTION_SECONDARY_ACTIONS.DELETE] = {
            text: translate('common.delete'),
            icon: Expensicons.Trashcan,
            value: CONST_1.default.REPORT.SECONDARY_ACTIONS.DELETE,
            onSelected: function () {
                setIsDeleteModalVisible(true);
            },
        },
        _c);
    var applicableSecondaryActions = secondaryActions.map(function (action) { return secondaryActionsImplementation[action]; });
    return (<react_native_1.View style={[styles.pl0, styles.borderBottom]}>
            <HeaderWithBackButton_1.default shouldShowBorderBottom={false} shouldShowReportAvatarWithDisplay shouldShowPinButton={false} report={reportID
            ? __assign(__assign({}, report), { reportID: reportID, ownerAccountID: parentReport === null || parentReport === void 0 ? void 0 : parentReport.ownerAccountID }) : undefined} policy={policy} shouldShowBackButton={shouldUseNarrowLayout} shouldDisplaySearchRouter={!isReportInRHP} shouldDisplayHelpButton={!isReportInRHP} onBackButtonPress={onBackButtonPress} shouldEnableDetailPageNavigation openParentReportInCurrentTab={shouldOpenParentReportInCurrentTab}>
                {!shouldUseNarrowLayout && (<react_native_1.View style={[styles.flexRow, styles.gap2]}>
                        {!!primaryAction && primaryActionImplementation[primaryAction]}
                        {!!applicableSecondaryActions.length && (<ButtonWithDropdownMenu_1.default success={false} onPress={function () { }} shouldAlwaysShowDropdownMenu customText={translate('common.more')} options={applicableSecondaryActions} isSplitButton={false}/>)}
                    </react_native_1.View>)}
                {shouldDisplayTransactionNavigation && <MoneyRequestReportTransactionsNavigation_1.default currentReportID={reportID}/>}
            </HeaderWithBackButton_1.default>
            {shouldUseNarrowLayout && (<react_native_1.View style={[styles.flexRow, styles.gap2, styles.pb3, styles.ph5, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    {!!primaryAction && <react_native_1.View style={[styles.flexGrow4]}>{primaryActionImplementation[primaryAction]}</react_native_1.View>}
                    {!!applicableSecondaryActions.length && (<ButtonWithDropdownMenu_1.default success={false} onPress={function () { }} shouldAlwaysShowDropdownMenu customText={translate('common.more')} options={applicableSecondaryActions} isSplitButton={false} wrapperStyle={[!primaryAction && styles.flexGrow4]}/>)}
                </react_native_1.View>)}
            {!!statusBarProps && (<react_native_1.View style={[styles.ph5, styles.pb3]}>
                    <MoneyRequestHeaderStatusBar_1.default icon={statusBarProps.icon} description={statusBarProps.description}/>
                </react_native_1.View>)}
            <LoadingBar_1.default shouldShow={shouldShowLoadingBar && shouldUseNarrowLayout}/>
            <DecisionModal_1.default title={translate('common.downloadFailedTitle')} prompt={translate('common.downloadFailedDescription')} isSmallScreenWidth={isSmallScreenWidth} onSecondOptionSubmit={function () { return setDownloadErrorModalVisible(false); }} secondOptionText={translate('common.buttonConfirm')} isVisible={downloadErrorModalVisible} onClose={function () { return setDownloadErrorModalVisible(false); }}/>
            <ConfirmModal_1.default title={translate('iou.deleteExpense', { count: 1 })} isVisible={isDeleteModalVisible} onConfirm={function () {
            setIsDeleteModalVisible(false);
            if (!parentReportAction || !transaction) {
                throw new Error('Data missing');
            }
            if ((0, ReportActionsUtils_1.isTrackExpenseAction)(parentReportAction)) {
                (0, IOU_1.deleteTrackExpense)(report === null || report === void 0 ? void 0 : report.parentReportID, transaction.transactionID, parentReportAction, true);
            }
            else {
                (0, IOU_1.deleteMoneyRequest)(transaction.transactionID, parentReportAction, true);
                removeTransaction(transaction.transactionID);
            }
            onBackButtonPress();
        }} onCancel={function () { return setIsDeleteModalVisible(false); }} prompt={translate('iou.deleteConfirmation', { count: 1 })} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger shouldEnableNewFocusManagement/>
        </react_native_1.View>);
}
MoneyRequestHeader.displayName = 'MoneyRequestHeader';
exports.default = MoneyRequestHeader;
