import type {SearchQueryAST, SearchQueryToken} from '@components/Search/types';
import {parse as parseRaw, SyntaxError} from './searchParser';
import type {PostProcessResult, RawFilterEntry} from './postProcessor';
import {postProcess} from './postProcessor';

function parseSearchQuery(query: string): SearchQueryAST & {tokens: SearchQueryToken[]} {
    const rawFilterList = parseRaw(query) as RawFilterEntry[];
    const processed = postProcess(query, rawFilterList) as PostProcessResult;
    return {
        ...processed,
    };
}

export {parseSearchQuery as parse, parseSearchQuery, SyntaxError};
export type {RawFilterEntry};
