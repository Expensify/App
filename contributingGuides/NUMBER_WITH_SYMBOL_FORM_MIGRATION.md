# Migrating from NumberWithSymbolForm to KeypadAmountEditor and AmountFormField

`NumberWithSymbolForm` and `MoneyRequestAmountInput` (a wrapper around it) are deprecated. Their replacements are explicit compositions that share one editing controller (`src/components/AmountEditingController`):

- `KeypadAmountEditor` is the full-screen amount editor. It owns the layout (amount row, touch number pad, actions, footer, error, scrolling).
- `AmountFormField` is an inline text field for forms, list rows and table cells. It owns no layout.

Oxlint flags default imports of the deprecated modules (`restrictedImportPatterns` in `oxlint.config.mts`) and uses of the deprecated symbols (`@typescript-eslint/no-deprecated`). The seatbelt file `config/oxlint/oxlint.seatbelt.tsv` freezes the existing call sites. Never edit it by hand (see `contributingGuides/LINTING.md`). Migrate each call site in its own PR.

`AmountForm` is the exception to both rules. Lint does not flag its consumers, because they import `AmountForm` and not `NumberWithSymbolForm`, and it is migrated as one unit rather than per consumer. See [section 7](#7-amountform).

> [!TIP]
> **Quick Start (4-step migration):**
> 1. **Identify the legacy render mode** ([section 1](#1-choose-the-target-by-legacy-mode)): full-screen layout -> `KeypadAmountEditor`, inline field or pad-without-pad -> `AmountFormField`.
> 2. **Map props** ([section 3](#3-prop-mapping)): check what legacy props need to be passed or dropped.
> 3. **Pick a reference blueprint** ([section 5](#5-examples)): [Example A](#a-full-screen-currency-amount-moneyrequestamountform) (full-screen currency), [B](#b-full-screen-unit-suffix-hours) (suffix unit), [C](#c-inline-field-amountfield-in-the-confirmation-list) (inline field), or [D](#d-standalone-screen-or-formprovider) (standalone vs `FormProvider`).
> 4. **Check prerequisites and incremental props** ([section 4](#4-prerequisites-and-incremental-props)): verify foundational behaviors (such as `submitBehavior` on Enter or `sentryLabel`) and add any screen-specific props to the primitive in your PR.

## 1. Choose the target by legacy mode

`NumberWithSymbolForm` has two render paths. Pick the target from the path the call site uses, not from the kind of screen.

| Legacy mode                                          | How to recognize it                                                                                               | What it renders                                                                                                                                                                                                                                                                                                                              | Target               |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Pad mode, full-screen layout                         | `displayAsTextInput` unset and `shouldWrapInputInContainer` left at `true`                                        | A root `ScrollView` with the centered amount (`TextInputWithCurrencySymbol` and `AmountTextInput`, symbol as a separate text), currency and flip buttons, error, `BigNumberPad` on touch screens, `footer`. Two columns in landscape.                                                                                                        | `KeypadAmountEditor` |
| Pad mode without pad and without the wrapping layout | `shouldShowBigNumberPad={false}` (the `MoneyRequestAmountInput` default) and `shouldWrapInputInContainer={false}` | The input inside a `ScrollView` (`flexGrow0`) plus an actions row (empty for current callers). In phone landscape the landscape branch runs before `shouldWrapInputInContainer` is checked, so split rows and `InlineNumberEditCell` get the full landscape layout (`ScrollView` with `ph5`, `numberWithSymbolFormInputContainerLandscape`). | `AmountFormField`    |
| Inline mode                                          | `displayAsTextInput`                                                                                              | A plain `TextInput` with the prefix taken from `symbol` and the buttons in the input's right-hand slot.                                                                                                                                                                                                                                      | `AmountFormField`    |

`AmountFormField` renders only the input. Landscape rendering of the pad-without-pad call sites (split rows, `InlineNumberEditCell`) therefore changes on purpose. It is not a regression.

Pad mode ignores several props that inline mode reads, and the other way around. The mode column in [section 3](#3-prop-mapping) records which applies.

## 2. Behavior semantics

These rules apply to both `KeypadAmountEditor` and `AmountFormField`, with the specific differences noted below.

- **Canonical signed value.** `value`, `onInputChange`, `getNumber` and `updateNumber` use the canonical string: `.` as the decimal separator, no grouping, a leading `-` for negatives. `AmountFormField.Input` displays the sign directly in the text. `KeypadAmountEditor.Input` displays only the magnitude while the root layout renders the minus sign, provided `allowNegative={true}`; when `allowNegative={false}` (default), the input displays the canonical value directly.
- **`value` seeds the editor.** After mount, changing `value` to `''` resets the editor. Any other change is ignored, so an external update has to go through `updateNumber` or a `key` remount. When `value` is already `''` (for example because the parent never committed the typed text), passing `''` again does nothing, so clear the editor with `updateNumber('')`.
- **`updateNumber(canonical)`** replaces the value without validation (`decimals`, `maxLength` and `allowNegative` are not applied) and without calling `onInputChange`, and moves the caret to the end. Pass a canonical string, never a locale-formatted display string.
- **`getNumber()` and sign flipping.** `getNumber()` returns the latest committed canonical signed value synchronously, including right after `updateNumber` or a sign flip. Call it from event handlers such as submit, not during render. Note the difference in sign flipping: `KeypadAmountEditor` toggles the sign via `controller.setCanonicalValue` (bypassing validation and selection sync), while `AmountFormField` runs `controller.setNumber` (which re-validates and moves the caret). Toggling the sign on an empty input yields `'-'`, which is truthy in JavaScript; normalize it (e.g. `currentAmount === '-' ? '' : currentAmount` or via `Number.isNaN(parseFloat(currentAmount))`) before reporting or validating.
- **`key` remount.** Keep the existing `key` props on migrated call sites (`key={transactionID}` in `AmountField`, `key={taxAmountInputKey}` in `TaxFields`). Remounting is how the editor switches between items without an intermediate empty value.
- **Pushing asynchronous or per-tab values.** Sync the editor from an effect that only calls `updateNumber`. The call imperatively updates the editor without updating parent React state or triggering parent re-renders. Skip the call when `getNumber()` already equals the value, preventing unnecessary caret jumps to the end.
- **Dirty tracking for the discard prompt.** Keep a mirror of the typed value in page state, updated from `onInputChange`.
  - On native, `useDiscardChangesConfirmation` calls `getHasUnsavedChanges()` during render to feed `usePreventRemove` (`shouldPreventRemove`). The editor keeps its value in its own state, so typing does not re-render the page. Without a mirror, `shouldPreventRemove` stays `false` and the native back gesture skips the prompt.
  - `getHasUnsavedChanges` must derive from state. Reading `ref.current` or `getNumber()` there reads a ref during render, which breaks the React rules and is not reactive.
  - When the committed value or the tab changes, reset the mirror and any other dependent state (for example `formError`) during render with the previous-value pattern, and push the new value into the editor from the effect. `updateNumber` does not call `onInputChange`, so the mirror would otherwise stay stale. Example B shows the full pattern.
- **Reference page.** `src/pages/workspace/taxes/WorkspaceCreateTaxValuePage.tsx` is the example of a standalone `KeypadAmountEditor` screen: a `footer` button, a `Symbol` after `.Input`, and `autoGrowMarginSide="left"` and `style={styles.textAlignRight}` on `.Input`. It has no `FormProvider`, no validation and no discard prompt. Its `currentValue` state, set with `onInputChange={setCurrentValue}`, is the source of truth that the save handler reads.

## 3. Prop mapping

Mode: `Pad` and `Inline` are the two legacy render paths from [section 1](#1-choose-the-target-by-legacy-mode).

The `Pad` rows name `KeypadAmountEditor` as the target, but pad-mode call sites without the pad (split rows, `InlineNumberEditCell`) target `AmountFormField`. For them, map the pad props to `AmountFormField.Input`. It has `style` (applied as `inputStyle`), `touchableInputWrapperStyle`, `disableKeyboard`, `prefixCharacter`, `prefixContainerStyle`, `shouldApplyPaddingToContainer`, `shouldUseDefaultLineHeightForPrefix`, `contentWidth` and `children` (for trailing accessories inside the input border). Add missing props (`containerStyle`, `autoGrow`, `hideFocusedState`, `prefixStyle`) to `AmountFormField.Input` when migrating those specific callers (see [section 4](#4-prerequisites-and-incremental-props)). It also lacks `autoGrowExtraSpace` and `autoGrowMarginSide`, which no current caller needs.

| Legacy prop                                                                                                                                            | Mode   | Target                                                                                                                                                                                                              | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`, `onInputChange`                                                                                                                               | Both   | `value`, `onInputChange` on the root                                                                                                                                                                                | See [section 2](#2-behavior-semantics). `onInputChange` also fires on sign flips and, in `KeypadAmountEditor`, when backspace removes the sign. `updateNumber` never triggers it. The new controller calls `onInputChange` only when the committed value actually changes. Legacy called it on every accepted edit.                                                                                                                                                                                                                                                                                                                                                 |
| `decimals`, `maxLength`, `errorText`                                                                                                                   | Both   | Same props on the root                                                                                                                                                                                              | `maxLength` limits integer digits and defaults to `CONST.IOU.AMOUNT_MAX_LENGTH`. `KeypadAmountEditor` renders `errorText` under the amount. `AmountFormField.Input` passes it to its text input.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `allowNegativeInput`, `allowFlippingAmount`, `isNegative`, `toggleNegative`, `clearNegative`                                                           | Both   | `allowNegative` on the root. The sign is part of the signed value.                                                                                                                                                  | Legacy pad mode kept the magnitude in the input and the sign in caller state. `allowFlippingAmount` turned a typed `-` into a toggle, `allowNegativeInput` kept it in the text. In `KeypadAmountEditor` typing `-` with the caret at the start of the magnitude toggles the sign, pasting a signed number sets it, replacing the whole number clears it and backspace at the start of the magnitude removes it (this replaces `clearNegative`).                                                                                                                                                                                                                     |
| `shouldShowFlipButton`, `allowFlippingAmount` (as the button switch)                                                                                   | Both   | `KeypadAmountEditor.SignFlipButton` in `actions`, or `AmountFormField.SignFlipButton` as a child or sibling of `.Input`                                                                                            | The new button renders only with root `allowNegative` on touch screens. Pad mode ignores `shouldShowFlipButton`: its flip button follows `allowFlippingAmount` (portrait: touch only, landscape: always). Inline mode needs `shouldShowFlipButton && allowNegativeInput` on touch. Use `isDisabled` on the button for `disabled`. Legacy pad-mode buttons have `style={styles.minWidth18}`, which the new flip button does not apply. Pass it for parity or accept the change.                                                                                                                                                                                      |
| `symbol`, `hideSymbol`, `symbolPosition`                                                                                                               | Pad    | `<KeypadAmountEditor.Symbol>` before or after `.Input` (omit it to hide), or `prefixCharacter` on `AmountFormField.Input` (`''` hides)                                                                              | JSX order replaces `symbolPosition`, so `CONST.TEXT_INPUT_SYMBOL_POSITION` users go away. `Symbol` children must be a string.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `symbol`, `hideSymbol`                                                                                                                                 | Inline | `prefixCharacter` on `AmountFormField.Input`                                                                                                                                                                        | Inline mode builds the prefix from `symbol` (`hideSymbol` empties it) and ignores `symbolPosition` and `prefixCharacter`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `prefixCharacter`                                                                                                                                      | Pad    | `prefixCharacter` on `.Input`                                                                                                                                                                                       | Pad mode forwards it to the input as a prefix. Split rows use it with `hideSymbol` to show the currency symbol inside the input.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `currency`, `isSymbolPressable`, `onSymbolButtonPress`                                                                                                 | Pad    | `CurrencyPickerButton` in `actions` (`onSymbolButtonPress` becomes `onPress`)                                                                                                                                       | `isSymbolPressable` defaults to `true`. In the wrapped full-screen layout the legacy button shows the `currency` text in landscape always, in portrait on touch screens always, and in portrait without touch only when `currency` is non-empty. Without the wrapper, `isSymbolPressable` instead makes the symbol itself a pressable `SymbolButton`, and the current pad-without-pad callers pass `false`. `CurrencyPickerButton` renders unconditionally, so guard with `!!currency` where the legacy button was hidden. The legacy button has `style={styles.minWidth18}`, which `CurrencyPickerButton` does not apply. Pass it for parity or accept the change. |
| `shouldShowCurrencyButton`, `onCurrencyButtonPress`, `currencyButtonLabel`, `currencyButtonAccessibilityLabel`                                         | Inline | `AmountFormField.CurrencyPickerButton` as a child of `.Input`                                                                                                                                                       | The legacy button renders only when `currencyButtonLabel ?? currency` is non-empty, calls `onCurrencyButtonPress ?? onSymbolButtonPress`, and sits inside the input border. Composed as a child of `.Input`, the button renders inside the input border. Its visible text is the `currency` prop; pass a custom label there together with an explicit `accessibilityLabel`. Use `isDisabled` for `disabled`.                                                                                                                                                                                                                                                             |
| `currencyButtonRef`, `shouldUseBorderlessButtons`, `leadingRightHandSideComponent`                                                                     | Inline | No equivalent for the first two (add `ref` and borderless support to `AmountCurrencyPickerButton` when migrating `AmountField`). Pass `leadingRightHandSideComponent` as a child of `.Input` placed before the buttons. | Trailing accessories render inside the input border via `children`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `shouldShowBigNumberPad`                                                                                                                               | Pad    | None                                                                                                                                                                                                                | `KeypadAmountEditor` renders the pad on touch screens only. A call site that passes `false` has no pad and belongs on `AmountFormField` (see [section 1](#1-choose-the-target-by-legacy-mode)).                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `displayAsTextInput`, `shouldWrapInputInContainer`                                                                                                     | -      | Selects the target                                                                                                                                                                                                  | See [section 1](#1-choose-the-target-by-legacy-mode).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `footer`                                                                                                                                               | Pad    | `footer` on `KeypadAmountEditor`                                                                                                                                                                                    | The layout puts it in a `w100 alignItemsCenter ph5` container and already adds a top margin on touch screens in portrait. Keep `w100` on the button and drop the call site's own top margin.                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `numberFormRef`, `ref`                                                                                                                                 | Both   | `ref` on the root (`AmountEditingRef` from `@components/AmountEditingController`, or its alias `AmountFormFieldRef`), `ref` on `.Input` (`BaseTextInputRef`)                                                        | `NumberWithSymbolFormRef` has the same three methods: `clearSelection`, `updateNumber`, `getNumber`. Import `AmountFormFieldProps` from `@components/AmountFormField/types`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `label`, `accessibilityLabel`                                                                                                                          | Both   | `label` and `accessibilityLabel` on `AmountFormField.Input`, `accessibilityLabel` on `KeypadAmountEditor.Input`                                                                                                     | Inline mode passes `accessibilityLabel` through with fallback to `label` (`props.accessibilityLabel ?? label`). `AmountFormField.Input` passes `accessibilityLabel` through, and `BaseTextInput` falls back to `[label, hint]` when it is unset. `KeypadAmountEditor.Input` defaults the accessibility label to `translate('iou.amount')`.                                                                                                                                                                                                                                                                                                                   |
| `autoFocus`, `onFocus`, `onBlur`, `keyboardType`                                                                                                       | Both   | Same props on `.Input`                                                                                                                                                                                              |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `onSubmitEditing`                                                                                                                                      | Both   | `onSubmitEditing` on `AmountFormField.Input` or `KeypadAmountEditor.Input`                                                                                                          | Legacy pad mode never forwarded `onSubmitEditing` to its inner text input. Pad-mode call sites like `InlineNumberEditCell` passed both `onBlur={save}` and `onSubmitEditing={save}`, where only `onBlur` executed. Porting `onSubmitEditing` runs both callbacks unless the redundant one is removed.                                                                                                                                                                                                                                                                                                                                                             |
| `submitBehavior`                                                                                                                                       | Both   | None. Both `.Input`s hardcode `"submit"`.                                                                                                                                                                           | In legacy pad mode, passing `submitBehavior={props.submitBehavior}` via `{...rest}` overrode `AmountTextInput`'s `"submit"` with `undefined`, causing React Native to fall back to `"blurAndSubmit"`. Inline mode also relied on that default. In contrast, `KeypadAmountEditor.Input` and `AmountFormField.Input` hardcode `submitBehavior="submit"`. Call sites that depend on blurring the input or dismissing the keyboard on Enter (such as `SplitAmountInput` or `useSplitParticipants`) require a configurable `submitBehavior` prop (see [section 4](#4-prerequisites-and-incremental-props)).                                                  |
| `disabled`                                                                                                                                             | Both   | `disabled` on `AmountFormField.Input`                                                                                                                                                                               | `KeypadAmountEditor.Input` has no `disabled` prop (add it if a new target requires it).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `shouldUseDynamicFontSize`                                                                                                                             | Pad    | `shouldUseDynamicFontSize` on `KeypadAmountEditor`                                                                                                                                                                  | Scales the input, the symbol and the minus sign together. `AmountFormField` has no equivalent.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `style`, `containerStyle`, `touchableInputWrapperStyle`, `autoGrow`, `autoGrowExtraSpace`, `autoGrowMarginSide`, `disableKeyboard`, `hideFocusedState` | Pad    | `style`, `containerStyle`, `touchableInputWrapperStyle`, `autoGrow`, `autoGrowExtraSpace`, `autoGrowMarginSide`, `disableKeyboard`, `hideFocusedState` on `KeypadAmountEditor.Input`                                | `KeypadAmountEditor.Input` already applies `styles.iouAmountTextInput`, `styles.iouAmountTextInputContainer`, `styles.heightUndefined`, `autoGrowExtraSpace={variables.w80}` and `autoGrow`, `disableKeyboard`, `hideFocusedState` set to `true`. Drop the legacy props that repeat these instead of passing them again. The caller's styles are appended to the defaults.                                                                                                                                                                                                                                                                                          |
| `style`                                                                                                                                                | Inline | `style` on `AmountFormField.Input`                                                                                                                                                                                  | Legacy inline mode passes `style` to `BaseTextInput`, which overrides it, so it has no effect there. `AmountFormField.Input` maps `style` to `inputStyle` and applies it. Do not port old inline `style` values without checking the result.                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `prefixStyle`, `prefixContainerStyle`, `shouldApplyPaddingToContainer`, `shouldUseDefaultLineHeightForPrefix`, `contentWidth`                          | Pad    | `prefixContainerStyle`, `shouldApplyPaddingToContainer`, `shouldUseDefaultLineHeightForPrefix` on both `.Input`s. `prefixStyle` on `KeypadAmountEditor.Input` only. `contentWidth` on `AmountFormField.Input` only. | `AmountFormField.Input` hardcodes `prefixStyle` to `styles.colorMuted`; add `prefixStyle` support to `AmountFormField.Input` when migrating split rows. Inline mode ignores all five.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `symbolTextStyle`                                                                                                                                      | Pad    | `textStyle` on `KeypadAmountEditor.Symbol`                                                                                                                                                                          | The symbol applies the dynamic font size itself. For an inline target the symbol becomes the input prefix.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `onPress`                                                                                                                                              | Pad    | `onPress` on `KeypadAmountEditor.Input`                                                                                                                                                                             | Wrapped by `useAmountPressSelection`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `testID`                                                                                                                                               | Both   | `testID` on `.Input`, or on the `KeypadAmountEditor` root                                                                                                                                                           | Legacy `testID` lands on the input. The `KeypadAmountEditor` root suffixes its `testID` for the layout parts (`-body`, `-main`, `-amount`, `-pad`, `-footer`), so tests that call `fireEvent.changeText` need the `testID` on `.Input`.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `scrollViewStyle`, `shouldRefocusOnScrollViewClick`, `outerContainerStyles`, `negativeSymbolStyle`                                                     | Pad    | No equivalent                                                                                                                                                                                                       | None of the current migration targets need `negativeSymbolStyle`. Split rows and `InlineNumberEditCell` container styles are added when migrating those components (see [section 4](#4-prerequisites-and-incremental-props)).                                                                                                                                                                                                                                                                                                                                                                                                                                       |

Props that legacy accepts but never uses (do not port them):

- `onChangeAmount`. Pad mode always passes its own handler (the prop only leaks into the public type through a typo in `Omit`). Use `onInputChange`.
- `selection` and `rightHandSideComponent`. Neither is read from the caller's props.
- `shouldAllowFocusInLandscapeMode`. Pad mode hardcodes `true`, which is also the `KeypadAmountEditor.Input` default.
- In inline mode, the input and styling props other than `label`, `symbol`, `hideSymbol`, `disabled`, `keyboardType`, `autoFocus`, `autoGrowExtraSpace`, `autoGrowMarginSide`, `onSubmitEditing`, `onFocus`, `onBlur`, `testID` and the button props. The value and validation props (`value`, `onInputChange`, `decimals`, `maxLength`, `errorText`, the sign props, `numberFormRef`, `ref`) work in both modes. Examples of props with no effect in inline mode: `autoGrow`, `hideFocusedState`, `containerStyle`, `touchableInputWrapperStyle`, `prefixCharacter`, `prefixStyle`, `contentWidth`, `symbolTextStyle`.

## 4. Prerequisites and incremental props

This guide serves as a stable architectural reference and design specification. Overall migration progress and task tracking are coordinated in the parent GitHub tracking issue ([#97970](https://github.com/Expensify/App/issues/97970)).

### Foundational prerequisites across shared primitives

Before or alongside early screen migrations, these two cross-cutting behaviors should be resolved in the shared primitives:

1. **`submitBehavior` on Enter:** `KeypadAmountEditor.Input` and `AmountFormField.Input` hardcode `submitBehavior="submit"`. Legacy effectively fell back to `"blurAndSubmit"` (dismissing the keyboard or blurring the input on Enter). Call sites that rely on Enter to blur or dismiss the keyboard (such as `SplitAmountInput`, `useSplitParticipants`, and `InlineNumberEditCell`) require a configurable `submitBehavior` prop or an agreed unified default.
2. **`sentryLabel` coverage:** Per `AGENTS.md`, all interactive inputs and buttons require a `sentryLabel`. Legacy inline mode set `CONST.SENTRY_LABEL.NUMBER_WITH_SYMBOL_FORM.INPUT`. Add missing Sentry labels to `KeypadAmountEditor.Input`, `AmountFormField.Input`, and the action buttons (`AmountActionButtons`).

### Incremental prop additions per screen

The new primitives intentionally ship with a clean, minimal API rather than porting legacy props on speculation. If a migrated screen genuinely needs a prop or style that the new primitive does not yet expose, **add that prop to the shared primitive in the PR that migrates that specific screen, accompanied by unit tests**.

- **`AmountField` / `AmountFilterInput`:** Requires `ref` (to restore focus after currency picker modal closes) and borderless button styling on `AmountCurrencyPickerButton`.
- **Split rows (`SplitAmountInput`, `useSplitParticipants`):** Require `prefixStyle` (to avoid muted color) and `containerStyle` on `AmountFormField.Input`.
- **`InlineNumberEditCell`:** Combines `prefixStyle`, `containerStyle`, `autoGrow={isRightAligned}`, and empty-area click refocusing (`scrollViewStyle`). Commit `f64d6fa7060` fixed amount jumping in left-aligned cells with these four properties working together; reproduce them in that cell's migration PR.
- **Dead code to delete:** `OptionRow.amountInputProps` is dead code (`shouldShowAmountInput` is never set anywhere in the app); delete the branch in `OptionRow.tsx` and the two `OptionData` fields in `src/libs/ReportUtils.ts` instead of porting them.

### Default differences for pad-without-pad callers

`KeypadAmountInput` preserves all legacy pad-mode defaults from `AmountTextInput` (`inputMode="decimal"`, `autoCorrect={false}`, `spellCheck={false}`, `disableKeyboardShortcuts`, `shouldInterceptSwipe`, `placeholder={numberFormat(0)}`).

The real differences affect legacy pad-mode call sites that do not use a keypad (such as split rows and `InlineNumberEditCell`) when migrated to `AmountFormField.Input`. Inline-mode callers are unaffected because legacy inline mode already used `DECIMAL_PAD` with `inputMode="decimal"`.

| Setting | Legacy pad mode (`AmountTextInput`) | `AmountFormField.Input` |
| --- | --- | --- |
| `keyboardType` | unset, with `inputMode` decimal | `DECIMAL_PAD` |
| `autoCorrect` / `spellCheck` | `false` | not set, so keyboard suggestion bar can appear |
| `shouldInterceptSwipe`, `disableKeyboardShortcuts` | set (`true`) | not set |
| `placeholder` | `numberFormat(0)` | none |
| `shouldApplyPaddingToContainer` | defaults to `false` | `undefined`, so `BaseTextInput` uses `true` |

## 5. Examples

### A. Full-screen currency amount (`MoneyRequestAmountForm`)

```tsx
type AmountStepProps = {
    amount: number;
    currency: string;
    selectedTab: string;
    allowFlippingAmount?: boolean;
    isCurrencyPressable?: boolean;
    iouType?: ValueOf<typeof CONST.IOU.TYPE>;
    isP2P?: boolean;
    onAmountChange: (amount: string) => void;
    onSubmit: (data: {amount: string; currency: string}) => void;
    onOpenCurrencyPicker?: () => void;
};

function AmountStep({
    amount,
    currency,
    selectedTab,
    allowFlippingAmount = false,
    isCurrencyPressable = true,
    iouType = CONST.IOU.TYPE.SUBMIT,
    isP2P = false,
    onAmountChange,
    onSubmit,
    onOpenCurrencyPicker,
}: AmountStepProps) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const amountEditorRef = useRef<AmountEditingRef>(null);
    const [formError, setFormError] = useState('');

    const decimals = getCurrencyDecimals(currency);
    const symbol = getLocalizedCurrencySymbol(preferredLocale, currency) ?? '';
    // `amount` is committed data (a saved draft or a loaded transaction), not the typed text. It is signed, so the frontend string is signed too.
    const frontendAmount = amount ? convertToFrontendAmountAsString(amount, decimals) : '';

    // Reset error during render with the previous-value pattern (complying with React Compiler's rc/set-state-in-effect)
    const [previousSync, setPreviousSync] = useState({selectedTab, frontendAmount});
    if (previousSync.selectedTab !== selectedTab || previousSync.frontendAmount !== frontendAmount) {
        setPreviousSync({selectedTab, frontendAmount});
        setFormError('');
    }

    useEffect(() => {
        // Skip when the editor already shows this value, otherwise the caret jumps to the end
        if (amountEditorRef.current?.getNumber() === frontendAmount) {
            return;
        }
        amountEditorRef.current?.updateNumber(frontendAmount);
    }, [selectedTab, frontendAmount]);

    const submit = () => {
        const currentAmount = amountEditorRef.current?.getNumber() ?? '';
        // '' and '-' (a flip on an empty input) are not valid amounts.
        // Critical: getNumber() returns the signed canonical value (e.g. "-10").
        // Legacy `isAmountInvalid(amount, ...)` expects the magnitude without sign and rejects `parseFloat(amount) < 0`.
        // To preserve existing business validation (e.g. minimum 0.01 for P2P and nonZeroExpenses), validate the magnitude.
        const magnitude = currentAmount.replace(/^-/, '');
        if (!magnitude.length || Number.isNaN(parseFloat(magnitude)) || isAmountInvalid(magnitude, iouType, isP2P)) {
            setFormError(translate('iou.error.invalidAmount'));
            return;
        }
        onSubmit({amount: currentAmount, currency});
    };

    return (
        <KeypadAmountEditor
            ref={amountEditorRef}
            value={frontendAmount}
            onInputChange={(newAmount) => {
                onAmountChange(newAmount);
                setFormError('');
            }}
            decimals={decimals}
            allowNegative={allowFlippingAmount}
            shouldUseDynamicFontSize
            errorText={formError}
            actions={
                <>
                    {isCurrencyPressable && (
                        <KeypadAmountEditor.CurrencyPickerButton
                            currency={currency}
                            onPress={onOpenCurrencyPicker}
                        />
                    )}
                    <KeypadAmountEditor.SignFlipButton />
                </>
            }
            footer={
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    style={styles.w100}
                    onPress={submit}
                >
                    <Button.KeyboardShortcut />
                    <Button.Text>{translate('common.next')}</Button.Text>
                </Button>
            }
        >
            {!!symbol && <KeypadAmountEditor.Symbol>{symbol}</KeypadAmountEditor.Symbol>}
            <KeypadAmountEditor.Input
                testID="moneyRequestAmountInput"
                accessibilityLabel={`${translate('iou.amount')} (${currency})`}
            />
        </KeypadAmountEditor>
    );
}
```

- Remove the outer `<ScrollView contentContainerStyle={styles.flexGrow1}>` that `MoneyRequestAmountForm` renders around the legacy input. `KeypadAmountLayout` owns its own `ScrollView` and layout (`flexGrow`, two columns in landscape), so an outer one adds a redundant scroll container and breaks layout parity.
- `MoneyRequestAmountForm` passes `inputStyle`, `containerStyle`, `touchableInputWrapperStyle` and `autoGrowExtraSpace` that `KeypadAmountEditor.Input` already applies. Drop them.
- `onAmountChange` must not write the typed value back into `amount`. If it did, typing `1.5` would round-trip to `frontendAmount = "1.50"`, the equality guard would fail and `updateNumber` would rewrite the text and move the caret mid-typing. If the caller has to persist every keystroke, compare numerically (`parseFloat(getNumber()) === parseFloat(frontendAmount)`) in the effect instead of comparing strings.
- **Signed value vs business validation (`isAmountInvalid`).** `KeypadAmountEditor.getNumber()` returns the signed canonical value (`"-10"`). Legacy `MoneyRequestAmountForm` passed the unsigned magnitude to `isAmountInvalid` (which is a module-private helper in `MoneyRequestAmountForm.tsx:74` that must be extracted to a shared utility like `IOUUtils` when migrating). `isAmountInvalid` rejects `parseFloat(amount) < 0`. Calling `isAmountInvalid` directly with `getNumber()` would reject all negative amounts. Validate the magnitude (`currentAmount.replace(/^-/, '')`) or adapt the validation function. Note: tax amount steps skip `isAmountInvalid` in favor of `isTaxAmountInvalid`, where 0 is valid.
- Sync rules for a real `MoneyRequestAmountInput` migration are in [section 6](#6-migrating-moneyrequestamountinput).

### B. Full-screen unit suffix (hours)

```tsx
type HoursStepProps = {
    /** Canonical count string (e.g. `${transaction?.comment?.units?.count ?? ''}`). */
    committedCount: string;
    selectedTab: string;
    onSave: (count: number) => void;
};

function HoursStep({committedCount, selectedTab, onSave}: HoursStepProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const amountEditorRef = useRef<AmountEditingRef>(null);
    const [formError, setFormError] = useState('');
    // Mirrors the editor value so dirtiness derives from state during render
    const [typedCount, setTypedCount] = useState(committedCount);
    const [previousSync, setPreviousSync] = useState({selectedTab, committedCount});

    // Reset the mirror and the error together with the committed value or the tab
    if (previousSync.selectedTab !== selectedTab || previousSync.committedCount !== committedCount) {
        setPreviousSync({selectedTab, committedCount});
        setTypedCount(committedCount);
        setFormError('');
    }

    // Only pushes the value into the imperative editor. It does not notify onInputChange.
    useEffect(() => {
        if (amountEditorRef.current?.getNumber() === committedCount) {
            return;
        }
        amountEditorRef.current?.updateNumber(committedCount);
    }, [selectedTab, committedCount]);

    const {suppressDiscardPrompt} = useDiscardChangesConfirmation({
        // Simplified. Keep the page's existing `getStringFieldHasUnsavedChanges(typed, committed, ...)` helper instead of `!==`.
        getHasUnsavedChanges: () => typedCount !== committedCount,
    });

    const save = () => {
        const count = parseFloat(amountEditorRef.current?.getNumber() ?? '');
        if (Number.isNaN(count) || count <= 0) {
            setFormError(translate('iou.error.quantityGreaterThanZero'));
            return;
        }
        suppressDiscardPrompt();
        onSave(count);
    };

    return (
        <KeypadAmountEditor
            ref={amountEditorRef}
            value={committedCount}
            onInputChange={(newCount) => {
                setTypedCount(newCount);
                setFormError('');
            }}
            decimals={CONST.HOURS_DECIMAL_PLACES}
            errorText={formError}
            shouldUseDynamicFontSize
            footer={
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    style={styles.w100}
                    onPress={save}
                >
                    <Button.KeyboardShortcut />
                    <Button.Text>{translate('common.save')}</Button.Text>
                </Button>
            }
        >
            <KeypadAmountEditor.Input accessibilityLabel={translate('iou.timeTracking.hours')} />
            <KeypadAmountEditor.Symbol>{translate('iou.timeTracking.hrs')}</KeypadAmountEditor.Symbol>
        </KeypadAmountEditor>
    );
}
```

- A suffix symbol is a `Symbol` after `.Input`. Pass `textStyle={styles.textSupporting}` only when the screen wants the supporting color (e.g. `DynamicIOURequestStepDistanceManual`); `IOURequestStepHours` leaves it at the default bold style.
- `getNumber()` is fine in `save` because it runs in an event handler. The dirty check reads the mirror.
- `IOURequestStepHours` and `DynamicIOURequestStepDistanceManual` already keep the mirror (`typedCount`, `typedDistance`). Keep it when migrating them. Note that `DynamicIOURequestStepDistanceManual` does not clear `formError` in its effect (only hours does). Move mirror resets out of the effect into the render-time reset so they stay pure and reactive. `DynamicIOURequestStepDistanceManual` also re-seeds the mirror when the transaction hydrates after mount, which the render-time reset covers.

### C. Inline field (`AmountField` in the confirmation list)

```tsx
<AmountFormField
    key={transactionID}
    value={transactionAmount}
    onInputChange={handleAmountChange}
    decimals={decimals}
    allowNegative={allowNegative}
    errorText={amountFieldErrorText}
>
    <AmountFormField.Input
        label={translate('iou.amount')}
        prefixCharacter={getLocalizedCurrencySymbol(preferredLocale, effectiveCurrency) ?? ''}
        onFocus={() => setIsAmountInputFocused(true)}
        onBlur={() => setIsAmountInputFocused(false)}
    >
        {shouldShowAmountButtons ? (
            <>
                <AmountFormField.SignFlipButton />
                <AmountFormField.CurrencyPickerButton
                    currency={effectiveCurrency}
                    onPress={showCurrencyPicker}
                />
            </>
        ) : (
            <AutomaticFieldHint />
        )}
    </AmountFormField.Input>
</AmountFormField>
```

- Compose trailing accessories (`SignFlipButton`, `CurrencyPickerButton`, or `AutomaticFieldHint`) as `children` of `AmountFormField.Input`. They render inside the input border via `BaseTextInput`'s `rightHandSideComponent`.
- The hint and the buttons are mutually exclusive in `AmountField` (`shouldShowAmountButtons = !shouldShowAutomaticHint`).
- Keep `amountTrailingAction` as a sibling of the field row.
- Add the picker `ref` and borderless styling to `AmountCurrencyPickerButton` as part of the `AmountField` migration.

### D. Standalone screen or `FormProvider`

`KeypadAmountLayout` owns the scroll view and the footer. `FormProvider` wraps its children in a `ScrollView` (`ScrollViewWithContext` when `scrollContextEnabled` is set) unless `shouldUseScrollView` is `false`, and renders its own submit button. Nesting the editor in it gives two scroll containers and two submit buttons.

Approach 1 (recommended): make the screen standalone and follow the structure of `WorkspaceCreateTaxValuePage`, which never used `FormProvider`. Use `KeypadAmountEditor` with a `footer` button and a save handler. Move the form's `validate` into that handler and show failures through `errorText`. Keep no-op exit checks (for example comparing with the default value) in the handler. A standalone `Button` stays enabled offline, which matches `enabledWhenOffline`. For a percent or unit value, put the `Symbol` after `.Input` and pass `autoGrowMarginSide="left"` and `style={styles.textAlignRight}` to `.Input`, as the reference page does.

`FormProvider` also provided things that a standalone page must re-create or drop on purpose. Check whether the page relies on the submit button's loading state (`isLoading` from the form's Onyx key), server errors shown by the form alert (the form's `errors`), and draft saving (`shouldSaveDraft` and the form draft key).

Approach 2 (only if the screen cannot leave `FormProvider` in the same PR): wrap `KeypadAmountEditor` in an `InputWrapper`-compatible component. Forward `onBlur`, `onSubmitEditing` and the form `ref` to `.Input` (not to the root), and register the component in the `ValidInputs` union in `src/components/Form/types.ts`. For amount fields, use the `AmountForm` adapter ([section 7](#7-amountform)) instead of writing a new one.

## 6. Migrating `MoneyRequestAmountInput`

`MoneyRequestAmountInput` is pad mode only (it never uses inline mode). It wraps `NumberWithSymbolForm`, so [section 3](#3-prop-mapping) applies to the props it forwards. Full-screen use (`MoneyRequestAmountForm`) moves to `KeypadAmountEditor`. Split rows (`SplitAmountInput`, `useSplitParticipants`) pass `shouldWrapInputInContainer={false}` and no pad, so they move to `AmountFormField`. Note: `OptionRow.amountInputProps` is dead code (`shouldShowAmountInput` is never set anywhere in the app); delete the branch in `OptionRow.tsx` and the two `OptionData` fields in `src/libs/ReportUtils.ts` instead of migrating it. `MoneyRequestAmountFormProps` in `MoneyRequestAmountForm.tsx` is typed from `MoneyRequestAmountInputProps` and must be retyped as part of that migration.

| Legacy prop                                                             | Target                                                                                                                                                     | Notes                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `amount` (backend integer), `onFormatAmount`                            | `value` on the root for the initial value, `updateNumber` for later changes                                                                                | Use the sync rules below.                                                                                                                                                                                             |
| `currency` (defaults to `CONST.CURRENCY.USD`)                           | `decimals` from `getCurrencyDecimals(currency)` on the root                                                                                                | The legacy component reads `getCurrencyDecimals` from `useCurrencyListActions()` itself. The caller does it now.                                                                                                      |
| `hideCurrencySymbol`, `prefixCharacter`                                 | `getLocalizedCurrencySymbol(preferredLocale, currency) ?? ''` as the `KeypadAmountEditor.Symbol` child, or as `prefixCharacter` on `AmountFormField.Input` | The legacy component computes the symbol itself. Split rows pass `hideCurrencySymbol` plus `prefixCharacter`, which maps to `prefixCharacter` alone.                                                                  |
| `isCurrencyPressable` (defaults to `true`), `onCurrencyButtonPress`     | `CurrencyPickerButton` only when pressable, `onCurrencyButtonPress` becomes `onPress`                                                                      | Guard rules are in the `currency` row of section 3.                                                                                                                                                                   |
| `onAmountChange`                                                        | `onInputChange` on the root                                                                                                                                | Receives the canonical signed value.                                                                                                                                                                                  |
| `inputStyle`                                                            | `style` on `.Input`                                                                                                                                        |                                                                                                                                                                                                                       |
| `moneyRequestAmountInputRef`, `ref`                                     | `ref` on the root, `ref` on `.Input`                                                                                                                       | Same split as `numberFormRef` and `ref` in section 3.                                                                                                                                                                 |
| Computed accessibility label                                            | `accessibilityLabel` on `.Input`                                                                                                                           | The legacy component always sets `` `${translate('iou.amount')} (${currency})` ``. Pass it explicitly.                                                                                                                |
| Defaults `disableKeyboard`, `hideFocusedState`, `autoGrow` (all `true`) | Defaults of `KeypadAmountEditor.Input`                                                                                                                     | `KeypadAmountEditor.Input` has the same `true` defaults. `BaseTextInput` defaults them to `false`, which is what `SplitAmountInput` and `useSplitParticipants` pass.                                                  |
| `shouldShowBigNumberPad` (defaults to `false`)                          | None                                                                                                                                                       | `MoneyRequestAmountForm` passes `canUseTouchScreen`. `KeypadAmountEditor` renders the pad on touch screens by itself, so drop the prop.                                                                               |

### Behavior to re-create

The legacy effect that syncs `amount` into the editor has these rules. Re-create them in the effect that calls `updateNumber`.

- **Skip conditions.** Skip when `currency` is empty, when `amount` is not a number, or when `formatAmountOnBlur` is set and the input is focused (`isTextInputFocused` from `@components/TextInput/BaseTextInput/isTextInputFocused`). The legacy expression is `(!currency || typeof amount !== 'number' || (formatAmountOnBlur && isTextInputFocused(textInput))) ?? shouldKeepUserInput`. `shouldKeepUserInput` therefore applies only when `formatAmountOnBlur` is `undefined`. With `true` or `false` it is ignored. The effect also reruns when `shouldKeepUserInput` changes.
- **Equality guard.** Skip `updateNumber` when the formatted amount already equals `getNumber()`. Without the guard, every external update moves the caret to the end.
- **Canonical input only.** `updateNumber` takes a canonical string. The three call sites that format with `convertToFrontendAmountAsString(amountAsInt, getCurrencyDecimals(currency))` already produce one. `useSplitParticipants` passes `convertToDisplayStringWithoutCurrency`, which adds thousand grouping separators even in English (`"1,234.00"`, `CurrencyUtils.ts:180`) and uses locale-specific decimal separators in other locales. Convert to a canonical string (e.g. via `convertToFrontendAmountAsString`) before calling `updateNumber`.
- **`formatAmountOnBlur` and `maxLength` trap.** On blur the legacy component re-formats the `amount` prop with `onFormatAmount` and calls `updateNumber`, unless `maxLength` is set and the formatted string is longer than it. Notice that legacy `MoneyRequestAmountInput` used `maxLength` only in this blur guard and never forwarded it to the input. In contrast, passing `maxLength` to `KeypadAmountEditor` or `AmountFormField` restricts the number of integer digits typed. Re-create the blur re-formatting in `onBlur` on `.Input` if needed, or drop it on purpose.
- **Sign handling in `MoneyRequestAmountForm`.** The legacy form keeps the magnitude in the input and the sign in `isNegative` state. With the signed value most of that state goes away, but preserve these behaviors:
  - Legacy `updateNumber` ran the value through `handleNegativeAmountFlipping`, so with `allowFlippingAmount`, `updateNumber('-5')` stripped the minus and called `toggleNegative`. `KeypadAmountEditor.updateNumber('-5')` stores the sign in the value directly. Pass the signed canonical value and drop the toggle workaround.
  - A manual flip survives asynchronous `amount` loads (`isUserSignOverrideRef`) and is discarded on a tab switch (`initializeIsNegative(amount, true)` in the `selectedTab` effect). The sync effect must therefore keep the user's sign while an override is active, and re-derive the sign from `amount < 0` on a tab switch.
  - `initialIsNegativeRef` is the baseline for `onSignDirtyChange`. Both the flip button and `clearNegative` report it. In the editor both arrive through `onInputChange` with a signed value, so compute the sign there (`startsWith('-')`) and compare it with the baseline. `IOURequestStepAmount` mirrors the typed amount and the sign-dirty flag in state for `getAmountHasUnsavedChanges` (see the dirty-tracking rule in [section 2](#2-behavior-semantics)).
  - The `getNumber` handle (`MoneyRequestAmountFormHandle`) returns the signed value, and `''` for an empty input. `KeypadAmountEditor.getNumber()` is already signed, but a flip on an empty input yields `'-'`. Normalize it before reporting or validating.

## 7. `AmountForm`

`AmountForm` (`src/components/AmountForm.tsx`) is the `FormProvider` adapter for amount fields. It derives `decimals` and the localized symbol from `currency`, forwards `ref` to the text input so `FormProvider` can focus the first invalid field, forwards `numberFormRef` to the editor, and is registered in `ValidInputs`. Keep it as an adapter. Migrating its 20 usages to the primitives one by one would make every screen re-create this wiring, or leave `FormProvider` and lose its loading state, error alert and drafts.

One consumer, `WorkspaceWorkflowsApprovalsApprovalLimitPage`, renders `AmountForm` directly outside `FormProvider` (controlled through `value`, `onInputChange` and a `key`). Keep that usage working in both PRs below.

`AmountForm` picks one of two paths:

| Path   | Condition                  | Renders today          | Consumers                                                                                                   |
| ------ | -------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| Inline | `displayAsTextInput`       | `AmountFormField`      | `ChronosScheduleOOOPage` and the other 16 consumers                                                         |
| Pad    | `displayAsTextInput` unset | `NumberWithSymbolForm` | `PolicyDistanceRateEditPage`, `PolicyDistanceRateTaxReclaimableEditPage`, `DynamicExpensifyCardLimitPage` |

The inline path routes directly to `AmountFormField`, composing `AmountFormField.CurrencyPickerButton` inside `AmountFormField.Input` as a child when `shouldShowCurrencyButton` is set. Until the legacy pad path is migrated, do not add `AmountForm` usages in pad mode. Lint does not catch them.

Migrate in two PRs:

1. **Migrate the legacy pad path inside `AmountForm`.** Keep the consumers unchanged and keep the rendered behavior.
   - Render `KeypadAmountEditor` without `footer`, because `FormProvider` renders the submit button. Put `KeypadAmountEditor.Symbol` before `.Input` unless `hideCurrencySymbol` is set. Pass `autoGrowExtraSpace={0}` to `.Input`: legacy `AmountForm` did not pass the prop, while `KeypadAmountEditor.Input` defaults it to `variables.w80`. The editor stays nested in the `FormProvider` scroll view. Legacy rendered the same nesting, so the structure matches, but this is not the standalone layout that [example D](#d-standalone-screen-or-formprovider) recommends for new screens. `KeypadAmountLayout` is not identical to the legacy scroll view: it adds `flex1`, bottom safe-area padding (which `FormWrapper` already applies), `pb5` on touch screens and an empty-area mouse-down that refocuses the input. Verify height and bottom padding against the three pad consumers on native and mWeb, and suppress the duplicated padding if needed.
   - Legacy pad mode also read `disabled`, `label` (beyond the accessibility label) and the currency button props. All three pad consumers pass `isCurrencyPressable={false}`. When migrating to `KeypadAmountEditor`, omit the currency picker action button because the currency is not pressable. `KeypadAmountEditor.Input` has no `disabled` prop.
   - Add tests to `tests/ui/AmountFormTest.tsx` for the pad path with its symbol and `numberFormRef`.
2. **Split `AmountForm` into an inline adapter and a pad adapter.** Do this in a separate PR that does not change rendering. `displayAsTextInput` is a mode switch ([CLEAN-REACT-PATTERNS-1](../.claude/skills/app-coding-standards/rules/clean-react-1-composition-over-config.md)), and the two paths share only the currency derivation.
   - Move the currency derivation (`decimals` override, `getCurrencyDecimals`, `getLocalizedCurrencySymbol`) into a hook used by both adapters.
   - Give each adapter its own props type. The inline adapter takes `label`, `disabled` and the currency button props. The pad adapter takes none of them, so passing one is a type error instead of a prop that is silently ignored.
   - Register both adapters in `ValidInputs` and remove `AmountForm`.
   - Every `FormProvider` consumer passes `displayAsTextInput` as a literal, so each one only changes `InputComponent` and drops the prop; `WorkspaceWorkflowsApprovalsApprovalLimitPage` changes its direct JSX tag to `AmountFormInline`. Migrate all consumers in this one PR.
   - The inline adapter must also work without `InputWrapper`, because `WorkspaceWorkflowsApprovalsApprovalLimitPage` renders it directly.
