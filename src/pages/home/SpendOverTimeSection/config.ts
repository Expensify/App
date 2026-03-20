import {getSuggestedSearches} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';

const CONFIG = getSuggestedSearches()[CONST.SEARCH.SEARCH_KEYS.SPEND_OVER_TIME];
const QUERY = CONFIG.searchQuery;
const QUERY_JSON = CONFIG.searchQueryJSON;
const GROUP_BY = QUERY_JSON?.groupBy;
const VIEW = QUERY_JSON?.view;
const SEARCH_KEY = CONFIG.key;
const TRANSLATION_PATH = CONFIG.translationPath;

export {QUERY, QUERY_JSON, GROUP_BY, VIEW, SEARCH_KEY, TRANSLATION_PATH};
