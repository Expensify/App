/** Form input for a choice field that takes several answers, drawn as the expense form's dropdown row */
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import React from 'react';

import type {DropdownChoice} from './DropdownChoiceAdapter';
import type {DropdownRowInputProps} from './FormDropdownField';

import FormDropdownField from './FormDropdownField';
import MultiValuePickerPopover from './ValuePicker/MultiValuePickerPopover';
import MultiValueSelectionList from './ValuePicker/MultiValueSelectionList';

/** FormProvider starts an unanswered list field as an empty string, so the value is the keys of the picked options or '' */
type MultiChoiceDropdownAdapterProps = DropdownRowInputProps<string[] | string, string[]> & {
    /** Options, one row each */
    items: DropdownChoice[];

    /** Sentry label for the Apply button, in the anchored list and on the full page */
    applyButtonSentryLabel: SentryLabel;
};

function haveSameValues(first: string[], second: string[]) {
    return first.length === second.length && first.every((value) => second.includes(value));
}

/**
 * A choice field whose options open in a container anchored to its row and are applied together with the Apply
 * button, as the attendees row applies its selection. A field that asks the server for new requirements therefore asks
 * once per Apply rather than once per checked option.
 */
function MultiChoiceDropdownAdapter({
    items,
    label,
    title,
    value,
    onInputChange,
    errorText,
    disabled,
    forwardedFSClass,
    ref,
    onBlur,
    sentryLabel,
    backButtonSentryLabel,
    applyButtonSentryLabel,
}: MultiChoiceDropdownAdapterProps) {
    const selectedValues = Array.isArray(value) ? value : [];
    const displayValue = items
        .filter((item) => selectedValues.includes(item.value))
        .map((item) => item.label)
        .join(', ');

    // A held value the field no longer offers has no row, so the list leaves it out of the applied values. Comparing
    // against everything the field holds makes that Apply a change, so the hidden value is dropped and not submitted.
    const applyValues = (appliedValues: string[]) => {
        if (haveSameValues(appliedValues, selectedValues)) {
            return;
        }
        onInputChange?.(appliedValues);
    };

    return (
        <FormDropdownField
            label={label}
            value={displayValue}
            title={title}
            errorText={errorText}
            disabled={disabled}
            rowRef={ref}
            onBlur={onBlur}
            forwardedFSClass={forwardedFSClass}
            sentryLabel={sentryLabel}
            renderDropdown={(dropdownProps) => (
                <MultiValuePickerPopover
                    {...dropdownProps}
                    shouldShowHeader
                    title={title}
                    backButtonSentryLabel={backButtonSentryLabel}
                    items={items}
                    selectedValues={selectedValues}
                    onApply={applyValues}
                    applyButtonSentryLabel={applyButtonSentryLabel}
                    forwardedFSClass={forwardedFSClass}
                />
            )}
            renderFullPageList={({isVisible, onClose}) => (
                <MultiValueSelectionList
                    items={items}
                    selectedValues={selectedValues}
                    isVisible={isVisible}
                    onApply={(appliedValues) => {
                        applyValues(appliedValues);
                        onClose();
                    }}
                    applyButtonSentryLabel={applyButtonSentryLabel}
                    addBottomSafeAreaPadding
                />
            )}
        />
    );
}

export default MultiChoiceDropdownAdapter;
export type {MultiChoiceDropdownAdapterProps};
