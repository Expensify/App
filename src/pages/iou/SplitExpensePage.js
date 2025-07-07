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
var Button_1 = require("@components/Button");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SearchContext_1 = require("@components/Search/SearchContext");
var SelectionList_1 = require("@components/SelectionList");
var SplitListItem_1 = require("@components/SelectionList/SplitListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var IOU_1 = require("@libs/actions/IOU");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var DateUtils_1 = require("@libs/DateUtils");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function SplitExpensePage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _k = route.params, reportID = _k.reportID, transactionID = _k.transactionID, splitExpenseTransactionID = _k.splitExpenseTransactionID, backTo = _k.backTo;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var _l = react_1.default.useState(null), errorMessage = _l[0], setErrorMessage = _l[1];
    var currentSearchHash = (0, SearchContext_1.useSearchContext)().currentSearchHash;
    var draftTransaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.SPLIT_TRANSACTION_DRAFT).concat(transactionID), { canBeMissing: false })[0];
    var transaction = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transactionID), { canBeMissing: false })[0];
    var currencyList = (0, useOnyx_1.default)(ONYXKEYS_1.default.CURRENCY_LIST, { canBeMissing: true })[0];
    var transactionDetails = (0, react_1.useMemo)(function () { var _a; return (_a = (0, ReportUtils_1.getTransactionDetails)(transaction)) !== null && _a !== void 0 ? _a : {}; }, [transaction]);
    var transactionDetailsAmount = (_b = transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.amount) !== null && _b !== void 0 ? _b : 0;
    var sumOfSplitExpenses = (0, react_1.useMemo)(function () { var _a, _b; return ((_b = (_a = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.comment) === null || _a === void 0 ? void 0 : _a.splitExpenses) !== null && _b !== void 0 ? _b : []).reduce(function (acc, item) { var _a; return acc + Math.abs((_a = item.amount) !== null && _a !== void 0 ? _a : 0); }, 0); }, [draftTransaction]);
    var currencySymbol = (_f = (_e = (_d = currencyList === null || currencyList === void 0 ? void 0 : currencyList[(_c = transactionDetails.currency) !== null && _c !== void 0 ? _c : '']) === null || _d === void 0 ? void 0 : _d.symbol) !== null && _e !== void 0 ? _e : transactionDetails.currency) !== null && _f !== void 0 ? _f : CONST_1.default.CURRENCY.USD;
    var isPerDiem = (0, TransactionUtils_1.isPerDiemRequest)(transaction);
    var isCard = (0, TransactionUtils_1.isCardTransaction)(transaction);
    (0, react_1.useEffect)(function () {
        setErrorMessage(null);
    }, [sumOfSplitExpenses, (_h = (_g = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.comment) === null || _g === void 0 ? void 0 : _g.splitExpenses) === null || _h === void 0 ? void 0 : _h.length]);
    var onAddSplitExpense = (0, react_1.useCallback)(function () {
        (0, IOU_1.addSplitExpenseField)(transaction, draftTransaction);
    }, [draftTransaction, transaction]);
    var onSaveSplitExpense = (0, react_1.useCallback)(function () {
        var _a, _b;
        if (sumOfSplitExpenses > Math.abs(transactionDetailsAmount)) {
            var difference = sumOfSplitExpenses - Math.abs(transactionDetailsAmount);
            setErrorMessage(translate('iou.totalAmountGreaterThanOriginal', { amount: (0, CurrencyUtils_1.convertToDisplayString)(difference, transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.currency) }));
            return;
        }
        if (sumOfSplitExpenses < Math.abs(transactionDetailsAmount) && (isPerDiem || isCard)) {
            var difference = Math.abs(transactionDetailsAmount) - sumOfSplitExpenses;
            setErrorMessage(translate('iou.totalAmountLessThanOriginal', { amount: (0, CurrencyUtils_1.convertToDisplayString)(difference, transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.currency) }));
            return;
        }
        if (((_b = (_a = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.comment) === null || _a === void 0 ? void 0 : _a.splitExpenses) !== null && _b !== void 0 ? _b : []).find(function (item) { return item.amount === 0; })) {
            setErrorMessage(translate('iou.splitExpenseZeroAmount'));
            return;
        }
        (0, IOU_1.saveSplitTransactions)(draftTransaction, currentSearchHash);
    }, [currentSearchHash, draftTransaction, isCard, isPerDiem, sumOfSplitExpenses, transactionDetailsAmount, transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.currency, translate]);
    var onSplitExpenseAmountChange = (0, react_1.useCallback)(function (currentItemTransactionID, value) {
        var amountInCents = (0, CurrencyUtils_1.convertToBackendAmount)(value);
        (0, IOU_1.updateSplitExpenseAmountField)(draftTransaction, currentItemTransactionID, amountInCents);
    }, [draftTransaction]);
    var getTranslatedText = (0, react_1.useCallback)(function (item) { var _a; return (item.translationPath ? translate(item.translationPath) : ((_a = item.text) !== null && _a !== void 0 ? _a : '')); }, [translate]);
    var sections = (0, react_1.useMemo)(function () {
        var _a, _b;
        var dotSeparator = { text: " ".concat(CONST_1.default.DOT_SEPARATOR, " ") };
        var isTransactionMadeWithCard = (0, TransactionUtils_1.isCardTransaction)(transaction);
        var showCashOrCard = { translationPath: isTransactionMadeWithCard ? 'iou.card' : 'iou.cash' };
        var items = ((_b = (_a = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.comment) === null || _a === void 0 ? void 0 : _a.splitExpenses) !== null && _b !== void 0 ? _b : []).map(function (item) {
            var _a, _b, _c;
            var previewHeaderText = [showCashOrCard];
            var date = DateUtils_1.default.formatWithUTCTimeZone(item.created, DateUtils_1.default.doesDateBelongToAPastYear(item.created) ? CONST_1.default.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST_1.default.DATE.MONTH_DAY_ABBR_FORMAT);
            previewHeaderText.unshift({ text: date }, dotSeparator);
            var headerText = previewHeaderText.reduce(function (text, currentKey) {
                return "".concat(text).concat(getTranslatedText(currentKey));
            }, '');
            return __assign(__assign({}, item), { headerText: headerText, originalAmount: transactionDetailsAmount, amount: transactionDetailsAmount >= 0 ? Math.abs(Number(item.amount)) : Number(item.amount), merchant: (_a = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.merchant) !== null && _a !== void 0 ? _a : '', currency: (_b = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.currency) !== null && _b !== void 0 ? _b : CONST_1.default.CURRENCY.USD, transactionID: (_c = item === null || item === void 0 ? void 0 : item.transactionID) !== null && _c !== void 0 ? _c : CONST_1.default.IOU.OPTIMISTIC_TRANSACTION_ID, currencySymbol: currencySymbol, onSplitExpenseAmountChange: onSplitExpenseAmountChange, isTransactionLinked: splitExpenseTransactionID === item.transactionID, keyForList: item === null || item === void 0 ? void 0 : item.transactionID });
        });
        var newSections = [{ data: items }];
        return [newSections];
    }, [transaction, draftTransaction, getTranslatedText, transactionDetailsAmount, currencySymbol, onSplitExpenseAmountChange, splitExpenseTransactionID])[0];
    var headerContent = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.w100, styles.ph5, styles.flexRow, styles.gap2, shouldUseNarrowLayout && styles.mb3]}>
                <Button_1.default success onPress={onAddSplitExpense} icon={Expensicons.Plus} text={translate('iou.addSplit')} style={[shouldUseNarrowLayout && styles.flex1]}/>
            </react_native_1.View>); }, [onAddSplitExpense, shouldUseNarrowLayout, styles.flex1, styles.flexRow, styles.gap2, styles.mb3, styles.ph5, styles.w100, translate]);
    var footerContent = (0, react_1.useMemo)(function () {
        return (<>
                {!!errorMessage && (<FormHelpMessage_1.default style={[styles.ph1, styles.mb2]} isError message={errorMessage}/>)}
                <Button_1.default success large style={[styles.w100]} text={translate('common.save')} onPress={onSaveSplitExpense} pressOnEnter enterKeyEventListenerPriority={1}/>
            </>);
    }, [onSaveSplitExpense, styles.mb2, styles.ph1, styles.w100, translate, errorMessage]);
    var initiallyFocusedOptionKey = (0, react_1.useMemo)(function () { var _a, _b; return (_b = (_a = sections.at(0)) === null || _a === void 0 ? void 0 : _a.data.find(function (option) { return option.transactionID === splitExpenseTransactionID; })) === null || _b === void 0 ? void 0 : _b.keyForList; }, [sections, splitExpenseTransactionID]);
    return (<ScreenWrapper_1.default testID={SplitExpensePage.displayName} shouldEnableMaxHeight={(0, DeviceCapabilities_1.canUseTouchScreen)()} keyboardAvoidingViewBehavior="height" shouldDismissKeyboardBeforeClose={false}>
            <FullPageNotFoundView_1.default shouldShow={!reportID || (0, EmptyObject_1.isEmptyObject)(draftTransaction)}>
                <react_native_1.View style={[styles.flex1]}>
                    <HeaderWithBackButton_1.default title={translate('iou.split')} subtitle={translate('iou.splitExpenseSubtitle', {
            amount: (0, CurrencyUtils_1.convertToDisplayString)(transactionDetailsAmount, transactionDetails === null || transactionDetails === void 0 ? void 0 : transactionDetails.currency),
            merchant: (_j = draftTransaction === null || draftTransaction === void 0 ? void 0 : draftTransaction.merchant) !== null && _j !== void 0 ? _j : '',
        })} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
                    <SelectionList_1.default onSelectRow={function (item) {
            react_native_1.Keyboard.dismiss();
            react_native_1.InteractionManager.runAfterInteractions(function () {
                (0, IOU_1.initDraftSplitExpenseDataForEdit)(draftTransaction, item.transactionID, reportID);
            });
        }} headerContent={headerContent} sections={sections} initiallyFocusedOptionKey={initiallyFocusedOptionKey} ListItem={SplitListItem_1.default} containerStyle={[styles.flexBasisAuto, styles.pt1]} footerContent={footerContent} disableKeyboardShortcuts shouldSingleExecuteRowSelect canSelectMultiple={false} shouldPreventDefaultFocusOnSelectRow/>
                </react_native_1.View>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
SplitExpensePage.displayName = 'SplitExpensePage';
exports.default = SplitExpensePage;
