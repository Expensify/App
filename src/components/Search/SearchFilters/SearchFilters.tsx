import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as SearchUtils from '@libs/SearchUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

type SearchFiltersProps = {
    query: string;
    searchType: SearchDataTypes;
};

const statusOptions = [
    {
        value: '',
        text: 'All',
        keyForList: 'all',
        isSelected: false,
    },
    {
        value: CONST.SEARCH.STATUS_FILTER.PAID,
        text: 'Paid',
        keyForList: 'paid',
        isSelected: false,
    },
    {
        value: CONST.SEARCH.STATUS_FILTER.PENDING,
        text: 'Pending',
        keyForList: 'pending',
        isSelected: false,
    },
];

function SearchFilters({query, searchType}: SearchFiltersProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();

    const [selectedStatus, setSelectedStatus] = useState('');

    const parsedQuery = useMemo(() => SearchUtils.buildSearchQueryJSON(query), [query]);

    const statusItems = useMemo(
        () =>
            statusOptions.map((option) => ({
                ...option,
                isSelected: selectedStatus === option.value,
            })),
        [selectedStatus],
    );

    const handleStatusChange = (status: ValueOf<typeof CONST.SEARCH.STATUS_FILTER> | '') => {
        setSelectedStatus(status);

        const updatedQuery = SearchUtils.buildSearchQueryString({
            ...parsedQuery,
            status,
        });

        Navigation.navigate(ROUTES.SEARCH.getRoute({query: updatedQuery}));
    };

    const getFilterDisplayValue = (filterType: string) => {
        switch (filterType) {
            case 'status':
                if (!selectedStatus) {
                    return translate('common.all');
                }
                return statusOptions.find(option => option.value === selectedStatus)?.text || translate('common.all');
            default:
                return translate('common.all');
        }
    };

    const shouldShowFilters = searchType === CONST.SEARCH.DATA_TYPES.EXPENSE;

    return (
        <ScreenWrapper
            testID="SearchFilters"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <HeaderWithBackButton
                title={translate('common.filters')}
                onBackButtonPress={Navigation.goBack}
            />

            {shouldShowFilters && (
                <View style={[styles.flex1, styles.ph5]}>
                    <MenuItemWithTopDescription
                        description={translate('common.status')}
                        title={getFilterDisplayValue('status')}
                        onPress={() => Navigation.navigate(ROUTES.SEARCH_FILTERS_STATUS)}
                        shouldShowRightIcon
                        wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

SearchFilters.displayName = 'SearchFilters';

export default SearchFilters;
