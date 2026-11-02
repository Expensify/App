/**
 * The NumberWithSymbolForm archetypes found in the app, each rendered with the props its call sites resolve to.
 * Every `*Form` component renders either the legacy snapshot or the adapter with the exact same props, and every
 * `*Composition` component renders the target KeypadAmountEditor, AmountFormField or table cell editor.
 * The props of `MoneyRequestAmountInput` and `AmountForm` callers are resolved here by hand, so both implementations
 * receive what those wrappers would pass and the wrappers' own logic (formatting on blur, amount sync) stays out of the comparison.
 */
import AmountFormField from '@components/AmountFormField';
import Button from '@components/Button';
import KeypadAmountEditor from '@components/KeypadAmountEditor';
import AutomaticFieldHint from '@components/MoneyRequestConfirmationList/sections/AutomaticFieldHint';
import NumberWithSymbolForm from '@components/NumberWithSymbolForm';
import type {NumberWithSymbolFormProps} from '@components/NumberWithSymbolForm';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import EditableTotalAmountInput from '@components/TransactionItemRow/DataCells/EditableTotalAmountInput';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLocalizedCurrencySymbol, hasSpaceBetweenSymbolAndAmount} from '@libs/CurrencyUtils';
import {canUseTouchScreen as canUseTouchScreenUtil} from '@libs/DeviceCapabilities';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import noop from 'lodash/noop';
import React, {useRef} from 'react';
import {View} from 'react-native';

import type {ComparisonCell, FormImplementation} from './ComparisonLayout';

import {useComparisonNumberFormRef} from './ComparisonLayout';
import LegacyNumberWithSymbolForm from './LegacyNumberWithSymbolForm';

const canUseTouchScreen = canUseTouchScreenUtil();

const CURRENCY = CONST.CURRENCY.USD;
const CURRENCY_DECIMALS = 2;

/** Total of the split, which sizes the split row inputs like `useSplitParticipants` does */
const FORMATTED_SPLIT_TOTAL = '100.00';

/** Distance units a distance request can use */
type DistanceUnit = typeof CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS | typeof CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;

type ArchetypeCompositionProps = {
    /** State owned by the comparison column */
    cell: ComparisonCell;
};

type ArchetypeFormProps = ArchetypeCompositionProps & {
    /** Implementation the props are rendered with */
    implementation: FormImplementation;
};

type ErrorArchetypeProps = {
    /** Whether to show the error the callers show after a failed submit */
    hasError?: boolean;
};

type DisabledArchetypeProps = {
    /** Whether the field is disabled */
    isDisabled?: boolean;
};

type NumberWithSymbolFormImplementationProps = NumberWithSymbolFormProps & {
    /** Implementation the props are rendered with */
    implementation: FormImplementation;
};

/** Renders the legacy snapshot or the adapter with the exact same props */
function NumberWithSymbolFormImplementation({implementation, ...props}: NumberWithSymbolFormImplementationProps) {
    if (implementation === 'legacy') {
        return <LegacyNumberWithSymbolForm {...props} />;
    }
    return <NumberWithSymbolForm {...props} />;
}

/** Values every archetype resolves the same way its call sites do */
function useArchetypeContext(hasError?: boolean) {
    const styles = useThemeStyles();
    const {translate, preferredLocale} = useLocalize();
    const currencySymbol = getLocalizedCurrencySymbol(preferredLocale, CURRENCY) ?? '';
    const errorText = hasError ? translate('common.error.invalidAmount') : undefined;

    return {styles, translate, currencySymbol, errorText};
}

/** Submit button the full-screen IOU steps pass as the legacy `footer`, spacing itself from the number pad */
function SaveButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Button
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            size={CONST.BUTTON_SIZE.LARGE}
            style={[styles.w100, canUseTouchScreen ? styles.mt5 : styles.mt0]}
            onPress={noop}
        >
            <Button.Text>{translate('common.save')}</Button.Text>
        </Button>
    );
}

/** Submit button passed as the KeypadAmountEditor `footer`, which leaves the gap above it to KeypadAmountEditor */
function CompositionSaveButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Button
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            size={CONST.BUTTON_SIZE.LARGE}
            style={styles.w100}
            onPress={noop}
        >
            <Button.Text>{translate('common.save')}</Button.Text>
        </Button>
    );
}

