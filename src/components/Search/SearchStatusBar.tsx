import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import useSingleExecution from '@hooks/useSingleExecution';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchUtils from '@libs/SearchUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import type {SearchQueryString} from './types';

type SearchStatusBarProps = {
    type: SearchDataTypes;
};

const statusMenuOptions: {[key in SearchDataTypes]: Array<{icon: IconAsset; text: TranslationPaths; query: SearchQueryString}>} = {
    [CONST.SEARCH.DATA_TYPES.TRANSACTION]: [
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
    ],
    [CONST.SEARCH.DATA_TYPES.REPORT]: [
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
    ],
    [CONST.SEARCH.DATA_TYPES.EXPENSE]: [
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
    ],
    [CONST.SEARCH.DATA_TYPES.INVOICE]: [
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
    ],
    [CONST.SEARCH.DATA_TYPES.TRIP]: [
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
        {icon: Expensicons.Inbox, text: 'common.expenses', query: SearchUtils.buildCannedSearchQuery()},
    ],
};

function SearchStatusBar({type}: SearchStatusBarProps) {
    const {singleExecution} = useSingleExecution();
    return (
        <View>
            {statusMenuOptions[type].map((item) => {
                const onPress = singleExecution(() => Navigation.setParams({q: item.query}));

                return (
                    <Button
                        key={item.query}
                        text={item.text}
                        onPress={onPress}
                        icon={item.icon}
                    />
                );
            })}
        </View>
    );
}

SearchStatusBar.displayName = 'SearchStatusBar';

export default SearchStatusBar;
