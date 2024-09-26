import debounce from 'lodash/debounce';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import Modal from '@components/Modal';
import type {SearchQueryJSON} from '@components/Search/types';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getAllTaxRates} from '@libs/PolicyUtils';
import * as SearchUtils from '@libs/SearchUtils';
import Navigation from '@navigation/Navigation';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {useSearchRouterContext} from './SearchRouterContext';
import SearchRouterInput from './SearchRouterInput';

const SEARCH_DEBOUNCE_DELAY = 150;

function SearchRouter() {
    const styles = useThemeStyles();

    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isSearchRouterDisplayed, closeSearchRouter} = useSearchRouterContext();

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const taxRates = getAllTaxRates();
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);

    const [userSearchQuery, setUserSearchQuery] = useState<SearchQueryJSON | undefined>(undefined);

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

        const standardQuery = SearchUtils.standardizeQueryJSON(userSearchQuery, cardList, reports, taxRates);
        const query = SearchUtils.buildSearchQueryString(standardQuery);
        SearchActions.clearAllFilters();
        Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query}));

        clearUserQuery();
    }, [closeSearchRouter, userSearchQuery, cardList, reports, taxRates]);

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