/** Approximates the submit button FormProvider renders under its inputs, with the `submitButtonStyles` of the callers */
function FormProviderSubmitButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <Button
            variant={CONST.BUTTON_VARIANT.SUCCESS}
            size={CONST.BUTTON_SIZE.LARGE}
            style={[styles.mh5, styles.mt0, styles.mb5]}
            onPress={noop}
        >
            <Button.Text>{translate('common.save')}</Button.Text>
        </Button>
    );
}

/** A. Full-screen currency amount: `MoneyRequestAmountForm` through `MoneyRequestAmountInput` */
function CurrencyAmountForm({implementation, cell, hasError}: ArchetypeFormProps & ErrorArchetypeProps) {
    const {styles, translate, currencySymbol, errorText} = useArchetypeContext(hasError);
    const numberFormRef = useComparisonNumberFormRef();

    return (
        // MoneyRequestAmountForm wraps the input in a ScrollView of its own
        <ScrollView contentContainerStyle={styles.flexGrow1}>
            <NumberWithSymbolFormImplementation
                implementation={implementation}
                value={cell.value}
                onInputChange={cell.onInputChange}
                numberFormRef={numberFormRef}
                decimals={CURRENCY_DECIMALS}
                currency={CURRENCY}
                symbol={currencySymbol}
                symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX}
                onSymbolButtonPress={noop}
                isSymbolPressable
                shouldShowBigNumberPad={canUseTouchScreen}
                shouldUseDynamicFontSize
                autoGrowExtraSpace={variables.w80}
                style={styles.iouAmountTextInput}
                containerStyle={styles.iouAmountTextInputContainer}
                touchableInputWrapperStyle={styles.heightUndefined}
                allowFlippingAmount
                isNegative={cell.isNegative}
                toggleNegative={cell.toggleNegative}
                clearNegative={cell.clearNegative}
                errorText={errorText}
                footer={<SaveButton />}
                accessibilityLabel={`${translate('iou.amount')} (${CURRENCY})`}
                testID="moneyRequestAmountInput"
            />
        </ScrollView>
    );
}

function CurrencyAmountComposition({cell, hasError}: ArchetypeCompositionProps & ErrorArchetypeProps) {
    const {styles, translate, currencySymbol, errorText} = useArchetypeContext(hasError);
    const numberFormRef = useComparisonNumberFormRef();

    return (
        <KeypadAmountEditor
            value={cell.value}
            onInputChange={cell.onInputChange}
            ref={numberFormRef}
            decimals={CURRENCY_DECIMALS}
            errorText={errorText}
            allowNegative
            shouldUseDynamicFontSize
            actions={
                <>
                    <KeypadAmountEditor.CurrencyPickerButton
                        currency={CURRENCY}
                        onPress={noop}
                        style={styles.minWidth18}
                    />
                    <KeypadAmountEditor.SignFlipButton style={styles.minWidth18} />
                </>
            }
            footer={<CompositionSaveButton />}
        >
            <KeypadAmountEditor.Symbol>{currencySymbol}</KeypadAmountEditor.Symbol>
            <KeypadAmountEditor.Input
                accessibilityLabel={`${translate('iou.amount')} (${CURRENCY})`}
                testID="moneyRequestAmountInput"
            />
        </KeypadAmountEditor>
    );
}

/** B. Full-screen amount inside a FormProvider: `AmountForm` without `displayAsTextInput` (PolicyDistanceRateEditPage) */
function FormAmountForm({implementation, cell, hasError}: ArchetypeFormProps & ErrorArchetypeProps) {
    const {styles, currencySymbol, errorText} = useArchetypeContext(hasError);
    const numberFormRef = useComparisonNumberFormRef();

    return (
        <View style={styles.flex1}>
            <View style={styles.flex1}>
                <NumberWithSymbolFormImplementation
                    implementation={implementation}
                    value={cell.value}
                    onInputChange={cell.onInputChange}
                    numberFormRef={numberFormRef}
                    decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
                    currency={CURRENCY}
                    symbol={currencySymbol}
                    symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX}
                    isSymbolPressable={false}
                    hideSymbol={false}
                    displayAsTextInput={false}
                    shouldShowCurrencyButton={false}
                    style={styles.iouAmountTextInput}
                    containerStyle={styles.iouAmountTextInputContainer}
                    touchableInputWrapperStyle={styles.heightUndefined}
                    errorText={errorText}
                    disabled={false}
                />
            </View>
            <FormProviderSubmitButton />
        </View>
    );
}

