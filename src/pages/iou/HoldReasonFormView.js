"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var MoneyRequestHoldReasonForm_1 = require("@src/types/form/MoneyRequestHoldReasonForm");
function HoldReasonFormView(_a) {
    var backTo = _a.backTo, validate = _a.validate, onSubmit = _a.onSubmit;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom shouldEnableMaxHeight testID={HoldReasonFormView.displayName}>
            <HeaderWithBackButton_1.default title={translate('iou.holdExpense')} onBackButtonPress={function () { return Navigation_1.default.goBack(backTo); }}/>
            <FormProvider_1.default formID="moneyHoldReasonForm" submitButtonText={translate('iou.holdExpense')} style={[styles.flexGrow1, styles.ph5]} onSubmit={onSubmit} validate={validate} enabledWhenOffline shouldHideFixErrorsAlert>
                <Text_1.default style={styles.mb6}>{translate('iou.explainHold')}</Text_1.default>
                <react_native_1.View>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={MoneyRequestHoldReasonForm_1.default.COMMENT} valueType="string" name="comment" defaultValue={undefined} label={translate('iou.reason')} accessibilityLabel={translate('iou.reason')} ref={inputCallbackRef}/>
                </react_native_1.View>
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
HoldReasonFormView.displayName = 'HoldReasonFormViewProps';
exports.default = HoldReasonFormView;
