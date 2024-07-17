import React from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import Navigation from '@libs/Navigation/Navigation';
import type {Route} from '@src/ROUTES';

const advancedFilters = [
    {
        fieldName: 'type',
        description: 'common.type' as const,
        route: '/search/filters/type' as Route,
    },
    {
        fieldName: 'date',
        description: 'common.date' as const,
        route: '/search/filters/date' as Route,
    },
];

function getFilterDisplayTitle(filters: Record<string, string>, fieldName: string) {
    // This is temporary because the full parsing of search query is not yet done
    // The actual value will be `filters[fieldName].value` to be updated later
    return fieldName;
}

function AdvancedSearchFilters() {
    const {singleExecution} = useSingleExecution();
    const {translate} = useLocalize();

    return (
        <View>
            {advancedFilters.map((item) => {
                const filterValue = getFilterDisplayTitle({}, item.fieldName);
                const onPress = singleExecution(() => Navigation.navigate(item.route));

                return (
                    <MenuItemWithTopDescription
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
