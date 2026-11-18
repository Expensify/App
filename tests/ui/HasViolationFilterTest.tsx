import {act, render} from '@testing-library/react-native';

import ListFilterContent from '@components/Search/FilterComponents/ListFilterContent';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import {VIOLATION_HAS_VALUES} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/MultiSelectListItem', () => jest.fn(() => null));
jest.mock('@components/ActivityIndicator', () => jest.fn(() => null));
jest.mock(
    '@components/Search/FilterComponents/ListFilterViewWrapper',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock(
    '@components/Search/FilterComponents/NegatableFilter',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock('@hooks/useTheme', () => () => ({}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);

describe('Has filter required violation stages', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    function getRow(value: string): ListItem & {tooltipText?: string} {
        const row = mockedSelectionList.mock.lastCall?.[0].data.find((item) => item.keyForList === value);
        if (!row) {
            throw new Error(`Missing Has row: ${value}`);
        }
        return row;
    }

    function selectRow(value: string) {
        act(() => mockedSelectionList.mock.lastCall?.[0].onSelectRow?.(getRow(value)));
    }

    function renderHasFilter(violationNames: Array<'overLimit'> | undefined, value: string[] = [...VIOLATION_HAS_VALUES], isNegated = false) {
        const onChange = jest.fn();
        render(
            <ListFilterContent
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS}
                value={value}
                violationNames={violationNames}
                isNegated={isNegated}
                policyID={undefined}
                onChange={onChange}
                onNegationChange={jest.fn()}
            />,
        );
        return onChange;
    }

    beforeEach(() => jest.clearAllMocks());

    it.each(VIOLATION_HAS_VALUES)('locks the remaining %s stage after the other stage is unchecked', (stage) => {
        // Given both stages selected with a positive violation filter
        const onChange = renderHasFilter(['overLimit']);
        const otherStage = VIOLATION_HAS_VALUES.find((value) => value !== stage);
        if (!otherStage) {
            throw new Error('Missing second violation stage');
        }
        expect(getRow(stage).isDisabled).toBe(false);

        // When one stage is unchecked, the other becomes required within the same open popup
        selectRow(otherStage);

        // Then the remaining stage has the required tooltip and cannot be unchecked
        expect(onChange).toHaveBeenLastCalledWith([stage]);
        expect(getRow(stage)).toEqual(expect.objectContaining({isSelected: true, isDisabled: true, tooltipText: 'search.filters.requiredWithViolationFilter'}));
        selectRow(stage);
        expect(onChange).toHaveBeenCalledTimes(1);

        // When the other stage is checked again, either stage can be removed
        selectRow(otherStage);

        // Then the lock and tooltip are removed
        expect(getRow(stage).isDisabled).toBe(false);
        expect(getRow(stage).tooltipText).toBeUndefined();
    });

    it('allows removing the last stage when there is no positive violation filter', () => {
        // Given an absent or negated-only violation filter, represented by no positive violation names
        const onChange = renderHasFilter(undefined, [CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION]);

        // When the last stage is unchecked
        selectRow(CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION);

        // Then it is removed normally
        expect(onChange).toHaveBeenCalledWith([]);
    });

    it('does not lock a negated Has selection even with a positive violation filter', () => {
        // Given a negated Has filter with one stage and an active positive violation filter
        const onChange = renderHasFilter(['overLimit'], [CONST.SEARCH.HAS_VALUES.APPROVED_VIOLATION], true);

        // When the negated stage is unchecked
        selectRow(CONST.SEARCH.HAS_VALUES.APPROVED_VIOLATION);

        // Then it is removed because only positive stages are required
        expect(onChange).toHaveBeenCalledWith([]);
    });

    it('does not lock unrelated Has values while the last violation stage is required', () => {
        // Given one required stage and an unrelated Has selection
        const onChange = renderHasFilter(['overLimit'], [CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION, CONST.SEARCH.HAS_VALUES.RECEIPT]);

        // When the unrelated Has value is unchecked
        selectRow(CONST.SEARCH.HAS_VALUES.RECEIPT);

        // Then it can be removed while the violation stage stays required
        expect(onChange).toHaveBeenCalledWith([CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION]);
        expect(getRow(CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION).isDisabled).toBe(true);
    });
});
