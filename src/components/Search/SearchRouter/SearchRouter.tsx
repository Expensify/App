import debounce from 'lodash/debounce';
import React, {useState} from 'react';
import {View} from 'react-native';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import Modal from '@components/Modal';
import type {SearchQueryJSON} from '@components/Search/types';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchUtils from '@libs/SearchUtils';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {useSearchRouterContext} from './SearchRouterContext';
import SearchRouterInput from './SearchRouterInput';

const SEARCH_DEBOUNCE_DELAY = 200;

function SearchRouter() {
    const styles = useThemeStyles();

    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isSearchRouterDisplayed, closeSearchRouter} = useSearchRouterContext();
    const [currentQuery, setCurrentQuery] = useState<SearchQueryJSON | undefined>(undefined);

    const clearUserQuery = () => {
        setCurrentQuery(undefined);
    };

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ENTER,
        () => {
            if (!currentQuery) {
                return;
            }

            const query = SearchUtils.buildSearchQueryString(currentQuery);
            Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query}));

            closeSearchRouter();
            clearUserQuery();
        },
        {
            captureOnInputs: true,
            shouldBubble: false,
        },
    );

    const onSearch = debounce((userQuery: string) => {
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

    const modalType = isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE : CONST.MODAL.MODAL_TYPE.POPOVER;
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
                        onSearch={onSearch}
                    />
                </View>
            </FocusTrapForModal>
        </Modal>
    );
}

SearchRouter.displayName = 'SearchRouter';

export default SearchRouter;