function FormAmountComposition({cell, hasError}: ArchetypeCompositionProps & ErrorArchetypeProps) {
    const {styles, currencySymbol, errorText} = useArchetypeContext(hasError);
    const numberFormRef = useComparisonNumberFormRef();

    return (
        // The FormProvider renders its submit button under the input, outside KeypadAmountEditor, so there is no footer
        <View style={styles.flex1}>
            <View style={styles.flex1}>
                <KeypadAmountEditor
                    value={cell.value}
                    onInputChange={cell.onInputChange}
                    ref={numberFormRef}
                    decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
                    errorText={errorText}
                >
                    <KeypadAmountEditor.Symbol>{currencySymbol}</KeypadAmountEditor.Symbol>
                    {/* AmountForm adds no extra auto-grow space */}
                    <KeypadAmountEditor.Input autoGrowExtraSpace={0} />
                </KeypadAmountEditor>
            </View>
            <FormProviderSubmitButton />
        </View>
    );
}

type DistanceArchetypeProps = {
    /** Unit displayed as the suffix */
    unit: DistanceUnit;
};

/** C1. Full-screen distance with a unit suffix: `DistanceManualTabContent` and `DynamicIOURequestStepDistanceManual` */
function DistanceForm({implementation, cell, hasError, unit}: ArchetypeFormProps & ErrorArchetypeProps & DistanceArchetypeProps) {
    const {styles, translate, errorText} = useArchetypeContext(hasError);
    const numberFormRef = useComparisonNumberFormRef();

    return (
        <NumberWithSymbolFormImplementation
            implementation={implementation}
            value={cell.value}
            onInputChange={cell.onInputChange}
            numberFormRef={numberFormRef}
            shouldUseDynamicFontSize
            decimals={CONST.DISTANCE_DECIMAL_PLACES}
            symbol={unit}
            symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX}
            isSymbolPressable={false}
            symbolTextStyle={styles.textSupporting}
            style={styles.iouAmountTextInput}
            containerStyle={styles.iouAmountTextInputContainer}
            autoGrowExtraSpace={variables.w80}
            touchableInputWrapperStyle={styles.heightUndefined}
            errorText={errorText}
            accessibilityLabel={`${translate('common.distance')} (${translate(`common.${unit}`)})`}
            footer={<SaveButton />}
        />
    );
}

function DistanceComposition({cell, hasError, unit}: ArchetypeCompositionProps & ErrorArchetypeProps & DistanceArchetypeProps) {
    const {styles, translate, errorText} = useArchetypeContext(hasError);
    const numberFormRef = useComparisonNumberFormRef();

    return (
        <KeypadAmountEditor
            value={cell.value}
            onInputChange={cell.onInputChange}
            ref={numberFormRef}
            decimals={CONST.DISTANCE_DECIMAL_PLACES}
            errorText={errorText}
            shouldUseDynamicFontSize
            footer={<CompositionSaveButton />}
        >
            <KeypadAmountEditor.Input accessibilityLabel={`${translate('common.distance')} (${translate(`common.${unit}`)})`} />
            <KeypadAmountEditor.Symbol textStyle={styles.textSupporting}>{unit}</KeypadAmountEditor.Symbol>
        </KeypadAmountEditor>
    );
}

/** C2. Full-screen hours with a unit suffix and no `value`, only seeded through `numberFormRef`: `IOURequestStepHours` */
function HoursForm({implementation, cell, hasError}: ArchetypeFormProps & ErrorArchetypeProps) {
    const {styles, translate, errorText} = useArchetypeContext(hasError);
    const numberFormRef = useComparisonNumberFormRef();

    return (
        <NumberWithSymbolFormImplementation
            implementation={implementation}
            symbol={translate('iou.timeTracking.hrs')}
            shouldUseDynamicFontSize
            symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX}
            isSymbolPressable={false}
            decimals={CONST.HOURS_DECIMAL_PLACES}
            autoGrowExtraSpace={variables.w80}
            shouldShowBigNumberPad={canUseTouchScreen}
            numberFormRef={numberFormRef}
            style={styles.iouAmountTextInput}
            containerStyle={styles.iouAmountTextInputContainer}
            errorText={errorText}
            touchableInputWrapperStyle={styles.heightUndefined}
            onInputChange={cell.onInputChange}
            footer={<SaveButton />}
        />
    );
}

