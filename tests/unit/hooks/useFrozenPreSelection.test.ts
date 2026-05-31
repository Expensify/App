import {renderHook} from '@testing-library/react-native';
import useFrozenPreSelection from '@hooks/useFrozenPreSelection';
import CONST from '@src/CONST';

type Option = {keyForList?: string};

const longList = CONST.STANDARD_LIST_ITEM_LIMIT;
const shortList = CONST.STANDARD_LIST_ITEM_LIMIT - 1;

describe('useFrozenPreSelection', () => {
    it('does not capture until the list is ready', () => {
        const onlyOption: Option = {keyForList: '1'};
        const selectedOptions: Option[] = [onlyOption];

        const {result} = renderHook(() =>
            useFrozenPreSelection<Option>({
                selectedOptions,
                isReady: false,
                visibleCount: longList,
            }),
        );

        expect(result.current.frozen).toEqual([]);
        expect(result.current.isFrozen(onlyOption)).toBe(false);
    });

    it('snapshots the selection on the first ready render when the list is long enough', () => {
        const selectedOptions: Option[] = [{keyForList: '1'}, {keyForList: '2'}];

        const {result} = renderHook(() =>
            useFrozenPreSelection<Option>({
                selectedOptions,
                isReady: true,
                visibleCount: longList,
            }),
        );

        expect(result.current.frozen).toEqual(selectedOptions);
        expect(result.current.isFrozen({keyForList: '1'})).toBe(true);
        expect(result.current.isFrozen({keyForList: '2'})).toBe(true);
        expect(result.current.isFrozen({keyForList: '3'})).toBe(false);
    });

    it('skips pinning when the list is below the threshold', () => {
        const onlyOption: Option = {keyForList: '1'};
        const selectedOptions: Option[] = [onlyOption];

        const {result} = renderHook(() =>
            useFrozenPreSelection<Option>({
                selectedOptions,
                isReady: true,
                visibleCount: shortList,
            }),
        );

        expect(result.current.frozen).toEqual([]);
        expect(result.current.isFrozen(onlyOption)).toBe(false);
    });

    it('respects a custom threshold', () => {
        const selectedOptions: Option[] = [{keyForList: '1'}];

        const {result} = renderHook(() =>
            useFrozenPreSelection<Option>({
                selectedOptions,
                isReady: true,
                visibleCount: 5,
                threshold: 5,
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
                }),
            {initialProps: {selectedOptions: initialOptions, canCapture: false}},
        );

        expect(result.current.frozen).toEqual([]);

        // Hydration arrives in the same render that flips canCapture to true.
        const hydratedOptions: Option[] = [{keyForList: '7'}];
        rerender({selectedOptions: hydratedOptions, canCapture: true});

        expect(result.current.frozen).toEqual(hydratedOptions);
        expect(result.current.isFrozen({keyForList: '7'})).toBe(true);
    });

    it('keeps the snapshot stable after the first capture, even when selectedOptions changes', () => {
        const initialSelection: Option[] = [{keyForList: '1'}];

        const {result, rerender} = renderHook(
            ({selectedOptions}: {selectedOptions: Option[]}) =>
                useFrozenPreSelection<Option>({
                    selectedOptions,
                    isReady: true,
                    visibleCount: longList,
                }),
            {initialProps: {selectedOptions: initialSelection}},
        );

        expect(result.current.frozen).toEqual(initialSelection);

        rerender({selectedOptions: [{keyForList: '99'}]});

        // The original snapshot stays put; the new selection isn't pinned.
        expect(result.current.frozen).toEqual(initialSelection);
        expect(result.current.isFrozen({keyForList: '1'})).toBe(true);
        expect(result.current.isFrozen({keyForList: '99'})).toBe(false);
    });

    it('ignores rows without a keyForList', () => {
        const selectedOptions: Option[] = [{keyForList: '42'}, {}];

        const {result} = renderHook(() =>
            useFrozenPreSelection<Option>({
                selectedOptions,
                isReady: true,
                visibleCount: longList,
            }),
        );

        expect(result.current.isFrozen({keyForList: '42'})).toBe(true);
        // A row without a keyForList can never match a captured key.
        expect(result.current.isFrozen({})).toBe(false);
    });

    it('keeps the isFrozen reference stable across renders once captured', () => {
        const selectedOptions: Option[] = [{keyForList: '1'}];

        const {result, rerender} = renderHook(() =>
            useFrozenPreSelection<Option>({
                selectedOptions,
                isReady: true,
                visibleCount: longList,
            }),
        );

        const firstIsFrozen = result.current.isFrozen;
        rerender({});
        expect(result.current.isFrozen).toBe(firstIsFrozen);
    });
});
