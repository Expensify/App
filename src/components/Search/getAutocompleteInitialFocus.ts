import CONST from '@src/CONST';

import type {ReactElement} from 'react';
import type {ValueOf} from 'type-fest';

type InitialFocusItem = {
    keyForList?: string;
    searchItemType?: ValueOf<typeof CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE>;
    text?: string;
};

type InitialFocusSection = {
    title?: string;
    customHeader?: ReactElement;
    data?: InitialFocusItem[];
};

type InitialFocusTarget = {
    /** Text of the first recent report row, used to decide whether a typed query highlights it. */
    firstRecentReportText: string;
    /** Header-aware flat index of the first recent report row, or -1 when none is rendered. */
    firstRecentReportFlatIndex: number;
    /** Key focused on open: the "Search in <chat>" suggestion when present, else the first recent report. */
    defaultFocusedKey: string | undefined;
    /** Flat index matching defaultFocusedKey, or -1 when nothing is focusable. */
    defaultFocusedFlatIndex: number;
};

/**
 * Resolves which row the autocomplete list focuses on open. Walks the rendered `sections` rather than
 * `styledRecentReports` because the two-section switcher sorts recent chats by a frozen rank, so their rendered
 * order can differ; `recentReportKeys` identifies which rows are recent reports. The returned index is flattened
 * across sections and counts header rows, otherwise focus would land on a header instead of the intended item.
 */
function getAutocompleteInitialFocus(sections: InitialFocusSection[], recentReportKeys: ReadonlySet<string>): InitialFocusTarget {
    let firstRecentReportKey: string | undefined;
    let firstRecentReportText = '';
    let firstRecentReportFlatIndex = -1;
    let contextualSuggestionKey: string | undefined;
    let contextualSuggestionFlatIndex = -1;
    let flatIndex = 0;

    for (const section of sections) {
        const hasData = (section.data?.length ?? 0) > 0;
        const hasHeader = hasData && (section.title !== undefined || section.customHeader !== undefined);
        if (hasHeader) {
            flatIndex++;
        }
        for (const item of section.data ?? []) {
            if (item.searchItemType === CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.CONTEXTUAL_SUGGESTION && contextualSuggestionFlatIndex === -1) {
                contextualSuggestionKey = item.keyForList;
                contextualSuggestionFlatIndex = flatIndex;
            }
            if (item.keyForList && recentReportKeys.has(item.keyForList)) {
                firstRecentReportKey = item.keyForList;
                firstRecentReportText = item.text ?? '';
                firstRecentReportFlatIndex = flatIndex;
                break;
            }
            flatIndex++;
        }
        if (firstRecentReportFlatIndex !== -1) {
            break;
        }
    }

    return {
        firstRecentReportText,
        firstRecentReportFlatIndex,
        // Prefer the "Search in <chat>" suggestion so Enter searches the current chat rather than opening a recent one.
        defaultFocusedKey: contextualSuggestionKey ?? firstRecentReportKey,
        defaultFocusedFlatIndex: contextualSuggestionFlatIndex !== -1 ? contextualSuggestionFlatIndex : firstRecentReportFlatIndex,
    };
}

export default getAutocompleteInitialFocus;
export type {InitialFocusSection};
