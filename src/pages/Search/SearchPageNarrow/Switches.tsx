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

const SearchTypeMenuSwitch = React.memo(({showStatic, ...props}: SearchTypeMenuNarrowProps & {showStatic: boolean}) => {
    if (showStatic) {
        return props.queryJSON ? <StaticSearchTypeMenu queryJSON={props.queryJSON} /> : null;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading -- thin wrapper forwarding exact SearchPageTabSelectorProps
    return <SearchTypeMenuNarrow {...props} />;
});
SearchTypeMenuSwitch.displayName = 'SearchTypeMenuSwitch';

const SearchPageInputSwitch = React.memo(({showStatic, ...props}: SearchPageInputNarrowProps & {showStatic: boolean}) => {
    if (showStatic) {
        return <StaticSearchPageInput />;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading -- thin wrapper forwarding exact SearchPageHeaderProps
    return <SearchPageInputNarrow {...props} />;
});
SearchPageInputSwitch.displayName = 'SearchPageInputSwitch';

const SearchFiltersBarSwitch = React.memo(({showStatic, ...props}: SearchFiltersBarNarrowProps & {showStatic: boolean}) => {
    if (showStatic) {
        return null;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading -- thin wrapper forwarding exact SearchFiltersBarProps
    return <SearchFiltersBarNarrow {...props} />;
});
SearchFiltersBarSwitch.displayName = 'SearchFiltersBarSwitch';

const SearchActionsBarSwitch = React.memo(({showStatic, ...props}: SearchActionsBarNarrowProps & {showStatic: boolean}) => {
    if (showStatic) {
        return <StaticSearchActionsBar />;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading -- thin wrapper forwarding exact SearchPageHeaderProps
    return <SearchActionsBarNarrow {...props} />;
});
SearchActionsBarSwitch.displayName = 'SearchActionsBarSwitch';

export {SearchTypeMenuSwitch, SearchPageInputSwitch, SearchFiltersBarSwitch, SearchActionsBarSwitch};
