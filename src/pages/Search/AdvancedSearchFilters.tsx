import React, {useMemo} from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';

function getFilterDisplayTitle(filters: Record<string, string>, fieldName: string) {
    // This is temporary because the full parsing of search query is not yet done
    // TODO once we have values from query, this value should be `filters[fieldName].value`
    return fieldName;
}

function AdvancedSearchFilters() {
    const {translate} = useLocalize();
    const {singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();

    const advancedFilters = useMemo(
        () => [
            {
                title: getFilterDisplayTitle({}, 'title'),
                description: 'common.type' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_TYPE,
            },
            {
                title: getFilterDisplayTitle({}, 'date'),
                description: 'common.date' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_DATE,
            },
        ],
        [],
    );

    return (
        <View>
            {advancedFilters.map((item) => {
                const onPress = singleExecution(waitForNavigate(() => Navigation.navigate(item.route)));

                return (
                    <MenuItemWithTopDescription
                        key={item.description}
                        title={item.title}
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
