/** Form input for a single choice field, drawn as the expense form's dropdown row */
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import type {ComponentRef, Ref} from 'react';
import type {View} from 'react-native';

import React, {useRef} from 'react';

import type {DropdownRowSentryLabelProps} from './FormDropdownField';
import type {ValuePickerItem} from './ValuePicker/types';

import FormDropdownField from './FormDropdownField';
import ValuePickerPopover from './ValuePicker/ValuePickerPopover';
import ValueSelectionList from './ValuePicker/ValueSelectionList';

/** An option of a dropdown row. `searchValue` is the text the list's search matches instead of the label */
type DropdownChoice = Required<Pick<ValuePickerItem, 'label' | 'value'>> & Pick<ValuePickerItem, 'searchValue'>;

type DropdownChoiceAdapterProps = ForwardedFSClassProps &
    DropdownRowSentryLabelProps & {
        /** Options, one row each */
        items: DropdownChoice[];

        /** Name of the field, shown in the row and read with its value */
        label: string;

        /** Heading of the list once it opens */
        title: string;

        /** Key of the picked option */
        value?: string;

        /**
         * Called with the key of a newly picked option, then with '' and `stateInputIDToReset` to clear that input.
         * Picking the option the field already holds does not call it.
         */
        onInputChange?: (value: string, inputID?: string) => void;

        /** Input cleared on each new pick, like the state of an address whose country changes, since the old state does not belong to the new country */
        stateInputIDToReset?: string;

        /** Validation error shown under the row */
        errorText?: string;

        /** Dims the row and stops it opening, e.g. while the form waits on the server for new requirements */
        disabled?: boolean;

        /** Lets FormProvider scroll to and focus the row when the user asks to fix the errors */
        ref?: Ref<ComponentRef<typeof View>>;

        /** Called when the list closes without a pick, so FormProvider validates a field closed without an answer */
        onBlur?: () => void;
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
    errorText = '',
    disabled = false,
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
