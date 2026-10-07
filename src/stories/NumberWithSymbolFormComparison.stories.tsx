import CONST from '@src/CONST';

import type {Meta} from 'storybook-react-rsbuild';

import React from 'react';

import {
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
} from './NumberWithSymbolFormComparison/archetypes';
import ComparisonLayout from './NumberWithSymbolFormComparison/ComparisonLayout';

/**
 * Side-by-side comparison of every NumberWithSymbolForm archetype found in the app: the legacy form from 0c5a23e5878,
 * the current adapter with the same props, and the target KeypadAmountEditor, AmountFormField or table cell editor composition.
 * Every column owns its own state, and the toolbar switches all of them between the web, mobile portrait and mobile landscape modes.
 */
const story: Meta = {
    title: 'Components/NumberWithSymbolFormComparison',
    parameters: {
        layout: 'fullscreen',
        // Lets the toolbar's device mode apply to these stories only, see DeviceModeScope in .storybook/preview.tsx
        usesDeviceMode: true,
        // The comparison renders its own fixtures, so there are no props to edit
        controls: {disable: true},
    },
};

const LONG_AMOUNT = '123456789.12';

/** A. MoneyRequestAmountForm */
function FullScreenCurrencyAmount() {
    return (
        <ComparisonLayout
            title="A. Full-screen currency amount"
            source="MoneyRequestAmountForm through MoneyRequestAmountInput"
            note="The legacy form and the adapter keep the sign in the parent (isNegative/toggleNegative), the composition keeps it in the value."
            frame="fullScreen"
            usesParentOwnedSign
            renderForm={(implementation, cell) => (
                <CurrencyAmountForm
                    implementation={implementation}
                    cell={cell}
                />
            )}
            renderComposition={(cell) => <CurrencyAmountComposition cell={cell} />}
        />
    );
}

function FullScreenCurrencyAmountNegative() {
    return (
        <ComparisonLayout
            title="A. Full-screen currency amount, negative"
            source="MoneyRequestAmountForm through MoneyRequestAmountInput"
            frame="fullScreen"
            initialValue="42.50"
            initialIsNegative
            usesParentOwnedSign
            renderForm={(implementation, cell) => (
                <CurrencyAmountForm
                    implementation={implementation}
                    cell={cell}
                />
            )}
            renderComposition={(cell) => <CurrencyAmountComposition cell={cell} />}
        />
    );
}

function FullScreenCurrencyAmountLongValue() {
    return (
        <ComparisonLayout
            title="A. Full-screen currency amount, long value"
            source="MoneyRequestAmountForm through MoneyRequestAmountInput"
            note="Checks shouldUseDynamicFontSize scaling the amount down."
            frame="fullScreen"
            initialValue={LONG_AMOUNT}
            usesParentOwnedSign
            renderForm={(implementation, cell) => (
                <CurrencyAmountForm
                    implementation={implementation}
                    cell={cell}
                />
            )}
            renderComposition={(cell) => <CurrencyAmountComposition cell={cell} />}
        />
    );
}

function FullScreenCurrencyAmountWithError() {
    return (
        <ComparisonLayout
            title="A. Full-screen currency amount, error"
            source="MoneyRequestAmountForm through MoneyRequestAmountInput"
            frame="fullScreen"
            initialValue="0"
            usesParentOwnedSign
            renderForm={(implementation, cell) => (
                <CurrencyAmountForm
                    implementation={implementation}
                    cell={cell}
                    hasError
                />
            )}
            renderComposition={(cell) => (
                <CurrencyAmountComposition
                    cell={cell}
                    hasError
                />
            )}
        />
    );
}

/** B. AmountForm without displayAsTextInput */
function FullScreenFormAmount() {
    return (
        <ComparisonLayout
            title="B. Full-screen amount inside a FormProvider"
            source="AmountForm without displayAsTextInput: PolicyDistanceRateEditPage, PolicyDistanceRateTaxReclaimableEditPage, DynamicExpensifyCardLimitPage"
            note="None of the columns has a footer: the button under them stands in for the FormProvider submit."
            frame="fullScreen"
            initialValue="0.6700"
            renderForm={(implementation, cell) => (
                <FormAmountForm
                    implementation={implementation}
                    cell={cell}
                />
            )}
            renderComposition={(cell) => <FormAmountComposition cell={cell} />}
        />
    );
}

