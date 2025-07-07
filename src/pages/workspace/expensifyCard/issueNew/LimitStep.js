"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AmountForm_1 = require("@components/AmountForm");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var InteractiveStepWrapper_1 = require("@components/InteractiveStepWrapper");
var Text_1 = require("@components/Text");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Card_1 = require("@libs/actions/Card");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var IssueNewExpensifyCardForm_1 = require("@src/types/form/IssueNewExpensifyCardForm");
function LimitStep(_a) {
    var _b;
    var policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var styles = (0, useThemeStyles_1.default)();
    var issueNewCard = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.ISSUE_NEW_EXPENSIFY_CARD).concat(policyID))[0];
    var isEditing = issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.isEditing;
    var submit = (0, react_1.useCallback)(function (values) {
        var limit = (0, CurrencyUtils_1.convertToBackendAmount)(Number(values === null || values === void 0 ? void 0 : values.limit));
        (0, Card_1.setIssueNewCardStepAndData)({
            step: isEditing ? CONST_1.default.EXPENSIFY_CARD.STEP.CONFIRMATION : CONST_1.default.EXPENSIFY_CARD.STEP.CARD_NAME,
            data: { limit: limit },
            isEditing: false,
            policyID: policyID,
        });
    }, [isEditing, policyID]);
    var handleBackButtonPress = (0, react_1.useCallback)(function () {
        if (isEditing) {
            (0, Card_1.setIssueNewCardStepAndData)({ step: CONST_1.default.EXPENSIFY_CARD.STEP.CONFIRMATION, isEditing: false, policyID: policyID });
            return;
        }
        (0, Card_1.setIssueNewCardStepAndData)({ step: CONST_1.default.EXPENSIFY_CARD.STEP.LIMIT_TYPE, policyID: policyID });
    }, [isEditing, policyID]);
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [IssueNewExpensifyCardForm_1.default.LIMIT]);
        // We only want integers to be sent as the limit
        if (!Number(values.limit)) {
            errors.limit = translate('iou.error.invalidAmount');
        }
        else if (!Number.isInteger(Number(values.limit))) {
            errors.limit = translate('iou.error.invalidIntegerAmount');
        }
        if (Number(values.limit) > CONST_1.default.EXPENSIFY_CARD.LIMIT_VALUE) {
            errors.limit = translate('workspace.card.issueNewCard.cardLimitError');
        }
        return errors;
    }, [translate]);
    return (<InteractiveStepWrapper_1.default wrapperID={LimitStep.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight headerTitle={translate('workspace.card.issueCard')} handleBackButtonPress={handleBackButtonPress} startStepIndex={3} stepNames={CONST_1.default.EXPENSIFY_CARD.STEP_NAMES} enableEdgeToEdgeBottomSafeAreaPadding>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mv3]}>{translate('workspace.card.issueNewCard.setLimit')}</Text_1.default>
            <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.ISSUE_NEW_EXPENSIFY_CARD_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} shouldHideFixErrorsAlert onSubmit={submit} style={[styles.flex1]} submitButtonStyles={[styles.mh5, styles.mt0]} submitFlexEnabled={false} disablePressOnEnter={false} validate={validate} enabledWhenOffline addBottomSafeAreaPadding>
                <InputWrapper_1.default InputComponent={AmountForm_1.default} defaultValue={(0, CurrencyUtils_1.convertToFrontendAmountAsString)((_b = issueNewCard === null || issueNewCard === void 0 ? void 0 : issueNewCard.data) === null || _b === void 0 ? void 0 : _b.limit, CONST_1.default.CURRENCY.USD, false)} isCurrencyPressable={false} inputID={IssueNewExpensifyCardForm_1.default.LIMIT} ref={inputCallbackRef}/>
            </FormProvider_1.default>
        </InteractiveStepWrapper_1.default>);
}
LimitStep.displayName = 'LimitStep';
exports.default = LimitStep;
