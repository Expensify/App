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
// eslint-disable-next-line no-restricted-imports
var sizing_1 = require("@styles/utils/sizing");
// eslint-disable-next-line no-restricted-imports
var spacing_1 = require("@styles/utils/spacing");
var CONST_1 = require("@src/CONST");
var componentsSpacing = {
    flatListStyle: [spacing_1.default.mhn4],
    wrapperStyle: spacing_1.default.p4,
    contentContainerStyle: spacing_1.default.gap4,
};
var NEXT_TRANSACTION_PEEK = 32;
var CAROUSEL_MAX_WIDTH_WIDE = CONST_1.default.REPORT.CAROUSEL_MAX_WIDTH_WIDE;
var TRANSACTION_WIDTH_WIDE = CONST_1.default.REPORT.TRANSACTION_PREVIEW.CAROUSEL.WIDE_WIDTH;
var CAROUSEL_ONE_SIDE_PADDING = componentsSpacing.wrapperStyle.padding;
var CAROUSEL_GAP = spacing_1.default.gap2.gap;
var getPeek = function (isSingleTransaction) {
    return isSingleTransaction ? CAROUSEL_ONE_SIDE_PADDING : NEXT_TRANSACTION_PEEK;
};
var mobileStyle = function (currentWidth, transactionsCount) {
    var transactionPreviewWidth = currentWidth - CAROUSEL_ONE_SIDE_PADDING - getPeek(transactionsCount === 1);
    return {
        transactionPreviewCarouselStyle: { width: transactionPreviewWidth, maxWidth: transactionPreviewWidth },
        transactionPreviewStandaloneStyle: __assign(__assign({}, sizing_1.default.w100), sizing_1.default.mw100),
        componentStyle: [sizing_1.default.mw100, sizing_1.default.w100],
        expenseCountVisible: false,
    };
};
var desktopStyle = function (currentWrapperWidth, transactionsCount) {
    var minimalWrapperWidth = TRANSACTION_WIDTH_WIDE + CAROUSEL_ONE_SIDE_PADDING + getPeek(transactionsCount < 2);
    var transactionPreviewWidth = currentWrapperWidth - CAROUSEL_ONE_SIDE_PADDING - getPeek(transactionsCount < 2);
    var spaceForTransactions = Math.max(transactionsCount, 1);
    var carouselExactMaxWidth = Math.min(minimalWrapperWidth + (TRANSACTION_WIDTH_WIDE + CAROUSEL_GAP) * (spaceForTransactions - 1), CAROUSEL_MAX_WIDTH_WIDE);
    return {
        transactionPreviewCarouselStyle: { width: currentWrapperWidth > minimalWrapperWidth || currentWrapperWidth === 0 ? TRANSACTION_WIDTH_WIDE : transactionPreviewWidth },
        transactionPreviewStandaloneStyle: { width: "min(100%, ".concat(TRANSACTION_WIDTH_WIDE, "px)"), maxWidth: "min(100%, ".concat(TRANSACTION_WIDTH_WIDE, "px)") },
        componentStyle: [{ maxWidth: "min(".concat(carouselExactMaxWidth, "px, 100%)") }, { width: currentWrapperWidth > minimalWrapperWidth ? 'min-content' : '100%' }],
        expenseCountVisible: transactionPreviewWidth >= TRANSACTION_WIDTH_WIDE,
    };
};
var getMoneyRequestReportPreviewStyle = function (shouldUseNarrowLayout, transactionsCount, currentWidth, currentWrapperWidth) { return (__assign(__assign({}, componentsSpacing), (shouldUseNarrowLayout ? mobileStyle(currentWidth !== null && currentWidth !== void 0 ? currentWidth : 256, transactionsCount) : desktopStyle(currentWrapperWidth !== null && currentWrapperWidth !== void 0 ? currentWrapperWidth : 1000, transactionsCount)))); };
exports.default = getMoneyRequestReportPreviewStyle;
