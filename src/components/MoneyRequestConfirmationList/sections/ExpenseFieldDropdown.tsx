import type {AnchoredFieldDropdownRenderProps} from '@hooks/useAnchoredFieldDropdown';
import useAnchoredFieldDropdown from '@hooks/useAnchoredFieldDropdown';

import type {ReactNode, Ref} from 'react';

import React, {useImperativeHandle} from 'react';

import type {ExpenseFieldRowProps} from './ExpenseFieldRow';

import ExpenseFieldRow from './ExpenseFieldRow';

/** What the field's list is handed to open in the container anchored to the row */
type ExpenseFieldDropdownRenderProps = AnchoredFieldDropdownRenderProps;

type ExpenseFieldDropdownProps = Omit<ExpenseFieldRowProps, 'onPress' | 'anchorRef' | 'isExpanded'> & {
    /** Renders the field's list. Only called once the row has been pressed, so an untouched field costs the form nothing. */
    renderDropdown: (props: ExpenseFieldDropdownRenderProps) => ReactNode;

    /** Whether the list opens in the container. A field that can't answer in place falls back to `onPress`. */
    shouldOpenInDropdown: boolean;

    /** Opens the field's full-page selector, for every case `shouldOpenInDropdown` rules out */
    onPress: () => void;

    /** Height of a header the list shows above its options, e.g. an add button, added to the container's limits so it still fits as many options */
    listHeaderHeight?: number;

    /** Lets the field open its list without a press, e.g. once the user is back from a step the press sent them to */
    ref?: Ref<ExpenseFieldDropdownHandle>;
};

type ExpenseFieldDropdownHandle = {
    /** Opens the list as a press would, falling back to `onPress` when it can't open in place. Does nothing if it is already open. */
    open: () => void;
};

/**
 * An expense form field whose list opens in a container anchored to the row, rather than on its own page.
 *
 * `PopoverWithMeasuredContent` makes it a pop-over on a wide layout and a bottom sheet on a narrow one. The
 * pop-over matches the row's width and opens below it, or above when there isn't room, capped so it is never
 * clipped. Knows nothing about any particular field: each passes its own list in through `renderDropdown`.
 */
function ExpenseFieldDropdown({renderDropdown, shouldOpenInDropdown, onPress, listHeaderHeight = 0, ref, ...rowProps}: ExpenseFieldDropdownProps) {
    const {anchorRef, isVisible, hasEverOpened, toggleDropdown, dropdownProps} = useAnchoredFieldDropdown({onFallback: onPress, listHeaderHeight});

    const handlePress = () => {
        if (!shouldOpenInDropdown) {
            onPress();
            return;
        }
        toggleDropdown();
    };

    useImperativeHandle(ref, () => ({
        open: () => {
            if (!shouldOpenInDropdown) {
                onPress();
                return;
            }
            if (!isVisible) {
                toggleDropdown();
            }
        },
    }));

    return (
        <>
            <ExpenseFieldRow
                {...rowProps}
                anchorRef={shouldOpenInDropdown ? anchorRef : undefined}
                isExpanded={shouldOpenInDropdown ? isVisible : undefined}
                onPress={handlePress}
            />
            {hasEverOpened && renderDropdown(dropdownProps)}
        </>
    );
}

export default ExpenseFieldDropdown;
export type {ExpenseFieldDropdownHandle, ExpenseFieldDropdownRenderProps};
