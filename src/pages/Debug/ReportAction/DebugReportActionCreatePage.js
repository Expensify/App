"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DateUtils_1 = require("@libs/DateUtils");
var DebugUtils_1 = require("@libs/DebugUtils");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var Navigation_1 = require("@libs/Navigation/Navigation");
var NumberUtils_1 = require("@libs/NumberUtils");
var ReportActionItem_1 = require("@pages/home/report/ReportActionItem");
var Debug_1 = require("@userActions/Debug");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var getInitialReportAction = function (reportID, session, personalDetailsList) {
    var _a, _b;
    return DebugUtils_1.default.stringifyJSON({
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        reportID: reportID,
        reportActionID: (0, NumberUtils_1.rand64)(),
        created: DateUtils_1.default.getDBTime(),
        actorAccountID: session === null || session === void 0 ? void 0 : session.accountID,
        avatar: (_b = ((session === null || session === void 0 ? void 0 : session.accountID) && ((_a = personalDetailsList === null || personalDetailsList === void 0 ? void 0 : personalDetailsList[session.accountID]) === null || _a === void 0 ? void 0 : _a.avatar))) !== null && _b !== void 0 ? _b : '',
        message: [{ type: CONST_1.default.REPORT.MESSAGE.TYPE.COMMENT, html: 'Hello world!', text: 'Hello world!' }],
    });
};
function DebugReportActionCreatePage(_a) {
    var reportID = _a.route.params.reportID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var allReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: false })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var personalDetailsList = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var _b = (0, react_1.useState)(function () { return getInitialReportAction(reportID, session, personalDetailsList); }), draftReportAction = _b[0], setDraftReportAction = _b[1];
    var _c = (0, react_1.useState)(), error = _c[0], setError = _c[1];
    var createReportAction = (0, react_1.useCallback)(function () {
        var _a;
        var parsedReportAction = JSON.parse(draftReportAction.replaceAll('\n', ''));
        Debug_1.default.mergeDebugData("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(reportID), (_a = {},
            _a[parsedReportAction.reportActionID] = parsedReportAction,
            _a));
        Navigation_1.default.navigate(ROUTES_1.default.DEBUG_REPORT_TAB_ACTIONS.getRoute(reportID));
    }, [draftReportAction, reportID]);
    var editJSON = (0, react_1.useCallback)(function (updatedJSON) {
        try {
            DebugUtils_1.default.validateReportActionJSON(updatedJSON);
            setError('');
        }
        catch (e) {
            var _a = e, cause = _a.cause, message = _a.message;
            setError(cause ? translate(message, cause) : message);
        }
        finally {
            setDraftReportAction(updatedJSON);
        }
    }, [translate]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} shouldEnableKeyboardAvoidingView={false} shouldEnableMinHeight={(0, DeviceCapabilities_1.canUseTouchScreen)()} testID={DebugReportActionCreatePage.displayName}>
            {function (_a) {
            var safeAreaPaddingBottomStyle = _a.safeAreaPaddingBottomStyle;
            return (<react_native_1.View style={[styles.flex1, safeAreaPaddingBottomStyle]}>
                    <HeaderWithBackButton_1.default title={"".concat(translate('debug.debug'), " - ").concat(translate('debug.createReportAction'))} onBackButtonPress={Navigation_1.default.goBack}/>
                    <ScrollView_1.default contentContainerStyle={[styles.ph5, styles.pb5, styles.gap5]}>
                        <react_native_1.View>
                            <Text_1.default style={[styles.textLabelSupporting, styles.mb2]}>{translate('debug.editJson')}</Text_1.default>
                            <TextInput_1.default errorText={error} accessibilityLabel={translate('debug.editJson')} forceActiveLabel numberOfLines={18} multiline value={draftReportAction} onChangeText={editJSON} 
            // We need to explicitly add styles.pt5 and styles.pb5 to override the default top and bottom padding of the text input
            textInputContainerStyles={[styles.border, styles.borderBottom, styles.ph5, styles.pt5, styles.pb5]}/>
                        </react_native_1.View>
                        <react_native_1.View>
                            <Text_1.default style={[styles.textLabelSupporting, styles.mb2]}>{translate('debug.preview')}</Text_1.default>
                            {!error ? (<ReportActionItem_1.default allReports={allReports} action={JSON.parse(draftReportAction.replaceAll('\n', ''))} report={{ reportID: reportID }} reportActions={[]} parentReportAction={undefined} displayAsGroup={false} isMostRecentIOUReportAction={false} shouldDisplayNewMarker={false} index={0} isFirstVisibleReportAction={false} shouldDisplayContextMenu={false}/>) : (<Text_1.default>{translate('debug.nothingToPreview')}</Text_1.default>)}
                        </react_native_1.View>
                        <Text_1.default style={[styles.headerText, styles.textAlignCenter]}>{translate('debug.hint')}</Text_1.default>
                        <Button_1.default success text={translate('common.save')} isDisabled={!draftReportAction || !!error} onPress={createReportAction}/>
                    </ScrollView_1.default>
                </react_native_1.View>);
        }}
        </ScreenWrapper_1.default>);
}
DebugReportActionCreatePage.displayName = 'DebugReportActionCreatePage';
exports.default = DebugReportActionCreatePage;
