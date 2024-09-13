import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import MenuItem from '@components/MenuItem';
import {usePersonalDetails} from '@components/OnyxProvider';
import type {SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {getAllTaxRates} from '@libs/PolicyUtils';
import * as SearchUtils from '@libs/SearchUtils';
import variables from '@styles/variables';
import * as Expensicons from '@src/components/Icon/Expensicons';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import SearchTypeMenuNarrow from './SearchTypeMenuNarrow';

type SearchTypeMenuProps = {
    queryJSON: SearchQueryJSON;
};

type SearchTypeMenuItem = {
    title: string;
    type: SearchDataTypes;
    icon: IconAsset;
    route?: Route;
};

function SearchTypeMenu({queryJSON}: SearchTypeMenuProps) {
    const {type} = queryJSON;
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {singleExecution} = useSingleExecution();
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const taxRates = getAllTaxRates();
    const [cardList = {}] = useOnyx(ONYXKEYS.CARD_LIST);

    const typeMenuItems: SearchTypeMenuItem[] = [
        {
            title: translate('common.expenses'),
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            icon: Expensicons.Receipt,
            route: ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchUtils.buildCannedSearchQuery()}),
        },
        {
            title: translate('common.chats'),
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            icon: Expensicons.ChatBubbles,
            route: ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.STATUS.TRIP.ALL)}),
        },
        {
            title: translate('workspace.common.invoices'),
            type: CONST.SEARCH.DATA_TYPES.INVOICE,
            icon: Expensicons.InvoiceGeneric,
            route: ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.STATUS.INVOICE.ALL)}),
        },
        {
            title: translate('travel.trips'),
            type: CONST.SEARCH.DATA_TYPES.TRIP,
            icon: Expensicons.Suitcase,
            route: ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.STATUS.TRIP.ALL)}),
        },
    ];

    const isCannedQuery = SearchUtils.isCannedSearchQuery(queryJSON);
    const activeItemIndex = isCannedQuery ? typeMenuItems.findIndex((item) => item.type === type) : -1;

    if (shouldUseNarrowLayout) {
        const title = isCannedQuery ? undefined : SearchUtils.getSearchHeaderTitle(queryJSON, personalDetails, cardList, reports, taxRates);

        return (
            <SearchTypeMenuNarrow
                typeMenuItems={typeMenuItems}
                activeItemIndex={activeItemIndex}
                queryJSON={queryJSON}
                title={title}
            />
        );
    }

    return (
        <View style={[styles.pb4, styles.mh3, styles.mt3]}>
            {typeMenuItems.map((item, index) => {
                const onPress = singleExecution(() => {
                    SearchActions.clearAllFilters();
                    Navigation.navigate(item.route);
                });

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

SearchTypeMenu.displayName = 'SearchTypeMenu';

export default SearchTypeMenu;
export type {SearchTypeMenuItem};
