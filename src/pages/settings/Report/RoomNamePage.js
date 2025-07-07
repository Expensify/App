"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var RoomNameInput_1 = require("@components/RoomNameInput");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var RoomNameForm_1 = require("@src/types/form/RoomNameForm");
function RoomNamePage(_a) {
    var report = _a.report;
    var route = (0, native_1.useRoute)();
    var styles = (0, useThemeStyles_1.default)();
    var roomNameInputRef = (0, react_1.useRef)(null);
    var isFocused = (0, native_1.useIsFocused)();
    var translate = (0, useLocalize_1.default)().translate;
    var reportID = report === null || report === void 0 ? void 0 : report.reportID;
    var reports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: false })[0];
    var isReportArchived = (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.reportID);
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return Navigation_1.default.goBack(ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(reportID, route.params.backTo)); });
    }, [reportID, route.params.backTo]);
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        // We should skip validation hence we return an empty errors and we skip Form submission on the onSubmit method
        if (values.roomName === (report === null || report === void 0 ? void 0 : report.reportName)) {
            return errors;
        }
        if (!values.roomName || values.roomName === CONST_1.default.POLICY.ROOM_PREFIX) {
            // We error if the user doesn't enter a room name or left blank
            (0, ErrorUtils_1.addErrorMessage)(errors, 'roomName', translate('newRoomPage.pleaseEnterRoomName'));
        }
        else if (!(0, ValidationUtils_1.isValidRoomNameWithoutLimits)(values.roomName)) {
            // We error if the room name has invalid characters
            (0, ErrorUtils_1.addErrorMessage)(errors, 'roomName', translate('newRoomPage.roomNameInvalidError'));
        }
        else if ((0, ValidationUtils_1.isReservedRoomName)(values.roomName)) {
            // Certain names are reserved for default rooms and should not be used for policy rooms.
            (0, ErrorUtils_1.addErrorMessage)(errors, 'roomName', translate('newRoomPage.roomNameReservedError', { reservedName: values.roomName }));
        }
        else if ((0, ValidationUtils_1.isExistingRoomName)(values.roomName, reports, report === null || report === void 0 ? void 0 : report.policyID)) {
            // The room name can't be set to one that already exists on the policy
            (0, ErrorUtils_1.addErrorMessage)(errors, 'roomName', translate('newRoomPage.roomAlreadyExistsError'));
        }
        else if (values.roomName.length > CONST_1.default.TITLE_CHARACTER_LIMIT) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'roomName', translate('common.error.characterLimitExceedCounter', { length: values.roomName.length, limit: CONST_1.default.TITLE_CHARACTER_LIMIT }));
        }
        return errors;
    }, [report, reports, translate]);
    var updatePolicyRoomName = (0, react_1.useCallback)(function (values) {
        (0, Report_1.updatePolicyRoomName)(report, values.roomName);
        goBack();
    }, [report, goBack]);
    return (<ScreenWrapper_1.default onEntryTransitionEnd={function () { var _a; return (_a = roomNameInputRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }} includeSafeAreaPaddingBottom testID={RoomNamePage.displayName}>
            <FullPageNotFoundView_1.default shouldShow={(0, ReportUtils_1.shouldDisableRename)(report, isReportArchived)}>
                <HeaderWithBackButton_1.default title={translate('newRoomPage.roomName')} onBackButtonPress={goBack}/>
                <FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.ROOM_NAME_FORM} onSubmit={updatePolicyRoomName} validate={validate} submitButtonText={translate('common.save')} enabledWhenOffline shouldHideFixErrorsAlert>
                    <react_native_1.View style={styles.mb4}>
                        <InputWrapper_1.default InputComponent={RoomNameInput_1.default} ref={roomNameInputRef} inputID={RoomNameForm_1.default.ROOM_NAME} defaultValue={report === null || report === void 0 ? void 0 : report.reportName} isFocused={isFocused}/>
                    </react_native_1.View>
                </FormProvider_1.default>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
RoomNamePage.displayName = 'RoomNamePage';
exports.default = RoomNamePage;
