import {fireEvent, render, screen} from '@testing-library/react-native';

import ListSelectionButton from '@components/SelectionList/components/ListSelectionButton';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import CONST from '@src/CONST';

import React from 'react';

const TEST_ID = `${CONST.SELECTION_BUTTON_TEST_ID}Test User`;

const buildItem = (isSelected: boolean, keyForList = 'test-user'): ListItem => ({
    text: 'Test User',
    keyForList,
    isSelected,
});

// The pressable is accessible={false}, so read the checked flag from its accessibility state directly.
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
            <ListSelectionButton
                role={CONST.ROLE.CHECKBOX}
                item={buildItem(false)}
                onSelectRow={onSelectRow}
                shouldUseOptimisticSelection
            />,
        );

        expect(getCheckedState()).toBe(false);

        fireEvent.press(screen.getByTestId(TEST_ID));

        expect(onSelectRow).toHaveBeenCalledTimes(1);
        // The checkmark flips immediately even though the item prop has not caught up yet.
        expect(getCheckedState()).toBe(true);
    });

    it('does not paint optimistically when the opt-in is off (default for every other list)', () => {
        const onSelectRow = jest.fn();
        render(
            <ListSelectionButton
                role={CONST.ROLE.CHECKBOX}
                item={buildItem(false)}
                onSelectRow={onSelectRow}
            />,
        );

        fireEvent.press(screen.getByTestId(TEST_ID));

        // Without the opt-in the check follows item.isSelected only, so it stays unchecked until the prop updates.
        expect(onSelectRow).toHaveBeenCalledTimes(1);
        expect(getCheckedState()).toBe(false);
    });

    it('drops the optimistic value once the item prop catches up', () => {
        const {rerender} = render(
            <ListSelectionButton
                role={CONST.ROLE.CHECKBOX}
                item={buildItem(false)}
                onSelectRow={jest.fn()}
                shouldUseOptimisticSelection
            />,
        );

        fireEvent.press(screen.getByTestId(TEST_ID));
        expect(getCheckedState()).toBe(true);

        // The parent's deferred update lands and confirms the selection.
        rerender(
            <ListSelectionButton
                role={CONST.ROLE.CHECKBOX}
                item={buildItem(true)}
                onSelectRow={jest.fn()}
                shouldUseOptimisticSelection
            />,
        );
        expect(getCheckedState()).toBe(true);

        // A later external update unselects the item - the stale optimistic value must not mask it.
        rerender(
            <ListSelectionButton
                role={CONST.ROLE.CHECKBOX}
                item={buildItem(false)}
                onSelectRow={jest.fn()}
                shouldUseOptimisticSelection
            />,
        );
        expect(getCheckedState()).toBe(false);
    });

    it('toggles the checkmark back on a second press before the parent commits', () => {
        render(
            <ListSelectionButton
                role={CONST.ROLE.CHECKBOX}
                item={buildItem(false)}
                onSelectRow={jest.fn()}
                shouldUseOptimisticSelection
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
            <ListSelectionButton
                role={CONST.ROLE.CHECKBOX}
                item={buildItem(false, 'user-a')}
                onSelectRow={jest.fn()}
                shouldUseOptimisticSelection
            />,
        );

        fireEvent.press(screen.getByTestId(TEST_ID));
        expect(getCheckedState()).toBe(true);

        // FlashList recycles the cell to a new item (same isSelected, new keyForList); the old checkmark must not leak.
        rerender(
            <ListSelectionButton
                role={CONST.ROLE.CHECKBOX}
                item={buildItem(false, 'user-b')}
                onSelectRow={jest.fn()}
                shouldUseOptimisticSelection
            />,
        );
        expect(getCheckedState()).toBe(false);
    });

    it('keeps a selected radio checked when it is pressed again', () => {
        // A radio only selects, so re-pressing a checked radio must not flip it to unchecked.
        render(
            <ListSelectionButton
                role={CONST.ROLE.RADIO}
                item={buildItem(true)}
                onSelectRow={jest.fn()}
            />,
        );

        expect(getCheckedState()).toBe(true);

        fireEvent.press(screen.getByTestId(TEST_ID));
        expect(getCheckedState()).toBe(true);
    });
});