function FullScreenFormAmountWithError() {
    return (
        <ComparisonLayout
            title="B. Full-screen amount inside a FormProvider, error"
            source="AmountForm without displayAsTextInput: PolicyDistanceRateEditPage, PolicyDistanceRateTaxReclaimableEditPage, DynamicExpensifyCardLimitPage"
            frame="fullScreen"
            renderForm={(implementation, cell) => (
                <FormAmountForm
                    implementation={implementation}
                    cell={cell}
                    hasError
                />
            )}
            renderComposition={(cell) => (
                <FormAmountComposition
                    cell={cell}
                    hasError
                />
            )}
        />
    );
}

/** C1. DistanceManualTabContent and DynamicIOURequestStepDistanceManual */
function FullScreenDistanceKilometers() {
    return (
        <ComparisonLayout
            title="C1. Full-screen distance, kilometers"
            source="DistanceManualTabContent, DynamicIOURequestStepDistanceManual"
            frame="fullScreen"
            initialValue="12.5"
            renderForm={(implementation, cell) => (
                <DistanceForm
                    implementation={implementation}
                    cell={cell}
                    unit={CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS}
                />
            )}
            renderComposition={(cell) => (
                <DistanceComposition
                    cell={cell}
                    unit={CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS}
                />
            )}
        />
    );
}

function FullScreenDistanceMiles() {
    return (
        <ComparisonLayout
            title="C1. Full-screen distance, miles, error"
            source="DistanceManualTabContent, DynamicIOURequestStepDistanceManual"
            frame="fullScreen"
            renderForm={(implementation, cell) => (
                <DistanceForm
                    implementation={implementation}
                    cell={cell}
                    unit={CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}
                    hasError
                />
            )}
            renderComposition={(cell) => (
                <DistanceComposition
                    cell={cell}
                    unit={CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES}
                    hasError
                />
            )}
        />
    );
}

/** C2. IOURequestStepHours */
function FullScreenHours() {
    return (
        <ComparisonLayout
            title="C2. Full-screen hours"
            source="IOURequestStepHours"
            note="The caller never passes value: the form is seeded and updated through numberFormRef only, and the symbol keeps the default text color."
            frame="fullScreen"
            isControlled={false}
            initialValue="7.5"
            renderForm={(implementation, cell) => (
                <HoursForm
                    implementation={implementation}
                    cell={cell}
                />
            )}
            renderComposition={(cell) => <HoursComposition cell={cell} />}
        />
    );
}

/** D. ValuePage */
function FullScreenPercentage() {
    return (
        <ComparisonLayout
            title="D. Full-screen right-aligned percentage"
            source="ValuePage. The composition follows WorkspaceCreateTaxValuePage, with the props of ValuePage."
            note="None of the columns has a footer: the button under them stands in for the FormProvider submit."
            frame="fullScreen"
            initialValue="8.25"
            renderForm={(implementation, cell) => (
                <PercentageForm
                    implementation={implementation}
                    cell={cell}
                />
            )}
            renderComposition={(cell) => <PercentageComposition cell={cell} />}
        />
    );
}

/** E1. TaxFields and the AmountForm callers with displayAsTextInput */
function InlineAmount() {
    return (
        <ComparisonLayout
            title="E1. Plain inline field"
            source="TaxFields, and AmountForm with displayAsTextInput (workspace rules, card limits, approval limit, time tracking rate...)"
            note="AmountForm already renders the composition column (AmountFormField) for these callers."
            frame="inline"
            initialValue="4.20"
            renderForm={(implementation, cell) => (
                <InlineAmountForm
                    implementation={implementation}
                    cell={cell}
                />
            )}
            renderComposition={(cell) => <InlineAmountComposition cell={cell} />}
        />
    );
}

