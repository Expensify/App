/**
 * Static/Interactive switches for SearchPageNarrow.
 *
 * Each Switch renders either a lightweight "static" placeholder (minimal hooks,
 * no heavy Onyx subscriptions) or the full interactive component, controlled by
 * the `showStatic` prop.
 *
 * IMPORTANT - keeping visual parity:
 *  • If you change the UI of an interactive component (SearchTypeMenuNarrow,
 *    SearchPageInputNarrow, SearchActionsBarNarrow), verify the matching Static* version
 *    still looks visually identical.
 *  • Static components intentionally avoid expensive hooks and Onyx reads.
 *    Do NOT add new subscriptions unless absolutely necessary for correctness.
 */
import React from 'react';
import SearchActionsBarNarrow from '@components/Search/SearchPageHeader/SearchActionsBarNarrow';
import type {SearchActionsBarNarrowProps} from '@components/Search/SearchPageHeader/SearchActionsBarNarrow';
import SearchFiltersBarNarrow from '@components/Search/SearchPageHeader/SearchFiltersBarNarrow';
import type {SearchFiltersBarNarrowProps} from '@components/Search/SearchPageHeader/SearchFiltersBarNarrow';
import SearchPageInputNarrow from '@components/Search/SearchPageHeader/SearchPageInputNarrow';
import type {SearchPageInputNarrowProps} from '@components/Search/SearchPageHeader/SearchPageInputNarrow';
import SearchTypeMenuNarrow from '@pages/Search/SearchTypeMenuNarrow';
import type {SearchTypeMenuNarrowProps} from '@pages/Search/SearchTypeMenuNarrow';
import StaticSearchActionsBar from './StaticSearchActionsBar';
import StaticSearchPageInput from './StaticSearchPageInput';
import StaticSearchTypeMenu from './StaticSearchTypeMenu';

function SearchTypeMenuSwitch({showStatic, ...props}: SearchTypeMenuNarrowProps & {showStatic: boolean}) {
    if (showStatic) {
        return props.queryJSON ? <StaticSearchTypeMenu queryJSON={props.queryJSON} /> : null;
    }

    return <SearchTypeMenuNarrow {...props} />;
}

function SearchPageInputSwitch({showStatic, ...props}: SearchPageInputNarrowProps & {showStatic: boolean}) {
    if (showStatic) {
        return <StaticSearchPageInput />;
    }

    return <SearchPageInputNarrow {...props} />;
}

function SearchFiltersBarSwitch({showStatic, ...props}: SearchFiltersBarNarrowProps & {showStatic: boolean}) {
    if (showStatic) {
        return null;
    }

    return <SearchFiltersBarNarrow {...props} />;
}

function SearchActionsBarSwitch({showStatic, ...props}: SearchActionsBarNarrowProps & {showStatic: boolean}) {
    if (showStatic) {
        return <StaticSearchActionsBar />;
    }

    return <SearchActionsBarNarrow {...props} />;
}

export {SearchTypeMenuSwitch, SearchPageInputSwitch, SearchFiltersBarSwitch, SearchActionsBarSwitch};
