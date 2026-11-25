/** Form input for a single choice field, drawn as the expense form's dropdown row */
import type {ValuePickerItem} from '@components/ValuePicker/types';
import ValuePickerPopover from '@components/ValuePicker/ValuePickerPopover';
import ValueSelectionList from '@components/ValuePicker/ValueSelectionList';

import React, {useRef} from 'react';

import type {DropdownRowInputProps} from '.';

import FormDropdownField from '.';

/** An option of a dropdown row. `searchValue` is the text the list's search matches instead of the label */
type DropdownChoice = Required<Pick<ValuePickerItem, 'label' | 'value'>> & Pick<ValuePickerItem, 'searchValue'>;

type DropdownChoiceAdapterProps = DropdownRowInputProps<string> & {
    /** Options, one row each */
    items: DropdownChoice[];

    /** Input cleared on each new pick by calling `onInputChange` with '' and this ID, like the state of an address whose country changes, since the old state does not belong to the new country */
    stateInputIDToReset?: string;
};

/**
 * A choice field whose options open in a container anchored to its row, and picking one saves it and closes the list.
 * Only FormProvider's value, change, error and ref props reach the row. FormProvider's `onPress` marks the field
 * touched, which a list the user dismisses without a pick must not do, so it is left out.
 * A pick does not mark the field touched either, as on a push row. A pick leaves nothing to report, and a touched field
 * would show its required error as soon as another input clears it, like the state when the country changes.
 */
function DropdownChoiceAdapter({
    items,
    label,
    title,
    value,
    onInputChange,
    stateInputIDToReset,
    errorText,
    disabled,
    forwardedFSClass,
    ref,
    onBlur,
    sentryLabel,
    backButtonSentryLabel,
}: DropdownChoiceAdapterProps) {
    const selectedItem = items.find((item) => item.value === value);
    const hasPickedRef = useRef(false);

    const blurUnlessPicked = () => {
        if (!hasPickedRef.current) {
            onBlur?.();
        }
        hasPickedRef.current = false;
    };

    const selectValue = (pickedValue: string | undefined) => {
        hasPickedRef.current = true;
        if (pickedValue === undefined || pickedValue === value) {
            return;
        }
        onInputChange?.(pickedValue);
        if (stateInputIDToReset) {
            onInputChange?.('', stateInputIDToReset);
        }
    };

    return (
        <FormDropdownField
            label={label}
            value={selectedItem?.label}
            title={title}
            errorText={errorText}
            disabled={disabled}
            rowRef={ref}
            onBlur={blurUnlessPicked}
            forwardedFSClass={forwardedFSClass}
            sentryLabel={sentryLabel}
            backButtonSentryLabel={backButtonSentryLabel}
            renderDropdown={(dropdownProps) => (
                <ValuePickerPopover
                    {...dropdownProps}
                    shouldFitContentHeight
                    shouldShowHeader
                    title={title}
                    backButtonSentryLabel={backButtonSentryLabel}
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
export type {DropdownChoice, DropdownChoiceAdapterProps};
