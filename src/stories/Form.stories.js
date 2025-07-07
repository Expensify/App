"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputError = exports.ServerError = exports.Loading = exports.Default = void 0;
exports.WithNativeEventHandler = WithNativeEventHandler;
var react_1 = require("react");
var react_native_1 = require("react-native");
var AddressSearch_1 = require("@components/AddressSearch");
var CheckboxWithLabel_1 = require("@components/CheckboxWithLabel");
var DatePicker_1 = require("@components/DatePicker");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var Picker_1 = require("@components/Picker");
var StateSelector_1 = require("@components/StateSelector");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var NetworkConnection_1 = require("@libs/NetworkConnection");
var ValidationUtils = require("@libs/ValidationUtils");
var FormActions = require("@userActions/FormActions");
var CONST_1 = require("@src/CONST");
var styles_1 = require("@src/styles");
var STORYBOOK_FORM_ID = 'TestForm';
var story = {
    title: 'Components/Form',
    component: FormProvider_1.default,
    subcomponents: {
        InputWrapper: InputWrapper_1.default,
        TextInput: TextInput_1.default,
        AddressSearch: AddressSearch_1.default,
        CheckboxWithLabel: CheckboxWithLabel_1.default,
        Picker: Picker_1.default,
        StateSelector: StateSelector_1.default,
        DatePicker: DatePicker_1.default,
    },
};
function Template(props) {
    var _a, _b;
    // Form consumes data from Onyx, so we initialize Onyx with the necessary data here
    NetworkConnection_1.default.setOfflineStatus(false);
    FormActions.setIsLoading(props.formID, !!((_a = props.formState) === null || _a === void 0 ? void 0 : _a.isLoading));
    FormActions.setDraftValues(props.formID, props.draftValues);
    if ((_b = props.formState) === null || _b === void 0 ? void 0 : _b.error) {
        FormActions.setErrors(props.formID, { error: props.formState.error });
    }
    else {
        FormActions.clearErrors(props.formID);
    }
    return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider_1.default {...props}>
            <react_native_1.View>
                <InputWrapper_1.default InputComponent={TextInput_1.default} role={CONST_1.default.ROLE.PRESENTATION} accessibilityLabel="Routing number" label="Routing number" inputID="routingNumber" shouldSaveDraft/>
            </react_native_1.View>
            <InputWrapper_1.default InputComponent={TextInput_1.default} role={CONST_1.default.ROLE.PRESENTATION} label="Account number" accessibilityLabel="Account number" inputID="accountNumber" containerStyles={styles_1.defaultStyles.mt4}/>
            <InputWrapper_1.default InputComponent={AddressSearch_1.default} label="Street" inputID="street" containerStyles={styles_1.defaultStyles.mt4} hint="common.noPO"/>
            <InputWrapper_1.default InputComponent={DatePicker_1.default} inputID="dob" label="Date of Birth" containerStyles={styles_1.defaultStyles.mt4}/>
            <react_native_1.View>
                <InputWrapper_1.default InputComponent={Picker_1.default} label="Fruit" inputID="pickFruit" onInputChange={function () { }} containerStyles={styles_1.defaultStyles.mt4} shouldSaveDraft items={[
            {
                label: 'Select a Fruit',
                value: '',
            },
            {
                label: 'Orange',
                value: 'orange',
            },
            {
                label: 'Apple',
                value: 'apple',
            },
        ]}/>
            </react_native_1.View>
            <InputWrapper_1.default InputComponent={Picker_1.default} label="Another Fruit" inputID="pickAnotherFruit" onInputChange={function () { }} containerStyles={styles_1.defaultStyles.mt4} items={[
            {
                label: 'Select a Fruit',
                value: '',
            },
            {
                label: 'Orange',
                value: 'orange',
            },
            {
                label: 'Apple',
                value: 'apple',
            },
        ]}/>
            <react_native_1.View style={styles_1.defaultStyles.mt4}>
                <InputWrapper_1.default InputComponent={StateSelector_1.default} inputID="state" shouldSaveDraft/>
            </react_native_1.View>
            <InputWrapper_1.default InputComponent={CheckboxWithLabel_1.default} inputID="checkbox" style={[styles_1.defaultStyles.mb4, styles_1.defaultStyles.mt5]} 
    // eslint-disable-next-line react/no-unstable-nested-components
    LabelComponent={function () { return <Text_1.default>I accept the Expensify Terms of Service</Text_1.default>; }}/>
        </FormProvider_1.default>);
}
/**
 * Story to exhibit the native event handlers for TextInput in the Form Component
 */
