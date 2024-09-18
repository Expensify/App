import {useNavigationState} from '@react-navigation/native';
import debounce from 'lodash/debounce';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import Modal from '@components/Modal';
import type {SearchQueryJSON} from '@components/Search/types';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchUtils from '@libs/SearchUtils';
import Navigation from '@navigation/Navigation';
import type {AuthScreensParamList, NavigationStateRoute} from '@navigation/types';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {useSearchRouterContext} from './SearchRouterContext';
import SearchRouterInput from './SearchRouterInput';

const SEARCH_DEBOUNCE_DELAY = 200;

function getCurrentSearchQuery(route?: NavigationStateRoute) {
    if (route?.name !== SCREENS.SEARCH.CENTRAL_PANE) {
        return;
    }

    const query = (route?.params as AuthScreensParamList[typeof SCREENS.SEARCH.CENTRAL_PANE]).q;
    return SearchUtils.buildSearchQueryJSON(query);
}

function SearchRouter() {
    const styles = useThemeStyles();

    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isSearchRouterDisplayed, closeSearchRouter} = useSearchRouterContext();
    const lastRoute = useNavigationState((state) => state.routes.at(-1));

    // If we open SearchRouter on a `/search` page, then we prefill input with the existing Search query
    const existingSearchQuery = getCurrentSearchQuery(lastRoute);
    const initialQuery = existingSearchQuery ? SearchUtils.getSearchRouterInputText(existingSearchQuery) : undefined;
    const initialQueryJSON = initialQuery ? SearchUtils.buildSearchQueryJSON(initialQuery) : undefined;

    const [userSearchQuery, setUserSearchQuery] = useState<SearchQueryJSON | undefined>(initialQueryJSON);

    const clearUserQuery = () => {
        setUserSearchQuery(undefined);
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

            setUserSearchQuery(queryJSON);
        } else {
            // Handle query parsing error
        }
    }, SEARCH_DEBOUNCE_DELAY);

    const onSearchSubmit = useCallback(() => {
        if (!userSearchQuery) {
            return;
        }

        closeSearchRouter();

        const query = SearchUtils.buildSearchQueryString(userSearchQuery);
        Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query}));

        clearUserQuery();
    }, [closeSearchRouter, userSearchQuery]);

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
                <View style={[styles.flex1, styles.p3]}>
                    <SearchRouterInput
                        initialValue={initialQuery}
                        isFullWidth={isFullWidth}
                        onChange={onSearchChange}
                        onSubmit={onSearchSubmit}
                    />
                </View>
            </FocusTrapForModal>
        </Modal>
    );
}

SearchRouter.displayName = 'SearchRouter';

export default SearchRouter;
