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

    const {isSmallScreenWidth} = useResponsiveLayout();
    const {isSearchRouterDisplayed, closeSearchRouter} = useSearchRouterContext();
    const [currentQuery, setCurrentQuery] = useState<SearchQueryJSON | undefined>(undefined);

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
        closeSearchRouter();

        const query = SearchUtils.buildSearchQueryString(currentQuery);
        Navigation.navigate(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query}));
        clearUserQuery();
    }, [currentQuery, closeSearchRouter]);

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ENTER,
        () => {
            if (!currentQuery) {
                return;
            }

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

    const mockedRecentSearches = [
        {
            name: 'Big agree',
            query: '123',
        },
        {
            name: 'GIF',
            query: '123',
        },
        {
            name: 'Greg',
            query: '123',
        },
    ];

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
                <View style={[styles.flex1, styles.p3]}>
                    <SearchRouterInput
                        isFullWidth={isFullWidth}
                        onChange={onSearchChange}
                        onSubmit={onSearchSubmit}
                    />
                    <SearchRouterList
                        recentSearches={mockedRecentSearches}
                        recentReports={searchOptions}
                    />
                </View>
            </FocusTrapForModal>
        </Modal>
    );
}

SearchRouter.displayName = 'SearchRouter';

export default SearchRouter;