function HoursComposition({cell, hasError}: ArchetypeCompositionProps & ErrorArchetypeProps) {
    const {translate, errorText} = useArchetypeContext(hasError);
    const numberFormRef = useComparisonNumberFormRef();
    const symbol = translate('iou.timeTracking.hrs');

    return (
        <KeypadAmountEditor
            onInputChange={cell.onInputChange}
            ref={numberFormRef}
            decimals={CONST.HOURS_DECIMAL_PLACES}
            errorText={errorText}
            shouldUseDynamicFontSize
            footer={<CompositionSaveButton />}
        >
            <KeypadAmountEditor.Input />
            <KeypadAmountEditor.Symbol>{symbol}</KeypadAmountEditor.Symbol>
        </KeypadAmountEditor>
    );
}

/** D. Full-screen right-aligned percentage inside a FormProvider: `ValuePage` */
function PercentageForm({implementation, cell, hasError}: ArchetypeFormProps & ErrorArchetypeProps) {
    const {styles, errorText} = useArchetypeContext(hasError);
    const numberFormRef = useComparisonNumberFormRef();

    return (
        <View style={styles.flex1}>
            <View style={styles.flex1}>
                <NumberWithSymbolFormImplementation
                    implementation={implementation}
                    value={cell.value}
                    onInputChange={cell.onInputChange}
                    numberFormRef={numberFormRef}
                    decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
                    maxLength={CONST.MAX_TAX_RATE_INTEGER_PLACES}
                    symbol="%"
                    symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.SUFFIX}
                    autoGrowExtraSpace={variables.w80}
                    isSymbolPressable={false}
                    autoGrowMarginSide="left"
                    style={[styles.iouAmountTextInput, styles.textAlignRight]}
                    containerStyle={styles.iouAmountTextInputContainer}
                    errorText={errorText}
                />
            </View>
            <FormProviderSubmitButton />
        </View>
    );
}

/** ValuePage composed like `WorkspaceCreateTaxValuePage`, with the input props and the FormProvider submit button of ValuePage */
function PercentageComposition({cell, hasError}: ArchetypeCompositionProps & ErrorArchetypeProps) {
    const {styles, errorText} = useArchetypeContext(hasError);
    const numberFormRef = useComparisonNumberFormRef();

    return (
        // The FormProvider renders its submit button under the input, outside KeypadAmountEditor, so there is no footer
        <View style={styles.flex1}>
            <View style={styles.flex1}>
                <KeypadAmountEditor
                    value={cell.value}
                    onInputChange={cell.onInputChange}
                    ref={numberFormRef}
                    decimals={CONST.MAX_TAX_RATE_DECIMAL_PLACES}
                    maxLength={CONST.MAX_TAX_RATE_INTEGER_PLACES}
                    errorText={errorText}
                >
                    <KeypadAmountEditor.Input
                        autoGrowMarginSide="left"
                        style={styles.textAlignRight}
                    />
                    <KeypadAmountEditor.Symbol>%</KeypadAmountEditor.Symbol>
                </KeypadAmountEditor>
            </View>
            <FormProviderSubmitButton />
        </View>
    );
}

/** E1. Plain inline field: `TaxFields`, and the `AmountForm` callers with `displayAsTextInput` */
function InlineAmountForm({implementation, cell, hasError, isDisabled}: ArchetypeFormProps & ErrorArchetypeProps & DisabledArchetypeProps) {
    const {styles, translate, currencySymbol, errorText} = useArchetypeContext(hasError);
    const numberFormRef = useComparisonNumberFormRef();

    return (
        <View style={[styles.mh4, styles.mv2]}>
            <NumberWithSymbolFormImplementation
                implementation={implementation}
                numberFormRef={numberFormRef}
                displayAsTextInput
                autoFocus={false}
                value={cell.value}
                decimals={CURRENCY_DECIMALS}
                currency={CURRENCY}
                symbol={currencySymbol}
                label={translate('iou.taxAmount')}
                errorText={errorText}
                onInputChange={cell.onInputChange}
                shouldShowBigNumberPad={false}
                disabled={isDisabled}
            />
        </View>
    );
}

/** The AmountFormField path `AmountForm` already renders for `displayAsTextInput` without a currency button */
function InlineAmountComposition({cell, hasError, isDisabled}: ArchetypeCompositionProps & ErrorArchetypeProps & DisabledArchetypeProps) {
    const {styles, translate, currencySymbol, errorText} = useArchetypeContext(hasError);
    const numberFormRef = useComparisonNumberFormRef();
    const label = translate('iou.taxAmount');

    return (
        <View style={[styles.mh4, styles.mv2]}>
            <AmountFormField
                value={cell.value}
                onInputChange={cell.onInputChange}
                decimals={CURRENCY_DECIMALS}
                errorText={errorText}
                ref={numberFormRef}
            >
                <AmountFormField.Input
                    prefixCharacter={currencySymbol}
                    accessibilityLabel={label}
                    label={label}
                    disabled={isDisabled}
                    autoFocus={false}
                />
            </AmountFormField>
        </View>
    );
}

