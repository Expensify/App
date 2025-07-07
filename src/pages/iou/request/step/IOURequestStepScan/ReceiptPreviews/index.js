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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var Button_1 = require("@components/Button");
var FlatList_1 = require("@components/FlatList");
var Expensicons = require("@components/Icon/Expensicons");
var Image_1 = require("@components/Image");
var Pressable_1 = require("@components/Pressable");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SubmitButtonShadow_1 = require("./SubmitButtonShadow");
function ReceiptPreviews(_a) {
    var _b;
    var submit = _a.submit, isMultiScanEnabled = _a.isMultiScanEnabled;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    var backTo = Navigation_1.default.getActiveRoute();
    var isPreviewsVisible = (0, react_native_reanimated_1.useSharedValue)(false);
    var previewsHeight = styles.receiptPlaceholder.height + styles.pv2.paddingVertical * 2;
    var previewItemWidth = styles.receiptPlaceholder.width + styles.receiptPlaceholder.marginRight;
    var initialReceiptsAmount = (0, react_1.useMemo)(function () { return (windowWidth - styles.ph4.paddingHorizontal * 2 - styles.singleAvatarMedium.width) / previewItemWidth; }, [windowWidth, styles, previewItemWidth]);
    var optimisticTransactionsReceipts = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION_DRAFT, {
        selector: function (items) {
            return Object.values(items !== null && items !== void 0 ? items : {})
                .map(function (transaction) { return ((transaction === null || transaction === void 0 ? void 0 : transaction.receipt) ? __assign(__assign({}, transaction === null || transaction === void 0 ? void 0 : transaction.receipt), { transactionID: transaction.transactionID }) : undefined); })
                .filter(function (receipt) { return !!receipt; });
        },
        canBeMissing: true,
    })[0];
    var receipts = (0, react_1.useMemo)(function () {
        if (optimisticTransactionsReceipts && optimisticTransactionsReceipts.length >= initialReceiptsAmount) {
            return optimisticTransactionsReceipts;
        }
        var receiptsWithPlaceholders = __spreadArray([], (optimisticTransactionsReceipts !== null && optimisticTransactionsReceipts !== void 0 ? optimisticTransactionsReceipts : []), true);
        while (receiptsWithPlaceholders.length < initialReceiptsAmount) {
            receiptsWithPlaceholders.push(undefined);
        }
        return receiptsWithPlaceholders;
    }, [initialReceiptsAmount, optimisticTransactionsReceipts]);
    var isScrollEnabled = optimisticTransactionsReceipts ? optimisticTransactionsReceipts.length >= receipts.length : false;
    var flatListRef = (0, react_1.useRef)(null);
    var receiptsPhotosLength = (_b = optimisticTransactionsReceipts === null || optimisticTransactionsReceipts === void 0 ? void 0 : optimisticTransactionsReceipts.length) !== null && _b !== void 0 ? _b : 0;
    var previousReceiptsPhotosLength = (0, usePrevious_1.default)(receiptsPhotosLength);
    (0, react_1.useEffect)(function () {
        if (isMultiScanEnabled) {
            isPreviewsVisible.set(true);
        }
        else {
            isPreviewsVisible.set(false);
        }
    }, [isMultiScanEnabled, isPreviewsVisible]);
    (0, react_1.useEffect)(function () {
        var _a;
        var shouldScrollToReceipt = receiptsPhotosLength && receiptsPhotosLength > previousReceiptsPhotosLength && receiptsPhotosLength > Math.floor(initialReceiptsAmount);
        if (!shouldScrollToReceipt) {
            return;
        }
        (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToIndex({ index: receiptsPhotosLength - 1 });
    }, [receiptsPhotosLength, previousReceiptsPhotosLength, initialReceiptsAmount]);
    var renderItem = function (_a) {
        var item = _a.item;
        if (!item) {
            return <react_native_1.View style={styles.receiptPlaceholder}/>;
        }
        return (<Pressable_1.PressableWithFeedback accessible accessibilityLabel={translate('common.receipt')} accessibilityRole={CONST_1.default.ROLE.BUTTON} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.MONEY_REQUEST_RECEIPT_VIEW_MODAL.getRoute(item.transactionID, backTo)); }}>
                <Image_1.default source={{ uri: item.source }} style={[styles.receiptPlaceholder, styles.overflowHidden]} loadingIconSize="small" loadingIndicatorStyles={styles.bgTransparent}/>
            </Pressable_1.PressableWithFeedback>);
    };
    var slideInStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () {
        return {
            height: (0, react_native_reanimated_1.withTiming)(isPreviewsVisible.get() ? previewsHeight : 0, {
                duration: 300,
            }),
        };
    });
    var submitReceipts = function () {
        var transactionReceipts = (optimisticTransactionsReceipts !== null && optimisticTransactionsReceipts !== void 0 ? optimisticTransactionsReceipts : []).filter(function (receipt) { return !!receipt.source; });
        submit(transactionReceipts);
    };
    return (<react_native_reanimated_1.default.View style={slideInStyle}>
            <react_native_1.View style={styles.pr4}>
                <FlatList_1.default ref={flatListRef} data={receipts} horizontal keyExtractor={function (_, index) { return index.toString(); }} renderItem={renderItem} getItemLayout={function (data, index) { return ({ length: previewItemWidth, offset: previewItemWidth * index, index: index }); }} style={styles.pv2} scrollEnabled={isScrollEnabled} showsHorizontalScrollIndicator={false} contentContainerStyle={[{ paddingRight: styles.singleAvatarMedium.width }, styles.pl4]}/>
                <SubmitButtonShadow_1.default>
                    <Button_1.default large isDisabled={!(optimisticTransactionsReceipts === null || optimisticTransactionsReceipts === void 0 ? void 0 : optimisticTransactionsReceipts.length)} innerStyles={[styles.singleAvatarMedium, styles.bgGreenSuccess]} icon={Expensicons.ArrowRight} iconFill={theme.white} onPress={submitReceipts}/>
                </SubmitButtonShadow_1.default>
            </react_native_1.View>
        </react_native_reanimated_1.default.View>);
}
exports.default = ReceiptPreviews;
