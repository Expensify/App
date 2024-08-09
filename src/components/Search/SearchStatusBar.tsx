import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import TabSelectorItem from '@components/TabSelector/TabSelectorItem';
import * as Expensicons from '@components/Icon/Expensicons';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchUtils from '@libs/SearchUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import type {SearchQueryString, SearchStatus} from './types';

type SearchStatusBarProps = {
    type: SearchDataTypes;
    status: SearchStatus;
};

const statusMenuOptions: {[key in SearchDataTypes]: Array<{key: SearchStatus; icon: IconAsset; text: TranslationPaths; query: SearchQueryString}>} = {
    [CONST.SEARCH.DATA_TYPES.TRANSACTION]: [
        {key: CONST.SEARCH.STATUS.EXPENSE.ALL, icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {key: CONST.SEARCH.STATUS.EXPENSE.ALL, icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {key: CONST.SEARCH.STATUS.EXPENSE.ALL, icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {key: CONST.SEARCH.STATUS.EXPENSE.ALL, icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
    ],
    [CONST.SEARCH.DATA_TYPES.REPORT]: [
        {key: CONST.SEARCH.STATUS.EXPENSE.ALL, icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {key: CONST.SEARCH.STATUS.EXPENSE.ALL, icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {key: CONST.SEARCH.STATUS.EXPENSE.ALL, icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {key: CONST.SEARCH.STATUS.EXPENSE.ALL, icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
    ],
    [CONST.SEARCH.DATA_TYPES.EXPENSE]: [
        {key: CONST.SEARCH.STATUS.EXPENSE.ALL, icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {key: CONST.SEARCH.STATUS.EXPENSE.ALL, icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {key: CONST.SEARCH.STATUS.EXPENSE.ALL, icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {key: CONST.SEARCH.STATUS.EXPENSE.ALL, icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
    ],
    [CONST.SEARCH.DATA_TYPES.INVOICE]: [
        {key: CONST.SEARCH.STATUS.EXPENSE.ALL, icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
    ],
    [CONST.SEARCH.DATA_TYPES.TRIP]: [
        {key: CONST.SEARCH.STATUS.EXPENSE.ALL, icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
    ],
};

function SearchStatusBar({type, status}: SearchStatusBarProps) {
    const {singleExecution} = useSingleExecution();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flexRow, styles.mh5, styles.gap5]}>
            {statusMenuOptions[type].map((item) => {
                const onPress = singleExecution(() => Navigation.setParams({q: item.query}));

                return (
                    <TabSelectorItem
                        key={item.key}
                        title={translate(item.text)}
                        onPress={onPress}
                        icon={item.icon}
                        isActive={status === item.key}
                    />
                );
            })}
        </View>
    );
}

SearchStatusBar.displayName = 'SearchStatusBar';

export default SearchStatusBar;
