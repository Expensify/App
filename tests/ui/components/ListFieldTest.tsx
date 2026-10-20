import {act, render, screen} from '@testing-library/react-native';

import ListField from '@components/ListField';
import type {ListFieldHandle, ListFieldRow} from '@components/ListField';

import variables from '@src/styles/variables';

import React, {createRef} from 'react';

const mockMoveAccessibilityFocus = jest.fn<void, [unknown]>();

jest.mock('@libs/Accessibility/moveAccessibilityFocus', () => ({
    __esModule: true,
    default: (element: unknown) => mockMoveAccessibilityFocus(element),
}));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string, params?: unknown) => (params === undefined ? key : `${key} ${JSON.stringify(params)}`)})));
jest.mock('@components/Avatar/UserAvatar', () => jest.fn(() => null));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Plus: () => null, Close: () => null})),
}));

const jane: ListFieldRow = {id: 'jane', title: 'Jane Doe'};
const john: ListFieldRow = {id: 'john', title: 'John Roe'};
const editJohnLabel = 'listField.editItem {"name":"John Roe"}';

function renderListField(rows: ListFieldRow[], canAddMore = true, errorText = '') {
    const ref = createRef<ListFieldHandle>();
    render(
        <ListField
            ref={ref}
            rows={rows}
            addTitle="Add owner"
            canAddMore={canAddMore}
            errorText={errorText}
            onAdd={jest.fn()}
            onEdit={jest.fn()}
            onRemove={jest.fn()}
        />,
    );
    if (!ref.current) {
        throw new Error('ListField did not expose its handle');
    }
    return ref.current;
}

function getLastFocusedLabel(): unknown {
    const element = mockMoveAccessibilityFocus.mock.lastCall?.[0];
    return screen.UNSAFE_root.findAll((node) => node.instance === element && !!node.props.accessibilityLabel).at(0)?.props.accessibilityLabel;
}

describe('ListField', () => {
    beforeEach(() => {
        mockMoveAccessibilityFocus.mockClear();
    });

    it('extends each row button to the 44x44 minimum touch target', () => {
        // Given an entry, whose small Edit button is shorter than 44 and whose remove button is 40x40
        renderListField([jane]);

        // When the row renders
        const editButton = screen.getByLabelText('listField.editItem {"name":"Jane Doe"}');
        const removeButton = screen.getByLabelText('listField.removeItem {"name":"Jane Doe"}');

        // Then the Edit button reaches 44 in height, without growing sideways into the remove button next to it, and the remove button is 44x44 itself
        const verticalSlop = (44 - variables.componentSizeSmall) / 2;
        expect(editButton).toHaveProp('hitSlop', {top: verticalSlop, bottom: verticalSlop});
        expect(removeButton).toHaveStyle({width: 44, height: 44});
    });

    it('focuses the Edit button of the asked row', () => {
        // Given two entries
        const list = renderListField([jane, john]);

        // When focus is moved to the second one, as after the entry before it is removed
        act(() => list.focusRow(john.id));

        // Then that entry's Edit button gets it
        expect(mockMoveAccessibilityFocus).toHaveBeenCalledTimes(1);
        expect(getLastFocusedLabel()).toBe(editJohnLabel);
    });

    it('focuses the last row when the add row is hidden because the list is full', () => {
        // Given a full list, which hides the add row
        const list = renderListField([jane, john], false);

        // When focus is moved to the add row, as after the entry that filled the list is saved
        act(() => list.focusAddRow());

        // Then the last entry's Edit button gets it instead, so focus does not drop to the top of the page
        expect(mockMoveAccessibilityFocus.mock.lastCall?.[0]).toBeTruthy();
        expect(getLastFocusedLabel()).toBe(editJohnLabel);
    });

    it('focuses the add row of an empty list', () => {
        // Given a list with no entries
        const list = renderListField([]);

        // When the form focuses the list to show its error
        act(() => list.focus());

        // Then the add row gets focus, as the only thing the user can act on
        expect(mockMoveAccessibilityFocus.mock.lastCall?.[0]).toBeTruthy();
        expect(getLastFocusedLabel()).toBe('Add owner');
    });

    it('reads the list error with the add row', async () => {
        // Given an empty list with an error under it
        renderListField([], true, 'Add at least 1');

        // When a screen reader reaches the add row
        // Then it hears the error with the row's name, since the error under the list is announced only when it appears
        expect(await screen.findByLabelText('Add owner. Add at least 1')).toBeOnTheScreen();
    });
});
