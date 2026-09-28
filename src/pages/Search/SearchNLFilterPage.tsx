/**
 * Full-screen page (narrow layout / RHP) wrapping the "Describe your search" natural-language filter input.
 */
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchNLFilterContent from '@components/Search/FilterComponents/AdvancedFilters/SearchNLFilterContent';

import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

import React, {useEffect} from 'react';

function SearchNLFilterPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isNLFiltersBeta = isBetaEnabledOrUnknown(CONST.BETAS.NL_FILTERS);

    useEffect(() => {
        if (isNLFiltersBeta !== false) {
            return;
        }
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
    }, [isNLFiltersBeta]);

    const handleSuccess = (route: Route) => {
        Navigation.dismissModal({afterTransition: () => Navigation.navigate(route)});
    };

    return (
        <ScreenWrapper
            testID="SearchNLFilterPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('search.filters.describeSearch.title')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS)}
            />
            <SearchNLFilterContent
                onSuccess={handleSuccess}
                size={CONST.BUTTON_SIZE.LARGE}
            />
        </ScreenWrapper>
    );
}

export default SearchNLFilterPage;