/** E2. Inline field with a unit dropdown and a hidden currency symbol: `ChronosScheduleOOOPage` through `AmountForm` */
function InlineDurationForm({implementation, cell}: ArchetypeFormProps) {
    const {styles, translate, currencySymbol} = useArchetypeContext();
    const numberFormRef = useComparisonNumberFormRef();
    const durationUnitButtonLabel = translate('chronos.hour');

    return (
        <View style={[styles.ph5, styles.pv4]}>
            <NumberWithSymbolFormImplementation
                implementation={implementation}
                label={translate('chronos.durationAmount')}
                value={cell.value}
                decimals={2}
                currency={CURRENCY}
                displayAsTextInput
                onInputChange={cell.onInputChange}
                onSymbolButtonPress={noop}
                numberFormRef={numberFormRef}
                symbol={currencySymbol}
                symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX}
                isSymbolPressable
                hideSymbol
                shouldShowCurrencyButton
                currencyButtonLabel={durationUnitButtonLabel}
                currencyButtonAccessibilityLabel={`${translate('common.select')}, ${durationUnitButtonLabel}`}
                disabled={false}
            />
        </View>
    );
}

function InlineDurationComposition({cell}: ArchetypeCompositionProps) {
    const {styles, translate} = useArchetypeContext();
    const numberFormRef = useComparisonNumberFormRef();
    const durationUnitButtonLabel = translate('chronos.hour');
    const label = translate('chronos.durationAmount');

    return (
        <View style={[styles.ph5, styles.pv4]}>
            <AmountFormField
                value={cell.value}
                onInputChange={cell.onInputChange}
                decimals={2}
                ref={numberFormRef}
            >
                <AmountFormField.Input
                    accessibilityLabel={label}
                    label={label}
                    autoFocus={false}
                    rightHandSideComponent={
                        <AmountFormField.CurrencyPickerButton
                            currency={durationUnitButtonLabel}
                            accessibilityLabel={`${translate('common.select')}, ${durationUnitButtonLabel}`}
                            onPress={noop}
                        />
                    }
                />
            </AmountFormField>
        </View>
    );
}

type InlineSignedAmountArchetypeProps = {
    /** Whether SmartScan's "Automatic" hint is shown before the buttons */
    shouldShowAutomaticHint?: boolean;
};

/** E3. Inline signed amount with flip and currency buttons: `AmountField` on the confirmation page */
function InlineSignedAmountForm({
    implementation,
    cell,
    hasError,
    isDisabled,
    shouldShowAutomaticHint,
}: ArchetypeFormProps & ErrorArchetypeProps & DisabledArchetypeProps & InlineSignedAmountArchetypeProps) {
    const {styles, translate, currencySymbol, errorText} = useArchetypeContext(hasError);
    const numberFormRef = useComparisonNumberFormRef();
    // AmountField hands the currency button to the currency picker modal as its launcher
    const currencyButtonRef = useRef<View>(null);

    return (
        <View style={[styles.mh4, styles.mv2]}>
            <NumberWithSymbolFormImplementation
                implementation={implementation}
                // AmountField reads the input through `ref`, the story also passes `numberFormRef` for the toolbar actions
                numberFormRef={numberFormRef}
                displayAsTextInput
                autoFocus={false}
                value={cell.value}
                decimals={CURRENCY_DECIMALS}
                currency={CURRENCY}
                symbol={currencySymbol}
                label={translate('iou.amount')}
                errorText={errorText}
                onInputChange={cell.onInputChange}
                allowNegativeInput
                shouldShowFlipButton
                shouldShowCurrencyButton
                shouldShowBigNumberPad={false}
                onCurrencyButtonPress={noop}
                currencyButtonRef={currencyButtonRef}
                leadingRightHandSideComponent={shouldShowAutomaticHint ? <AutomaticFieldHint /> : undefined}
                shouldUseBorderlessButtons
                disabled={isDisabled}
            />
        </View>
    );
}

