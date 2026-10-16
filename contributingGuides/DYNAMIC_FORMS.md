# Dynamic Forms

Some forms are described by data instead of JSX: the fields a Wise bank account needs depend on the country and currency, and the server sends them as a schema. `DynamicForm` renders such a schema with the regular form components, so these forms look and behave like every other form in the App.

## Usage

There are two ways in.

### A whole flow: `DynamicFormFlow`

`DynamicFormFlow` turns a schema into a multi-page flow, followed by a confirmation page with every answer.

```tsx
import DynamicFormFlow from "@components/DynamicForm";

<DynamicFormFlow
  schema={schema}
  formID={ONYXKEYS.FORMS.SOME_FORM}
  headerTitle={translate("someFlow.title")}
  confirmationTitle={translate("someFlow.confirmTitle")}
  testID="SomeFlow"
  buildRoute={(pageName, action) => ROUTES.SOME_FLOW.getRoute(pageName, action)}
  onSubmit={(answers) => submitSomeFlow(answers)}
  onBack={() => Navigation.goBack()}
/>;
```

- `schema` is either `{pages}`, the pages as the server groups them, or `{fields}`, a flat list the App splits into pages (see [Pages](#pages)).
- The current page is kept in the route, through `useSubPage`. Pass `shouldReplaceRoute` for flows on dynamic routes.
- A new visit resumes on the first page its draft leaves incomplete, or on the last page when nothing is missing.
- `hasConfirmation` decides whether a confirmation page follows the last page. It is on by default; without it the last page's Confirm button submits.
- `layout` decides the step indicator: `auto` shows it at three or more shown pages, `stepper` always, `pages` never.
- Answers are saved to the form draft as the user types, and again, cleaned, when they leave a page with Next.
- `onPageSubmit` receives each page and its drafted answers, list entries included, when the user leaves it with Next, for flows that save page by page. Sensitive answers are not passed.
- `onSubmit` receives the answers to every visible field, sensitive ones included. Answers left on fields that were hidden later are not sent.
- `isSubmitting` and `submitError` show the confirmation page's Confirm button loading and the error from sending the answers.
- `onRefreshRequirements` is called when a field marked `refreshOnChange` changes, so the screen can fetch the schema again. Typed fields call it when the user leaves the input, not on every keystroke.
- `currency` is the currency of amount fields that let the user pick none. `maxFileSize` is the largest size of one file, in bytes, for file fields that set none.

### One page: `DynamicFormFields`

Render `DynamicFormFields` inside a `FormProvider` and validate the same content with `getDynamicFieldErrors`:

```tsx
import DynamicFormFields from "@components/DynamicForm/components/DynamicFormFields";
import getContentFields from "@components/DynamicForm/utils/getContentFields";
import getDynamicFieldErrors from "@components/DynamicForm/utils/getDynamicFieldErrors";

<FormProvider
  formID={ONYXKEYS.FORMS.SOME_FORM}
  submitButtonText={translate("common.save")}
  validate={(values) => getDynamicFieldErrors(getContentFields(content), values, translate)}
  onSubmit={onSubmit}
>
  {({ inputValues }) => <DynamicFormFields content={content} values={inputValues} />}
</FormProvider>;
```

Pass `inputValues` from the render prop, so `showWhen` and `dependsOn` react to the user's answers as they type. When `content` is one page of a bigger form, pass the whole form as `allFields`, since a field can depend on an answer asked on another page. Outside `DynamicFormFlow`, list entries are edited in a modal.

## Pages

A page is a heading with its own `content`: `key`, `title` or `titleKey`, `description` or `descriptionKey`, and an optional `showWhen`. Its `content` holds headings and fields in screen order. An item without a `type` is a heading; a heading shows only while its `showWhen` matches and a visible field follows it before the next heading.

When the schema is a flat `{fields}` list, the App builds the pages:

- Addresses, files, multi-selects, lists, dependent selects and selects with more than 10 options get a page of their own.
- Other fields share a page, up to 4 in a row.
- A field with `showWhen` joins the page of its controller and does not count toward that limit.

A page is shown while its own `showWhen` matches and it has a visible field; a page that is not shown is skipped, and its fields are neither asked nor submitted. A page without a title is headed by its only question: the field's `question` or `questionKey` when it has one, else its label. An untitled page with several questions has no headline and no section name on the confirmation page, since no one question names it. A label never names a confirmation section, since the label is already on the row below it. Page keys become route segments, so they are made URL-safe and unique, and `confirm` is reserved for the confirmation page.

## The field format

`DynamicFormField` in `src/types/onyx/DynamicFormField.ts` is the contract with the server. Each `type` has its own variant, so a property such as `rule` or `currencyKey` only exists on the types that use it.

| Type                 | Input                                                                                                                                     | Type-specific properties                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `text`               | `TextInput`                                                                                                                               | `regex`, `minLength`, `maxLength`, `example`, `keyboard`, `multiline`, `rule: 'legalName' \| 'phone'` |
| `number`             | `TextInput` with the numeric keyboard                                                                                                     | `regex`, `minLength`, `maxLength`, `example`                                                          |
| `select`             | `ValuePicker`, or `PushRowWithModal` above 10 options                                                                                     | `values`, `dependsOn`, `presentation: 'tabs'`                                                         |
| `radio`              | `RadioButtons`                                                                                                                            | `values`, `dependsOn`, `presentation: 'tabs'`                                                         |
| `multiselect`        | `PushRowWithModal` with checkboxes and a Save button                                                                                      | `values`, `dependsOn`                                                                                 |
| `date`               | `DatePicker`                                                                                                                              | `rule: 'dateOfBirth'`                                                                                 |
| `boolean`            | Yes and No radio buttons, where No is an answer. With `presentation: 'checkbox'`, `CheckboxWithLabel`, which must be ticked when required. | `presentation: 'checkbox'`                                                                            |
| `country`            | `CountryPicker`                                                                                                                           |                                                                                                       |
| `countryMultiselect` | `PushRowWithModal` with every country                                                                                                     |                                                                                                       |
| `currency`           | `CurrencyPicker`                                                                                                                          |                                                                                                       |
| `address`            | The standard address form. The street is the field's value; the other parts are stored under `<key>.city`, `<key>.zipCode` and so on.     | `rule: 'zipCode'`                                                                                     |
| `file`               | `UploadFile` for PDF, JPG and PNG files, taking one file unless `maxFiles` allows more                                                    | `maxFiles`, `maxFileSize`                                                                             |
| `amount`             | `AmountForm`. With `currencyKey`, a `CurrencyPicker` above it saves the currency under that key.                                          | `currencyKey`                                                                                         |
| `percent`            | `PercentageForm`, from 1 to 100                                                                                                           |                                                                                                       |
| `list`               | Rows with Add, Edit and Remove. Each entry is edited on its own page in the flow, or in a modal outside it.                               | `itemFields`, `itemLabel`, `addItemDescription`, `minItems`, `maxItems`                               |

Every type also takes:

- `key`: unique within the form, and the field's draft key. A field without one is left out and logged.
- `label` or `labelKey`, and the same pair for `description`. A `*Key` is our translation and wins over the server's wording.
- `question` or `questionKey`: the headline of an untitled page where this is the only question, such as "What's your account number?". Without one, that page is headed by the label, which a text input then repeats.
- `required`. An optional address the user has started filling in is checked like a required one, so it is never sent in part.
- `readonly`: shown as a row with its value, never edited or validated
- `sensitive`: kept out of the form draft, see below
- `showWhen`: shown only while another answer is one of the listed values. A list answer counts when any chosen value matches. A field whose controlling field is hidden stays hidden.
- `refreshOnChange`: see `onRefreshRequirements` above

A choice or list field that is the only question on its page is drawn as the page itself, as an inline list, with its question above it. A page without its own title takes the question as its headline, so the label is not repeated below it. Fields it reveals, such as an "Other" description, do not count, so the layout stays put when they appear. On a page with several questions, every choice, tabs included, shows its question above it.

`maxFileSize` comes from the field when the schema sets it, else from the `maxFileSize` the screen passes. With neither, files of any size are taken.

The server can send a type this App version does not know. The schema is typed `DynamicFormSchemaField` for that reason: such a field is left out and logged once, so a newer schema never blocks the form.

## Privacy and accessibility

- Every field row, read-only rows included, every confirmation row and the list entry editor are masked in session recordings. The mask sits on the row's `View`, so it also covers inputs that do not pass a FullStory class on, such as `CountryPicker`.
- The confirmation before removing a list entry names the entry only in its masked prompt, since the modal title cannot be masked.
- Radio buttons, Yes/No questions and tabs are named after their question for screen readers, and the bold labels above addresses, files and lists are headings.

## Sensitive answers

`sensitive` answers, such as SSNs, never reach the form draft. `DynamicFormFlow` keeps them in memory, in the RAM-only `ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS`, for one visit:

- They are cleared when a new visit opens without a page in the route, and when the user leaves from the first page.
- They are cleared once `isSubmitting` turns false without `submitError`, or right after `onSubmit` when the screen passes no `isSubmitting`.
- They are never passed to `onPageSubmit`, since a page save would persist them in the request queue.
- The confirmation page shows only their last four characters, as in `•••-••-6789` for an SSN.

## List fields

A `list` field holds repeated entries, such as a company's owners. Its value is an array of entries, each holding its answers keyed by item field key and an `id` made on the device.

- In the flow each entry is edited on its own page, using the `dynamicFormListItemForm` form, which the page fills with the entry's answers when it opens and empties when it closes. The modal outside the flow does the same. These pages come after the confirmation page and Next and Back skip them, so only Add, Edit or an entry's row opens them.
- Saving an entry drafts the list right away. Leaving the list page with Next drops the sensitive answers of entries the user removed.
- Sensitive entry answers are kept in memory per entry and are sent back with their entry on submit. They are checked with their entry, so one lost with the memory, such as after a restart, is asked for again.
- A list marked `sensitive` is kept in memory whole and never drafted.
- On the confirmation page each entry is a row of its own, with a letter avatar, that opens the entry. An empty list is a plain row that opens its page.
- `minItems`, `maxItems` and the first entry with a problem show as the list's error.

## Adding a field type

1. Add a variant to `DynamicFormField`.
2. Typecheck then points at every place that has to handle it: the renderers in `renderers/`, the validators in `utils/getDynamicFieldErrors.ts`, the supported types in `utils/isSupportedField.ts` and the input map in `DynamicFormFieldsTest.tsx`.
3. Map the field onto an existing input component. If the component's props do not fit a form input, add a thin adapter in `adapters/`: it takes `value`, `onInputChange` and `errorText`, renders one existing component, reads no Onyx and navigates nowhere, and passes `forwardedFSClass` on so the answer stays masked. If no component fits, add the input outside `DynamicForm` first, so other forms can use it too.
