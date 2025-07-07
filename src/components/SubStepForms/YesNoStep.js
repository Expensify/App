"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var RadioButtons_1 = require("@components/RadioButtons");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function YesNoStep(_a) {
    var title = _a.title, description = _a.description, defaultValue = _a.defaultValue, onSelectedValue = _a.onSelectedValue, submitButtonStyles = _a.submitButtonStyles, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, react_1.useState)(defaultValue), value = _c[0], setValue = _c[1];
    var handleSubmit = function () {
        onSelectedValue(value);
    };
    var handleSelectValue = function (newValue) { return setValue(newValue === 'true'); };
    var options = (0, react_1.useMemo)(function () { return [
        {
            label: translate('common.yes'),
            value: 'true',
        },
        {
            label: translate('common.no'),
            value: 'false',
        },
    ]; }, [translate]);
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.REIMBURSEMENT_ACCOUNT_FORM} submitButtonText={translate('common.confirm')} onSubmit={handleSubmit} style={[styles.mh5, styles.flexGrow1]} submitButtonStyles={submitButtonStyles} isLoading={isLoading} shouldHideFixErrorsAlert>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL]}>{title}</Text_1.default>
            <Text_1.default style={[styles.pv3, styles.textSupporting]}>{description}</Text_1.default>
            <RadioButtons_1.default items={options} onPress={handleSelectValue} defaultCheckedValue={defaultValue.toString()} radioButtonStyle={[styles.mb6]}/>
        </FormProvider_1.default>);
}
YesNoStep.displayName = 'YesNoStep';
exports.default = YesNoStep;
