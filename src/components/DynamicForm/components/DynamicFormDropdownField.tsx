/** The dropdown row every DynamicForm choice field shares, with the full-page list it falls back to */
import DropdownField from '@components/DropdownField';
import type {DropdownFieldRenderProps} from '@components/DropdownField';
import FSClassView from '@components/FSClassView';
import {SELECTION_LIST_POPOVER_HEADER_HEIGHT} from '@components/SelectionListPopoverHeader';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import CONST from '@src/CONST';

import type {ComponentRef, ReactNode, Ref} from 'react';
import type {View} from 'react-native';

import React, {useContext, useState} from 'react';

import DynamicFormFullPageList from './DynamicFormFullPageList';
import DynamicFormModalContext from './DynamicFormModalContext';

type DynamicFormDropdownFieldRenderProps = {
    /** Whether the list is open, so a list that keeps unapplied picks can drop them each time it opens or closes */
    isVisible: boolean;

    /** Closes the list. A single-select list calls it after a pick, a multi-select one after Apply */
    onClose: () => void;
};

type DynamicFormDropdownFieldProps = ForwardedFSClassProps & {
    /** Name of the field, shown in the row and read with its value */
    label: string;

    /** The answer as the row shows it. Empty leaves the field name as the placeholder */
    value?: string;

    /** Name screen readers hear in place of `label` and `value`, for a field whose label alone does not say what it belongs to */
    accessibilityLabel?: string;

    /** Heading of the list once it opens, on the narrow layout's sheet and on the full page */
    title: string;

    /** Validation error shown under the row and read with it */
    errorText: string;

    /** Dims the row and stops it opening, e.g. while the form waits on the server for new requirements */
    disabled: boolean;

    /** Lets FormProvider scroll to and focus the row when the user asks to fix the errors */
    rowRef?: Ref<ComponentRef<typeof View>>;

    /** Called each time the list closes, so FormProvider marks the field touched and shows a required error for a list closed without an answer */
    onBlur?: () => void;

    /** The field's list in the container anchored to the row. Only called once the row is first pressed. The container renders outside the row, so the list masks itself with `forwardedFSClass` */
    renderDropdown: (props: DropdownFieldRenderProps) => ReactNode;

    /** The same list on a page of its own, for when neither side of the row has room for one option */
    renderFullPageList: (props: DynamicFormDropdownFieldRenderProps) => ReactNode;
};

/**
 * A choice field drawn as the expense form's dropdown row: a bordered box like a text input whose options open in a
 * container anchored to it, the same way the category, tag and tax rows behave. A form field has no page of its own to
 * navigate to, so when the row has no room for its container, or sits in a modal the container would draw behind, the
 * list opens on a full page instead, masked like the field.
 */
function DynamicFormDropdownField({
    label,
    value,
    accessibilityLabel,
    title,
    errorText,
    disabled,
    rowRef,
    forwardedFSClass,
    renderDropdown,
    renderFullPageList,
    onBlur,
}: DynamicFormDropdownFieldProps) {
    const styles = useThemeStyles();
    const isInsideModal = useContext(DynamicFormModalContext);
    const [isFullPageListVisible, setIsFullPageListVisible] = useState(false);
    const closeFullPageList = () => {
        setIsFullPageListVisible(false);
        onBlur?.();
    };

    return (
        <>
            <DropdownField
                rowRef={rowRef}
                name={label}
                value={value}
                accessibilityLabel={accessibilityLabel}
                errorText={errorText}
                shouldReadErrorWithLabel
                isDisabled={disabled}
                // The anchored container draws below every modal, so inside one it would open hidden behind it
                shouldOpenInDropdown={!isInsideModal}
                onPress={() => setIsFullPageListVisible(true)}
                listHeaderHeight={SELECTION_LIST_POPOVER_HEADER_HEIGHT}
                renderDropdown={(dropdownProps) =>
                    renderDropdown({
                        ...dropdownProps,
                        onClose: () => {
                            dropdownProps.onClose();
                            onBlur?.();
                        },
                    })
                }
                sentryLabel={CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD}
            />
            <DynamicFormFullPageList
                isVisible={isFullPageListVisible}
                title={title}
                onClose={closeFullPageList}
            >
                <FSClassView
                    style={styles.flex1}
                    forwardedFSClass={forwardedFSClass}
                >
                    {renderFullPageList({isVisible: isFullPageListVisible, onClose: closeFullPageList})}
                </FSClassView>
            </DynamicFormFullPageList>
        </>
    );
}

export default DynamicFormDropdownField;
export type {DynamicFormDropdownFieldRenderProps};
