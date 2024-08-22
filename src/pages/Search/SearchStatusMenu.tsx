import React from 'react';
import {View} from 'react-native';
import MenuItem from '@components/MenuItem';
import type {SearchQueryJSON, SearchStatus} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {normalizeQuery} from '@libs/SearchUtils';
import * as SearchUtils from '@libs/SearchUtils';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';
import SearchStatusMenuNarrow from './SearchStatusMenuNarrow';

type SearchStatusMenuProps = {
    queryJSON: SearchQueryJSON;
    isCustomQuery: boolean;
};

type SearchStatusMenuItem = {
    title: string;
    status: SearchStatus;
    icon: IconAsset;
    route?: Route;
};

function SearchStatusMenu({queryJSON, isCustomQuery}: SearchStatusMenuProps) {
    const {status} = queryJSON;
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {singleExecution} = useSingleExecution();
    const {translate} = useLocalize();

    const statusMenuItems: SearchStatusMenuItem[] = [
        {
            title: translate('common.expenses'),
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            icon: Expensicons.Receipt,
            route: ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: normalizeQuery(CONST.SEARCH.TAB.EXPENSE.ALL)}),
        },
        {
            title: translate('common.shared'),
            status: CONST.SEARCH.STATUS.EXPENSE.SHARED,
            icon: Expensicons.Send,
            route: ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: normalizeQuery(CONST.SEARCH.TAB.EXPENSE.SHARED)}),
        },
        {
            title: translate('common.drafts'),
            status: CONST.SEARCH.STATUS.EXPENSE.DRAFTS,
            icon: Expensicons.Pencil,
            route: ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: normalizeQuery(CONST.SEARCH.TAB.EXPENSE.DRAFTS)}),
        },
        {
            title: translate('common.finished'),
            status: CONST.SEARCH.STATUS.EXPENSE.FINISHED,
            icon: Expensicons.CheckCircle,
            route: ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: normalizeQuery(CONST.SEARCH.TAB.EXPENSE.FINISHED)}),
        },
    ];
    const activeItemIndex = statusMenuItems.findIndex((item) => item.status === status);

    if (shouldUseNarrowLayout) {
        const title = isCustomQuery ? SearchUtils.getSearchHeaderTitle(queryJSON) : undefined;

        return (
            <SearchStatusMenuNarrow
                statusMenuItems={statusMenuItems}
                activeItemIndex={activeItemIndex}
                title={title}
            />
        );
    }

    return (
        <View style={[styles.pb4, styles.mh3, styles.mt3]}>
            {statusMenuItems.map((item, index) => {
                const onPress = singleExecution(() => Navigation.navigate(item.route));

                return (
                    <MenuItem
                        key={item.title}
                        disabled={false}
                        interactive
                        title={item.title}
                        icon={item.icon}
                        iconWidth={variables.iconSizeNormal}
                        iconHeight={variables.iconSizeNormal}
                        wrapperStyle={styles.sectionMenuItem}
                        focused={index === activeItemIndex}
                        hoverAndPressStyle={styles.hoveredComponentBG}
                        onPress={onPress}
                        isPaneMenu
                    />
                );
            })}
        </View>
    );
}

SearchStatusMenu.displayName = 'SearchStatusMenu';

export default SearchStatusMenu;
export type {SearchStatusMenuItem};
