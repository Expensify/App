import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
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

const options: {[key in SearchDataTypes]: Array<{key: SearchStatus; icon: IconAsset; text: TranslationPaths; query: SearchQueryString}>} = {
    [CONST.SEARCH.DATA_TYPES.EXPENSE]: [
        {
            key: CONST.SEARCH.STATUS.EXPENSE.ALL,
            icon: Expensicons.All,
            text: 'common.all',
            query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.STATUS.EXPENSE.ALL),
        },
        {
            key: CONST.SEARCH.STATUS.EXPENSE.DRAFTS,
            icon: Expensicons.Pencil,
            text: 'common.drafts',
            query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.STATUS.EXPENSE.DRAFTS),
        },
        {
            key: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING,
            icon: Expensicons.Hourglass,
            text: 'common.outstanding',
            query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING),
        },
        {
            key: CONST.SEARCH.STATUS.EXPENSE.APPROVED,
            icon: Expensicons.ThumbsUp,
            text: 'iou.approved',
            query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.STATUS.EXPENSE.APPROVED),
        },
        {
            key: CONST.SEARCH.STATUS.EXPENSE.FINISHED,
            icon: Expensicons.MoneyBag,
            text: 'iou.settledExpensify',
            query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.STATUS.EXPENSE.FINISHED),
        },
    ],
    [CONST.SEARCH.DATA_TYPES.INVOICE]: [
        {
            key: CONST.SEARCH.STATUS.INVOICE.ALL,
            icon: Expensicons.All,
            text: 'common.all',
            query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.STATUS.INVOICE.ALL),
        },
        {
            key: CONST.SEARCH.STATUS.INVOICE.OUTSTANDING,
            icon: Expensicons.Hourglass,
            text: 'common.outstanding',
            query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.STATUS.INVOICE.OUTSTANDING),
        },
        {
            key: CONST.SEARCH.STATUS.INVOICE.PAID,
            icon: Expensicons.MoneyBag,
            text: 'iou.settledExpensify',
            query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.STATUS.INVOICE.PAID),
        },
    ],
    [CONST.SEARCH.DATA_TYPES.TRIP]: [
        {
            key: CONST.SEARCH.STATUS.TRIP.ALL,
            icon: Expensicons.All,
            text: 'common.all',
            query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.STATUS.TRIP.ALL),
        },
        {
            key: CONST.SEARCH.STATUS.TRIP.DRAFTS,
            icon: Expensicons.Pencil,
            text: 'common.drafts',
            query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.STATUS.TRIP.DRAFTS),
        },
        {
            key: CONST.SEARCH.STATUS.TRIP.OUTSTANDING,
            icon: Expensicons.Hourglass,
            text: 'common.outstanding',
            query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.STATUS.TRIP.OUTSTANDING),
        },
        {
            key: CONST.SEARCH.STATUS.TRIP.APPROVED,
            icon: Expensicons.ThumbsUp,
            text: 'iou.approved',
            query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.STATUS.TRIP.APPROVED),
        },
        {
            key: CONST.SEARCH.STATUS.TRIP.PAID,
            icon: Expensicons.MoneyBag,
            text: 'iou.settledExpensify',
            query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.STATUS.TRIP.PAID),
        },
    ],
};

function SearchStatusBar({type, status}: SearchStatusBarProps) {
    const {singleExecution} = useSingleExecution();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();

    return (
        <ScrollView
            style={[styles.flexRow, styles.mh5, styles.mb5, styles.overflowScroll, styles.flexGrow0]}
            horizontal
            showsHorizontalScrollIndicator={false}
        >
            {options[type].map((item) => {
                const onPress = singleExecution(() => Navigation.setParams({q: item.query}));
                const isActive = status === item.key;

                return (
                    <Button
                        key={item.key}
                        text={translate(item.text)}
                        onPress={onPress}
                        icon={item.icon}
                        iconFill={isActive ? theme.success : undefined}
                        innerStyles={!isActive && styles.bgTransparent}
                        textStyles={!isActive ? StyleUtils.getTextColorStyle(theme.textSupporting) : undefined}
                        medium
                    />
                );
            })}
        </ScrollView>
    );
}

SearchStatusBar.displayName = 'SearchStatusBar';

export default SearchStatusBar;