function InlineAmountWithError() {
    return (
        <ComparisonLayout
            title="E1. Plain inline field, error"
            source="TaxFields, and AmountForm with displayAsTextInput"
            frame="inline"
            initialValue="999"
            renderForm={(implementation, cell) => (
                <InlineAmountForm
                    implementation={implementation}
                    cell={cell}
                    hasError
                />
            )}
            renderComposition={(cell) => (
                <InlineAmountComposition
                    cell={cell}
                    hasError
                />
            )}
        />
    );
}

function InlineAmountDisabled() {
    return (
        <ComparisonLayout
            title="E1. Plain inline field, disabled"
            source="TaxFields after the expense is confirmed"
            frame="inline"
            initialValue="4.20"
            renderForm={(implementation, cell) => (
                <InlineAmountForm
                    implementation={implementation}
                    cell={cell}
                    isDisabled
                />
            )}
            renderComposition={(cell) => (
                <InlineAmountComposition
                    cell={cell}
                    isDisabled
                />
            )}
        />
    );
}

/** E2. ChronosScheduleOOOPage */
function InlineDurationWithUnitButton() {
    return (
        <ComparisonLayout
            title="E2. Inline field with a unit dropdown"
            source="ChronosScheduleOOOPage through AmountForm"
            frame="inline"
            initialValue="3"
            renderForm={(implementation, cell) => (
                <InlineDurationForm
                    implementation={implementation}
                    cell={cell}
                />
            )}
            renderComposition={(cell) => <InlineDurationComposition cell={cell} />}
        />
    );
}

/** E3. AmountField */
function InlineSignedAmount() {
    return (
        <ComparisonLayout
            title="E3. Inline signed amount with flip and currency buttons"
            source="AmountField on the money request confirmation page"
            note="The flip button only shows on touch screens, so compare the mobile modes too."
            frame="inline"
            initialValue="-15.00"
            renderForm={(implementation, cell) => (
                <InlineSignedAmountForm
                    implementation={implementation}
                    cell={cell}
                />
            )}
            renderComposition={(cell) => <InlineSignedAmountComposition cell={cell} />}
        />
    );
}

function InlineSignedAmountWithHintAndError() {
    return (
        <ComparisonLayout
            title="E3. Inline signed amount, Automatic hint and error"
            source="AmountField while SmartScan fills the amount"
            frame="inline"
            renderForm={(implementation, cell) => (
                <InlineSignedAmountForm
                    implementation={implementation}
                    cell={cell}
                    shouldShowAutomaticHint
                    hasError
                />
            )}
            renderComposition={(cell) => (
                <InlineSignedAmountComposition
                    cell={cell}
                    shouldShowAutomaticHint
                    hasError
                />
            )}
        />
    );
}

function InlineSignedAmountDisabled() {
    return (
        <ComparisonLayout
            title="E3. Inline signed amount, disabled"
            source="AmountField"
            frame="inline"
            initialValue="15.00"
            renderForm={(implementation, cell) => (
                <InlineSignedAmountForm
                    implementation={implementation}
                    cell={cell}
                    isDisabled
                />
            )}
            renderComposition={(cell) => (
                <InlineSignedAmountComposition
                    cell={cell}
                    isDisabled
                />
            )}
        />
    );
}

/** F. useSplitParticipants, SplitAmountInput, OptionRow */
function SplitParticipantRow() {
    return (
        <ComparisonLayout
            title="F. Compact split row"
            source="useSplitParticipants and OptionRow through MoneyRequestAmountInput"
            note="The legacy form checks the orientation before shouldWrapInputInContainer={false}, so in mobile landscape it wraps the row in its full-screen landscape layout (padding and a 400px column). The extra space around the legacy row there is that defect, which the adapter does not reproduce."
            frame="row"
            initialValue="33.33"
            renderForm={(implementation, cell) => (
                <SplitRowForm
                    implementation={implementation}
                    cell={cell}
                    variant="participant"
                />
            )}
            renderComposition={(cell) => (
                <SplitRowComposition
                    cell={cell}
                    variant="participant"
                />
            )}
        />
    );
}

