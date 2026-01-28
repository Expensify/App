import {useEffect} from 'react';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';
import useOnyx from './useOnyx';

const allSearchAdvancedFilters: {current: Partial<SearchAdvancedFiltersForm>} = {current: {}};
const prevSearchAdvancedFiltersFormsByType: {current: Record<string, Partial<SearchAdvancedFiltersForm> | undefined>} = {current: {}};
/**
 * This hook helps retain all filter values and will only update the filters that have changed
 */
export default function useStickySearchFilters(shouldUpdate?: boolean) {
    const [searchAdvancedFiltersForm = getEmptyObject<Partial<SearchAdvancedFiltersForm>>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});

    useEffect(() => {
        if (!shouldUpdate || !searchAdvancedFiltersForm.type) {
            return;
        }

        const prevSearchAdvancedFiltersForm = prevSearchAdvancedFiltersFormsByType.current[searchAdvancedFiltersForm.type];
        const allKeys = new Set([...Object.keys(searchAdvancedFiltersForm), ...Object.keys(prevSearchAdvancedFiltersForm ?? {})]) as Set<keyof typeof searchAdvancedFiltersForm>;
        const changedKeys: Array<keyof typeof searchAdvancedFiltersForm> = [];
        for (const key of allKeys) {
            const currentValue = searchAdvancedFiltersForm[key];
            const previousValue = prevSearchAdvancedFiltersForm?.[key];
            if (Array.isArray(currentValue) && Array.isArray(previousValue)) {
                if (currentValue.sort().join(',') === previousValue.sort().join(',')) {
                    continue;
                }
            } else if (Object.is(currentValue, previousValue)) {
                continue;
            }

            changedKeys.push(key);
        }

        for (const key of changedKeys) {
            if (!prevSearchAdvancedFiltersForm && allSearchAdvancedFilters.current[key]) {
                continue;
            }
            (allSearchAdvancedFilters.current[key] as unknown) = searchAdvancedFiltersForm[key] ?? undefined;
        }
        allSearchAdvancedFilters.current = {...allSearchAdvancedFilters.current, type: searchAdvancedFiltersForm.type};
        prevSearchAdvancedFiltersFormsByType.current[searchAdvancedFiltersForm.type] = searchAdvancedFiltersForm;

        // Here we only rely on `searchAdvancedFiltersForm`, without triggering when `shouldUpdate`,
        // because `shouldUpdate` is just a flag indicating that an update can happen,
        // and the actual update only occurs when `searchAdvancedFiltersForm` has truly been updated.
        // And since `shouldUpdate` is a value derived from queryJSON data,
        // when `searchAdvancedFiltersForm` is updated via useOnyx,
        // `shouldUpdate` has already been updated beforehand,
        // so there’s no concern about having an incorrect value.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchAdvancedFiltersForm]);

    // We want to use ref here only because the value from this hook is just a derived value,
    // and we don’t need to rerender when the hook’s value changes.
    // eslint-disable-next-line react-hooks/refs
    return shouldUpdate && isEmptyObject(allSearchAdvancedFilters.current) ? searchAdvancedFiltersForm : allSearchAdvancedFilters.current;
}
