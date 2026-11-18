/** Form input for a single choice field, drawn as the expense form's dropdown row */
import DynamicFormDropdownField from '@components/DynamicForm/components/DynamicFormDropdownField';
import type {DynamicFormChoice} from '@components/DynamicForm/utils/getFieldOptions';
import ValuePickerPopover from '@components/ValuePicker/ValuePickerPopover';
import ValueSelectionList from '@components/ValuePicker/ValueSelectionList';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import CONST from '@src/CONST';

import type {ComponentRef, Ref} from 'react';
import type {View} from 'react-native';

import React from 'react';

type DropdownChoiceAdapterProps = ForwardedFSClassProps & {
    /** Options, one row each */
    items: DynamicFormChoice[];

    /** Name of the field, shown in the row and read with its value */
    label: string;

    /** Heading of the list once it opens */
    title: string;

    /** Key of the picked option */
    value?: string;

    /** Called with the key of a newly picked option. Picking the option the field already holds does not call it. */
    onInputChange?: (value: string) => void;

    /** Validation error shown under the row */
    errorText?: string;

    /** Dims the row and stops it opening, e.g. while the form waits on the server for new requirements */
    disabled?: boolean;

    /** Lets FormProvider scroll to and focus the row when the user asks to fix the errors */
    ref?: Ref<ComponentRef<typeof View>>;

    /** Called when the list closes, so FormProvider validates a field closed without an answer */
    onBlur?: () => void;
};

/**
 * A choice field whose options open in a container anchored to its row, and picking one saves it and closes the list.
 * Only FormProvider's value, change, error and ref props reach the row. FormProvider's `onPress` marks the field
 * touched, which a list the user dismisses without a pick must not do, so it is left out.
 */
function DropdownChoiceAdapter({items, label, title, value, onInputChange, errorText = '', disabled = false, forwardedFSClass, ref, onBlur}: DropdownChoiceAdapterProps) {
    const selectedItem = items.find((item) => item.value === value);

    const selectValue = (pickedValue: string | undefined) => {
        if (pickedValue === undefined || pickedValue === value) {
            return;
        }
        onInputChange?.(pickedValue);
    };

    return (
        <DynamicFormDropdownField
            label={label}
            value={selectedItem?.label}
            title={title}
            errorText={errorText}
            disabled={disabled}
            rowRef={ref}
            onBlur={onBlur}
            forwardedFSClass={forwardedFSClass}
            renderDropdown={(dropdownProps) => (
                <ValuePickerPopover
                    {...dropdownProps}
                    shouldFitContentHeight
                    shouldShowHeader
                    title={title}
                    backButtonSentryLabel={CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD_BACK}
                    items={items}
                    selectedItem={selectedItem}
                    onItemSelected={(item) => selectValue(item.value)}
                    forwardedFSClass={forwardedFSClass}
                />
            )}
            renderFullPageList={({isVisible, onClose}) => (
                <ValueSelectionList
                    items={items}
                    selectedItem={selectedItem}
                    isVisible={isVisible}
                    onItemSelected={(item) => {
                        selectValue(item.value);
                        onClose();
                    }}
                />
            )}
        />
    );
}

export default DropdownChoiceAdapter;
export type {DropdownChoiceAdapterProps};
