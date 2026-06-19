import type {OnyxEntry} from 'react-native-onyx';
import {shouldShowFilter, SKIPPED_SEARCH_FILTERS} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {SearchAdvancedFiltersKey} from '@src/types/form/SearchAdvancedFiltersForm';

const columnsSelector = (form: OnyxEntry<SearchAdvancedFiltersForm>) => form?.columns;

const hasFilterBarsSelector = (form: OnyxEntry<SearchAdvancedFiltersForm>) => {
    const type = form?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;
    return Object.entries(form ?? {}).some(([key, value]) => shouldShowFilter(SKIPPED_SEARCH_FILTERS, key as SearchAdvancedFiltersKey, value, type));
};

export {columnsSelector, hasFilterBarsSelector};
