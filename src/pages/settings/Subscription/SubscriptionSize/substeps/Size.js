"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useStepFormSubmit_1 = require("@hooks/useStepFormSubmit");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SubscriptionSizeForm_1 = require("@src/types/form/SubscriptionSizeForm");
function Size(_a) {
    var _b;
    var _c;
    var onNext = _a.onNext;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var privateSubscription = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION)[0];
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var updateValuesAndNavigateToNextStep = (0, useStepFormSubmit_1.default)({
        formId: ONYXKEYS_1.default.FORMS.SUBSCRIPTION_SIZE_FORM,
        fieldIds: [SubscriptionSizeForm_1.default.SUBSCRIPTION_SIZE],
        onNext: onNext,
        shouldSaveDraft: true,
    });
    var defaultValues = (_b = {},
        _b[SubscriptionSizeForm_1.default.SUBSCRIPTION_SIZE] = "".concat((_c = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.userCount) !== null && _c !== void 0 ? _c : ''),
        _b);
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = (0, ValidationUtils_1.getFieldRequiredErrors)(values, [SubscriptionSizeForm_1.default.SUBSCRIPTION_SIZE]);
        if (values[SubscriptionSizeForm_1.default.SUBSCRIPTION_SIZE] && !(0, ValidationUtils_1.isValidSubscriptionSize)(values[SubscriptionSizeForm_1.default.SUBSCRIPTION_SIZE])) {
            errors.subscriptionSize = translate('subscription.subscriptionSize.error.size');
        }
        if (Number(values[SubscriptionSizeForm_1.default.SUBSCRIPTION_SIZE]) === (privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.userCount)) {
            errors.subscriptionSize = translate('subscription.subscriptionSize.error.sameSize');
        }
        return errors;
    }, [privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.userCount, translate]);
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.SUBSCRIPTION_SIZE_FORM} submitButtonText={translate('common.next')} onSubmit={updateValuesAndNavigateToNextStep} validate={validate} style={[styles.mh5, styles.flexGrow1]} enabledWhenOffline shouldHideFixErrorsAlert>
            <react_native_1.View>
                <Text_1.default style={[styles.textNormalThemeText, styles.mb5]}>{translate('subscription.subscriptionSize.yourSize')}</Text_1.default>
                <InputWrapper_1.default InputComponent={TextInput_1.default} ref={inputCallbackRef} inputID={SubscriptionSizeForm_1.default.SUBSCRIPTION_SIZE} label={translate('subscription.subscriptionSize.subscriptionSize')} aria-label={translate('subscription.subscriptionSize.subscriptionSize')} role={CONST_1.default.ROLE.PRESENTATION} defaultValue={defaultValues[SubscriptionSizeForm_1.default.SUBSCRIPTION_SIZE]} shouldSaveDraft/>
                <Text_1.default style={[styles.formHelp, styles.mt2]}>{translate('subscription.subscriptionSize.eachMonth')}</Text_1.default>
                <Text_1.default style={[styles.formHelp, styles.mt2]}>{translate('subscription.subscriptionSize.note')}</Text_1.default>
            </react_native_1.View>
        </FormProvider_1.default>);
}
Size.displayName = 'SizeStep';
exports.default = Size;
