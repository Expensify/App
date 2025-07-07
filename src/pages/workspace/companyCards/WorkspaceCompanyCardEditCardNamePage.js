"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWorkspaceAccountID_1 = require("@hooks/useWorkspaceAccountID");
var CardUtils_1 = require("@libs/CardUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var Navigation_1 = require("@navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EditExpensifyCardNameForm_1 = require("@src/types/form/EditExpensifyCardNameForm");
function WorkspaceCompanyCardEditCardNamePage(_a) {
    var _b;
    var route = _a.route;
    var _c = route.params, policyID = _c.policyID, cardID = _c.cardID;
    var workspaceAccountID = (0, useWorkspaceAccountID_1.default)(policyID);
    var bank = decodeURIComponent(route.params.bank);
    var customCardNames = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES, { canBeMissing: true })[0];
    var defaultValue = (_b = customCardNames === null || customCardNames === void 0 ? void 0 : customCardNames[cardID]) !== null && _b !== void 0 ? _b : (0, CardUtils_1.getCustomCardName)(cardID);
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var styles = (0, useThemeStyles_1.default)();
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var companyFeeds = (0, CardUtils_1.getCompanyFeeds)(cardFeeds);
    var domainOrWorkspaceAccountID = (0, CardUtils_1.getDomainOrWorkspaceAccountID)(workspaceAccountID, companyFeeds[bank]);
    var submit = function (values) {
        (0, CompanyCards_1.updateCompanyCardName)(domainOrWorkspaceAccountID, cardID, values[EditExpensifyCardNameForm_1.default.NAME], bank, defaultValue);
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, cardID, bank), { compareParams: false });
    };
    var validate = function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [EditExpensifyCardNameForm_1.default.NAME]);
        var length = values.name.length;
        if (length > CONST_1.default.STANDARD_LENGTH_LIMIT) {
            (0, ErrorUtils_1.addErrorMessage)(errors, EditExpensifyCardNameForm_1.default.NAME, translate('common.error.characterLimitExceedCounter', {
                length: length,
                limit: CONST_1.default.STANDARD_LENGTH_LIMIT,
            }));
        }
        return errors;
    };
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceCompanyCardEditCardNamePage.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.moreFeatures.companyCards.cardName')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_COMPANY_CARD_DETAILS.getRoute(policyID, cardID, bank), { compareParams: false }); }}/>
                <Text_1.default style={[styles.mh5, styles.mt3, styles.mb5]}>{translate('workspace.moreFeatures.companyCards.giveItNameInstruction')}</Text_1.default>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.EDIT_WORKSPACE_COMPANY_CARD_NAME_FORM} submitButtonText={translate('common.save')} onSubmit={submit} style={[styles.flex1, styles.mh5]} enabledWhenOffline validate={validate} shouldHideFixErrorsAlert>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={EditExpensifyCardNameForm_1.default.NAME} label={translate('workspace.moreFeatures.companyCards.cardName')} aria-label={translate('workspace.moreFeatures.companyCards.cardName')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={defaultValue} ref={inputCallbackRef}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceCompanyCardEditCardNamePage.displayName = 'WorkspaceCompanyCardEditCardNamePage';
exports.default = WorkspaceCompanyCardEditCardNamePage;
