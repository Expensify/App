import {fireEvent, render, screen} from '@testing-library/react-native';

import ListCheckbox from '@components/SelectionList/components/ListCheckbox';
import ListRadioButton from '@components/SelectionList/components/ListRadioButton';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import CONST from '@src/CONST';

import React from 'react';

const TEST_ID = `${CONST.SELECTION_BUTTON_TEST_ID}Test User`;

const buildItem = (isSelected: boolean, keyForList = 'test-user'): ListItem => ({
    text: 'Test User',
    keyForList,
    isSelected,
});

// The pressable renders with accessible={false}, so role-based queries and toBeChecked() can't reach it -
// read the checked flag from the accessibility state it exposes instead.
const getCheckedState = (): unknown => {
    const props: unknown = screen.getByTestId(TEST_ID).props;
    if (typeof props !== 'object' || props === null || !('accessibilityState' in props)) {
        return undefined;
    }
    const state = props.accessibilityState;
    if (typeof state !== 'object' || state === null || !('checked' in state)) {
        return undefined;
    }
    return state.checked;
};

describe('ListSelectionButton', () => {
    it('paints the checkmark optimistically on press, before the parent commits the selection', () => {
        const onSelectRow = jest.fn();
        // The parent defers its selection update (e.g. in a transition), so item.isSelected does not change on press.
        render(
            <ListCheckbox
                item={buildItem(false)}
                onSelectRow={onSelectRow}
            />,
        );

        expect(getCheckedState()).toBe(false);

        fireEvent.press(screen.getByTestId(TEST_ID));

        expect(onSelectRow).toHaveBeenCalledTimes(1);
        // The checkmark flips immediately even though the item prop has not caught up yet.
        expect(getCheckedState()).toBe(true);
    });

    it('drops the optimistic value once the item prop catches up', () => {
        const {rerender} = render(
            <ListCheckbox
                item={buildItem(false)}
                onSelectRow={jest.fn()}
            />,
        );

        fireEvent.press(screen.getByTestId(TEST_ID));
        expect(getCheckedState()).toBe(true);

        // The parent's deferred update lands and confirms the selection.
        rerender(
            <ListCheckbox
                item={buildItem(true)}
                onSelectRow={jest.fn()}
            />,
        );
        expect(getCheckedState()).toBe(true);

        // A later external update unselects the item - the stale optimistic value must not mask it.
        rerender(
            <ListCheckbox
                item={buildItem(false)}
                onSelectRow={jest.fn()}
            />,
        );
        expect(getCheckedState()).toBe(false);
    });

    it('toggles the checkmark back on a second press before the parent commits', () => {
        render(
            <ListCheckbox
                item={buildItem(false)}
                onSelectRow={jest.fn()}
            />,
        );

        fireEvent.press(screen.getByTestId(TEST_ID));
        expect(getCheckedState()).toBe(true);

        // A second rapid press (still no prop change) reverts the optimistic checkmark.
        fireEvent.press(screen.getByTestId(TEST_ID));
        expect(getCheckedState()).toBe(false);
    });

    it('drops the optimistic value when the row is recycled to a different item', () => {
        const {rerender} = render(
            <ListCheckbox
                item={buildItem(false, 'user-a')}
                onSelectRow={jest.fn()}
            />,
        );

        fireEvent.press(screen.getByTestId(TEST_ID));
        expect(getCheckedState()).toBe(true);

        // FlashList recycles the cell to a different, still-unselected item (same isSelected, new keyForList).
        // The optimistic checkmark from the previous row must not leak onto the recycled one.
        rerender(
            <ListCheckbox
                item={buildItem(false, 'user-b')}
                onSelectRow={jest.fn()}
            />,
        );
        expect(getCheckedState()).toBe(false);
    });

    it('keeps a selected radio checked when it is pressed again', () => {
        // A radio press only ever selects, so re-pressing an already-selected radio (whose isSelected prop
        // never changes) must not optimistically flip it to unchecked.
        render(
            <ListRadioButton
                item={buildItem(true)}
                onSelectRow={jest.fn()}
            />,
        );

        expect(getCheckedState()).toBe(true);

        fireEvent.press(screen.getByTestId(TEST_ID));
        expect(getCheckedState()).toBe(true);
    });
});