function InlineSignedAmountComposition({
    cell,
    hasError,
    isDisabled,
    shouldShowAutomaticHint,
}: ArchetypeCompositionProps & ErrorArchetypeProps & DisabledArchetypeProps & InlineSignedAmountArchetypeProps) {
    const {styles, translate, currencySymbol, errorText} = useArchetypeContext(hasError);
    const numberFormRef = useComparisonNumberFormRef();
    const label = translate('iou.amount');

    const rightHandSideComponent = (
        <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter]}>
            {!!shouldShowAutomaticHint && <AutomaticFieldHint />}
            <AmountFormField.SignFlipButton
                isDisabled={isDisabled}
                isBorderless
            />
            <AmountFormField.CurrencyPickerButton
                currency={CURRENCY}
                onPress={noop}
                isDisabled={isDisabled}
                isBorderless
            />
        </View>
    );

    return (
        <View style={[styles.mh4, styles.mv2]}>
            <AmountFormField
                value={cell.value}
                onInputChange={cell.onInputChange}
                decimals={CURRENCY_DECIMALS}
                allowNegative
                errorText={errorText}
                ref={numberFormRef}
            >
                <AmountFormField.Input
                    prefixCharacter={currencySymbol}
                    accessibilityLabel={label}
                    label={label}
                    disabled={isDisabled}
                    autoFocus={false}
                    rightHandSideComponent={rightHandSideComponent}
                />
            </AmountFormField>
        </View>
    );
}

type SplitRowArchetypeProps = {
    /** `participant` is the confirmation page split (`useSplitParticipants`), `splitExpense` the split expense page (`SplitAmountInput`) */
    variant: 'participant' | 'splitExpense';
};

/** F. Compact split row: `useSplitParticipants`, `SplitAmountInput` and `OptionRow` through `MoneyRequestAmountInput` */
function SplitRowForm({implementation, cell, variant}: ArchetypeFormProps & SplitRowArchetypeProps) {
    const {styles, translate, currencySymbol} = useArchetypeContext();
    const numberFormRef = useComparisonNumberFormRef();
    const isSplitExpense = variant === 'splitExpense';

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.ph5, styles.pv3]}>
            <Text style={[styles.flex1, styles.textStrong]}>Participant</Text>
            <NumberWithSymbolFormImplementation
                implementation={implementation}
                value={cell.value}
                onInputChange={cell.onInputChange}
                numberFormRef={numberFormRef}
                decimals={CURRENCY_DECIMALS}
                currency={CURRENCY}
                symbol={currencySymbol}
                symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX}
                hideSymbol
                isSymbolPressable={false}
                shouldShowBigNumberPad={false}
                autoGrow={false}
                disableKeyboard={false}
                prefixCharacter={currencySymbol}
                hideFocusedState={false}
                shouldApplyPaddingToContainer
                shouldUseDefaultLineHeightForPrefix={false}
                shouldWrapInputInContainer={false}
                style={isSplitExpense ? [styles.lineHeightUndefined] : [styles.optionRowAmountInput, styles.lineHeightUndefined]}
                containerStyle={[styles.textInputContainer, styles.pl2, styles.pr1]}
                prefixStyle={styles.lineHeightUndefined}
                prefixContainerStyle={[styles.pv0, styles.h100]}
                touchableInputWrapperStyle={[styles.ml3]}
                maxLength={FORMATTED_SPLIT_TOTAL.length + 1}
                contentWidth={(FORMATTED_SPLIT_TOTAL.length + 1) * CONST.CHARACTER_WIDTH}
                allowNegativeInput={isSplitExpense}
                keyboardType={isSplitExpense ? CONST.KEYBOARD_TYPE.NUMBERS_AND_PUNCTUATION : undefined}
                submitBehavior={isSplitExpense ? 'blurAndSubmit' : undefined}
                accessibilityLabel={`${translate('iou.amount')} (${CURRENCY})`}
            />
        </View>
    );
}

