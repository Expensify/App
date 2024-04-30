import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as SearchActions from '@libs/actions/Search';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as SearchUtils from '@libs/SearchUtils';
import Navigation from '@navigation/Navigation';
import EmptySearchView from '@pages/Search/EmptySearchView';
import useCustomBackHandler from '@pages/Search/useCustomBackHandler';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import SelectionList from './SelectionList';
import TableListItemSkeleton from './Skeletons/TableListItemSkeleton';
import SearchTableHeader from './SelectionList/SearchTableHeader';

/**
 * Todo This is a temporary function that will pick search results from under `snapshot_` key
 * either api needs to be updated to key by `snapshot_hash` or app code calling search data needs to be refactored
 * remove this function once this is properly fixed
 */
function getCleanSearchResults(searchResults: unknown) {
    if (!searchResults) {
        return {};
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line no-underscore-dangle,@typescript-eslint/no-unsafe-return
    return searchResults?.data;
}

type SearchProps = {
    query: string;
};

function Search({query}: SearchProps) {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const {isSmallScreenWidth, isMediumScreenWidth} = useWindowDimensions();
    // const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({});
    useCustomBackHandler();

    const hash = SearchUtils.getQueryHash(query);
    const [searchResults, searchResultsMeta] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);

    useEffect(() => {
        if (isOffline) {
            return;
        }

        SearchActions.search(query);
    }, [query, isOffline]);

    const cleanResults = getCleanSearchResults(searchResults);

    useEffect(() => {
        SearchActions.addPersonalDetailsFromSearch(cleanResults?.personalDetailsList ?? {});
    }, [cleanResults]);

    const isLoading = (!isOffline && isLoadingOnyxValue(searchResultsMeta)) || cleanResults === undefined;
    const shouldShowEmptyState = !isLoading && isEmptyObject(cleanResults);

    if (isLoading) {
        return <TableListItemSkeleton shouldAnimate />;
    }

    if (shouldShowEmptyState) {
        return <EmptySearchView />;
    }

    const displayNarrowVersion = isMediumScreenWidth || isSmallScreenWidth;

    const openReport = (reportID?: string) => {
        if (!reportID) {
            return;
        }

        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(query, reportID));
    };

    const ListItem = SearchUtils.getListItem();
    const data = SearchUtils.getSections(cleanResults ?? {});

    return (
        <SelectionList
            canSelectMultiple
            customListHeader={<SearchTableHeader />}
            ListItem={ListItem}
            sections={[{data, isDisabled: false}]}
            onSelectRow={(item) => {
                openReport(item.transactionThreadReportID);
            }}
            onSelectAll={!displayNarrowVersion ? () => {} : undefined}
            onCheckboxPress={() => {}}
            shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
            listHeaderWrapperStyle={[styles.ph9, styles.pv3, styles.pb5]}
        />
    );
}

Search.displayName = 'Search';

export type {SearchProps};
export default Search;
