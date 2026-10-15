import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import type {SearchQueryJSON} from '@src/components/Search/types';

const POLICY_COUNT = 500;
const REPORT_COUNT = 500;
const CATEGORY_COUNT = 500;

function buildSearchQueryJSONOrThrow(query: string): SearchQueryJSON {
    const result = buildSearchQueryJSON(query);
    if (!result) {
        throw new Error(`Failed to parse query string: ${query}`);
    }
    return result;
}

export {POLICY_COUNT, REPORT_COUNT, CATEGORY_COUNT, buildSearchQueryJSONOrThrow};
