import {useNavigationState} from '@react-navigation/native';
import debounce from 'lodash/debounce';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import Modal from '@components/Modal';
import {useOptionsList} from '@components/OptionListContextProvider';
import type {SearchQueryJSON} from '@components/Search/types';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as SearchUtils from '@libs/SearchUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {useSearchRouterContext} from './SearchRouterContext';
import SearchRouterInput from './SearchRouterInput';
import SearchRouterList from './SearchRouterList';

const SEARCH_DEBOUNCE_DELAY = 200;

function SearchRouter() {
    const styles = useThemeStyles();
    const [betas] = useOnyx(`${ONYXKEYS.BETAS}`);
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isSearchRouterDisplayed, closeSearchRouter} = useSearchRouterContext();

    const [currentQuery, setCurrentQuery] = useState<SearchQueryJSON | undefined>(undefined);
    const contextualReportID = useNavigationState<Record<string, {reportID: string}>, string | undefined>((state) => {
        return state.routes.at(-1)?.params?.reportID;
    });
    const [recentSearches] = useOnyx(ONYXKEYS.RECENT_SEARCHES);
    const sortedRecentSearches = Object.values(recentSearches ?? {}).sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB.getTime() - dateA.getTime();
    });

    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: true,
    });
    const searchOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return [] as unknown as OptionsListUtils.Options;
        }
        const optionList = OptionsListUtils.getSearchOptions(options, '', betas ?? []);
        return optionList;
    }, [areOptionsInitialized, betas, options]);

    const contextualReportData = searchOptions.recentReports?.find((option) => option.reportID === contextualReportID);

    const clearUserQuery = () => {
        setCurrentQuery(undefined);
    };

    const onSearchChange = debounce((userQuery: string) => {
        if (!userQuery) {
            clearUserQuery();
            return;
        }

        const queryJSON = SearchUtils.buildSearchQueryJSON(userQuery);

        if (queryJSON) {
            // eslint-disable-next-line
            console.log('parsedQuery', queryJSON);

            setCurrentQuery(queryJSON);
        } else {
            // Handle query parsing error
        }
    }, SEARCH_DEBOUNCE_DELAY);

    const closeAndClearRouter = useCallback(() => {
        closeSearchRouter();
        clearUserQuery();
    }, [closeSearchRouter]);

    const onSearchSubmit = useCallback(
        (query: SearchQueryJSON | undefined) => {
            if (!query) {
                return;
            }
            closeSearchRouter();
            const queryString = SearchUtils.buildSearchQueryString(query);
            Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: queryString}));
            clearUserQuery();
        },
        [closeSearchRouter],
    );

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ENTER,
        () => {
            onSearchSubmit(currentQuery);
        },
        {
            captureOnInputs: true,
            shouldBubble: false,
        },
    );

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => {
        closeSearchRouter();
        clearUserQuery();
    });

    const modalType = isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.CENTERED : CONST.MODAL.MODAL_TYPE.POPOVER;
    const isFullWidth = isSmallScreenWidth;

    return (
        <Modal
            type={modalType}
            fullscreen
            isVisible={isSearchRouterDisplayed}
            popoverAnchorPosition={{right: 20, top: 20}}
            onClose={closeSearchRouter}
        >
            <FocusTrapForModal active={isSearchRouterDisplayed}>
                <View style={[styles.flex1, styles.p2]}>
                    <SearchRouterInput
                        isFullWidth={isFullWidth}
                        onChange={onSearchChange}
                        onSubmit={() => {
                            onSearchSubmit(currentQuery);
                        }}
                    />

                    <SearchRouterList
                        currentSearch={currentQuery}
                        reportForContextualSearch={contextualReportData}
                        recentSearches={sortedRecentSearches}
                        recentReports={searchOptions?.recentReports?.slice(0, 5)}
                        onRecentSearchSelect={onSearchSubmit}
                        closeAndClearRouter={closeAndClearRouter}
                    />
                </View>
            </FocusTrapForModal>
        </Modal>
    );
}

SearchRouter.displayName = 'SearchRouter';

export default SearchRouter;