function SplitExpenseRow() {
    return (
        <ComparisonLayout
            title="F. Compact split row, split expense"
            source="SplitAmountInput through MoneyRequestAmountInput"
            note="Accepts a typed minus sign (allowNegativeInput)."
            frame="row"
            initialValue="-10.00"
            renderForm={(implementation, cell) => (
                <SplitRowForm
                    implementation={implementation}
                    cell={cell}
                    variant="splitExpense"
                />
            )}
            renderComposition={(cell) => (
                <SplitRowComposition
                    cell={cell}
                    variant="splitExpense"
                />
            )}
        />
    );
}

/** G. TotalCell */
function TableTotalCell() {
    return (
        <ComparisonLayout
            title="G. Editable table cell"
            source="TotalCell through MoneyRequestAmountInput (legacy); TotalCell's own EditableTotalAmountInput (target)"
            note="Typing a minus sign flips the sign, and pressing backspace on an empty value clears it. The composition keeps the sign in its value, so its readout is signed. TotalCell no longer goes through NumberWithSymbolForm, so the adapter column has nothing to show."
            frame="cell"
            initialValue="250.00"
            usesParentOwnedSign
            renderForm={(implementation, cell) => (
                <TableCellForm
                    implementation={implementation}
                    cell={cell}
                />
            )}
            renderComposition={(cell) => <TableCellComposition cell={cell} />}
        />
    );
}

function TableTotalCellNegative() {
    return (
        <ComparisonLayout
            title="G. Editable table cell, negative"
            source="TotalCell through MoneyRequestAmountInput (legacy); TotalCell's own EditableTotalAmountInput (target)"
            frame="cell"
            initialValue="250.00"
            initialIsNegative
            usesParentOwnedSign
            renderForm={(implementation, cell) => (
                <TableCellForm
                    implementation={implementation}
                    cell={cell}
                />
            )}
            renderComposition={(cell) => <TableCellComposition cell={cell} />}
        />
    );
}

/** H. InlineNumberEditCell, right-aligned like the expensify card limit and per diem cells */
function TableNumberEditCellRightAligned() {
    return (
        <ComparisonLayout
            title="H. Inline number edit cell, right-aligned"
            source="InlineNumberEditCell in WorkspaceExpensifyCardLimitCell, WorkspaceDistanceRateValueCell and WorkspacePerDiemAmountCell"
            note="The composition has no separate symbol, so AmountFormField renders it as the input's prefix."
            frame="cell"
            initialValue="250.00"
            renderForm={(implementation, cell) => (
                <NumberEditCellForm
                    implementation={implementation}
                    cell={cell}
                    isRightAligned
                />
            )}
            renderComposition={(cell) => (
                <NumberEditCellComposition
                    cell={cell}
                    isRightAligned
                />
            )}
        />
    );
}

/** H. InlineNumberEditCell with `textAlign="left"`, whose input fills the cell instead of growing */
function TableNumberEditCellLeftAligned() {
    return (
        <ComparisonLayout
            title="H. Inline number edit cell, left-aligned"
            source="InlineNumberEditCell with textAlign left"
            note="The composition has no separate symbol, so AmountFormField renders it as the input's prefix."
            frame="cell"
            initialValue="250.00"
            renderForm={(implementation, cell) => (
                <NumberEditCellForm
                    implementation={implementation}
                    cell={cell}
                    isRightAligned={false}
                />
            )}
            renderComposition={(cell) => (
                <NumberEditCellComposition
                    cell={cell}
                    isRightAligned={false}
                />
            )}
        />
    );
}

export default story;
export {
    FullScreenCurrencyAmount,
    FullScreenCurrencyAmountNegative,
    FullScreenCurrencyAmountLongValue,
    FullScreenCurrencyAmountWithError,
    FullScreenFormAmount,
    FullScreenFormAmountWithError,
    FullScreenDistanceKilometers,
    FullScreenDistanceMiles,
    FullScreenHours,
    FullScreenPercentage,
    InlineAmount,
    InlineAmountWithError,
    InlineAmountDisabled,
    InlineDurationWithUnitButton,
    InlineSignedAmount,
    InlineSignedAmountWithHintAndError,
    InlineSignedAmountDisabled,
    SplitParticipantRow,
    SplitExpenseRow,
    TableTotalCell,
    TableTotalCellNegative,
    TableNumberEditCellRightAligned,
    TableNumberEditCellLeftAligned,
};
