# Dynamic Forms

A dynamic form is a form whose fields come from data rather than from JSX: the server, or a schema file in the App, describes each field, and one renderer draws it. Use it whenever the set of questions is decided outside the App at runtime, such as a payment provider's per-country bank account requirements or follow-up verification questions, or whenever the same form is authored per country and should stay one component.

Read [FORMS.md](FORMS.md) first. Everything there still applies; a dynamic form is an ordinary `FormProvider` whose `InputWrapper`s are generated.

## The contract

Every field is a `DynamicFormField` (`src/types/onyx/DynamicFormField.ts`). The important members:

| Member | Meaning |
|---|---|
| `key` | Form input ID and draft key. Keys may be dotted (`address.country`); in object literals write them through a named constant, since the naming-convention lint rule rejects dotted literal keys and `no-useless-computed-key` rejects computed string literals. |
| `type` | One of the closed set of fifteen in `DynamicFormFieldType`. See the registry below. |
| `label` / `labelKey` | Server wording, or our translation. `labelKey` wins. App-owned schemas must use `labelKey` only. |
| `description` / `descriptionKey` | Supporting text: a hint under a text field, a line above anything else. |
| `group` / `groupLabelKey` | Page. Fields with the same group render on one page, in first-appearance order. The group string is the title unless `groupLabelKey` names our translation; App-owned schemas must set it. |
| `required`, `regex`, `minLength`, `maxLength` | Validation, applied by `getDynamicFieldErrors`. Every failing rule is reported. |
| `rule` | A named check from `ValidationUtils` a regex cannot express: `legalName` (text), `dateOfBirth` (date, past and 18 or older) or `zipCode` (address, against the chosen country). The same checks and copy as the ACH sub-step forms. |
| `values`, `dependsOn` | Options for choice fields; `dependsOn` filters them by another answer. |
| `presentation: 'tabs'` | Select and radio only. Draws the choice as a segmented tab row, for the switch whose answer decides which fields follow through `showWhen`. Answers of fields hidden at submit time are not submitted. |
| `showWhen` | Visibility by another answer. Hidden fields are never validated. |
| `refreshOnChange` | Re-fetch the schema when this answer changes (`useRefreshOnChange`). |
| `keyboard`, `multiline` | Text field hints. Digit-only regexes and `number` fields open the numeric keyboard on their own. |
| `readonly` | Plain row with the prefilled value, skipped by validation. |
| `sensitive` | Never saved to the draft. Use for SSNs and account numbers, per FORMS.md. |
| `currencyKey` | Amount only. Names the sibling key the chosen currency is written to; without it the currency is fixed. |
| `itemFields`, `minItems`, `maxItems` | List only. The schema of one repeated item and the allowed count. |
| `itemLabel` / `itemLabelKey`, `addItemDescription` / `addItemDescriptionKey` | List only. The noun for one item ("owner") drives the add row and the editor title; the description is the hint under the add row. |

## The registry

`src/components/DynamicForm/getInputComponentForField.ts` is the only place a `type` meets a component. It is declared with `satisfies Record<DynamicFormFieldType, …>`, so adding a member to the type union fails `npm run typecheck` until the registry has an entry.

| `type` | Renders as | Alone on its page |
|---|---|---|
| `text` | `TextInput` | same |
| `number` | `TextInput` with the numeric keyboard and a finite-number check | same |
| `select` | `ValuePicker`, or `PushRowWithModal` above eight options | the option list is the page, with search above eight options |
| `multiselect` | `PushRowWithModal` with `canSelectMultiple`: a searchable modal that saves the selection | the checkbox list is the page, with search above eight options |
| `radio` | `RadioButtons` under a body-text prompt; `presentation: 'tabs'` draws a segmented tab row instead | the radio list is the page |
| `boolean` | `CheckboxWithLabel` | a Yes/No choice |
| `date` | `DatePicker` | same |
| `country` | searchable push row of countries | the searchable country list is the page |
| `countryMultiselect` | the multiselect push row over every country | the searchable checkbox list is the page |
| `currency` | `CurrencyPicker` | the searchable currency list is the page |
| `address` | `AddressSearch`, parts written to `<key>.city` and friends | same |
| `file` | `UploadFile` | same |
| `amount` | `AmountForm`, with a currency picker when `currencyKey` is set | same |
| `percent` | `PercentageForm` | same |
| `list` | avatar rows with Edit and a confirmed remove, an add row, and an item editor page inside the flow (a modal outside it) | same |

