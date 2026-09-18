# Dynamic Forms

A dynamic form is a form whose fields come from data rather than from JSX: the server, or a schema file in the App, describes each field, and one renderer draws it. Use it whenever the set of questions is decided outside the App at runtime (Wise's recipient bank-account requirements, Wise's KYC follow-ups) or whenever the same form is authored per country and should stay one component (the business intake).

Read [FORMS.md](FORMS.md) first. Everything there still applies; a dynamic form is an ordinary `FormProvider` whose `InputWrapper`s are generated.

## The contract

Every field is a `DynamicFormField` (`src/types/onyx/DynamicFormField.ts`). The important members:

| Member | Meaning |
|---|---|
| `key` | Form input ID and draft key. Wise's keys can be dotted (`address.country`); write them as computed keys in object literals or the naming-convention lint rule rejects them. |
| `type` | One of the closed set in `DynamicFormFieldType`. See the registry below. |
| `label` / `labelKey` | Server wording, or our translation. `labelKey` wins. App-owned schemas must use `labelKey` only. |
| `description` / `descriptionKey` | Supporting text: a hint under a text field, a line above anything else. |
| `group` | Page. Fields with the same group render on one page, in first-appearance order. |
| `required`, `regex`, `minLength`, `maxLength` | Validation, applied by `getDynamicFieldErrors`. Every failing rule is reported. |
| `values`, `dependsOn` | Options for choice fields; `dependsOn` filters them by another answer. |
| `showWhen` | Visibility by another answer. Hidden fields are never validated. |
| `refreshOnChange` | Re-fetch the schema when this answer changes (`useRefreshOnChange`). |
| `keyboard`, `multiline` | Text field hints. Digit-only regexes open the numeric keyboard on their own. |
| `readonly` | Plain row with the prefilled value, skipped by validation. |
| `sensitive` | Never saved to the draft. Use for SSNs and account numbers, per FORMS.md. |
| `currencyKey` | Amount only. Names the sibling key the chosen currency is written to; without it the currency is fixed. |
| `itemFields`, `minItems`, `maxItems` | List only. The schema of one repeated item and the allowed count. |

## The registry

`src/components/DynamicForm/getInputComponentForField.ts` is the only place a `type` meets a component. It is declared with `satisfies Record<DynamicFormFieldType, …>`, so adding a member to the type union fails `npm run typecheck` until the registry has an entry.

| `type` | Renders as | Alone on its page |
|---|---|---|
| `text` | `TextInput` | same |
| `select` | `ValuePicker`, or `PushRowWithModal` above eight options | the option list is the page |
| `multiselect` | push row opening a searchable multi-select modal | the checkbox list is the page |
| `radio` | `RadioButtons` | same |
| `boolean` | `CheckboxWithLabel` | a Yes/No choice |
| `date` | `DatePicker` | same |
| `country` | searchable push row of countries | same |
| `address` | `AddressSearch`, parts written to `<key>.city` and friends | same |
| `file` | `UploadFile` | same |
| `amount` | `AmountForm`, with a currency picker when `currencyKey` is set | same |
| `percent` | `PercentageForm` | same |
| `list` | rows with an add row and a right-docked item editor that reuses the renderer | same |

"Alone on its page" means the field is the only visible one; choice fields then present as the page itself, which is how the follow-up form designs work. Everything else renders as a row.

The `adapters/` folder holds prop mappers that give existing components the `value` and `onInputChange` shape `InputWrapper` expects. They compose existing components and draw no input of their own.

## Building a flow

`DynamicFormFlow` turns a schema into a whole flow: one sub page per group through `useSubPage`, a step indicator once there are three or more pages, page titles, per-page validation against the whole draft, a draft-load gate, and a confirmation page listing every answer with edit rows. Give it the fields, a form key, a header title, a route builder and `onSubmit`.

```tsx
<DynamicFormFlow
    fields={requirement.fields}
    formID={ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM}
    headerTitle={translate('wiseKYC.title')}
    confirmationTitle={translate('common.confirm')}
    testID="RequirementForm"
    buildRoute={(pageName, action) => ROUTES.SOME_ROUTE.getRoute(id, pageName, action)}
    onSubmit={(values) => submitSomething(id, values)}
    onBack={() => Navigation.goBack()}
/>
```

The route must accept a `subPage` segment and an optional `action=edit` parameter, as the Corpay and enable-GR routes do. Pages that mount before their draft has loaded must wait for it (`isLoadingOnyxValue` on the draft metadata); the flow does this, and any page that uses `DynamicFormFields` directly must too, because `AmountForm` reads its value only on mount.

The step indicator appears at three or more pages by default. Pass `shouldShowStepIndicator` to force it on for a shorter flow or off for a longer one; single-screen forms never get one.

## Fixtures are the server contract

The server is not required to exist for any of this to be tested. Each flow that consumes the renderer checks in a fixture shaped as its server will emit it and asserts it with `expectSchemaRenders` from `tests/utils/dynamicFormCoverage.ts`, which walks every field, nested list items included, and fails when one has no registered input. `tests/unit/DynamicFormCoverageTest.ts` covers the generic fixture and asserts every type in the contract appears in it. When a server adds a shape, add it to that flow's fixture; the test fails until the registry can render it.

## Rules

- New field types are added to `DynamicFormFieldType` and the registry, by an internal engineer, with a fixture entry and a Storybook story.
- Do not add an input component under `src/components/DynamicForm/`. Adapters compose existing components only.
- Do not switch on `field.type` anywhere but the registry.
- Pages consume `DynamicFormFields` or `DynamicFormFlow`; they never know a field name.
- Existing Corpay pages are left as they are.

Storybook: `Components/DynamicForm` shows every type, the paged flow, a lone question, a list of owners and an amount with currency. Modal pickers open there because Storybook aliases `@react-navigation/stack` to a copy whose card animation reports a presented card (`.storybook/mocks`).