function SplitRowComposition({cell, variant}: ArchetypeCompositionProps & SplitRowArchetypeProps) {
    const {styles, translate, currencySymbol} = useArchetypeContext();
    const {numberFormat} = useLocalize();
    const numberFormRef = useComparisonNumberFormRef();
    const isSplitExpense = variant === 'splitExpense';

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.ph5, styles.pv3]}>
            <Text style={[styles.flex1, styles.textStrong]}>Participant</Text>
            <AmountFormField
                value={cell.value}
                onInputChange={cell.onInputChange}
                allowNegative={isSplitExpense}
                decimals={CURRENCY_DECIMALS}
                maxLength={FORMATTED_SPLIT_TOTAL.length + 1}
                ref={numberFormRef}
            >
                <AmountFormField.Input
                    prefixCharacter={currencySymbol}
                    accessibilityLabel={`${translate('iou.amount')} (${CURRENCY})`}
                    autoGrow={false}
                    disableKeyboard={false}
                    hideFocusedState={false}
                    shouldApplyPaddingToContainer
                    shouldUseDefaultLineHeightForPrefix={false}
                    style={isSplitExpense ? [styles.lineHeightUndefined, styles.pr1] : [styles.optionRowAmountInput, styles.lineHeightUndefined, styles.pr1]}
                    containerStyle={[styles.textInputContainer, styles.pl2, styles.pr1]}
                    prefixStyle={styles.lineHeightUndefined}
                    prefixContainerStyle={[styles.pv0, styles.h100]}
                    touchableInputWrapperStyle={[styles.ml3]}
                    contentWidth={(FORMATTED_SPLIT_TOTAL.length + 1) * CONST.CHARACTER_WIDTH}
                    keyboardType={isSplitExpense ? CONST.KEYBOARD_TYPE.NUMBERS_AND_PUNCTUATION : undefined}
                    submitBehavior={isSplitExpense ? 'blurAndSubmit' : undefined}
                    placeholder={numberFormat(0)}
                    shouldUseFullInputHeight
                    autoCorrect={false}
                    spellCheck={false}
                />
            </AmountFormField>
        </View>
    );
}

/** G. Editable table cell with a parent-owned sign: `TotalCell` through `MoneyRequestAmountInput` */
function TableCellForm({implementation, cell}: ArchetypeFormProps) {
    const {styles, translate, currencySymbol} = useArchetypeContext();
    const numberFormRef = useComparisonNumberFormRef();

    // TotalCell renders its own editor now, so no production cell reaches this path of the adapter
    if (implementation === 'adapter') {
        return <Text style={styles.textSupporting}>Not used: TotalCell renders EditableTotalAmountInput</Text>;
    }

    return (
        // The focused EditableCell container TotalCell renders the input in
        <View style={[styles.editableCell, styles.editableCellFocus]}>
            <NumberWithSymbolFormImplementation
                implementation={implementation}
                value={cell.value}
                onInputChange={cell.onInputChange}
                numberFormRef={numberFormRef}
                decimals={CURRENCY_DECIMALS}
                currency={CURRENCY}
                symbol={currencySymbol}
                symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX}
                isSymbolPressable={false}
                disableKeyboard={false}
                hideFocusedState
                shouldShowBigNumberPad={false}
                shouldWrapInputInContainer={false}
                shouldApplyPaddingToContainer={false}
                shouldRefocusOnScrollViewClick
                allowFlippingAmount
                isNegative={cell.isNegative}
                toggleNegative={cell.toggleNegative}
                clearNegative={cell.clearNegative}
                containerStyle={[styles.editableCellInputStyle]}
                style={[styles.textAlignRight, styles.pr0]}
                touchableInputWrapperStyle={styles.editableCellInputStyle}
                scrollViewStyle={[styles.flexRow, styles.justifyContentEnd]}
                symbolTextStyle={[styles.editableCellSymbolStyle]}
                negativeSymbolStyle={styles.editableCellSymbolStyle}
                accessibilityLabel={`${translate('iou.amount')} (${CURRENCY})`}
            />
        </View>
    );
}

/**
 * TotalCell's own editor over a signed amount. It holds no imperative ref, so the toolbar actions that drive the form
 * through `numberFormRef` do not reach this column.
 */
function TableCellComposition({cell}: ArchetypeCompositionProps) {
    const {styles, translate} = useArchetypeContext();

    return (
        <View style={[styles.editableCell, styles.editableCellFocus]}>
            <EditableTotalAmountInput
                // The composition column owns one signed value, so it is passed through and reported back unchanged
                initialValue={cell.value ?? ''}
                onChange={cell.onInputChange}
                // Nothing in the story holds an edit apart from the column's own value, so the input follows it
                hasUnsavedEdits={false}
                allowNegative
                decimals={CURRENCY_DECIMALS}
                currency={CURRENCY}
                accessibilityLabel={`${translate('iou.amount')} (${CURRENCY})`}
                onBlur={noop}
            />
        </View>
    );
}

type NumberEditCellArchetypeProps = {
    /** Whether the cell is right-aligned, the default of `InlineNumberEditCell`, or left-aligned */
    isRightAligned: boolean;
};

