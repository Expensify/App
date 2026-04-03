/**
 * Static/Interactive switches for SearchPageNarrow.
 *
 * Each Switch renders either a lightweight "static" placeholder (minimal hooks,
 * no heavy Onyx subscriptions) or the full interactive component, controlled by
 * the `showStatic` prop.
 *
 * IMPORTANT - keeping visual parity:
 *  • If you change the UI of an interactive component (SearchPageTabSelector,
 *    SearchPageHeader, SearchFiltersBar), verify the matching Static* version
 *    still looks visually identical.
 *  • Static components intentionally avoid expensive hooks and Onyx reads.
 *    Do NOT add new subscriptions unless absolutely necessary for correctness.
 */
import React from 'react';
import SearchFiltersBar from '@components/Search/SearchPageHeader/SearchFiltersBar';
import SearchPageHeader from '@components/Search/SearchPageHeader/SearchPageHeader';
import type {SearchQueryJSON} from '@components/Search/types';
import SearchPageTabSelector from '@pages/Search/SearchPageTabSelector';
import StaticFiltersBar from './StaticFiltersBar';
import StaticSearchPageHeader from './StaticSearchPageHeader';
import StaticTabSelector from './StaticTabSelector';

type SearchPageTabSelectorProps = {
    queryJSON?: SearchQueryJSON;
    onTabPress?: () => void;
};

type SearchPageHeaderProps = {
    queryJSON: SearchQueryJSON;
    searchRouterListVisible?: boolean;
    hideSearchRouterList?: () => void;
    onSearchRouterFocus?: () => void;
    handleSearch: (value: string) => void;
    isMobileSelectionModeEnabled: boolean;
    skipInputSkeleton?: boolean;
};

type SearchFiltersBarProps = {
    queryJSON: SearchQueryJSON;
    isMobileSelectionModeEnabled: boolean;
};

const TabSelectorSwitch = React.memo(({showStatic, ...props}: SearchPageTabSelectorProps & {showStatic: boolean}) => {
    if (showStatic) {
        return props.queryJSON ? <StaticTabSelector queryJSON={props.queryJSON} /> : null;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading -- thin wrapper forwarding exact SearchPageTabSelectorProps
    return <SearchPageTabSelector {...props} />;
});
TabSelectorSwitch.displayName = 'TabSelectorSwitch';

const SearchPageHeaderSwitch = React.memo(({showStatic, ...props}: SearchPageHeaderProps & {showStatic: boolean}) => {
    if (showStatic) {
        return <StaticSearchPageHeader />;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading -- thin wrapper forwarding exact SearchPageHeaderProps
    return <SearchPageHeader {...props} />;
});
SearchPageHeaderSwitch.displayName = 'SearchPageHeaderSwitch';

const FiltersBarSwitch = React.memo(({showStatic, ...props}: SearchFiltersBarProps & {showStatic: boolean}) => {
    if (showStatic) {
        return <StaticFiltersBar queryJSON={props.queryJSON} />;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading -- thin wrapper forwarding exact SearchFiltersBarProps
    return <SearchFiltersBar {...props} />;
});
FiltersBarSwitch.displayName = 'FiltersBarSwitch';

export {TabSelectorSwitch, SearchPageHeaderSwitch, FiltersBarSwitch};
