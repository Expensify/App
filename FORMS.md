# Creating and Using Forms

This document lists specific guidelines for using our Form component and general forms guidelines.

## General Form UI/UX

### Labels, Placeholders, & Hints

Labels are required for each input and should clearly mark the field. Optional text may appear below a field when a hint, suggestion, or context feels necessary. If validation fails on such a field, its error should clearly explain why without relying on the hint. Inline errors should always replace the microcopy hints. Placeholders should not be used as it’s customary for labels to appear inside form fields and animate them above the field when focused.

![hint](https://user-images.githubusercontent.com/22219519/156266779-72deaf42-832c-453c-a5c2-1b2073b8b3b7.png)

Labels and hints are enabled by passing the appropriate props to each input:

```jsx
<TextInput
    label="Value"
    hint="Hint text goes here"
/>
```

### Character Limits

If a field has a character limit we should give that field a max limit. This is done by passing the maxLength prop to TextInput.

```jsx
<TextInput
    maxLength={20}
/>
```
Note: We shouldn't place a max limit on a field if the entered value can be formatted. eg: Phone number.
The phone number can be formatted in different ways.

- 2109400803
- +12109400803
- (210)-940-0803

### Native Keyboards

We should always set people up for success on native platforms by enabling the best keyboard for the type of input we’re asking them to provide. See [keyboardType](https://reactnative.dev/docs/0.64/textinput#keyboardtype) in the React Native documentation.

We have a couple of keyboard types [defined](https://github.com/Expensify/App/blob/572caa9e7cf32a2d64fe0e93d171bb05a1dfb217/src/CONST.js#L357-L360) and should be used like so:

```jsx
<TextInput
    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
/>
```

### Autofill Behavior

Forms should autofill information whenever possible i.e. they should work with browsers and password managers auto complete features.

As a best practice we should avoid asking for information we can get via other means e.g. asking for City, State, and Zip if we can use Google Places to gather information with the least amount of hassle to the user.

Browsers use the name prop to autofill information into the input. Here's a [reference](https://developers.google.com/web/fundamentals/design-and-ux/input/forms#recommended_input_name_and_autocomplete_attribute_values) for available values for the name prop.

```jsx
<TextInput
    name="fname"
/>
```

### Focus and Tab Behavior

All forms should define an order in which the inputs should be filled out, and using tab / shift + tab to navigate through the form should traverse the inputs in that order/reversed order, respectively. In most cases this can be achieved by composition, i.e. rendering the components in the correct order. If we come across a situation where composition is not enough, we can:

1. Create a local tab index state
2. Assign a tab index to each form input
3. Add an event listener to the page/component we are creating and update the tab index state on tab/shift + tab key press
4. Set focus to the input with that tab index.

Additionally, pressing the enter key on any focused field should submit the form.

Note: This doesn't apply to the multiline fields. To keep the browser behavior consistent, pressing enter on the multiline should not be intercepted. It should follow the default browser behavior (such as adding a newline).

### Modifying User Input on Change

User input that may include optional characters (e.g. (, ), - in a phone number) should never be restricted on input, nor be modified or formatted on blur. This type of input jacking is disconcerting and makes things feel broken. 

Instead we will format and clean the user input internally before using the value (e.g. making an API request where the user will never see this transformation happen). Additionally, users should always be able to copy/paste whatever characters they want into fields.

To give a slightly more detailed example of how this would work with phone numbers we should:

1. Allow any character to be entered in the field.
2. On blur, strip all non-number characters (with the exception of + if the API accepts it) and validate the result against the E.164 regex pattern we use for a valid phone. This change is internal and the user should not see any changes. This should be done in the validate callback passed as a prop to Form.
3. On submit, repeat validation and submit with the clean value.

### Form Drafts

Form inputs will NOT store draft values by default. This is to avoid accidentely storing any sensitive information like passwords, SSN or bank account information. We need to explicitly tell each form input to save draft values by passing the shouldSaveDraft prop to the input. Saving draft values is highly desireable and we should always try to save draft values. This way when a user continues a given flow they can easily pick up right where they left off if they accidentally exited a flow. Inputs with saved draft values [will be cleared when a user logs out](https://github.com/Expensify/App/blob/aa1f0f34eeba5d761657168255a1ae9aebdbd95e/src/libs/actions/SignInRedirect.js#L52) (like most data). Additionally we should clear draft data once the form is successfully submitted by calling `Onyx.set(ONYXKEY.FORM_ID, null)` in the onSubmit callback passed to Form.

```jsx
<TextInput
    shouldSaveDraft
/>
```

## Form Validation and Error handling

### Validate on Blur and Submit

Each individual form field that requires validation will have its own validate test defined. When the form field loses focus (blur) we will run that validate test and show feedback. A blur on one field will not cause other fields to validate or show errors unless they have already been blurred.

All form fields will additionally be validated when the form is submitted. Although we are validating on blur this additional step is necessary to cover edge cases where forms are auto-filled or when a form is submitted by pressing enter (i.e. there will be only a ‘submit’ event and no ‘blur’ event to hook into).

The Form component takes care of validation internally and the only requirement is that we pass a validate callback prop. The validate callback takes in the input values as argument and should return an object with shape `{[inputID]: errorMessage}`. Here's an example for a form that has two inputs, `routingNumber` and `accountNumber`:

```js
function validate(values) {
    const errors = {};
    if (!values.routingNumber) {
        errors.routingNumber = props.translate(CONST.ERRORS.ROUTING_NUMBER);
    }
    if (!values.accountNumber) {
        errors.accountNumber = props.translate(CONST.ERRORS.ACCOUNT_NUMBER);
    }
    return errors;
}
```

For a working example, check [Form story](https://github.com/Expensify/App/blob/aa1f0f34eeba5d761657168255a1ae9aebdbd95e/src/stories/Form.stories.js#L63-L72)

### Highlight Fields and Inline Errors

Individual form fields should be highlighted with a red error outline and present supporting inline error text below the field. Error text will be required for all required fields and optional fields that require validation. This will keep our error handling consistent and ensure we put in a good effort to help the user fix the problem by providing more information than less.

![error](https://user-images.githubusercontent.com/22219519/156267035-af40fe93-da27-4e16-bc55-b7cd40b0f1f2.png)

### Multiple Types of Errors for Individual Fields

Individual fields should support multiple messages depending on validation e.g. a date could be badly formatted or outside of an allowable range. We should not only say “Please enter a valid date” and instead always tell the user why something is failing if we can. The Form component supports an infinite number of possible error messages per field and they are displayed simultaneously if multiple validations fail.

### Form Alerts

When any form field fails to validate in addition to the inline error below a field, an error message will also appear inline above the submit button indicating that some fields need to be fixed. A “fix the errors” link will scroll the user to the first input that needs attention and focus on it (putting the cursor at the end of the existing value). By default, on form submit and when tapping the “fix the errors” link we should scroll the user to the first field that needs their attention.

![form-alert](https://user-images.githubusercontent.com/22219519/156267105-861fbe81-32cc-479d-8eff-3760bd0585b1.png)

### Handling Server Errors

Server errors related to form submission should appear in the Form Alert above the submit button. They should not appear in growls or other kinds of alerts. Additionally, as best practice moving forward server errors should never solely do the work that frontend validation can also do. This means that any error that can be validated in the frontend should be validated in the frontend and backend.

Note: This is not meant to suggest that we should avoid validating in the backend if the frontend already validates.

Note: There are edge cases where some server errors will inevitably relate to specific fields in a form with other fields unrelated to that error. We had trouble coming to a consensus on exactly how this edge case should be handled (e.g. show inline error, clear on blur, etc). For now, we will show the server error in the form alert and not inline (so the “fix the errors” link will not be present). In those cases, we will still attempt to inform the user which field needs attention, but not highlight the input or display an error below the input. We will be on the lookout for our first validation in the server that could benefit from being tied to a specific field and try to come up with a unified solution for all errors.

## Form Submission
### Submit Button Disabling

Submit buttons shall not be disabled or blocked from being pressed in most cases. We will allow the user to submit a form and point them in the right direction if anything needs their attention.

The only time we won’t allow a user to press the submit button is when we have submitted the form and are waiting for a response (e.g. from the API). In this case we will show a loading indicator and additional taps on the submit button will have no effect. This is handled by the Form component and will also ensure that a form cannot be submitted multiple times.

## Using Form.js

The example below shows how to use [Form.js](https://github.com/Expensify/App/blob/c5a84e5b4c0b8536eed2214298a565e5237a27ca/src/components/Form.js) in our app. You can also refer to [Form.stories.js](https://github.com/Expensify/App/blob/c5a84e5b4c0b8536eed2214298a565e5237a27ca/src/stories/Form.stories.js) for more examples.

```jsx
function validate(values) {
    const errors = {};
    if (!values.routingNumber) {
        errors.routingNumber = 'Please enter a routing number';
    }
    if (!values.accountNumber) {
        errors.accountNumber = 'Please enter an account number';
    }
    return errors;
}

function onSubmit(values) {
    setTimeout(() => {
        alert(`Form submitted!`);
        FormActions.setIsSubmitting('TestForm', false);
    }, 1000);
}

<Form
    formID="testForm"
    submitButtonText="Submit"
    validate={this.validate}
    onSubmit={this.onSubmit}
>
    // Wrapping TextInput in a View to show that Form inputs can be nested in other components
    <View>
        <TextInput
            label="Routing number"
            inputID="routingNumber"
            maxLength={8}
            shouldSaveDraft
        />
    </View>
    <TextInput
        label="Account number"
        inputID="accountNumber"
        containerStyles={[styles.mt4]}
    />
</Form>
```

### Props provided to Form inputs

The following props is available to form inputs:

- inputID: An unique identifier for the input.

Form.js will automatically provide the following props to any input with the inputID prop.

- ref: A React ref that must be attached to the input.
- defaultValue: The input default value.
- errorText: The translated error text that is returned by validate for that specific input.
- onBlur: An onBlur handler that calls validate.
- onChange: An onChange handler that saves draft values and calls validate.
