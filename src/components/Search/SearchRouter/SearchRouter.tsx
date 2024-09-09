import React, {useState} from 'react';
import {View} from 'react-native';
import Modal from '@components/Modal';
import type {SearchQueryJSON} from '@components/Search/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchUtils from '@libs/SearchUtils';
import CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import {useSearchRouterContext} from './SearchRouterContext';
import SearchRouterInput from './SearchRouterInput';

type SearchRouterProps = {
    type?: SearchDataTypes;
};

function SearchRouter({type}: SearchRouterProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useResponsiveLayout();

    const {isSearchRouterDisplayed, toggleSearchRouter} = useSearchRouterContext();
    const [, setCurrentQuery] = useState<SearchQueryJSON | undefined>(undefined);

    const modalType = isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE : CONST.MODAL.MODAL_TYPE.POPOVER;

    const onSearch = (userQuery: string) => {
        if (!userQuery) {
            setCurrentQuery(undefined);
            return;
        }

        const query = type ? `type:${type} ${userQuery}` : userQuery;
        const queryJSON = SearchUtils.buildSearchQueryJSON(query);

        if (queryJSON) {
            // eslint-disable-next-line
            console.log('parsedQuery', queryJSON);

            setCurrentQuery(queryJSON);
        } else {
            // Handle query parsing error
        }
    };

    return (
        <Modal
            type={modalType}
            fullscreen
            isVisible={isSearchRouterDisplayed}
            popoverAnchorPosition={{right: 20, top: 20}}
            onClose={() => {
                toggleSearchRouter();
            }}
        >
            <View style={[styles.flex1, styles.p5]}>
                <SearchRouterInput onSearch={onSearch} />
            </View>
        </Modal>
    );
}

SearchRouter.displayName = 'SearchRouter';

export default SearchRouter;