function WithNativeEventHandler(props) {
    var _a, _b;
    var _c = (0, react_1.useState)(''), log = _c[0], setLog = _c[1];
    // Form consumes data from Onyx, so we initialize Onyx with the necessary data here
    NetworkConnection_1.default.setOfflineStatus(false);
    FormActions.setIsLoading(props.formID, !!((_a = props.formState) === null || _a === void 0 ? void 0 : _a.isLoading));
    FormActions.setDraftValues(props.formID, props.draftValues);
    if ((_b = props.formState) === null || _b === void 0 ? void 0 : _b.error) {
        FormActions.setErrors(props.formID, { error: props.formState.error });
    }
    else {
        FormActions.clearErrors(props.formID);
    }
    return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider_1.default {...props}>
            <InputWrapper_1.default InputComponent={TextInput_1.default} role={CONST_1.default.ROLE.PRESENTATION} accessibilityLabel="Routing number" label="Routing number" inputID="routingNumber" onChangeText={setLog} shouldSaveDraft/>
            <Text_1.default>{"Entered routing number: ".concat(log)}</Text_1.default>
        </FormProvider_1.default>);
}
// Arguments can be passed to the component by binding
// See: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
var Default = Template.bind({});
exports.Default = Default;
var Loading = Template.bind({});
exports.Loading = Loading;
var ServerError = Template.bind({});
exports.ServerError = ServerError;
var InputError = Template.bind({});
exports.InputError = InputError;
var defaultArgs = {
    formID: STORYBOOK_FORM_ID,
    submitButtonText: 'Submit',
    validate: function (values) {
        var errors = {};
        if (!ValidationUtils.isRequiredFulfilled(values.routingNumber)) {
            errors.routingNumber = 'Please enter a routing number';
        }
        if (!ValidationUtils.isRequiredFulfilled(values.accountNumber)) {
            errors.accountNumber = 'Please enter an account number';
        }
        if (!ValidationUtils.isRequiredFulfilled(values.street)) {
            errors.street = 'Please enter an address';
        }
        if (!ValidationUtils.isRequiredFulfilled(values.dob)) {
            errors.dob = 'Please enter your date of birth';
        }
        if (!ValidationUtils.isRequiredFulfilled(values.pickFruit)) {
            errors.pickFruit = 'Please select a fruit';
        }
        if (!ValidationUtils.isRequiredFulfilled(values.pickAnotherFruit)) {
            errors.pickAnotherFruit = 'Please select a fruit';
        }
        if (!ValidationUtils.isRequiredFulfilled(values.state)) {
            errors.state = 'Please select a state';
        }
        if (!ValidationUtils.isRequiredFulfilled(values.checkbox)) {
            errors.checkbox = 'You must accept the Terms of Service to continue';
        }
        return errors;
    },
    onSubmit: function (values) {
        setTimeout(function () {
            alert("Form submitted!\n\nInput values: ".concat(JSON.stringify(values, null, 4)));
            FormActions.setIsLoading(STORYBOOK_FORM_ID, false);
        }, 1000);
    },
    formState: {
        isLoading: false,
        error: '',
    },
    draftValues: {
        routingNumber: '00001',
        accountNumber: '1111222233331111',
        street: '123 Happy St, HappyLand HP 12345',
        dob: '1990-01-01',
        pickFruit: 'orange',
        pickAnotherFruit: 'apple',
        state: 'AL',
        checkbox: false,
    },
};
Default.args = defaultArgs;
Loading.args = __assign(__assign({}, defaultArgs), { formState: { isLoading: true } });
ServerError.args = __assign(__assign({}, defaultArgs), { formState: { isLoading: false, error: 'There was an unexpected error. Please try again later.' } });
InputError.args = __assign(__assign({}, defaultArgs), { draftValues: {
        routingNumber: '',
        accountNumber: '',
        street: '',
        pickFruit: '',
        dob: '',
        pickAnotherFruit: '',
        state: '',
        checkbox: false,
    } });
WithNativeEventHandler.args = __assign(__assign({}, defaultArgs), { draftValues: { routingNumber: '', accountNumber: '' } });
exports.default = story;
