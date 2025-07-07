"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var Report_1 = require("@libs/actions/Report");
var getComponentDisplayName_1 = require("@libs/getComponentDisplayName");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var LoadingPage_1 = require("@pages/LoadingPage");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var withReportOrNotFound_1 = require("./withReportOrNotFound");
function default_1(pageTitle) {
    return function (WrappedComponent) {
        // eslint-disable-next-line rulesdir/no-negated-variables
        function WithReportAndPrivateNotesOrNotFound(props) {
            var _a, _b;
            var translate = (0, useLocalize_1.default)().translate;
            var isOffline = (0, useNetwork_1.default)().isOffline;
            var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION)[0];
            var route = props.route, report = props.report, reportMetadata = props.reportMetadata;
            var reportNameValuePairs = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report === null || report === void 0 ? void 0 : report.reportID))[0];
            var accountID = ('accountID' in route.params && route.params.accountID) || '';
            var isPrivateNotesFetchTriggered = (reportMetadata === null || reportMetadata === void 0 ? void 0 : reportMetadata.isLoadingPrivateNotes) !== undefined;
            var prevIsOffline = (0, usePrevious_1.default)(isOffline);
            var isReconnecting = prevIsOffline && !isOffline;
            var isOtherUserNote = !!accountID && Number(session === null || session === void 0 ? void 0 : session.accountID) !== Number(accountID);
            var isPrivateNotesFetchFinished = isPrivateNotesFetchTriggered && !reportMetadata.isLoadingPrivateNotes;
            var isPrivateNotesUndefined = accountID ? ((_b = (_a = report === null || report === void 0 ? void 0 : report.privateNotes) === null || _a === void 0 ? void 0 : _a[Number(accountID)]) === null || _b === void 0 ? void 0 : _b.note) === undefined : (0, EmptyObject_1.isEmptyObject)(report === null || report === void 0 ? void 0 : report.privateNotes);
            (0, react_1.useEffect)(function () {
                // Do not fetch private notes if isLoadingPrivateNotes is already defined, or if network is offline.
                if ((isPrivateNotesFetchTriggered && !isReconnecting) || isOffline) {
                    return;
                }
                (0, Report_1.getReportPrivateNote)(report === null || report === void 0 ? void 0 : report.reportID);
                // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- do not add report.isLoadingPrivateNotes to dependencies
            }, [report === null || report === void 0 ? void 0 : report.reportID, isOffline, isPrivateNotesFetchTriggered, isReconnecting]);
            var shouldShowFullScreenLoadingIndicator = !isPrivateNotesFetchFinished;
            // eslint-disable-next-line rulesdir/no-negated-variables
            var shouldShowNotFoundPage = (0, react_1.useMemo)(function () {
                // Show not found view if the report is archived, or if the note is not of current user or if report is a self DM.
                if ((0, ReportUtils_1.isArchivedReport)(reportNameValuePairs) || isOtherUserNote || (0, ReportUtils_1.isSelfDM)(report)) {
                    return true;
                }
                // Don't show not found view if the notes are still loading, or if the notes are non-empty.
                if (shouldShowFullScreenLoadingIndicator || !isPrivateNotesUndefined || isReconnecting) {
                    return false;
                }
                // As notes being empty and not loading is a valid case, show not found view only in offline mode.
                return isOffline;
            }, [report, isOtherUserNote, shouldShowFullScreenLoadingIndicator, isPrivateNotesUndefined, isReconnecting, isOffline, reportNameValuePairs]);
            if (shouldShowFullScreenLoadingIndicator) {
                if (isOffline) {
                    return (<ScreenWrapper_1.default shouldEnableMaxHeight includeSafeAreaPaddingBottom testID="PrivateNotesOfflinePage">
                            <HeaderWithBackButton_1.default title={translate('privateNotes.title')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }} shouldShowBackButton onCloseButtonPress={function () { return Navigation_1.default.dismissModal(); }}/>
                            <FullPageOfflineBlockingView_1.default>
                                <react_native_1.View />
                            </FullPageOfflineBlockingView_1.default>
                        </ScreenWrapper_1.default>);
                }
                return <LoadingPage_1.default title={translate(pageTitle)}/>;
            }
            if (shouldShowNotFoundPage) {
                return <NotFoundPage_1.default />;
            }
            return (<WrappedComponent 
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props} accountID={session === null || session === void 0 ? void 0 : session.accountID}/>);
        }
        WithReportAndPrivateNotesOrNotFound.displayName = "withReportAndPrivateNotesOrNotFound(".concat((0, getComponentDisplayName_1.default)(WrappedComponent), ")");
        return (0, withReportOrNotFound_1.default)()(WithReportAndPrivateNotesOrNotFound);
    };
}