"Alone on its page" means the field is the only visible one; choice fields then present as the page itself, which is how the follow-up form designs work. Everything else renders as a row.

The `adapters/` folder holds prop mappers that give existing components the `value` and `onInputChange` shape `InputWrapper` expects. They compose existing components and draw no input of their own.

## Building a flow

`DynamicFormFlow` turns a schema into a whole flow: one sub page per group through `useSubPage`, a step indicator once there are three or more pages, page titles, per-page validation against the whole draft, a draft-load gate, and a confirmation page listing every answer with edit rows. Give it the fields, a form key, a header title, a route builder and `onSubmit`.

```tsx
<DynamicFormFlow
    fields={schema.fields}
    formID={ONYXKEYS.FORMS.SOME_FORM}
    headerTitle={translate('someFlow.title')}
    confirmationTitle={translate('common.confirm')}
    testID="SomeFlow"
    buildRoute={(pageName, action) => ROUTES.SOME_ROUTE.getRoute(id, pageName, action)}
    onSubmit={(values) => submitSomething(id, values)}
    onBack={() => Navigation.goBack()}
/>
```

The route must accept a `subPage` segment and an optional `action=edit` parameter, as the existing `useSubPage` routes do. Pages that mount before their draft has loaded must wait for it (`isLoadingOnyxValue` on the draft metadata); the flow does this, and any page that uses `DynamicFormFields` directly must too, because `AmountForm` reads its value only on mount.

Inside the flow a list edits its items on their own page (route `<listKey>~<itemID>`, `~new` to add), with the list's step highlighted. Rows show a letter avatar, an Edit button and a remove control that asks for confirmation. Sensitive item answers stay out of the draft and are merged back into the item on submit. Outside the flow the list falls back to a modal editor.

Pass `onPageSubmit` to persist each page as the ACH flow does. It receives the page and that page's answers before the flow moves on, so the consumer's action can call its API command per group; the page's own button shows the form key's `isLoading` and `errors` without further wiring.

The step indicator appears at three or more pages by default. Pass `shouldShowStepIndicator` to force it on for a shorter flow or off for a longer one; single-screen forms never get one.

## Fixtures are the server contract

The server is not required to exist for any of this to be tested. Each flow that consumes the renderer checks in a fixture shaped as its server will emit it and asserts it with `expectSchemaRenders` from `tests/utils/dynamicFormCoverage.ts`, which walks every field, nested list items included, and fails when one has no registered input. `tests/unit/DynamicFormCoverageTest.ts` covers the generic fixture and asserts every type in the contract appears in it. When a server adds a shape, add it to that flow's fixture; the test fails until the registry can render it.

## Rules

- New field types are added to `DynamicFormFieldType` and the registry, by an internal engineer, with a fixture entry and a Storybook story.
- Do not add an input component under `src/components/DynamicForm/`. Adapters map props onto existing components; when an existing component is one prop short, add the prop to it instead of composing a copy.
- Do not switch on `field.type` anywhere but the registry.
- Pages consume `DynamicFormFields` or `DynamicFormFlow`; they never know a field name.
- Existing hand-written forms are left as they are; the dynamic form is for new schema-driven flows.
- Alternatives that swap the field set, such as two ways to identify a bank account, are expressed in the schema as a leading `radio` plus `showWhen` on each alternative's fields, not as a second component.

Storybook: `Components/DynamicForm` shows every type, the paged flow, a lone question, a list of owners and an amount with currency. The Playground story loads a preset schema into editable `fields` and `draftValues` controls, so a schema can be tried without writing a fixture; a field with an unknown type is reported in place of the form. Modal pickers open there because Storybook aliases `@react-navigation/stack` to a copy whose card animation reports a presented card (`.storybook/mocks`).
