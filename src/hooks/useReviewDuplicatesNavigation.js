"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function useReviewDuplicatesNavigation(stepNames, currentScreenName, threadReportID, backTo) {
    var _a = (0, react_1.useState)(), nextScreen = _a[0], setNextScreen = _a[1];
    var _b = (0, react_1.useState)(), prevScreen = _b[0], setPrevScreen = _b[1];
    var _c = (0, react_1.useState)(0), currentScreenIndex = _c[0], setCurrentScreenIndex = _c[1];
    var intersection = (0, react_1.useMemo)(function () { return CONST_1.default.REVIEW_DUPLICATES_ORDER.filter(function (element) { return stepNames.includes(element); }); }, [stepNames]);
    (0, react_1.useEffect)(function () {
        if (currentScreenName === 'confirmation') {
            setPrevScreen(intersection.at(-1));
            return;
        }
        var currentIndex = intersection.indexOf(currentScreenName);
        var nextScreenIndex = currentIndex + 1;
        var prevScreenIndex = currentIndex - 1;
        setCurrentScreenIndex(currentIndex);
        setNextScreen(intersection.at(nextScreenIndex));
        setPrevScreen(prevScreenIndex !== -1 ? intersection.at(prevScreenIndex) : undefined);
    }, [currentScreenName, intersection]);
    var goBack = function () {
        switch (prevScreen) {
            case 'merchant':
                Navigation_1.default.goBack(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_MERCHANT_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'category':
                Navigation_1.default.goBack(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_CATEGORY_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'tag':
                Navigation_1.default.goBack(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_TAG_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'description':
                Navigation_1.default.goBack(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'taxCode':
                Navigation_1.default.goBack(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'reimbursable':
                Navigation_1.default.goBack(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'billable':
                Navigation_1.default.goBack(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_BILLABLE_PAGE.getRoute(threadReportID, backTo));
                break;
            default:
                Navigation_1.default.goBack(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(threadReportID, backTo));
                break;
        }
    };
    var navigateToNextScreen = function () {
        switch (nextScreen) {
            case 'merchant':
                Navigation_1.default.navigate(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_MERCHANT_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'category':
                Navigation_1.default.navigate(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_CATEGORY_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'tag':
                Navigation_1.default.navigate(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_TAG_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'description':
                Navigation_1.default.navigate(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'taxCode':
                Navigation_1.default.navigate(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_TAX_CODE_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'reimbursable':
                Navigation_1.default.navigate(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE_PAGE.getRoute(threadReportID, backTo));
                break;
            case 'billable':
                Navigation_1.default.navigate(ROUTES_1.default.TRANSACTION_DUPLICATE_REVIEW_BILLABLE_PAGE.getRoute(threadReportID, backTo));
                break;
            default:
                Navigation_1.default.navigate(ROUTES_1.default.TRANSACTION_DUPLICATE_CONFIRMATION_PAGE.getRoute(threadReportID, backTo));
                break;
        }
    };
    return { navigateToNextScreen: navigateToNextScreen, goBack: goBack, currentScreenIndex: currentScreenIndex };
}
exports.default = useReviewDuplicatesNavigation;
