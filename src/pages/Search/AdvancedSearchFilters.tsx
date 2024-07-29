import {Str} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import type {AdvancedFiltersKeys} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchUtils from '@libs/SearchUtils';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';

function getFilterDisplayTitle(filters: Partial<SearchAdvancedFiltersForm>, fieldName: AdvancedFiltersKeys, translate: LocaleContextProps['translate']) {
    if (fieldName === CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE) {
        // the value of date filter is a combination of dateBefore + dateAfter values
        const {dateAfter, dateBefore} = filters;
        let dateValue = '';
        if (dateBefore) {
            dateValue = translate('search.filters.date.before', dateBefore);
        }
        if (dateBefore && dateAfter) {
            dateValue += ', ';
        }
        if (dateAfter) {
            dateValue += translate('search.filters.date.after', dateAfter);
        }

        return dateValue;
    }

    // Todo Once all Advanced filters are implemented this line can be cleaned up. See: https://github.com/Expensify/App/issues/45026
    // @ts-expect-error this property access is temporarily an error, because not every SYNTAX_FILTER_KEYS is handled by form.
    // When all filters are updated here: src/types/form/SearchAdvancedFiltersForm.ts this line comment + type cast can be removed.
    const filterValue = filters[fieldName] as string;
    return filterValue ? Str.recapitalize(filterValue) : undefined;
}

function AdvancedSearchFilters() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();

    const [searchAdvancedFilters = {}] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const advancedFilters = useMemo(
        () => [
            {
                title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE, translate),
                description: 'common.type' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_TYPE,
            },
            {
                title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS, translate),
                description: 'search.filters.status' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_STATUS,
            },
            {
                title: getFilterDisplayTitle(searchAdvancedFilters, CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, translate),
                description: 'common.date' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_DATE,
            },
        ],
        [searchAdvancedFilters, translate],
    );

    const onFormSubmit = () => {
        const query = SearchUtils.buildQueryStringFromFilters(searchAdvancedFilters);
        SearchActions.clearAdvancedFilters();
        Navigation.navigate(
            ROUTES.SEARCH_CENTRAL_PANE.getRoute({
                query,
                isCustomQuery: true,
            }),
        );
    };

    return (
        <View style={[styles.flex1, styles.justifyContentBetween]}>
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
            <FormAlertWithSubmitButton
                buttonText={translate('search.viewResults')}
                containerStyles={[styles.m4]}
                onSubmit={onFormSubmit}
                enabledWhenOffline
            />
        </View>
    );
}

AdvancedSearchFilters.displayName = 'AdvancedSearchFilters';

export default AdvancedSearchFilters;
