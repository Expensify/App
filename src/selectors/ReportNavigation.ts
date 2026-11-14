import {getStoredSearchTabParams} from '@components/Navigation/NavigationTabBar/getSearchTabRoute';

import type {SearchKey} from '@libs/SearchKeyUtils';

import type LastSearchParams from '@src/types/onyx/ReportNavigation';

import type {OnyxEntry} from 'react-native-onyx';

/** The search key of the search a Spend tab that has not shown a search yet opens on, see getStoredSearchTabParams. */
const storedSearchTabSearchKeySelector = (lastSearchParams: OnyxEntry<LastSearchParams>): SearchKey | undefined => getStoredSearchTabParams(lastSearchParams, undefined).searchKey;

// eslint-disable-next-line import/prefer-default-export -- additional selectors may be added here
export {storedSearchTabSearchKeySelector};
