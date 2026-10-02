# Dynamic Forms

Some forms are described by data instead of JSX: the fields a Wise bank account needs depend on the country and currency, and the server sends them as a list. `DynamicForm` renders such a list with the regular form components, so these forms look and behave like every other form in the App.

## Usage

There are two ways in.

### A whole flow: `DynamicFormFlow`

`DynamicFormFlow` turns a schema into a multi-page flow: one page per `group`, then, on longer forms, a confirmation page with every answer.

```tsx
import DynamicFormFlow from "@components/DynamicForm";

<DynamicFormFlow
  fields={fields}
  formID={ONYXKEYS.FORMS.SOME_FORM}
  headerTitle={translate("someFlow.title")}
  confirmationTitle={translate("someFlow.confirmTitle")}
  testID="SomeFlow"
  buildRoute={(pageName, action) => ROUTES.SOME_FLOW.getRoute(pageName, action)}
  onSubmit={(answers) => submitSomeFlow(answers)}
  onBack={() => Navigation.goBack()}
/>;
```

- The current page is kept in the route, through `useSubPage`. Pass `shouldReplaceRoute` for flows on dynamic routes.
- A page whose fields are all hidden is skipped.
- A new visit resumes on the first page its draft leaves incomplete, or on the last page when nothing is missing.
- `hasConfirmation` decides whether a confirmation page follows the last page. By default only a form with more than five pages gets one; on the others the last page's Confirm button submits.
- `layout` decides the step indicator: `auto` shows it at three or more shown pages, `stepper` always, `pages` never.
- Answers are saved to the form draft as the user types, and again, cleaned, when they leave a page with Next.
- `onGroupSubmit` receives each page's visible answers, for flows that save page by page.
- `onSubmit` receives the answers to every visible field. Answers left on fields that were hidden later are not sent.
- `onRefreshRequirements` is called when a field marked `refreshRequirementsOnChange` changes, so the screen can fetch the schema again. Typed fields call it when the user leaves the input, not on every keystroke.

### One page: `DynamicFormFields`

Render `DynamicFormFields` inside a `FormProvider` and validate with `getDynamicFieldErrors`:

```tsx
import { DynamicFormFields, getDynamicFieldErrors } from "@components/DynamicForm";

<FormProvider
  formID={ONYXKEYS.FORMS.SOME_FORM}
  submitButtonText={translate("common.save")}
  validate={(values) => getDynamicFieldErrors(fields, values, translate)}
  onSubmit={onSubmit}
>
  {({ inputValues }) => <DynamicFormFields fields={fields} values={inputValues} />}
</FormProvider>;
```

Pass `inputValues` from the render prop, so `showWhen` and `dependsOn` react to the user's answers as they type. When `fields` is one page of a bigger form, pass the whole form as `allFields`, since a field can depend on an answer asked on another page. List fields need `DynamicFormFlow`, which owns their editor pages.

## The field format

`DynamicFormField` in `src/types/onyx/DynamicFormField.ts` is the contract with the server. Each `type` has its own variant, so a property such as `rule` or `currencyKey` only exists on the types that use it.

| Type                 | Input                                                                                                                                   | Type-specific properties                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `text`               | `TextInput`                                                                                                                             | `regex`, `minLength`, `maxLength`, `example`, `keyboard`, `multiline`, `rule: 'legalName' \| 'phone'`, `sensitive` |
| `number`             | `TextInput` with the numeric keyboard                                                                                                   | `regex`, `minLength`, `maxLength`, `example`, `sensitive`                                                          |
| `select`             | `ValuePicker`, or `PushRowWithModal` above `CONST.STANDARD_LIST_ITEM_LIMIT` options                                                     | `values`, `dependsOn`, `presentation: 'tabs'`                                                                      |
| `radio`              | `RadioButtons`                                                                                                                          | `values`, `dependsOn`, `presentation: 'tabs'`                                                                      |
| `multiselect`        | `PushRowWithModal` with checkboxes and a Save button                                                                                    | `values`, `dependsOn`                                                                                              |
| `date`               | `DatePicker`                                                                                                                            | `rule: 'dateOfBirth'`                                                                                              |
| `boolean`            | `CheckboxWithLabel`, which must be ticked when required. With `presentation: 'yesNo'`, Yes and No radio buttons, where No is an answer. | `presentation: 'yesNo'`                                                                                            |
| `country`            | `CountryPicker`                                                                                                                         |                                                                                                                    |
| `countryMultiselect` | `PushRowWithModal` with every country                                                                                                   |                                                                                                                    |
| `currency`           | `CurrencyPicker`                                                                                                                        |                                                                                                                    |
| `address`            | The standard address form. The street is the field's value; the other parts are stored under `<key>.city`, `<key>.zipCode` and so on.   | `rule: 'zipCode'`                                                                                                  |
| `file`               | `UploadFile`, allowing several files unless `maxFiles` says otherwise                                                                   | `maxFiles`                                                                                                         |
| `amount`             | `AmountForm`. With `currencyKey`, a `CurrencyPicker` above it saves the currency under that key.                                        | `currencyKey`                                                                                                      |
| `percent`            | `PercentageForm`                                                                                                                        |                                                                                                                    |
| `list`               | Rows with Add, Edit and Remove. Each entry is edited on its own page in the flow.                                                       | `itemFields`, `itemLabel`, `addItemDescription`, `minItems`, `maxItems`                                            |

Every type also takes:

- `label` or `labelKey`, and the same pair for `description`, `section` and `group`. A `*Key` is our translation and wins over the server's wording.
- `required`
- `readonly`: shown as a row with its value, never edited or validated
- `group`: the page the field is asked on in `DynamicFormFlow`
- `section`: consecutive fields sharing it render under one title
- `showWhen`: shown only while another answer is one of the listed values. A list answer counts when any chosen value matches. A field whose controlling field is hidden stays hidden.
- `refreshRequirementsOnChange`: see `onRefreshRequirements` above

A choice field that is the only question on its page is drawn as the page itself, as an inline list. Fields it reveals, such as an "Other" description, do not count, so the layout stays put when they appear.

The server can send a type this App version does not know. The schema is typed `DynamicFormSchemaField` for that reason: such a field is left out and logged once, so a newer schema never blocks the form.

## Sensitive answers

`sensitive` text and number answers, such as SSNs, never reach the form draft. `DynamicFormFlow` keeps them in memory, in the RAM-only `ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS`, for one visit:

- They are cleared when a new visit opens without a page in the route, and when the user leaves from the first page.
- Call `clearSensitiveAnswers(formID)` once the submission succeeds.
- The confirmation page shows them in full, so the user can check them, and masks them from session recording.

## List fields

A `list` field holds repeated entries, such as a company's owners. Its value is an array of `{id, answers}`, where `id` is made on the device. Each entry is edited on its own page after the other pages, which Next and Back skip, using the `dynamicFormListItemForm` form. Sensitive entry answers are kept in memory per entry and are sent back with their entry on submit. On the confirmation page each entry is a row of its own.

## Adding a field type

1. Add a variant to `DynamicFormField`.
2. Typecheck then points at every place that has to handle it: the renderers in `renderers/`, the validators in `utils/getDynamicFieldErrors.ts`, the supported types in `utils/isSupportedField.ts` and the input map in `DynamicFormFieldsTest.tsx`.
3. Map the field onto an existing input component. If the component's props do not fit a form input, add a thin adapter in `adapters/`: it takes `value`, `onInputChange` and `errorText`, renders one existing component, and reads no Onyx and navigates nowhere. If no component fits, add the input outside `DynamicForm` first, so other forms can use it too.
