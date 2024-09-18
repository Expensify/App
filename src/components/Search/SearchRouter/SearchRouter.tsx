import debounce from 'lodash/debounce';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import * as Expensicons from '@components/Icon/Expensicons';
import Modal from '@components/Modal';
import {useOptionsList} from '@components/OptionListContextProvider';
import type {SearchQueryJSON} from '@components/Search/types';
import SingleIconListItem from '@components/SelectionList/Search/SingleIconListItem';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as SearchUtils from '@libs/SearchUtils';
import Navigation from '@navigation/Navigation';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {useSearchRouterContext} from './SearchRouterContext';
import SearchRouterInput from './SearchRouterInput';
import SearchRouterList from './SearchRouterList';

const SEARCH_DEBOUNCE_DELAY = 200;

function SearchRouter() {
    const styles = useThemeStyles();

    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isSearchRouterDisplayed, closeSearchRouter} = useSearchRouterContext();
    const [currentQuery, setCurrentQuery] = useState<SearchQueryJSON | undefined>(undefined);
    const [recentSearches] = useOnyx(ONYXKEYS.RECENT_SEARCHES);

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

    const onSearchSubmit = useCallback(() => {
        if (!currentQuery) {
            return;
        }
        closeSearchRouter();
        const queryString = SearchUtils.buildSearchQueryString(currentQuery);
        SearchActions.addRecentSearch({queryJSON: currentQuery, previousRecentSearches: recentSearches ?? []});
        Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: queryString}));
        clearUserQuery();
    }, [currentQuery, closeSearchRouter, recentSearches]);

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ENTER,
        () => {
            onSearchSubmit();
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

    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: true,
    });

    const [betas] = useOnyx(`${ONYXKEYS.BETAS}`);

    const searchOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return [];
        }
        const optionList = OptionsListUtils.getSearchOptions(options, '', betas ?? []);
        return optionList.recentReports.slice(0, 5);
    }, [areOptionsInitialized, betas, options]);

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
                        onSubmit={onSearchSubmit}
                    />

                    <SearchRouterList
                        currentSearch={currentQuery}
                        recentSearches={recentSearches ?? []}
                        recentReports={searchOptions}
                    />
                </View>
            </FocusTrapForModal>
        </Modal>
    );
}

SearchRouter.displayName = 'SearchRouter';

export default SearchRouter;
