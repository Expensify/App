import {createDateDisplayValueHelper} from '@components/Search/SearchPageHeader/SearchFiltersBar';
import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

describe('SearchFiltersBar createDateDisplayValueHelper', () => {
    const translate: (key: TranslationPaths) => string = (key) => key;

    it('shows on/after/before/range together when explicit range is enabled', () => {
        const on = '2023-01-01';
        const after = '2023-01-02';
        const before = '2023-01-05';
        const range = `${after},${before}`;

        const [value, display] = createDateDisplayValueHelper({on, after, before, range}, translate);
        const expectedRange = DateUtils.getFormattedDateRangeForSearch(after, before, true);

        expect(value.Range).toBe(range);
        expect(value.On).toBe(on);
        expect(value.After).toBe(after);
        expect(value.Before).toBe(before);
        expect(display).toEqual([
            `common.on ${DateUtils.formatToReadableString(on)}`,
            `common.after ${DateUtils.formatToReadableString(after)}`,
            `common.before ${DateUtils.formatToReadableString(before)}`,
            `common.range: ${expectedRange}`,
        ]);
    });

    it('shows single-boundary range text when explicit range is enabled', () => {
        const range = '2023-03-03';
        const [value, display] = createDateDisplayValueHelper({range}, translate);

        expect(value.Range).toBe(range);
        expect(display).toEqual([`common.range: ${DateUtils.formatToReadableString(range)}`]);
    });

    it('formats single boundary dates without using range mode', () => {
        const after = '2023-02-10';
        const before = '2023-02-12';

        const [afterValue, afterDisplay] = createDateDisplayValueHelper({after}, translate);
        const [beforeValue, beforeDisplay] = createDateDisplayValueHelper({before}, translate);

        expect(afterValue.Range).toBeUndefined();
        expect(afterDisplay).toEqual([`common.after ${DateUtils.formatToReadableString(after)}`]);

        expect(beforeValue.Range).toBeUndefined();
        expect(beforeDisplay).toEqual([`common.before ${DateUtils.formatToReadableString(before)}`]);
    });

    it('uses preset labels when provided', () => {
        const [value, display] = createDateDisplayValueHelper({on: CONST.SEARCH.DATE_PRESETS.LAST_MONTH}, translate);

        expect(value.On).toBe(CONST.SEARCH.DATE_PRESETS.LAST_MONTH);
        expect(value.Range).toBeUndefined();
        expect(display).toEqual([`search.filters.date.presets.${CONST.SEARCH.DATE_PRESETS.LAST_MONTH}`]);
    });
});
