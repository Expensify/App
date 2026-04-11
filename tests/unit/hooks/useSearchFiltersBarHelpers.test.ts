import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import {createDateDisplayValue, hasDateFilterValue} from '@components/Search/SearchPageHeader/useSearchFiltersBar';
import CONST from '@src/CONST';

describe('useSearchFiltersBar helpers', () => {
    it('includes a readable range display value when range is set', () => {
        const translate = ((path: string) => path) as unknown as LocalizedTranslate;

        const [dateValues, displayValues] = createDateDisplayValue(
            {
                range: '2026-03-01,2026-03-31',
            },
            translate,
        );

        expect(dateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE]).toBe('2026-03-01,2026-03-31');
        expect(displayValues.length).toBe(1);
    });

    it('prefers range when on/after/before are empty for hidden date filter checks', () => {
        const filterFormValues = {
            postedRange: '2026-02-01,2026-02-28',
        };

        expect(hasDateFilterValue(filterFormValues, CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED)).toBe('2026-02-01,2026-02-28');
    });
});
