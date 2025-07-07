"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@react-navigation/core");
var react_1 = require("react");
var react_native_1 = require("react-native");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var Button_1 = require("@components/Button");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Illustrations = require("@components/Icon/Illustrations");
var RoomNameInput_1 = require("@components/RoomNameInput");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TextInput_1 = require("@components/TextInput");
var ValuePicker_1 = require("@components/ValuePicker");
var useBottomSafeSafeAreaPaddingStyle_1 = require("@hooks/useBottomSafeSafeAreaPaddingStyle");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useSafeAreaInsets_1 = require("@hooks/useSafeAreaInsets");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var LocaleCompare_1 = require("@libs/LocaleCompare");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var variables_1 = require("@styles/variables");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var NewRoomForm_1 = require("@src/types/form/NewRoomForm");
function EmptyWorkspaceView() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var bottomSafeAreaPaddingStyle = (0, useBottomSafeSafeAreaPaddingStyle_1.default)({ addBottomSafeAreaPadding: true, additionalPaddingBottom: styles.mb5.marginBottom, styleProperty: 'marginBottom' });
    return (<>
            <BlockingView_1.default icon={Illustrations.TeleScope} iconWidth={variables_1.default.emptyListIconWidth} iconHeight={variables_1.default.emptyListIconHeight} title={translate('workspace.emptyWorkspace.notFound')} subtitle={translate('workspace.emptyWorkspace.description')} shouldShowLink={false} addBottomSafeAreaPadding/>
            <Button_1.default success large text={translate('footer.learnMore')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACES_LIST.getRoute(Navigation_1.default.getActiveRoute())); }} style={[styles.mh5, bottomSafeAreaPaddingStyle]}/>
        </>);
}
function WorkspaceNewRoomPage(_, ref) {
    var styles = (0, useThemeStyles_1.default)();
    var isFocused = (0, core_1.useIsFocused)();
    var translate = (0, useLocalize_1.default)().translate;
    var _a = (0, react_1.useState)(false), shouldEnableValidation = _a[0], setShouldEnableValidation = _a[1];
    var policies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: false })[0];
    var reports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: false })[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: false })[0];
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to show offline indicator on small screen only
    var top = (0, useSafeAreaInsets_1.default)().top;
    var _b = (0, react_1.useState)(CONST_1.default.REPORT.VISIBILITY.RESTRICTED), visibility = _b[0], setVisibility = _b[1];
    var _c = (0, react_1.useState)(CONST_1.default.REPORT.WRITE_CAPABILITIES.ALL), writeCapability = _c[0], setWriteCapability = _c[1];
    var visibilityDescription = (0, react_1.useMemo)(function () { return translate("newRoomPage.".concat(visibility, "Description")); }, [translate, visibility]);
    var roomPageInputRef = (0, react_1.useRef)(null);
    (0, react_1.useImperativeHandle)(ref, function () { return ({
        focus: function () { var _a; return (_a = roomPageInputRef.current) === null || _a === void 0 ? void 0 : _a.focus(); },
    }); });
    var workspaceOptions = (0, react_1.useMemo)(function () {
        var _a, _b;
        return (_b = (_a = (0, PolicyUtils_1.getActivePolicies)(policies, session === null || session === void 0 ? void 0 : session.email)) === null || _a === void 0 ? void 0 : _a.filter(function (policy) { return policy.type !== CONST_1.default.POLICY.TYPE.PERSONAL; }).map(function (policy) { return ({
            label: policy.name,
            value: policy.id,
        }); }).sort(function (a, b) { return (0, LocaleCompare_1.default)(a.label, b.label); })) !== null && _b !== void 0 ? _b : [];
    }, [policies, session === null || session === void 0 ? void 0 : session.email]);
    var _d = (0, react_1.useState)(function () {
        if (!!activePolicyID && workspaceOptions.some(function (option) { return option.value === activePolicyID; })) {
            return activePolicyID;
        }
        return '';
    }), policyID = _d[0], setPolicyID = _d[1];
    var isAdminPolicy = (0, react_1.useMemo)(function () {
        if (!policyID) {
            return false;
        }
        return (0, ReportUtils_1.isPolicyAdmin)(policyID, policies);
    }, [policyID, policies]);
    /**
     * @param values - form input values passed by the Form component
     */
    var submit = function (values) {
        var _a, _b;
        (0, Report_1.setNewRoomFormLoading)();
        var participants = [(_a = session === null || session === void 0 ? void 0 : session.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID];
        var parsedDescription = (0, ReportUtils_1.getParsedComment)((_b = values.reportDescription) !== null && _b !== void 0 ? _b : '', { policyID: policyID });
        var policyReport = (0, ReportUtils_1.buildOptimisticChatReport)({
            participantList: participants,
            reportName: values.roomName,
            chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM,
            policyID: policyID,
            ownerAccountID: CONST_1.default.REPORT.OWNER_ACCOUNT_ID_FAKE,
            visibility: visibility,
            writeCapability: writeCapability || CONST_1.default.REPORT.WRITE_CAPABILITIES.ALL,
            notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.DAILY,
            description: parsedDescription,
        });
        react_native_1.InteractionManager.runAfterInteractions(function () {
            requestAnimationFrame(function () {
                (0, Report_1.addPolicyReport)(policyReport);
            });
        });
    };
    (0, react_1.useEffect)(function () {
        if (!isFocused) {
            return;
        }
        setShouldEnableValidation(false);
        (0, Report_1.clearNewRoomFormError)().then(function () { return setShouldEnableValidation(true); });
    }, [isFocused]);
    (0, react_1.useEffect)(function () {
        if (policyID) {
            if (!workspaceOptions.some(function (opt) { return opt.value === policyID; })) {
                setPolicyID('');
            }
            return;
        }
        if (!!activePolicyID && workspaceOptions.some(function (opt) { return opt.value === activePolicyID; })) {
            setPolicyID(activePolicyID);
        }
        else {
            setPolicyID('');
        }
    }, [activePolicyID, policyID, workspaceOptions]);
    (0, react_1.useEffect)(function () {
        if (isAdminPolicy) {
            return;
        }
        setWriteCapability(CONST_1.default.REPORT.WRITE_CAPABILITIES.ALL);
    }, [isAdminPolicy]);
    /**
     * @param values - form input values passed by the Form component
     * @returns an object containing validation errors, if any were found during validation
     */
    var validate = (0, react_1.useCallback)(function (values) {
        if (!shouldEnableValidation) {
            return {};
        }
        var errors = {};
        if (!values.roomName || values.roomName === CONST_1.default.POLICY.ROOM_PREFIX) {
            // We error if the user doesn't enter a room name or left blank
            (0, ErrorUtils_1.addErrorMessage)(errors, 'roomName', translate('newRoomPage.pleaseEnterRoomName'));
        }
        else if (values.roomName !== CONST_1.default.POLICY.ROOM_PREFIX && !(0, ValidationUtils_1.isValidRoomNameWithoutLimits)(values.roomName)) {
            // We error if the room name has invalid characters
            (0, ErrorUtils_1.addErrorMessage)(errors, 'roomName', translate('newRoomPage.roomNameInvalidError'));
        }
        else if ((0, ValidationUtils_1.isReservedRoomName)(values.roomName)) {
            // Certain names are reserved for default rooms and should not be used for policy rooms.
            (0, ErrorUtils_1.addErrorMessage)(errors, 'roomName', translate('newRoomPage.roomNameReservedError', { reservedName: values.roomName }));
        }
        else if ((0, ValidationUtils_1.isExistingRoomName)(values.roomName, reports, values.policyID)) {
            // Certain names are reserved for default rooms and should not be used for policy rooms.
            (0, ErrorUtils_1.addErrorMessage)(errors, 'roomName', translate('newRoomPage.roomAlreadyExistsError'));
        }
        else if (values.roomName.length > CONST_1.default.TITLE_CHARACTER_LIMIT) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'roomName', translate('common.error.characterLimitExceedCounter', { length: values.roomName.length, limit: CONST_1.default.TITLE_CHARACTER_LIMIT }));
        }
        var descriptionLength = (0, ReportUtils_1.getCommentLength)(values.reportDescription, { policyID: policyID });
        if (descriptionLength > CONST_1.default.REPORT_DESCRIPTION.MAX_LENGTH) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'reportDescription', translate('common.error.characterLimitExceedCounter', { length: descriptionLength, limit: CONST_1.default.REPORT_DESCRIPTION.MAX_LENGTH }));
        }
        if (!values.policyID) {
            errors.policyID = translate('newRoomPage.pleaseSelectWorkspace');
        }
        return errors;
    }, [reports, policyID, translate, shouldEnableValidation]);
    var writeCapabilityOptions = (0, react_1.useMemo)(function () {
        return Object.values(CONST_1.default.REPORT.WRITE_CAPABILITIES).map(function (value) { return ({
            value: value,
            label: translate("writeCapabilityPage.writeCapability.".concat(value)),
        }); });
    }, [translate]);
    var visibilityOptions = (0, react_1.useMemo)(function () {
        return Object.values(CONST_1.default.REPORT.VISIBILITY)
            .filter(function (visibilityOption) { return visibilityOption !== CONST_1.default.REPORT.VISIBILITY.PUBLIC_ANNOUNCE; })
            .map(function (visibilityOption) { return ({
            label: translate("newRoomPage.visibilityOptions.".concat(visibilityOption)),
            value: visibilityOption,
            description: translate("newRoomPage.".concat(visibilityOption, "Description")),
        }); });
    }, [translate]);
    return (<ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding includePaddingTop={false} shouldShowOfflineIndicator shouldEnablePickerAvoiding={false} shouldEnableKeyboardAvoidingView={workspaceOptions.length !== 0} keyboardVerticalOffset={variables_1.default.contentHeaderHeight + variables_1.default.tabSelectorButtonHeight + variables_1.default.tabSelectorButtonPadding + top} 
    // Disable the focus trap of this page to activate the parent focus trap in `NewChatSelectorPage`.
    focusTrapSettings={{ active: false }} testID={WorkspaceNewRoomPage.displayName}>
            {workspaceOptions.length === 0 ? (<EmptyWorkspaceView />) : (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.NEW_ROOM_FORM} submitButtonText={translate('newRoomPage.createRoom')} style={[styles.h100, styles.mh5, styles.flexGrow1]} validate={validate} onSubmit={submit} enabledWhenOffline addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.mb5}>
                        <InputWrapper_1.default ref={roomPageInputRef} InputComponent={RoomNameInput_1.default} inputID={NewRoomForm_1.default.ROOM_NAME} isFocused={isFocused}/>
                    </react_native_1.View>
                    <react_native_1.View style={styles.mb5}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={NewRoomForm_1.default.REPORT_DESCRIPTION} label={translate('reportDescriptionPage.roomDescriptionOptional')} accessibilityLabel={translate('reportDescriptionPage.roomDescriptionOptional')} role={CONST_1.default.ROLE.PRESENTATION} autoGrowHeight maxAutoGrowHeight={variables_1.default.textInputAutoGrowMaxHeight} autoCapitalize="none" shouldInterceptSwipe type="markdown"/>
                    </react_native_1.View>
                    <react_native_1.View style={[styles.mhn5]}>
                        <InputWrapper_1.default InputComponent={ValuePicker_1.default} inputID={NewRoomForm_1.default.POLICY_ID} label={translate('workspace.common.workspace')} items={workspaceOptions} value={policyID} onValueChange={function (value) { return setPolicyID(value); }}/>
                    </react_native_1.View>
                    {isAdminPolicy && (<react_native_1.View style={styles.mhn5}>
                            <InputWrapper_1.default InputComponent={ValuePicker_1.default} inputID={NewRoomForm_1.default.WRITE_CAPABILITY} label={translate('writeCapabilityPage.label')} items={writeCapabilityOptions} value={writeCapability} onValueChange={function (value) { return setWriteCapability(value); }}/>
                        </react_native_1.View>)}
                    <react_native_1.View style={[styles.mb1, styles.mhn5]}>
                        <InputWrapper_1.default InputComponent={ValuePicker_1.default} inputID={NewRoomForm_1.default.VISIBILITY} label={translate('newRoomPage.visibility')} items={visibilityOptions} onValueChange={function (value) { return setVisibility(value); }} value={visibility} furtherDetails={visibilityDescription} shouldShowTooltips={false}/>
                    </react_native_1.View>
                </FormProvider_1.default>)}
        </ScreenWrapper_1.default>);
}
WorkspaceNewRoomPage.displayName = 'WorkspaceNewRoomPage';
exports.default = (0, react_1.forwardRef)(WorkspaceNewRoomPage);
