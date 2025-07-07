"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWorkspaceAccountID_1 = require("@hooks/useWorkspaceAccountID");
var Card_1 = require("@libs/actions/Card");
var CardUtils_1 = require("@libs/CardUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var Navigation_1 = require("@navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var EditExpensifyCardNameForm_1 = require("@src/types/form/EditExpensifyCardNameForm");
function WorkspaceEditCardNamePage(_a) {
    var _b;
    var route = _a.route;
    var _c = route.params, policyID = _c.policyID, cardID = _c.cardID, backTo = _c.backTo;
    var workspaceAccountID = (0, useWorkspaceAccountID_1.default)(policyID);
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var styles = (0, useThemeStyles_1.default)();
    var cardsList = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(workspaceAccountID, "_").concat(CONST_1.default.EXPENSIFY_CARD.BANK), { selector: CardUtils_1.filterInactiveCards })[0];
    var card = cardsList === null || cardsList === void 0 ? void 0 : cardsList[cardID];
    var isWorkspaceRhp = route.name === SCREENS_1.default.WORKSPACE.EXPENSIFY_CARD_NAME;
    var goBack = (0, react_1.useCallback)(function () {
        if (backTo) {
            Navigation_1.default.goBack(backTo);
            return;
        }
        Navigation_1.default.goBack(isWorkspaceRhp ? ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(policyID, cardID) : ROUTES_1.default.EXPENSIFY_CARD_DETAILS.getRoute(policyID, cardID));
    }, [backTo, isWorkspaceRhp, policyID, cardID]);
    var submit = function (values) {
        var _a;
        (0, Card_1.updateExpensifyCardTitle)(workspaceAccountID, Number(cardID), values[EditExpensifyCardNameForm_1.default.NAME], (_a = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _a === void 0 ? void 0 : _a.cardTitle);
        goBack();
    };
    var validate = function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [EditExpensifyCardNameForm_1.default.NAME]);
        var length = values.name.length;
        if (length > CONST_1.default.STANDARD_LENGTH_LIMIT) {
            (0, ErrorUtils_1.addErrorMessage)(errors, EditExpensifyCardNameForm_1.default.NAME, translate('common.error.characterLimitExceedCounter', { length: length, limit: CONST_1.default.STANDARD_LENGTH_LIMIT }));
        }
        return errors;
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceEditCardNamePage.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.card.issueNewCard.cardName')} onBackButtonPress={goBack}/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.EDIT_EXPENSIFY_CARD_NAME_FORM} submitButtonText={translate('common.save')} onSubmit={submit} style={[styles.flex1, styles.mh5]} enabledWhenOffline validate={validate} shouldHideFixErrorsAlert>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={EditExpensifyCardNameForm_1.default.NAME} label={translate('workspace.card.issueNewCard.cardName')} hint={translate('workspace.card.issueNewCard.giveItNameInstruction')} aria-label={translate('workspace.card.issueNewCard.cardName')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={(_b = card === null || card === void 0 ? void 0 : card.nameValuePairs) === null || _b === void 0 ? void 0 : _b.cardTitle} ref={inputCallbackRef}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceEditCardNamePage.displayName = 'WorkspaceEditCardNamePage';
exports.default = WorkspaceEditCardNamePage;
