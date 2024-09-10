import debounce from 'lodash/debounce';
import React, {useState} from 'react';
import {View} from 'react-native';
import Modal from '@components/Modal';
import type {SearchQueryJSON} from '@components/Search/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchUtils from '@libs/SearchUtils';
import CONST from '@src/CONST';
import {useSearchRouterContext} from './SearchRouterContext';
import SearchRouterInput from './SearchRouterInput';

const SEARCH_DEBOUNCE_DELAY = 250;

function SearchRouter() {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useResponsiveLayout();

    const {isSearchRouterDisplayed, closeSearchRouter} = useSearchRouterContext();
    const [, setCurrentQuery] = useState<SearchQueryJSON | undefined>(undefined);

    const modalType = isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE : CONST.MODAL.MODAL_TYPE.POPOVER;

    const onSearch = debounce((userQuery: string) => {
        if (!userQuery) {
            setCurrentQuery(undefined);
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

    return (
        <Modal
            type={modalType}
            fullscreen
            isVisible={isSearchRouterDisplayed}
            popoverAnchorPosition={{right: 20, top: 20}}
            onClose={closeSearchRouter}
        >
            <View style={[styles.flex1, styles.p3]}>
                <SearchRouterInput onSearch={onSearch} />
            </View>
        </Modal>
    );
}

SearchRouter.displayName = 'SearchRouter';

export default SearchRouter;
