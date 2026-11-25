/** Form input for a choice field that takes several answers, drawn as the expense form's dropdown row */
import DynamicFormDropdownField from '@components/DynamicForm/components/DynamicFormDropdownField';
import type {DynamicFormChoice} from '@components/DynamicForm/utils/getFieldOptions';
import MultiValuePickerPopover from '@components/ValuePicker/MultiValuePickerPopover';
import MultiValueSelectionList from '@components/ValuePicker/MultiValueSelectionList';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import CONST from '@src/CONST';

import type {ComponentRef, Ref} from 'react';
import type {View} from 'react-native';

import React from 'react';

type MultiChoiceDropdownAdapterProps = ForwardedFSClassProps & {
    /** Options, one row each */
    items: DynamicFormChoice[];

    /** Name of the field, shown in the row and read with its value */
    label: string;

    /** Heading of the list once it opens */
    title: string;

    /** Keys of the picked options. FormProvider starts an unanswered list field as an empty string. */
    value?: string[] | string;

    /** Called with the keys of the applied options. Applying the options the field already holds does not call it. */
    onInputChange?: (value: string[]) => void;

    /** Validation error shown under the row */
    errorText?: string;

    /** Dims the row and stops it opening, e.g. while the form waits on the server for new requirements */
    disabled?: boolean;

    /** Lets FormProvider scroll to and focus the row when the user asks to fix the errors */
    ref?: Ref<ComponentRef<typeof View>>;

    /** Called when the list closes, so FormProvider validates a field closed without an answer */
    onBlur?: () => void;
};

function haveSameValues(first: string[], second: string[]) {
    return first.length === second.length && first.every((value) => second.includes(value));
}

/**
 * A choice field whose options open in a container anchored to its row and are applied together with the Apply
 * button, as the attendees row applies its selection. A field that asks the server for new requirements therefore asks
 * once per Apply rather than once per checked option.
 */
function MultiChoiceDropdownAdapter({items, label, title, value, onInputChange, errorText = '', disabled = false, forwardedFSClass, ref, onBlur}: MultiChoiceDropdownAdapterProps) {
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
        <DynamicFormDropdownField
            label={label}
            value={displayValue}
            title={title}
            errorText={errorText}
            disabled={disabled}
            rowRef={ref}
            onBlur={onBlur}
            forwardedFSClass={forwardedFSClass}
            renderDropdown={(dropdownProps) => (
                <MultiValuePickerPopover
                    {...dropdownProps}
                    shouldShowHeader
                    title={title}
                    backButtonSentryLabel={CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD_BACK}
                    items={items}
                    selectedValues={selectedValues}
                    onApply={applyValues}
                    applyButtonSentryLabel={CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD_APPLY}
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
                    applyButtonSentryLabel={CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD_APPLY}
                    addBottomSafeAreaPadding
                />
            )}
        />
    );
}

export default MultiChoiceDropdownAdapter;
export type {MultiChoiceDropdownAdapterProps};
