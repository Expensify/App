import React from 'react';
import Button from '@components/Button';
import type {SearchQueryJSON} from '@components/Search/types';
import useFilterFormValues from '@hooks/useFilterFormValues';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSearchFilterSync from '@hooks/useSearchFilterSync';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SearchAdvancedFiltersButton({queryJSON}: {queryJSON: SearchQueryJSON}) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Filter']);
    const filterFormValues = useFilterFormValues(queryJSON);
    useSearchFilterSync(filterFormValues);

    const openAdvancedFilters = () => {
        updateAdvancedFilters(filterFormValues);
        Navigation.navigate(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    };

    return (
        <Button
            small
            text={translate('search.filtersHeader')}
            icon={expensifyIcons.Filter}
            onPress={openAdvancedFilters}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.ADVANCED_FILTERS_BUTTON}
        />
    );
}

export default SearchAdvancedFiltersButton;
