import {getLastSearchQuery} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type SearchFilters from '@src/types/onyx/SearchFilters';

import type {OnyxEntry} from 'react-native-onyx';

const lastExpensesSearchQuerySelector = (searchFilters: OnyxEntry<SearchFilters>): string | undefined => getLastSearchQuery(searchFilters, CONST.SEARCH.SEARCH_KEYS.EXPENSES);

// eslint-disable-next-line import/prefer-default-export -- additional selectors may be added here
export {lastExpensesSearchQuerySelector};