/** Styles `InlineNumberEditCell` resolves for the alignment, shared by the form and the composition column */
function useNumberEditCellStyles(isRightAligned: boolean) {
    const styles = useThemeStyles();
    const {preferredLocale} = useLocalize();
    const hasSymbolSpaceInPreview = hasSpaceBetweenSymbolAndAmount(preferredLocale, CURRENCY);

    return {
        inputStyle: [styles.lh16, styles.optionDisplayName, styles.pr0, !isRightAligned && styles.flex1, isRightAligned && styles.textAlignRight],
        symbolTextStyle: [styles.editableCellSymbolStyle, hasSymbolSpaceInPreview && styles.pr1],
    };
}

/**
 * H. Inline number edit cell of the workspace tables: `InlineNumberEditCell` in the expensify card limit, distance rate and
 * per diem cells. The story passes the props the cell passes to its editor, apart from the focus-on-mount ref and the save callbacks.
 */
function NumberEditCellForm({implementation, cell, isRightAligned}: ArchetypeFormProps & NumberEditCellArchetypeProps) {
    const {styles, translate, currencySymbol} = useArchetypeContext();
    const numberFormRef = useComparisonNumberFormRef();
    const {inputStyle, symbolTextStyle} = useNumberEditCellStyles(isRightAligned);

    return (
        // The focused EditableCell container the cell renders its editor in
        <View style={[styles.editableCell, styles.editableCellFocus]}>
            <NumberWithSymbolFormImplementation
                implementation={implementation}
                numberFormRef={numberFormRef}
                value={cell.value}
                decimals={CURRENCY_DECIMALS}
                currency={CURRENCY}
                symbol={currencySymbol}
                symbolPosition={CONST.TEXT_INPUT_SYMBOL_POSITION.PREFIX}
                isSymbolPressable={false}
                allowNegativeInput={false}
                disableKeyboard={false}
                shouldShowBigNumberPad={false}
                shouldWrapInputInContainer={false}
                shouldApplyPaddingToContainer={false}
                shouldRefocusOnScrollViewClick
                hideFocusedState
                // A left-aligned amount fills the cell, because measuring its grown width after paint makes each new digit jump
                autoGrow={isRightAligned}
                onInputChange={cell.onInputChange}
                accessibilityLabel={`${translate('iou.amount')} (${CURRENCY})`}
                style={inputStyle}
                containerStyle={[styles.editableCellInputStyle]}
                outerContainerStyles={!isRightAligned ? [styles.flex1, styles.mnw0] : undefined}
                touchableInputWrapperStyle={styles.editableCellInputStyle}
                scrollViewStyle={[styles.flexRow, styles.alignItemsCenter, !isRightAligned && styles.w100, isRightAligned && styles.justifyContentEnd]}
                symbolTextStyle={symbolTextStyle}
            />
        </View>
    );
}

/** The same cell over AmountFormField, which has no separate symbol, so the symbol is the input's prefix */
function NumberEditCellComposition({cell, isRightAligned}: ArchetypeCompositionProps & NumberEditCellArchetypeProps) {
    const {styles, translate, currencySymbol} = useArchetypeContext();
    const numberFormRef = useComparisonNumberFormRef();
    const {inputStyle, symbolTextStyle} = useNumberEditCellStyles(isRightAligned);

    return (
        <View style={[styles.editableCell, styles.editableCellFocus]}>
            <AmountFormField
                value={cell.value}
                onInputChange={cell.onInputChange}
                decimals={CURRENCY_DECIMALS}
                ref={numberFormRef}
            >
                <AmountFormField.Input
                    prefixCharacter={currencySymbol}
                    prefixStyle={symbolTextStyle}
                    accessibilityLabel={`${translate('iou.amount')} (${CURRENCY})`}
                    disableKeyboard={false}
                    hideFocusedState
                    shouldApplyPaddingToContainer={false}
                    autoGrow={isRightAligned}
                    style={inputStyle}
                    containerStyle={[styles.editableCellInputStyle]}
                    touchableInputWrapperStyle={styles.editableCellInputStyle}
                />
            </AmountFormField>
        </View>
    );
}

export {
    CurrencyAmountComposition,
    CurrencyAmountForm,
    DistanceComposition,
    DistanceForm,
    FormAmountComposition,
    FormAmountForm,
    HoursComposition,
    HoursForm,
    InlineAmountComposition,
    InlineAmountForm,
    InlineDurationComposition,
    InlineDurationForm,
    InlineSignedAmountComposition,
    InlineSignedAmountForm,
    NumberEditCellComposition,
    NumberEditCellForm,
    PercentageComposition,
    PercentageForm,
    SplitRowComposition,
    SplitRowForm,
    TableCellComposition,
    TableCellForm,
};
