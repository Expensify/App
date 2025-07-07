"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var ReportActionsSkeletonView_1 = require("@components/ReportActionsSkeletonView");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function ListBoundaryLoader(_a) {
    var type = _a.type, _b = _a.isLoadingOlderReportActions, isLoadingOlderReportActions = _b === void 0 ? false : _b, _c = _a.isLoadingInitialReportActions, isLoadingInitialReportActions = _c === void 0 ? false : _c, _d = _a.lastReportActionName, lastReportActionName = _d === void 0 ? '' : _d, _e = _a.isLoadingNewerReportActions, isLoadingNewerReportActions = _e === void 0 ? false : _e, _f = _a.hasError, hasError = _f === void 0 ? false : _f, onRetry = _a.onRetry;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var translate = (0, useLocalize_1.default)().translate;
    // When retrying we want to show the loading state in the retry button so we
    // have this separate state to handle that.
    var _g = react_1.default.useState(false), isRetrying = _g[0], setIsRetrying = _g[1];
    var retry = function () {
        setIsRetrying(true);
        onRetry === null || onRetry === void 0 ? void 0 : onRetry();
    };
    // Reset the retrying state once loading is done.
    (0, react_1.useEffect)(function () {
        if (isLoadingNewerReportActions || isLoadingOlderReportActions) {
            return;
        }
        setIsRetrying(false);
    }, [isLoadingNewerReportActions, isLoadingOlderReportActions]);
    if (hasError || isRetrying) {
        return (<react_native_1.View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.listBoundaryError]}>
                <Text_1.default style={styles.listBoundaryErrorText}>{translate('listBoundary.errorMessage')}</Text_1.default>
                {!isOffline && (<Button_1.default small onPress={retry} text={translate('listBoundary.tryAgain')} isLoading={isRetrying}/>)}
            </react_native_1.View>);
    }
    // We use two different loading components for the header and footer
    // to reduce the jumping effect when the user is scrolling to the newer report actions
    if (type === CONST_1.default.LIST_COMPONENTS.FOOTER) {
        /*
         Ensure that the report chat is not loaded until the beginning.
         This is to avoid displaying the skeleton view above the "created" action in a newly generated optimistic chat or one with not that many comments.
         Additionally, if we are offline and the report is not loaded until the beginning, we assume there are more actions to load;
         Therefore, show the skeleton view even though the actions are not actually loading.
        */
        var isReportLoadedUntilBeginning = lastReportActionName === CONST_1.default.REPORT.ACTIONS.TYPE.CREATED;
        var mayLoadMoreActions = !isReportLoadedUntilBeginning && (isLoadingInitialReportActions || isOffline);
        if (isLoadingOlderReportActions || mayLoadMoreActions) {
            return <ReportActionsSkeletonView_1.default />;
        }
    }
    if (type === CONST_1.default.LIST_COMPONENTS.HEADER && isLoadingNewerReportActions) {
        // applied for a header of the list, i.e. when you scroll to the bottom of the list
        // the styles for android and the rest components are different that's why we use two different components
        return (<react_native_1.View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.listBoundaryLoader]}>
                <react_native_1.ActivityIndicator color={theme.spinner} size="small"/>
            </react_native_1.View>);
    }
}
ListBoundaryLoader.displayName = 'ListBoundaryLoader';
exports.default = ListBoundaryLoader;
