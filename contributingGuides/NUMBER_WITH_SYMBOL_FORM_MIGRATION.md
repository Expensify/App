# NumberWithSymbolForm to KeypadAmountEditor / AmountFormField Migration Guide

`NumberWithSymbolForm` is deprecated in favor of explicit composition via `KeypadAmountEditor` (for full-screen number inputs with touch pads) and `AmountFormField` (for inline inputs inside forms and list rows).

---

## 1. V1 Prop to Composition Mapping

| Legacy `NumberWithSymbolForm` Prop | Target API (`KeypadAmountEditor` / `AmountFormField`) | Notes |
|---|---|---|
| `value` | `value` on root (`KeypadAmountEditor` / `AmountFormField`) | Canonical signed value. |
| `onInputChange` | `onInputChange` on root | Receives canonical signed value directly. |
| `decimals` | `decimals` on root | Supported decimal places. |
| `maxLength` | `maxLength` on root | Maximum digit length constraint. |
| `errorText` | `errorText` on root | Error message rendered by layout. |
| `allowNegativeInput` / `allowFlippingAmount` | `allowNegative` on root | Governs whether negative numbers can be input or toggled. |
| `isNegative` / `toggleNegative` / `clearNegative` | Replaced by signed `value` + `.SignFlipButton` | `isNegative` and `toggleNegative` are forwarded from `TextInputWithSymbol`; `clearNegative` is a `NumberWithSymbolForm` prop. Callers no longer manage detached sign state separately. For call sites tracking whether the visible sign differs from a baseline (e.g. `onSignDirtyChange` in `MoneyRequestAmountForm`), compare the sign of the canonical value against the initial value in `onInputChange`. |
| `currency` / `symbol` / `hideSymbol` | `KeypadAmountEditor.Symbol` (omit it to hide) or `prefixCharacter` on either `.Input` (pass `''` to hide) | `hideSymbol` comes from `TextInputWithSymbol`. Explicit composition replacing ambiguous symbol positioning. |
| `symbolPosition` | Explicit JSX ordering (`KeypadAmountEditor`) or `prefixCharacter` (`AmountFormField`) | Deprecates `CONST.TEXT_INPUT_SYMBOL_POSITION`. |
| `isSymbolPressable` / `onSymbolButtonPress` | Compose `KeypadAmountEditor.CurrencyPickerButton` or `AmountFormField.CurrencyPickerButton` | Compose the button only when pressable. `onSymbolButtonPress` becomes `onPress`. |
| `symbolTextStyle` | `textStyle` on `KeypadAmountEditor.Symbol` | No `AmountFormField` equivalent (prefix styling is handled via text input styles). |
| `shouldShowFlipButton` | Compose `KeypadAmountEditor.SignFlipButton` or `AmountFormField.SignFlipButton` | In `actions` for `KeypadAmountEditor`; as a sibling of `AmountFormField.Input` inside the root for `AmountFormField` (no right-hand slot). |
| `shouldShowCurrencyButton` / `onCurrencyButtonPress` | Compose `KeypadAmountEditor.CurrencyPickerButton` or `AmountFormField.CurrencyPickerButton` | Explicit button composition. Note: legacy hid the button when `currencyOrUnitButtonText` was empty; `AmountCurrencyPickerButton` renders unconditionally, so guard with `!!currency` if currency can be empty. |
| `currencyButtonRef` | `ref` on `CurrencyPickerButton` | Used by `AmountField` to return focus to the button when the currency picker modal closes (prevents regression of issue #96614). Note: `AmountCurrencyPickerButtonProps` will accept `ref` when migrating `AmountField` (see [Preset Policy](#4-preset-policy)). |
| `currencyButtonLabel` / `currencyButtonAccessibilityLabel` | `accessibilityLabel` on `CurrencyPickerButton` | The button always displays the `currency` code as visible text. If a custom visible label is needed (e.g. `ChronosScheduleOOOPage` passing time units via `AmountForm`), pass it as `currency={currencyButtonLabel ?? currency}` or introduce a `label` prop in that migration PR. |
| `shouldUseBorderlessButtons` | **No equivalent yet** | Legacy behavior sets the inner and hover backgrounds to transparent and the button text to the supporting color. `style` on the new buttons does not reach the inner background. Add a borderless variant to `AmountActionButtons` in the PR that migrates the first call site needing it (see [Preset Policy](#4-preset-policy)). |
| `shouldShowBigNumberPad` | Built into `KeypadAmountLayout` | Pad renders automatically on touch devices; callers that pass `false` (e.g. `InlineNumberEditCell`, `AmountField`) must use `AmountFormField` instead. |
| `displayAsTextInput` | Use `AmountFormField` instead of `KeypadAmountEditor` | Inline field architecture. |
| `shouldWrapInputInContainer={false}` | Use `AmountFormField` instead of `KeypadAmountEditor` | Inline field architecture. |
| `footer` | `footer` prop on `KeypadAmountEditor` | Rendered below input/pad layout. |
| `numberFormRef` / `ref` | `ref` on root (`AmountEditingRef` / `AmountFormFieldRef`) and/or `ref` on `.Input` (`BaseTextInputRef`) | Imperative ref access. `AmountFormFieldRef` is an alias of `AmountEditingRef`. |
| `label` / `accessibilityLabel` | `label` on `AmountFormField.Input`; `accessibilityLabel` on `KeypadAmountEditor.Input` (no visible label) or `AmountFormField.Input` | Passed to input primitive. |
| `autoFocus` | `autoFocus` on `.Input` | Passed to input primitive. |
| `disabled` | `disabled` on `AmountFormField.Input`, `isDisabled` on buttons | `KeypadAmountEditor.Input` has no `disabled` prop. |
| `shouldUseDynamicFontSize` | `shouldUseDynamicFontSize` on `KeypadAmountEditor` | Dynamic scaling on full-screen amounts. |
| `autoGrow` / `autoGrowExtraSpace` / `autoGrowMarginSide` | Props on `KeypadAmountEditor.Input` only | Passed to input primitive. Note: `InlineNumberEditCell` relies on `autoGrow={isRightAligned}` to avoid text jumping when typing (see commit `f64d6fa7060`); add `autoGrow` to `AmountFormField.Input` in that migration PR. |
| `disableKeyboard` / `keyboardType` | Props on `.Input` | Passed to input primitive. |
| `hideFocusedState` | `hideFocusedState` on `KeypadAmountEditor.Input` only | Passed to input primitive. |
| `prefixCharacter` | `prefixCharacter` on `.Input` | Supported by primitive. |
| `prefixContainerStyle` | `prefixContainerStyle` on `.Input` | Supported by primitive on both `.Input`s. |
| `shouldApplyPaddingToContainer` | `shouldApplyPaddingToContainer` on `.Input` | Passed to input primitive. |
| `shouldUseDefaultLineHeightForPrefix` | `shouldUseDefaultLineHeightForPrefix` on `.Input` | Passed to input primitive. |
| `contentWidth` / `touchableInputWrapperStyle` | `contentWidth` on `AmountFormField.Input` only; `touchableInputWrapperStyle` on both `.Input`s | Passed to input primitive. |
| `style` / `containerStyle` / `outerContainerStyles` | `style` on either `.Input`; `containerStyle` on `KeypadAmountEditor.Input` only | `outerContainerStyles` has no equivalent; wrap the root in a styled `View`. |
| `leadingRightHandSideComponent` | Sibling of `AmountFormField.Input` inside the root | `AmountFormField.Input` has no right-hand slot; content renders outside the text input border. |
| `prefixStyle` | `prefixStyle` on `KeypadAmountEditor.Input` | `AmountFormField.Input` always uses `styles.colorMuted`. |
| `onFocus` / `onBlur` | `onFocus` and `onBlur` on `.Input` | Supported on both `KeypadAmountEditor.Input` and `AmountFormField.Input`. |
| `onSubmitEditing` | `onSubmitEditing` on `.Input` | Supported on both `KeypadAmountEditor.Input` and `AmountFormField.Input`. |
| `onPress` | `onPress` on `KeypadAmountEditor.Input` | Passed to input primitive; wrapped by `useAmountPressSelection`. |
| `submitBehavior` | Hardcoded to `"submit"` on both new `.Input`s | Both `KeypadAmountEditor.Input` and `AmountFormField.Input` hardcode `submitBehavior="submit"`. Legacy `displayAsTextInput` did not pass `submitBehavior`, defaulting to RN single-line `"blurAndSubmit"`. Full-screen keypad editors use `"submit"`. If an inline or split-row call site migrating to `AmountFormField` needs `"blurAndSubmit"` (e.g. `SplitAmountInput` or `AmountField`), expose the prop on `AmountFormFieldInputProps` (or call `ref.current?.blur()` in `onSubmitEditing`) in that migration PR. |
| `testID` | `testID` on root (`KeypadAmountEditor`) or `.Input` | `KeypadAmountEditor` suffixes root `testID` for layout parts (`-body`, `-main`, `-amount`, `-pad`, `-footer`). Attach directly to `.Input` when test selectors target the input directly (e.g. for `fireEvent.changeText`). |
| `scrollViewStyle` | Wrap root in styled `View` if still needed | Pad mode applies it to portrait `ScrollView` `contentContainerStyle`. `KeypadAmountLayout` owns its `ScrollView` with no override, and `AmountFormField` has no `ScrollView`. |
| `shouldRefocusOnScrollViewClick` | Automatic on web in `KeypadAmountLayout` | Re-focus on empty area click is built into `KeypadAmountLayout`. `AmountFormField` has no equivalent. |
| `negativeSymbolStyle` | **No equivalent needed** (see [Section 2](#2-dead-props-map-to-nothing)) | Legacy pad mode forwarded it to style minus sign; `KeypadAmountEditor` renders minus sign itself. |

---

## 2. Dead Props Map to Nothing

The first list is dead or ignored props: do not replicate them. The second list is props that look legacy but still change behaviour: decide per call site.

### Dead or ignored props

1. **`onChangeAmount`**: Pad mode always passes `onChangeAmount={setNewNumber}` to `TextInputWithCurrencySymbol`. The `Omit` in `NumberWithSymbolFormProps` lists `'onAmountChange'` (a typo), so `onChangeAmount` leaks into the public type, but callers' callbacks are never invoked. Use `onInputChange`.
2. **`selection`**: Both modes pass the internal `selection` state. The caller value is ignored.
3. **`rightHandSideComponent`**: `displayAsTextInput` mode builds its own from the currency and flip buttons plus `leadingRightHandSideComponent`, and pad mode does not pass it. The caller value is ignored. Compose the content as described in section 1 instead.
4. **`shouldAllowFocusInLandscapeMode`**: Hardcoded to `true` in pad mode. `KeypadAmountEditor.Input` exposes it if it is ever needed.
5. In `displayAsTextInput` mode, roughly 30 public props are no-ops, because that branch never reads them (for example `autoGrow`, `hideFocusedState`, `negativeSymbolStyle`, `scrollViewStyle`).

### Live props that need an explicit decision

- **`prefixStyle`**: `displayAsTextInput` mode hardcodes `styles.colorMuted`, but pad mode forwards the caller's `props.prefixStyle`. Use `prefixStyle` on `KeypadAmountEditor.Input`. `AmountFormField.Input` always uses `styles.colorMuted`.
- **`negativeSymbolStyle`**: Pad mode forwards it to `TextInputWithCurrencySymbol`, where it styles the minus sign. `KeypadAmountEditor` renders the minus sign itself and has no style override. No call site passes it today (only `MoneyRequestAmountInput` forwards it), so there is nothing to preserve. If a call site ever needs it, file the gap in the migration PR.
- **`scrollViewStyle`**: Pad mode applies it to the portrait `ScrollView` `contentContainerStyle` and ignores it in landscape. `KeypadAmountLayout` owns its own `ScrollView` with no override, and `AmountFormField` has no `ScrollView`. Verify layout parity on the migrated screen, and wrap the root in a styled `View` if the style is still needed. The only call site is `InlineNumberEditCell`.
- **`autoGrow` in `InlineNumberEditCell`**: Commit `f64d6fa7060` added `autoGrow={isRightAligned}` and flex layout adjustments in `InlineNumberEditCell` to ensure amount text does not jump while typing. Currently `autoGrow` is only supported on `KeypadAmountEditor.Input`. When migrating `InlineNumberEditCell` to `AmountFormField`, add `autoGrow` to `AmountFormField.Input` in that migration PR and verify visual stability for both left-aligned and right-aligned cell layouts.
- **`shouldRefocusOnScrollViewClick`**: In portrait pad mode, a mouse-down on empty `ScrollView` space prevents default, refocuses the input, and switches the cursor to `cursorAuto`. `KeypadAmountLayout` always does the equivalent on web (any non-interactive area refocuses through `onEmptyAreaPress`, portrait uses `cursorAuto`), so full-screen call sites need no prop. `AmountFormField` has no equivalent. The only call site is `InlineNumberEditCell`, an inline cell that should move to `AmountFormField`: re-add the behaviour or consciously drop it in that migration PR.

---

## 3. Direct Composition Examples

### A. Full-Screen Currency Amount Form (e.g. `MoneyRequestAmountForm`)
```tsx
<KeypadAmountEditor
    value={amount}
    onInputChange={setAmount}
    decimals={decimals}
    allowNegative={allowNegative}
    shouldUseDynamicFontSize
    errorText={errorText}
    actions={
        <>
            <KeypadAmountEditor.CurrencyPickerButton
                currency={currency}
                onPress={openCurrencyPicker}
            />
            <KeypadAmountEditor.SignFlipButton />
        </>
    }
    footer={
        <Button
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            size={CONST.BUTTON_SIZE.LARGE}
            onPress={onSubmit}
        >
            <Button.KeyboardShortcut />
            <Button.Text>{translate('common.next')}</Button.Text>
        </Button>
    }
>
    {!hideCurrencySymbol && !!symbol && <KeypadAmountEditor.Symbol>{symbol}</KeypadAmountEditor.Symbol>}
    <KeypadAmountEditor.Input
        ref={inputRef}
        accessibilityLabel={translate('iou.amount')}
        testID="moneyRequestAmountInput"
    />
</KeypadAmountEditor>
```
* `KeypadAmountEditor.SignFlipButton` renders nothing unless the root has `allowNegative` and the device has a touch screen, so no caller-side guard is needed.
* **Important layout note for `MoneyRequestAmountForm`**: The legacy screen currently wraps its content in a `<ScrollView contentContainerStyle={styles.flexGrow1}>`. Because `KeypadAmountEditor` already provides its own responsive layout and `ScrollView` internally, **remove the outer `ScrollView`** during migration to avoid nested scroll container warnings.
* **Test ID placement**: Automated tests (such as `IOURequestStepAmountDraftTest`) target the input directly via `getByTestId('moneyRequestAmountInput')` to trigger `fireEvent.changeText`. Attach `testID="moneyRequestAmountInput"` directly to `KeypadAmountEditor.Input`, not the root (the root suffixes `testID` for its layout sections, e.g. `-amount` and `-body`).
* If callers need to access the canonical amount imperatively (e.g. via `amountFormRef.current?.getNumber()`), attach a `ref` of type `AmountEditingRef` to `KeypadAmountEditor`.

### B. Full-Screen Unit Suffix Form (e.g. Distance / Hours)
```tsx
<KeypadAmountEditor
    ref={amountEditorRef}
    value={hours}
    onInputChange={setHours}
    decimals={CONST.HOURS_DECIMAL_PLACES}
    errorText={formError}
    shouldUseDynamicFontSize
    footer={
        <Button
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            size={CONST.BUTTON_SIZE.LARGE}
            onPress={saveHours}
        >
            <Button.Text>{translate('common.save')}</Button.Text>
        </Button>
    }
>
    <KeypadAmountEditor.Input
        ref={textInputRef}
        accessibilityLabel={translate('iou.timeTracking.hours')}
    />
    <KeypadAmountEditor.Symbol textStyle={styles.textSupporting}>
        {translate('iou.timeTracking.hrs')}
    </KeypadAmountEditor.Symbol>
</KeypadAmountEditor>
```
* **Asynchronous value updates**: `useAmountEditingController` intentionally ignores external `value` changes while editing, resetting only when `value === ''`. If the initial or draft value arrives asynchronously from Onyx or when switching tabs (e.g. `IOURequestStepHours`, `DynamicIOURequestStepDistanceManual`), synchronize external updates into the editor by calling `amountEditorRef.current?.updateNumber(committedValue)` in an effect:
```tsx
useEffect(() => {
    amountEditorRef.current?.updateNumber(committedHours);
    // updateNumber does not notify onInputChange, so mirror the value manually
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHours(committedHours);
}, [selectedTab, committedHours]);
```
* The `react-hooks/set-state-in-effect` disable above mirrors the existing call sites in `IOURequestStepHours.tsx` and `DynamicIOURequestStepDistanceManual.tsx`.
* `updateNumber` does not invoke `onInputChange`, so callers that mirror the value in state must update it themselves. `IOURequestStepHours.tsx` does this with `setTypedCount` and also re-syncs on `selectedTab`.
* Pass `textStyle={styles.textSupporting}` to `KeypadAmountEditor.Symbol` when the unit suffix should match the supporting color rather than the bold amount text.

### C. Inline Field (e.g. `AmountField` in Confirmation List)
```tsx
<AmountFormField
    key={transactionID}
    value={transactionAmount}
    onInputChange={handleAmountChange}
    decimals={decimals}
    allowNegative={allowNegative}
    errorText={amountFieldErrorText}
>
    <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter]}>
        <View style={styles.flex1}>
            <AmountFormField.Input
                ref={amountInputRef}
                label={translate('iou.amount')}
                accessibilityLabel={translate('iou.amount')}
                prefixCharacter={currencySymbol}
                onFocus={() => setIsAmountInputFocused(true)}
                onBlur={() => setIsAmountInputFocused(false)}
            />
        </View>
        {shouldShowAutomaticHint && <AutomaticFieldHint />}
        {shouldShowAmountButtons && (
            <>
                <AmountFormField.SignFlipButton />
                <AmountFormField.CurrencyPickerButton
                    // Note: ref={currencyButtonRef} will be attached once AmountCurrencyPickerButton accepts ref (in that PR)
                    currency={effectiveCurrency}
                    onPress={showCurrencyPicker}
                />
            </>
        )}
    </View>
</AmountFormField>
```
* **Key-based state reset (`key={transactionID}`)**: Retain existing `key` props on migrated call sites (such as `key={transactionID}` in `AmountField` and `key={taxAmountInputKey}` in `TaxFields`). Because `useAmountEditingController` ignores non-empty external `value` changes while editing, remounting via `key` is the standard mechanism to reset the editor when switching between different transactions or items without an intermediate empty string.
* `AmountFormField.SignFlipButton` renders nothing unless the root has `allowNegative` and the device has a touch screen.
* Wrap `AmountFormField.Input` in a `<View style={styles.flex1}>` to ensure the input fills the row properly (because `touchableInputWrapperStyle` styles the inner pressable rather than the outer input container).
* `AutomaticFieldHint` renders after the input and before the action buttons, matching its legacy `leadingRightHandSideComponent` placement.
* The buttons render outside the input border because `AmountFormField.Input` has no right-hand slot, and borderless styling is not available yet.
* Forward `currencyButtonRef` to `CurrencyPickerButton` to restore keyboard focus upon closing the modal (issue #96614); `AmountCurrencyPickerButtonProps` will add `ref` in that migration PR. See the `leadingRightHandSideComponent` and `shouldUseBorderlessButtons` rows in [section 1](#1-v1-prop-to-composition-mapping).
* Render the buttons conditionally (`shouldShowAmountButtons`) so they do not show when the automatic field hint (`AutomaticFieldHint`) is visible.
* In `AmountField`, `amountTrailingAction` (e.g. the compact add-receipt button) renders alongside the field row; preserve its container sibling placement during migration.

### D. Form Integration vs. Standalone Screen Refactoring (e.g. `ValuePage` in Taxes)

When migrating screens that edit a non-currency numeric value (such as tax rate percentage), there are two architectural approaches:

#### Approach 1: Standalone Screen Refactoring (Recommended)
Screens that present a full-screen amount editor with numeric keypad should follow the pattern in `WorkspaceCreateTaxValuePage`: refactor away from `FormProvider` to standalone `KeypadAmountEditor` with a custom save callback and `footer={<Button variant={CONST.BUTTON_VARIANT.SUCCESS} ...>}`. This avoids nesting `KeypadAmountLayout`'s `ScrollView` inside `FormProvider`'s `ScrollViewWithContext`, prevents duplicate submit buttons, and eliminates impedance between form-wrapper state and the numeric controller.

When refactoring an edit screen (such as `ValuePage`) away from `FormProvider`, recreate any business validation (e.g. `validateTaxValue` checking the 0–100% range and required fields) directly inside the custom save callback before submitting to the backend, displaying validation failures via `errorText` on `KeypadAmountEditor`. A standalone `Button` stays enabled offline, matching `enabledWhenOffline`, so no extra handling is needed unless the screen must be disabled offline. Preserve no-op exit checks (e.g. comparing the input against `defaultValue`).

#### Approach 2: Form-Registered Input Component (Transitional)

> [!WARNING]
> Nesting `KeypadAmountEditor` inside `FormProvider` creates a nested `ScrollView` inside `ScrollViewWithContext`. Prefer Approach 1 whenever possible; use Approach 2 only if refactoring the screen away from `FormProvider` cannot be completed in the same PR.

For standard Onyx forms, `AmountForm` remains the supported `InputWrapper`-compatible amount input; it still renders `NumberWithSymbolForm` internally (grandfathered) and will be migrated separately. If you write a custom wrapper component adhering to `InputComponent` for `FormProvider`:

Forward `onBlur` to `.Input` so that blur validation and touched state trigger properly. Forward `onSubmitEditing` so that pressing Enter on desktop submits the form. For suffix symbols like `%`, pass `autoGrowMarginSide="left"` and `style={styles.textAlignRight}` to ensure proper text alignment. The form's `ref` targets the text input (used to focus the field), so forward it to `.Input`, not to the root:

```tsx
type TaxValueInputProps = {
    value?: string;
    defaultValue?: string;
    onInputChange?: (value: string) => void;
    onBlur?: KeypadAmountInputProps['onBlur'];
    onSubmitEditing?: KeypadAmountInputProps['onSubmitEditing'];
    errorText?: string;
    label?: string;
    ref?: ForwardedRef<BaseTextInputRef>;
};

function TaxValueInput({value, defaultValue, onInputChange, onBlur, onSubmitEditing, errorText, label, ref}: TaxValueInputProps) {
    const styles = useThemeStyles();

    return (
        <KeypadAmountEditor
            value={value ?? defaultValue}
            onInputChange={onInputChange}
            errorText={errorText}
            decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
            maxLength={CONST.MAX_TAX_RATE_INTEGER_PLACES}
        >
            <KeypadAmountEditor.Input
                ref={ref}
                accessibilityLabel={label}
                onBlur={onBlur}
                onSubmitEditing={onSubmitEditing}
                autoGrowMarginSide="left"
                style={styles.textAlignRight}
            />
            <KeypadAmountEditor.Symbol>%</KeypadAmountEditor.Symbol>
        </KeypadAmountEditor>
    );
}
```
Register the component by adding it to the `ValidInputs` union in `src/components/Form/types.ts`, because `InputWrapper` only accepts components listed there. When the last `NumberWithSymbolForm` call site is migrated, remove `| typeof NumberWithSymbolForm` from the same union.
```ts
type ValidInputs =
    // ...
    | typeof TaxValueInput;
```

---

## 4. Preset Policy

Presets (such as `NumberFormDistance`) are **not** built ahead of time.
* Add a preset only in the same PR as the first call site that demonstrates a repeated pattern across multiple screens.
* Only introduce a preset when composing inline would otherwise duplicate non-trivial JSX structure and glue code.

---

## 5. Verification Expected Per Migrated Call Site

For every migrated call site, verify:
1. **Ref contract**: Imperative methods (`clearSelection`, `updateNumber`, `getNumber`, focus/blur) work as expected.
2. **Scroll container hierarchy**: Confirm there are no nested `ScrollView` warnings when migrating full-screen pages to `KeypadAmountEditor`.
3. **External value synchronization**: Verify that asynchronous data updates (e.g. Onyx drafts or backend fetches) correctly push into the editor via `updateNumber`.
4. **Orientation**: Renders cleanly in both portrait and landscape orientations.
5. **Device type**: Behaves correctly on touch (e.g. mobile Safari / Android) and desktop/non-touch browsers (keyboard input, mouse interactions).
6. **Automated tests**: The screen and component's unit/UI tests pass without regression.

---

## 6. Migrating `MoneyRequestAmountInput`

`MoneyRequestAmountInput` wraps `NumberWithSymbolForm`, so everything in [section 1](#1-v1-prop-to-composition-mapping) applies to the props it forwards. This section covers only what it adds on top. Split-row call sites (`SplitAmountInput`, `OptionRow`, `useSplitParticipants`) move to `AmountFormField`; full-screen ones (`MoneyRequestAmountForm`) move to `KeypadAmountEditor`. Note that `OptionData.amountInputProps` in `src/libs/ReportUtils.ts` and `MoneyRequestAmountFormProps` in `MoneyRequestAmountForm.tsx` must also be retyped (or replaced with explicit fields) as part of those migrations.

| Legacy `MoneyRequestAmountInput` Prop | Target API | Notes |
|---|---|---|
| `amount` (backend integer) + `onFormatAmount` | `value` on root (initial value) + `updateNumber` on the root ref | Three of the four call sites pass the backend integer and an `onFormatAmount` that wraps `convertToFrontendAmountAsString(amountAsInt, getCurrencyDecimals(currency))`. `useSplitParticipants` passes `convertToDisplayStringWithoutCurrency`, which is locale-aware; convert to a canonical frontend string before feeding `updateNumber`, and verify with non-EN locales. The root only re-reads `value` when it resets to an empty string; other external non-empty changes are ignored by design. To preserve the external sync, call `rootRef.current?.updateNumber(onFormatAmount(amount, currency))` in an effect on `amount` (skip it if `!currency`, if `typeof amount !== 'number'`, while focused with `formatAmountOnBlur`, or while `shouldKeepUserInput` is true). |
| `currency` (defaults to `CONST.CURRENCY.USD`) | `decimals` on root; `currency` on `CurrencyPickerButton` | The legacy component read `getCurrencyDecimals(currency)` from `useCurrencyListActions()` internally. The caller must now do it and pass the result as `decimals`. |
| `hideCurrencySymbol` | `getLocalizedCurrencySymbol(preferredLocale, currency) ?? ''` as the child of `KeypadAmountEditor.Symbol`, or as `prefixCharacter` on `AmountFormField.Input` | The legacy component computed the symbol itself. Omit the symbol to hide it. |
| `isCurrencyPressable` (defaults to `true`) / `onCurrencyButtonPress` | Compose `CurrencyPickerButton` only when the currency is pressable | `onCurrencyButtonPress` becomes `onPress`. Note: legacy only hid the button for an empty `currency` in the non-touch portrait branch (`isSymbolPressable && !!currency && !canUseTouchScreen`); the touch portrait and landscape branches rendered it without that guard. `CurrencyPickerButton` renders unconditionally, so guard with `!!currency` if empty currencies can occur. |
| `symbolTextStyle` | `textStyle` on `KeypadAmountEditor.Symbol` | No `AmountFormField` equivalent. |
| `onAmountChange` | `onInputChange` on root | Receives the canonical signed value. |
| `inputStyle` | `style` on `.Input` | |
| `moneyRequestAmountInputRef` / `ref` | `ref` on root (`AmountEditingRef` / `AmountFormFieldRef`) / `ref` on `.Input` (`BaseTextInputRef`) | Same split as `numberFormRef` / `ref` in section 1. |
| `computed accessibility label` | `accessibilityLabel` on `.Input` | The legacy component always sets `` `${translate('iou.amount')} (${currency})` ``. Pass it explicitly. |
| `submitBehavior` | Hardcoded to `"submit"` on both new `.Input`s | Full-screen editors use `"submit"`. Legacy `displayAsTextInput` did not pass `submitBehavior`, defaulting to RN single-line `"blurAndSubmit"`. If migrating an inline or split row that needs `"blurAndSubmit"` (e.g. `SplitAmountInput` or `AmountField`), expose the prop on `AmountFormFieldInputProps` (or call `ref.current?.blur()` in `onSubmitEditing`) in that migration PR. |
| Defaults: `disableKeyboard`, `hideFocusedState`, `autoGrow`, `shouldUseDefaultLineHeightForPrefix` | Props on `KeypadAmountEditor.Input` only | The legacy component defaults all four to `true`. `KeypadAmountEditor.Input` retains these defaults (`BaseTextInput` defaults `shouldUseDefaultLineHeightForPrefix` to `true` as well). `AmountFormField.Input` currently does not expose `autoGrow` or `hideFocusedState`; if a split-row call site relies on them, add them to `AmountFormFieldInputProps` in that migration PR. |

### Behaviour to re-create

- **`formatAmountOnBlur`**: On blur, the legacy component re-formats `amount` through `onFormatAmount` and calls `updateNumber` with the result, unless `maxLength` is set and the formatted string is longer than it. While the input is focused with `formatAmountOnBlur` on, the effect that syncs `amount` into the editor is skipped. Re-create it in `onBlur` on `.Input` by calling `updateNumber` on the root ref, or drop it consciously.
- **`shouldKeepUserInput`**: When `formatAmountOnBlur` is not set (e.g. in `MoneyRequestAmountForm`), the left side of the guard evaluates to `undefined`, so `?? shouldKeepUserInput` applies: while `true`, external `amount` changes are not pushed into the editor. Preserve this by skipping the `updateNumber` sync effect while `shouldKeepUserInput` is true.
- **`isNegative` / `toggleNegative` / `clearNegative` / `allowFlippingAmount` / `allowNegativeInput`**: Handled as in section 1: a signed `value`, `allowNegative` on root, and `SignFlipButton`. Note that `updateNumber` accepts the canonical signed string (e.g. `updateNumber(frontendAmount)`). For sign-dirty tracking (`onSignDirtyChange` in `MoneyRequestAmountForm`), compute dirtiness by comparing the sign of the current canonical value in `onInputChange` against the baseline.
- **`prefixStyle` and `containerStyle` in split rows**: Split rows pass `prefixStyle={styles.lineHeightUndefined}` and `containerStyle={[styles.textInputContainer, styles.pl2, styles.pr1]}`. `AmountFormField.Input` does not currently support these props (its `prefixStyle` is fixed to `styles.colorMuted`). Add them to `AmountFormFieldInputProps` or wrap the field in the split-row migration PR.

---

## 7. Call Sites Inventory

The seatbelt rule freezes all active call sites (source of truth: the `no-deprecated/NumberWithSymbolForm*`, `no-deprecated/MoneyRequestAmountInput*` and `no-restricted-imports` entries in `config/eslint/eslint.seatbelt.tsv`). Migrate each in its own PR according to its target API:

| File | Type | Target API | Key Considerations |
|---|---|---|---|
| `src/pages/iou/MoneyRequestAmountForm.tsx` | Full-screen currency amount | `KeypadAmountEditor` | Remove outer `ScrollView`; attach `testID="moneyRequestAmountInput"` to `.Input`; handle signed `getNumber()` and `onSignDirtyChange`. |
| `src/pages/iou/request/step/IOURequestStepHours.tsx` | Full-screen unit suffix | `KeypadAmountEditor` | Unit suffix ordering (`.Input` before `.Symbol`); sync Onyx drafts via `updateNumber` in `useEffect`. |
| `src/pages/iou/request/step/DynamicIOURequestStepDistanceManual.tsx` | Full-screen unit suffix | `KeypadAmountEditor` | Wraps the editor in `StepScreenWrapper`; tab-switching resync via `updateNumber` (also mirror `typedDistance` manually, as `updateNumber` does not notify `onInputChange`); verify there is no nested scroll after migration. |
| `src/pages/iou/request/step/DistanceManualTabContent.tsx` | Tab content (manual distance tab) | `KeypadAmountEditor` | Rendered by `DynamicIOURequestStepDistance` inside `TabScreenWithFocusTrapWrapper`, not a standalone screen; receives `manualNumberFormRef` from the parent, so retype it to `AmountEditingRef` together with the parent. |
| `src/pages/workspace/taxes/ValuePage.tsx` | Full-screen tax percentage | `KeypadAmountEditor` (Approach 1) | Refactor away from `FormProvider` to standalone `KeypadAmountEditor`; recreate `validateTaxValue` inside `save` callback. |
| `src/components/MoneyRequestConfirmationList/sections/AmountField.tsx` | Inline confirmation row | `AmountFormField` | Preserve `key={transactionID}` for item switching; add `ref` to `AmountCurrencyPickerButton`; keep `amountTrailingAction` sibling. |
| `src/components/MoneyRequestConfirmationList/sections/TaxFields.tsx` | Inline tax amount field | `AmountFormField` | Preserve `key={taxAmountInputKey}`; imperative sync via `AmountFormFieldRef`. |
| `src/components/SelectionList/ListItem/SplitListItem/SplitAmountInput.tsx` | Inline split row | `AmountFormField` | Add `blurAndSubmit`, `prefixStyle`, and `containerStyle` support to `AmountFormField.Input`. |
| `src/components/MoneyRequestConfirmationList/hooks/useSplitParticipants.tsx` | Inline split row | `AmountFormField` | Convert locale-aware strings to canonical frontend values before feeding `updateNumber`. |
| `src/components/OptionRow.tsx` | Inline split row | `AmountFormField` | Participant split row styling. |
| `src/components/EditableCell/InlineNumberEditCell.tsx` | Table edit cell | `AmountFormField` | Add `autoGrow` to `AmountFormField.Input` to prevent text jumping during typing (commit `f64d6fa7060`). |
| `src/pages/ChronosScheduleOOOPage.tsx` | Form duration input (uses `AmountForm`) | `AmountFormField` / `AmountForm` | Does not render `NumberWithSymbolForm` directly: it uses `AmountForm` and the `NumberWithSymbolFormRef` type. Switch the ref type to `AmountFormFieldRef` / `AmountEditingRef` when `AmountForm` migrates; keep the custom visible label (time units) via `currencyButtonLabel`. |
| `src/components/AmountForm.tsx` | Form wrapper | Internal migration | Grandfathered wrapper; will migrate to `AmountFormField` once remaining call sites move. |
| `src/stories/NumberWithSymbolForm.stories.tsx` | Storybook | Update stories | Migrate or retire stories alongside component deprecation. |
| `src/libs/ReportUtils.ts` | Type | Retype `OptionData.amountInputProps` | Typed as `MoneyRequestAmountInputProps`; retype (or replace with explicit fields) with the split-row migration. |
| `src/pages/iou/request/step/DynamicIOURequestStepDistance.tsx` | Type (parent of the manual tab) | `AmountEditingRef` | Uses the `NumberWithSymbolFormRef` type for `manualNumberFormRef`; switch to `AmountEditingRef` together with `DistanceManualTabContent.tsx`. |
| `src/components/Form/types.ts` | Type | Remove union member | `ValidInputs` includes `typeof NumberWithSymbolForm`; remove it after the last call site migrates. |
| `src/components/MoneyRequestAmountInput.tsx` | Deprecated wrapper | Delete | Delete after its 4 call sites (`MoneyRequestAmountForm`, `OptionRow`, `useSplitParticipants`, `SplitAmountInput`) migrate. |
| `tests/ui/NumberWithSymbolFormTest.tsx` | Test | Update or retire | Retire alongside the component, or port coverage to the new components. |
| `tests/ui/NumberWithSymbolFormWithoutTouchScreenTest.tsx` | Test | Update or retire | Retire alongside the component, or port coverage to the new components. |
| `tests/ui/AmountFormTest.tsx` | Test | Update | Uses the `NumberWithSymbolFormRef` type; update with the `AmountForm` migration. |
| `tests/unit/hooks/useSplitParticipants.test.tsx` | Test | Update | Mocks `MoneyRequestAmountInput`; update with the `useSplitParticipants` migration. |
| `tests/unit/components/MoneyRequestConfirmationList/AmountField.test.tsx` | Test | Update | Mocks `NumberWithSymbolForm` and uses `NumberWithSymbolFormProps`; update with the `AmountField` migration. |
| Cleanup (after the last call site migrates): `src/components/NumberWithSymbolForm.tsx`, `src/components/TextInputWithSymbol/` (`BaseTextInputWithSymbol.tsx`, `index.tsx`, `index.web.tsx`, `index.android.tsx`, `types.ts`), `src/components/SymbolButton.tsx` | Deprecated components | Delete | `SymbolButton` is only used by `TextInputWithSymbol/BaseTextInputWithSymbol.tsx` (no other users in `src/` or `tests/`; the `onSymbolButtonPress` prop name is unrelated to the component), so it is safe to delete together with `TextInputWithSymbol/`. Also remove the matching entries from `config/eslint/eslint.seatbelt.tsv` and `config/oxlint/oxlint.seatbelt.tsv`. |
| `CONST.TEXT_INPUT_SYMBOL_POSITION` in `src/CONST/index.ts` | Constant | Remove | Delete only after all its users are gone: besides the deprecated files above, it is still referenced by `AmountForm.tsx`, `MoneyRequestAmountInput.tsx`, `InlineNumberEditCell.tsx`, `ValuePage.tsx`, `DistanceManualTabContent.tsx`, `IOURequestStepHours.tsx`, `DynamicIOURequestStepDistanceManual.tsx`, `NumberWithSymbolForm.stories.tsx` and `NumberWithSymbolFormTest.tsx`, all of which are covered by the rows above. |
| `config/eslint/eslint.config.mjs`, `oxlint.config.mts` | Lint config | Remove `no-restricted-imports` entries | Remove the `**/NumberWithSymbolForm` pattern from `restrictedImportPatterns` in both files once the component is deleted. The `**/MoneyRequestAmountInput` pattern goes the same way when `MoneyRequestAmountInput.tsx` is deleted. |
