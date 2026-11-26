import {act, render} from '@testing-library/react-native';

import SelectionList from '@components/SelectionList';
import MultiValueSelectionList from '@components/ValuePicker/MultiValueSelectionList';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/SelectionList', () => jest.fn(() => null));
// The list pins what the field holds to the top once per open, which reads screen focus a bare render has none of
jest.mock('@hooks/useInitialSelection', () => jest.fn((selection: string[]) => selection));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

const ITEMS = [
    {value: 'RETAIL', label: 'Retail'},
    {value: 'SERVICES', label: 'Services'},
];

describe('MultiValueSelectionList', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const lastListProps = () => mockedSelectionList.mock.lastCall?.[0];
    const row = (key: string) => lastListProps()?.data.find((item) => item.keyForList === key);
    const toggle = (key: string) => {
        const item = row(key);
        if (item) {
            act(() => lastListProps()?.onSelectRow(item));
        }
    };

    const renderList = (onApply: jest.Mock, isVisible = true) =>
        render(
            <MultiValueSelectionList
                items={ITEMS}
                selectedValues={['RETAIL']}
                isVisible={isVisible}
                onApply={onApply}
                applyButtonSentryLabel={CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD_APPLY}
            />,
        );

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('checks rows without applying them', () => {
        // Given an open list with Retail checked
        const onApply = jest.fn();
        renderList(onApply);

        // When the user checks Services
        toggle('SERVICES');

        // Then the row shows checked, but nothing is applied yet, so a field that asks the server for new requirements does not ask per tap
        expect(row('SERVICES')?.isSelected).toBe(true);
        expect(onApply).not.toHaveBeenCalled();
    });

    it('applies every checked row at once', () => {
        // Given an open list with Retail checked, where the user also checks Services
        const onApply = jest.fn();
        renderList(onApply);
        toggle('SERVICES');

        // When the user applies the selection
        act(() => lastListProps()?.confirmButtonOptions?.onConfirm?.());

        // Then both values are applied together
        expect(onApply).toHaveBeenCalledTimes(1);
        expect(onApply).toHaveBeenCalledWith(['RETAIL', 'SERVICES']);
    });

    it('drops unapplied picks once the list closes', () => {
        // Given an open list where the user unchecks Retail without applying
        const onApply = jest.fn();
        const {rerender} = renderList(onApply);
        toggle('RETAIL');

        // When the list is dismissed and opened again
        const renderAt = (isVisible: boolean) =>
            rerender(
                <MultiValueSelectionList
                    items={ITEMS}
                    selectedValues={['RETAIL']}
                    isVisible={isVisible}
                    onApply={onApply}
                    applyButtonSentryLabel={CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD_APPLY}
                />,
            );
        renderAt(false);
        renderAt(true);

        // Then the list shows what the field holds again, as the attendee list does
        expect(row('RETAIL')?.isSelected).toBe(true);
        expect(onApply).not.toHaveBeenCalled();
    });

    it('does not apply a pick the options dropped while the list was open', () => {
        // Given an open list where the user checks Services
        const onApply = jest.fn();
        const {rerender} = renderList(onApply);
        toggle('SERVICES');

        // When new requirements arrive that no longer offer Services, and the user applies
        rerender(
            <MultiValueSelectionList
                items={ITEMS.filter((item) => item.value !== 'SERVICES')}
                selectedValues={['RETAIL']}
                isVisible
                onApply={onApply}
                applyButtonSentryLabel={CONST.SENTRY_LABEL.DYNAMIC_FORM.CHOICE_FIELD_APPLY}
            />,
        );
        act(() => lastListProps()?.confirmButtonOptions?.onConfirm?.());

        // Then only what the field still offers is applied, so the form never holds a key the server did not list
        expect(onApply).toHaveBeenCalledWith(['RETAIL']);
    });
});
