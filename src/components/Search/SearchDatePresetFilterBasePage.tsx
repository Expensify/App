import React, {useCallback, useMemo} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useSubPage from '@hooks/useSubPage';
import type {PageConfig, SubPageProps} from '@hooks/useSubPage/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import DateFilterBase from './FilterComponents/DateFilterBase';
import type {SearchDateFilterKeys, SearchFilterKey} from './types';

function EmptySubPageComponent() {
    return null;
}
const DATE_FILTER_SUB_PAGES: Array<PageConfig<SubPageProps>> = [
    {pageName: CONST.SEARCH.DATE_FILTER_SUB_PAGE.MAIN, component: EmptySubPageComponent},
    {pageName: CONST.SEARCH.DATE_MODIFIERS.ON, component: EmptySubPageComponent},
    {pageName: CONST.SEARCH.DATE_MODIFIERS.AFTER, component: EmptySubPageComponent},
    {pageName: CONST.SEARCH.DATE_MODIFIERS.BEFORE, component: EmptySubPageComponent},
];

type SearchDatePresetFilterBasePageProps = {
    /** Key used for the date filter */
    dateKey: Extract<SearchDateFilterKeys, SearchFilterKey>;

    /** The translation key for the page title */
    titleKey: TranslationPaths;
};

function SearchDatePresetFilterBasePage({dateKey, titleKey}: SearchDatePresetFilterBasePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const goBack = useCallback(() => {
        Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
    }, []);

    const buildSubPageRoute = useCallback((subPage: string) => ROUTES.SEARCH_ADVANCED_FILTERS.getRoute(dateKey, subPage), [dateKey]);

    const {currentPageName, resetToPage, isRedirecting} = useSubPage<SubPageProps>({
        pages: DATE_FILTER_SUB_PAGES,
        startFrom: 0,
        onFinished: goBack,
        buildRoute: buildSubPageRoute,
    });

    const selectedDateModifier = useMemo<SearchDateModifier | null>(() => {
        if (currentPageName === CONST.SEARCH.DATE_MODIFIERS.ON || currentPageName === CONST.SEARCH.DATE_MODIFIERS.AFTER || currentPageName === CONST.SEARCH.DATE_MODIFIERS.BEFORE) {
            return currentPageName;
        }

        return null;
    }, [currentPageName]);

    const selectDateModifier = useCallback(
        (dateModifier: SearchDateModifier | null) => {
            if (!dateModifier) {
                Navigation.goBack(buildSubPageRoute(CONST.SEARCH.DATE_FILTER_SUB_PAGE.MAIN));
                return;
            }

            resetToPage(dateModifier);
        },
        [buildSubPageRoute, resetToPage],
    );

    if (isRedirecting) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            testID="SearchDatePresetFilterBasePage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <DateFilterBase
                title={translate(titleKey)}
                dateKey={dateKey}
                back={goBack}
                selectedDateModifier={selectedDateModifier}
                onSelectDateModifier={selectDateModifier}
                onSubmit={(values) => {
                    updateAdvancedFilters(values);
                    Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS.getRoute());
                }}
            />
        </ScreenWrapper>
    );
}

export default SearchDatePresetFilterBasePage;
