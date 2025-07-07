"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var Card_1 = require("@userActions/Card");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var IssueNewExpensifyCardForm_1 = require("@src/types/form/IssueNewExpensifyCardForm");
function CardNameStep(_a) {
    var _b, _c, _d;
    var policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var issueNewCard = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD).concat(policyID))[0];
    var isEditing = issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.isEditing;
    var data = issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.data;
    var userName = (0, PersonalDetailsUtils_1.getUserNameByEmail)((_b = data === null || data === void 0 ? void 0 : data.assigneeEmail) !== null && _b !== void 0 ? _b : '', 'firstName');
    var defaultCardTitle = (data === null || data === void 0 ? void 0 : data.cardType) !== CONST_1.default.EXPENSIFY_CARD.CARD_TYPE.VIRTUAL ? (0, CardUtils_1.getDefaultCardName)(userName) : '';
    var validate = function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [IssueNewExpensifyCardForm_1.default.CARD_TITLE]);
        var length = values.cardTitle.length;
        if (length > CONST_1.default.STANDARD_LENGTH_LIMIT) {
            (0, ErrorUtils_1.addErrorMessage)(errors, IssueNewExpensifyCardForm_1.default.CARD_TITLE, translate('common.error.characterLimitExceedCounter', { length: length, limit: CONST_1.default.STANDARD_LENGTH_LIMIT }));
        }
        return errors;
    };
    var submit = (0, react_1.useCallback)(function (values) {
        (0, Card_1.setIssueNewCardStepAndData)({
            step: CONST_1.default.EXPENSIFY_CARD.STEP.CONFIRMATION,
            data: {
                cardTitle: values.cardTitle,
            },
            isEditing: false,
            policyID: policyID,
        });
    }, [policyID]);
    var handleBackButtonPress = (0, react_1.useCallback)(function () {
        if (isEditing) {
            (0, Card_1.setIssueNewCardStepAndData)({ step: CONST_1.default.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID: policyID });
            return;
        }
        (0, Card_1.setIssueNewCardStepAndData)({ step: CONST_1.default.EXPENSIFY_CARD.STEP.LIMIT, policyID: policyID });
    }, [isEditing, policyID]);
    return (<InteractiveStepWrapper_1.default wrapperID={CardNameStep.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight headerTitle={translate('workspace.card.issueCard')} handleBackButtonPress={handleBackButtonPress} startStepIndex={4} stepNames={CONST_1.default.EXPENSIFY_CARD.STEP_NAMES} enableEdgeToEdgeBottomSafeAreaPadding>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.giveItName')}</Text_1.default>
            <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} onSubmit={submit} validate={validate} style={[styles.mh5, styles.flexGrow1]} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={IssueNewExpensifyCardForm_1.default.CARD_TITLE} label={translate('workspace.card.issueNewCard.cardName')} hint={translate('workspace.card.issueNewCard.giveItNameInstruction')} aria-label={translate('workspace.card.issueNewCard.cardName')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={(_d = (_c = issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.data) === null || _c === void 0 ? void 0 : _c.cardTitle) !== null && _d !== void 0 ? _d : defaultCardTitle} containerStyles={[styles.mb6]} ref={inputCallbackRef}/>
            </FormProvider_1.default>
        </InteractiveStepWrapper_1.default>);
}
CardNameStep.displayName = 'CardNameStep';
exports.default = CardNameStep;
