import React from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

const advancedFilters = [
    {
        fieldName: 'type',
        description: 'common.type' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TYPE,
    },
    {
        fieldName: 'date',
        description: 'common.date' as const,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_DATE,
    },
];

function getFilterDisplayTitle(filters: Record<string, string>, fieldName: string) {
    // This is temporary because the full parsing of search query is not yet done
    // TODO once we have values from query, this value should be `filters[fieldName].value`
    return fieldName;
}

function AdvancedSearchFilters() {
    const {translate} = useLocalize();
    const {singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();

    return (
        <View>
            {advancedFilters.map((item) => {
                const filterValue = getFilterDisplayTitle({}, item.fieldName);
                const onPress = singleExecution(waitForNavigate(() => Navigation.navigate(item.route)));

                return (
                    <MenuItemWithTopDescription
                        key={item.description}
                        title={filterValue}
                        description={translate(item.description)}
                        shouldShowRightIcon
                        onPress={onPress}
                    />
                );
            })}
        </View>
    );
}

AdvancedSearchFilters.displayName = 'AdvancedSearchFilters';

export default AdvancedSearchFilters;
