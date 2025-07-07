"use strict";
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
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WorkspaceConfirmationForm_1 = require("@src/types/form/WorkspaceConfirmationForm");
var isLoadingOnyxValue_1 = require("@src/types/utils/isLoadingOnyxValue");
var Avatar_1 = require("./Avatar");
var AvatarWithImagePicker_1 = require("./AvatarWithImagePicker");
var CurrencyPicker_1 = require("./CurrencyPicker");
var FormProvider_1 = require("./Form/FormProvider");
var InputWrapper_1 = require("./Form/InputWrapper");
var HeaderWithBackButton_1 = require("./HeaderWithBackButton");
var Expensicons = require("./Icon/Expensicons");
var ScrollView_1 = require("./ScrollView");
var Text_1 = require("./Text");
var TextInput_1 = require("./TextInput");
function getFirstAlphaNumericCharacter(str) {
    if (str === void 0) { str = ''; }
    return str
        .normalize('NFD')
        .replace(/[^0-9a-z]/gi, '')
        .toUpperCase()[0];
}
function WorkspaceConfirmationForm(_a) {
    var _b, _c, _d, _e;
    var onSubmit = _a.onSubmit, _f = _a.policyOwnerEmail, policyOwnerEmail = _f === void 0 ? '' : _f, _g = _a.onBackButtonPress, onBackButtonPress = _g === void 0 ? function () { return Navigation_1.default.goBack(); } : _g;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        var name = values.name.trim();
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(name)) {
            errors.name = translate('workspace.editor.nameIsRequiredError');
        }
        else if (__spreadArray([], name, true).length > CONST_1.default.TITLE_CHARACTER_LIMIT) {
            // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16
            // code units.
            (0, ErrorUtils_1.addErrorMessage)(errors, 'name', translate('common.error.characterLimitExceedCounter', { length: __spreadArray([], name, true).length, limit: CONST_1.default.TITLE_CHARACTER_LIMIT }));
        }
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(values[WorkspaceConfirmationForm_1.default.CURRENCY])) {
            errors[WorkspaceConfirmationForm_1.default.CURRENCY] = translate('common.error.fieldRequired');
        }
        return errors;
    }, [translate]);
    var policyID = (0, react_1.useMemo)(function () { return (0, Policy_1.generatePolicyID)(); }, []);
    var _h = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false }), session = _h[0], metadata = _h[1];
    var allPersonalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var defaultWorkspaceName = (0, Policy_1.generateDefaultWorkspaceName)(policyOwnerEmail || (session === null || session === void 0 ? void 0 : session.email));
    var _j = (0, react_1.useState)(defaultWorkspaceName !== null && defaultWorkspaceName !== void 0 ? defaultWorkspaceName : ''), workspaceNameFirstCharacter = _j[0], setWorkspaceNameFirstCharacter = _j[1];
    var userCurrency = (_d = (_c = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[(_b = session === null || session === void 0 ? void 0 : session.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID]) === null || _c === void 0 ? void 0 : _c.localCurrencyCode) !== null && _d !== void 0 ? _d : CONST_1.default.CURRENCY.USD;
    var currencyList = (0, useOnyx_1.default)(ONYXKEYS_1.default.CURRENCY_LIST, { canBeMissing: false })[0];
    var route = (0, native_1.useRoute)();
    var currencyParam = route.params && 'currency' in route.params && !!route.params.currency ? route.params.currency : undefined;
    var currencyValue = !!currencyList && currencyParam && currencyParam in currencyList ? currencyParam : userCurrency;
    var currency = (0, react_1.useState)(currencyValue)[0];
    (0, react_1.useEffect)(function () {
        Navigation_1.default.setParams({ currency: currency });
    }, [currency]);
    var _k = (0, react_1.useState)({
        avatarUri: null,
        avatarFileName: null,
        avatarFileType: null,
    }), workspaceAvatar = _k[0], setWorkspaceAvatar = _k[1];
    var _l = (0, react_1.useState)(), avatarFile = _l[0], setAvatarFile = _l[1];
    var stashedLocalAvatarImage = (_e = workspaceAvatar === null || workspaceAvatar === void 0 ? void 0 : workspaceAvatar.avatarUri) !== null && _e !== void 0 ? _e : undefined;
    var DefaultAvatar = (0, react_1.useCallback)(function () { return (<Avatar_1.default containerStyles={styles.avatarXLarge} imageStyles={[styles.avatarXLarge, styles.alignSelfCenter]} 
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- nullish coalescing cannot be used if left side can be empty string
    source={(workspaceAvatar === null || workspaceAvatar === void 0 ? void 0 : workspaceAvatar.avatarUri) || (0, ReportUtils_1.getDefaultWorkspaceAvatar)(workspaceNameFirstCharacter)} fallbackIcon={Expensicons.FallbackWorkspaceAvatar} size={CONST_1.default.AVATAR_SIZE.X_LARGE} name={workspaceNameFirstCharacter} avatarID={policyID} type={CONST_1.default.ICON_TYPE_WORKSPACE}/>); }, [workspaceAvatar === null || workspaceAvatar === void 0 ? void 0 : workspaceAvatar.avatarUri, workspaceNameFirstCharacter, styles.alignSelfCenter, styles.avatarXLarge, policyID]);
    return (<>
            <HeaderWithBackButton_1.default title={translate('workspace.new.confirmWorkspace')} onBackButtonPress={onBackButtonPress}/>
            <ScrollView_1.default contentContainerStyle={styles.flexGrow1} keyboardShouldPersistTaps="always">
                <react_native_1.View style={[styles.ph5, styles.pv3]}>
                    <Text_1.default style={[styles.mb3, styles.webViewStyles.baseFontStyle, styles.textSupporting]}>{translate('workspace.emptyWorkspace.subtitle')}</Text_1.default>
                </react_native_1.View>
                <AvatarWithImagePicker_1.default isUsingDefaultAvatar={!stashedLocalAvatarImage} 
    // eslint-disable-next-line react-compiler/react-compiler
    avatarID={policyID} source={stashedLocalAvatarImage} onImageSelected={function (image) {
            var _a, _b;
            setAvatarFile(image);
            setWorkspaceAvatar({ avatarUri: (_a = image.uri) !== null && _a !== void 0 ? _a : '', avatarFileName: (_b = image.name) !== null && _b !== void 0 ? _b : '', avatarFileType: image.type });
        }} onImageRemoved={function () {
            setAvatarFile(undefined);
            setWorkspaceAvatar({ avatarUri: null, avatarFileName: null, avatarFileType: null });
        }} size={CONST_1.default.AVATAR_SIZE.X_LARGE} avatarStyle={[styles.avatarXLarge, styles.alignSelfCenter]} shouldDisableViewPhoto editIcon={Expensicons.Camera} editIconStyle={styles.smallEditIconAccount} type={CONST_1.default.ICON_TYPE_WORKSPACE} style={[styles.w100, styles.alignItemsCenter, styles.mv4, styles.mb6, styles.alignSelfCenter, styles.ph5]} DefaultAvatar={DefaultAvatar} editorMaskImage={Expensicons.ImageCropSquareMask}/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_CONFIRMATION_FORM} submitButtonText={translate('common.confirm')} style={[styles.flexGrow1, styles.ph5]} scrollContextEnabled validate={validate} onSubmit={function (val) {
            return onSubmit({
                name: val[WorkspaceConfirmationForm_1.default.NAME],
                currency: val[WorkspaceConfirmationForm_1.default.CURRENCY],
                avatarFile: avatarFile,
                policyID: policyID,
            });
        }} enabledWhenOffline addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.mb4}>
                        {!(0, isLoadingOnyxValue_1.default)(metadata) && (<InputWrapper_1.default InputComponent={TextInput_1.default} role={CONST_1.default.ROLE.PRESENTATION} inputID={WorkspaceConfirmationForm_1.default.NAME} label={translate('workspace.common.workspaceName')} accessibilityLabel={translate('workspace.common.workspaceName')} spellCheck={false} defaultValue={defaultWorkspaceName} onChangeText={function (str) {
                if (getFirstAlphaNumericCharacter(str) === getFirstAlphaNumericCharacter(workspaceNameFirstCharacter)) {
                    return;
                }
                setWorkspaceNameFirstCharacter(str);
            }} ref={inputCallbackRef}/>)}

                        <react_native_1.View style={[styles.mhn5, styles.mt4]}>
                            <InputWrapper_1.default InputComponent={CurrencyPicker_1.default} inputID={WorkspaceConfirmationForm_1.default.CURRENCY} label={translate('workspace.editor.currencyInputLabel')} defaultValue={currency} shouldSyncPickerVisibilityWithNavigation shouldSaveCurrencyInNavigation/>
                        </react_native_1.View>
                    </react_native_1.View>
                </FormProvider_1.default>
            </ScrollView_1.default>
        </>);
}
WorkspaceConfirmationForm.displayName = 'WorkspaceConfirmationForm';
exports.default = WorkspaceConfirmationForm;
