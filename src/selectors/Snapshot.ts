import type {OnyxEntry} from 'react-native-onyx';
import type {SearchResults} from '@src/types/onyx';

const searchResultsSelector = (snapshot: OnyxEntry<SearchResults>) => snapshot?.search;

const searchResultsErrorSelector = (snapshot: OnyxEntry<SearchResults>) => snapshot?.errors;

export {searchResultsSelector, searchResultsErrorSelector};
