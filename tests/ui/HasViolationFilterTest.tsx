import {act, render} from '@testing-library/react-native';

import ListFilterContent from '@components/Search/FilterComponents/ListFilterContent';
import NegatableFilter from '@components/Search/FilterComponents/NegatableFilter';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import Tooltip from '@components/Tooltip';

import {VIOLATION_HAS_VALUES} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

const mockUseOnyx = jest.fn((key: string) => [
    key === ONYXKEYS.COLLECTION.POLICY ? {[`${ONYXKEYS.COLLECTION.POLICY}test`]: {id: 'test', type: CONST.POLICY.TYPE.CORPORATE, areRulesEnabled: true}} : undefined,
]);

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/MultiSelectListItem', () => jest.fn(() => null));
jest.mock('@components/ActivityIndicator', () => jest.fn(() => null));
jest.mock('@components/Tooltip', () => jest.fn(({children}: React.PropsWithChildren) => children));
jest.mock(
    '@components/Search/FilterComponents/ListFilterViewWrapper',
    () =>
        ({children}: React.PropsWithChildren) =>
            children,
);
jest.mock('@components/Search/FilterComponents/NegatableFilter', () => jest.fn(({children}: React.PropsWithChildren) => children));
jest.mock('@hooks/useTheme', () => () => ({}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useOnyx', () => (key: string) => mockUseOnyx(key));

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
        function HasFilterHost() {
            const [selectedValues, setSelectedValues] = React.useState(value);
            const [isHasNegated, setIsHasNegated] = React.useState(isNegated);
            return (
                <ListFilterContent
                    baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS}
                    value={selectedValues}
                    violationNames={violationNames}
                    isNegated={isHasNegated}
                    policyID={undefined}
                    onChange={(newValue) => {
                        onChange(newValue);
                        setSelectedValues(Array.isArray(newValue) ? newValue : []);
                    }}
                    onNegationChange={setIsHasNegated}
                />
            );
        }
        render(<HasFilterHost />);
        return onChange;
    }

    beforeEach(() => jest.clearAllMocks());

    it.each([
        {value: CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION, shouldRender: true},
        {value: CONST.SEARCH.HAS_VALUES.RECEIPT, shouldRender: false},
    ])('only wraps a Has row in a tooltip when it has explanatory text (%j)', ({value, shouldRender}) => {
        // Given one required violation stage alongside an unrelated Has selection
        renderHasFilter(['overLimit'], [CONST.SEARCH.HAS_VALUES.SUBMITTED_VIOLATION, CONST.SEARCH.HAS_VALUES.RECEIPT]);
        const Row = mockedSelectionList.mock.lastCall?.[0].ListItem;
        if (!Row) {
            throw new Error('Missing Has row component');
        }

        // When the shared row component renders either option
        render(
            <Row
                item={getRow(value)}
                onSelectRow={jest.fn()}
                showTooltip={false}
            />,
        );

        // Then only the required stage enables the hover wrapper
        expect(jest.mocked(Tooltip).mock.lastCall?.[0].shouldRender).toBe(shouldRender);
    });

    it.each(VIOLATION_HAS_VALUES)('disables Has negation while the %s stage is positively selected', (stage) => {
        // Given a positive violation filter with a stage alongside an unrelated Has value
        renderHasFilter(['overLimit'], [CONST.SEARCH.HAS_VALUES.RECEIPT, stage]);

        // When the Has negation toggle is rendered
        const props = jest.mocked(NegatableFilter).mock.lastCall?.[0];

        // Then the negative option explains why it is unavailable rather than describing it as required
        expect(props?.negationDisabledTooltip).toBe('search.filters.notAvailableWithViolationFilter');
    });

    it.each([{violationNames: undefined}, {violationNames: []}])('allows Has negation without a positive violation filter (%j)', ({violationNames}) => {
        // Given an absent or negated-only violation filter with no positive violation names
        renderHasFilter(violationNames);

        // When the Has negation toggle is rendered
        const props = jest.mocked(NegatableFilter).mock.lastCall?.[0];

        // Then the negative option remains available without a disabled tooltip
        expect(props?.negationDisabledTooltip).toBeUndefined();
    });

    it('does not disable negation on other filters while positive violations are selected', () => {
        // Given a positive violation filter and an unrelated Billable filter
        render(
            <ListFilterContent
                baseFilterKey={CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE}
                value={undefined}
                violationNames={['overLimit']}
                isNegated={false}
                policyID={undefined}
                onChange={jest.fn()}
                onNegationChange={jest.fn()}
            />,
        );

        // When the unrelated filter's negation toggle is rendered
        const props = jest.mocked(NegatableFilter).mock.lastCall?.[0];

        // Then the Has-only restriction does not apply
        expect(props?.negationDisabledTooltip).toBeUndefined();
    });

    it('keeps an already-negated Has filter enabled with a positive violation filter', () => {
        // Given over-limit expenses filtered to exclude receipts
        renderHasFilter(['overLimit'], [CONST.SEARCH.HAS_VALUES.RECEIPT], true);

        // When the already-negated Has popup opens
        const props = jest.mocked(NegatableFilter).mock.lastCall?.[0];

        // Then the selected negative option has no disabling tooltip
        expect(props?.isNegated).toBe(true);
        expect(props?.negationDisabledTooltip).toBeUndefined();
    });

    it('can switch a receipt-only filter from negative to positive and back with positive violations', () => {
        // Given over-limit expenses without receipts, with no violation stage selected in Has
        renderHasFilter(['overLimit'], [CONST.SEARCH.HAS_VALUES.RECEIPT], true);

        // When the user switches the live popup to Has
        act(() => jest.mocked(NegatableFilter).mock.lastCall?.[0].onNegationChange(false));

        // Then Receipt can still be negated because the selection contains no violation stage
        expect(jest.mocked(NegatableFilter).mock.lastCall?.[0].isNegated).toBe(false);
        expect(jest.mocked(NegatableFilter).mock.lastCall?.[0].negationDisabledTooltip).toBeUndefined();

        // When the user switches back to Doesn't have
        act(() => jest.mocked(NegatableFilter).mock.lastCall?.[0].onNegationChange(true));

        // Then the original negative filter is restored without losing Receipt
        expect(jest.mocked(NegatableFilter).mock.lastCall?.[0].isNegated).toBe(true);
        expect(jest.mocked(NegatableFilter).mock.lastCall?.[0].negationDisabledTooltip).toBeUndefined();
        expect(getRow(CONST.SEARCH.HAS_VALUES.RECEIPT).isSelected).toBe(true);
    });

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
