import {renderHook} from '@testing-library/react-native';
import useFrozenPreSelection from '@hooks/useFrozenPreSelection';
import CONST from '@src/CONST';

type Option = {accountID?: number; login?: string};

const getKeys = (option: Option) => [option.accountID, option.login];

const longList = CONST.STANDARD_LIST_ITEM_LIMIT;
const shortList = CONST.STANDARD_LIST_ITEM_LIMIT - 1;

describe('useFrozenPreSelection', () => {
    it('does not capture until the list is ready', () => {
        const selectedOptions: Option[] = [{accountID: 1, login: 'a@example.com'}];

        const {result} = renderHook(() =>
            useFrozenPreSelection<Option>({
                selectedOptions,
                isReady: false,
                visibleCount: longList,
                getKeys,
            }),
        );

        expect(result.current.frozen).toEqual([]);
        expect(result.current.isFrozen(selectedOptions.at(0) as Option)).toBe(false);
    });

    it('snapshots the selection on the first ready render when the list is long enough', () => {
        const selectedOptions: Option[] = [
            {accountID: 1, login: 'a@example.com'},
            {accountID: 2, login: 'b@example.com'},
        ];

        const {result} = renderHook(() =>
            useFrozenPreSelection<Option>({
                selectedOptions,
                isReady: true,
                visibleCount: longList,
                getKeys,
            }),
        );

        expect(result.current.frozen).toEqual(selectedOptions);
        expect(result.current.isFrozen({accountID: 1})).toBe(true);
        expect(result.current.isFrozen({login: 'b@example.com'})).toBe(true);
        expect(result.current.isFrozen({accountID: 3, login: 'c@example.com'})).toBe(false);
    });

    it('skips pinning when the list is below the threshold', () => {
        const selectedOptions: Option[] = [{accountID: 1, login: 'a@example.com'}];

        const {result} = renderHook(() =>
            useFrozenPreSelection<Option>({
                selectedOptions,
                isReady: true,
                visibleCount: shortList,
                getKeys,
            }),
        );

        expect(result.current.frozen).toEqual([]);
        expect(result.current.isFrozen(selectedOptions.at(0) as Option)).toBe(false);
    });

    it('respects a custom threshold', () => {
        const selectedOptions: Option[] = [{accountID: 1, login: 'a@example.com'}];

        const {result} = renderHook(() =>
            useFrozenPreSelection<Option>({
                selectedOptions,
                isReady: true,
                visibleCount: 5,
                threshold: 5,
                getKeys,
            }),
        );

        expect(result.current.frozen).toEqual(selectedOptions);
    });

    it('does not capture while canCapture is false, even if isReady is true', () => {
        const initialOptions: Option[] = [];

        const {result, rerender} = renderHook(
            ({selectedOptions, canCapture}: {selectedOptions: Option[]; canCapture: boolean}) =>
                useFrozenPreSelection<Option>({
                    selectedOptions,
                    isReady: true,
                    visibleCount: longList,
                    canCapture,
                    getKeys,
                }),
            {initialProps: {selectedOptions: initialOptions, canCapture: false}},
        );

        expect(result.current.frozen).toEqual([]);

        // Hydration arrives in the same render that flips canCapture to true.
        const hydratedOptions: Option[] = [{accountID: 7, login: 'g@example.com'}];
        rerender({selectedOptions: hydratedOptions, canCapture: true});

        expect(result.current.frozen).toEqual(hydratedOptions);
        expect(result.current.isFrozen({accountID: 7})).toBe(true);
    });

    it('keeps the snapshot stable after the first capture, even when selectedOptions changes', () => {
        const initialSelection: Option[] = [{accountID: 1, login: 'a@example.com'}];

        const {result, rerender} = renderHook(
            ({selectedOptions}: {selectedOptions: Option[]}) =>
                useFrozenPreSelection<Option>({
                    selectedOptions,
                    isReady: true,
                    visibleCount: longList,
                    getKeys,
                }),
            {initialProps: {selectedOptions: initialSelection}},
        );

        expect(result.current.frozen).toEqual(initialSelection);

        rerender({selectedOptions: [{accountID: 99, login: 'late@example.com'}]});

        // The original snapshot stays put; the new selection isn't pinned.
        expect(result.current.frozen).toEqual(initialSelection);
        expect(result.current.isFrozen({accountID: 1})).toBe(true);
        expect(result.current.isFrozen({accountID: 99})).toBe(false);
    });

    it('ignores invalid keys (default-number-id, undefined, empty string)', () => {
        const selectedOptions: Option[] = [
            {accountID: CONST.DEFAULT_NUMBER_ID, login: 'name-only@example.com'},
            {accountID: 42, login: ''},
        ];

        const {result} = renderHook(() =>
            useFrozenPreSelection<Option>({
                selectedOptions,
                isReady: true,
                visibleCount: longList,
                getKeys,
            }),
        );

        // login matches for the first row, accountID matches for the second.
        expect(result.current.isFrozen({login: 'name-only@example.com'})).toBe(true);
        expect(result.current.isFrozen({accountID: 42})).toBe(true);

        // A different row with the placeholder accountID and a different login should not be frozen.
        expect(result.current.isFrozen({accountID: CONST.DEFAULT_NUMBER_ID, login: 'someone-else@example.com'})).toBe(false);
        // An empty-string login alone matches no captured key.
        expect(result.current.isFrozen({login: ''})).toBe(false);
    });

    it('keeps the isFrozen reference stable across renders once captured', () => {
        const selectedOptions: Option[] = [{accountID: 1, login: 'a@example.com'}];

        const {result, rerender} = renderHook(() =>
            useFrozenPreSelection<Option>({
                selectedOptions,
                isReady: true,
                visibleCount: longList,
                getKeys,
            }),
        );

        const firstIsFrozen = result.current.isFrozen;
        rerender({});
        expect(result.current.isFrozen).toBe(firstIsFrozen);
    });
});
