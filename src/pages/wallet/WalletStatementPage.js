"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var WalletStatementModal_1 = require("@components/WalletStatementModal");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var useThemePreference_1 = require("@hooks/useThemePreference");
var Environment_1 = require("@libs/Environment/Environment");
var fileDownload_1 = require("@libs/fileDownload");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Url_1 = require("@libs/Url");
var User_1 = require("@userActions/User");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function WalletStatementPage(_a) {
    var _b, _c;
    var route = _a.route;
    var walletStatement = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_STATEMENT, { canBeMissing: true })[0];
    var themePreference = (0, useThemePreference_1.default)();
    var yearMonth = (_b = route.params.yearMonth) !== null && _b !== void 0 ? _b : null;
    var isWalletStatementGenerating = (_c = walletStatement === null || walletStatement === void 0 ? void 0 : walletStatement.isGenerating) !== null && _c !== void 0 ? _c : false;
    var prevIsWalletStatementGenerating = (0, usePrevious_1.default)(isWalletStatementGenerating);
    var _d = (0, react_1.useState)(isWalletStatementGenerating), isDownloading = _d[0], setIsDownloading = _d[1];
    var translate = (0, useLocalize_1.default)().translate;
    var environment = (0, useEnvironment_1.default)().environment;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var baseURL = (0, Url_1.addTrailingForwardSlash)((0, Environment_1.getOldDotURLFromEnvironment)(environment));
    (0, react_1.useEffect)(function () {
        var currentYearMonth = (0, date_fns_1.format)(new Date(), CONST_1.default.DATE.YEAR_MONTH_FORMAT);
        if (!yearMonth || yearMonth.length !== 6 || yearMonth > currentYearMonth) {
            Navigation_1.default.dismissModal();
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we want this effect to run only on mount
    }, []);
    var processDownload = (0, react_1.useCallback)(function () {
        if (isWalletStatementGenerating) {
            return;
        }
        setIsDownloading(true);
        if (walletStatement === null || walletStatement === void 0 ? void 0 : walletStatement[yearMonth]) {
            // We already have a file URL for this statement, so we can download it immediately
            var downloadFileName = "Expensify_Statement_".concat(yearMonth, ".pdf");
            var fileName = walletStatement[yearMonth];
            var pdfURL = "".concat(baseURL, "secure?secureType=pdfreport&filename=").concat(fileName, "&downloadName=").concat(downloadFileName);
            (0, fileDownload_1.default)(pdfURL, downloadFileName).finally(function () { return setIsDownloading(false); });
            return;
        }
        (0, User_1.generateStatementPDF)(yearMonth);
    }, [baseURL, isWalletStatementGenerating, walletStatement, yearMonth]);
    // eslint-disable-next-line rulesdir/prefer-early-return
    (0, react_1.useEffect)(function () {
        // If the statement generate is complete, download it automatically.
        if (prevIsWalletStatementGenerating && !isWalletStatementGenerating) {
            if (walletStatement === null || walletStatement === void 0 ? void 0 : walletStatement[yearMonth]) {
                processDownload();
            }
            else {
                setIsDownloading(false);
            }
        }
    }, [prevIsWalletStatementGenerating, isWalletStatementGenerating, processDownload, walletStatement, yearMonth]);
    var year = (yearMonth === null || yearMonth === void 0 ? void 0 : yearMonth.substring(0, 4)) || (0, date_fns_1.getYear)(new Date());
    var month = (yearMonth === null || yearMonth === void 0 ? void 0 : yearMonth.substring(4)) || (0, date_fns_1.getMonth)(new Date());
    var monthName = (0, date_fns_1.format)(new Date(Number(year), Number(month) - 1), CONST_1.default.DATE.MONTH_FORMAT);
    var title = translate('statementPage.title', { year: year, monthName: monthName });
    var url = "".concat(baseURL, "statement.php?period=").concat(yearMonth).concat(themePreference === CONST_1.default.THEME.DARK ? '&isDarkMode=true' : '');
    return (<ScreenWrapper_1.default shouldShowOfflineIndicator={false} enableEdgeToEdgeBottomSafeAreaPadding testID={WalletStatementPage.displayName}>
            <HeaderWithBackButton_1.default title={expensify_common_1.Str.recapitalize(title)} shouldShowDownloadButton={!isOffline || isDownloading} isDownloading={isDownloading} onDownloadButtonPress={processDownload}/>
            <FullPageOfflineBlockingView_1.default addBottomSafeAreaPadding>
                <WalletStatementModal_1.default statementPageURL={url}/>
            </FullPageOfflineBlockingView_1.default>
        </ScreenWrapper_1.default>);
}
WalletStatementPage.displayName = 'WalletStatementPage';
exports.default = WalletStatementPage;
