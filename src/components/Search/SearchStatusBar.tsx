import React from 'react';
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
import type {ChatSearchStatus, ExpenseSearchStatus, InvoiceSearchStatus, SearchQueryString, SearchStatus, TripSearchStatus} from './types';

type SearchStatusBarProps = {
    type: SearchDataTypes;
    status: SearchStatus;
    resetOffset: () => void;
};

const expenseOptions: Array<{key: ExpenseSearchStatus; icon: IconAsset; text: TranslationPaths; query: SearchQueryString}> = [
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
        key: CONST.SEARCH.STATUS.EXPENSE.PAID,
        icon: Expensicons.MoneyBag,
        text: 'iou.settledExpensify',
        query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.STATUS.EXPENSE.PAID),
    },
];

const invoiceOptions: Array<{key: InvoiceSearchStatus; icon: IconAsset; text: TranslationPaths; query: SearchQueryString}> = [
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
];

const tripOptions: Array<{key: TripSearchStatus; icon: IconAsset; text: TranslationPaths; query: SearchQueryString}> = [
    {
        key: CONST.SEARCH.STATUS.TRIP.ALL,
        icon: Expensicons.All,
        text: 'common.all',
        query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.STATUS.TRIP.ALL),
    },
    {
        key: CONST.SEARCH.STATUS.TRIP.CURRENT,
        icon: Expensicons.Calendar,
        text: 'search.filters.current',
        query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.STATUS.TRIP.CURRENT),
    },
    {
        key: CONST.SEARCH.STATUS.TRIP.PAST,
        icon: Expensicons.History,
        text: 'search.filters.past',
        query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.STATUS.TRIP.PAST),
    },
];

const chatOptions: Array<{key: ChatSearchStatus; icon: IconAsset; text: TranslationPaths; query: SearchQueryString}> = [
    {
        key: CONST.SEARCH.STATUS.CHAT.ALL,
        icon: Expensicons.All,
        text: 'common.all',
        query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.STATUS.CHAT.ALL),
    },
    {
        key: CONST.SEARCH.STATUS.CHAT.UNREAD,
        icon: Expensicons.ChatBubbleUnread,
        text: 'common.unread',
        query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.STATUS.CHAT.UNREAD),
    },
    {
        key: CONST.SEARCH.STATUS.CHAT.SENT,
        icon: Expensicons.Send,
        text: 'common.sent',
        query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.STATUS.CHAT.SENT),
    },
    {
        key: CONST.SEARCH.STATUS.CHAT.ATTACHMENTS,
        icon: Expensicons.Document,
        text: 'common.attachments',
        query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.STATUS.CHAT.ATTACHMENTS),
    },
    {
        key: CONST.SEARCH.STATUS.CHAT.LINKS,
        icon: Expensicons.Paperclip,
        text: 'common.links',
        query: SearchUtils.buildCannedSearchQuery(CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.STATUS.CHAT.LINKS),
    },
];

function getOptions(type: SearchDataTypes) {
    switch (type) {
        case CONST.SEARCH.DATA_TYPES.INVOICE:
            return invoiceOptions;
        case CONST.SEARCH.DATA_TYPES.TRIP:
            return tripOptions;
        case CONST.SEARCH.DATA_TYPES.CHAT:
            return chatOptions;
        case CONST.SEARCH.DATA_TYPES.EXPENSE:
        default:
            return expenseOptions;
    }
}

function SearchStatusBar({type, status, resetOffset}: SearchStatusBarProps) {
    const {singleExecution} = useSingleExecution();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const options = getOptions(type);

    return (
        <ScrollView
            style={[styles.flexRow, styles.mb5, styles.overflowScroll, styles.flexGrow0]}
            horizontal
            showsHorizontalScrollIndicator={false}
        >
            {options.map((item, index) => {
                const onPress = singleExecution(() => {
                    resetOffset();
                    Navigation.setParams({q: item.query});
                });
                const isActive = status === item.key;
                const isFirstItem = index === 0;
                const isLastItem = index === options.length - 1;

                return (
                    <Button
                        key={item.key}
                        text={translate(item.text)}
                        onPress={onPress}
                        icon={item.icon}
                        iconFill={isActive ? theme.success : undefined}
                        iconHoverFill={theme.success}
                        innerStyles={!isActive && styles.bgTransparent}
                        hoverStyles={StyleUtils.getBackgroundColorStyle(!isActive ? theme.highlightBG : theme.border)}
                        textStyles={!isActive && StyleUtils.getTextColorStyle(theme.textSupporting)}
                        textHoverStyles={StyleUtils.getTextColorStyle(theme.text)}
                        // We add padding to the first and last items so that they align with the header and table but can overflow outside the screen when scrolled.
                        style={[isFirstItem && styles.pl5, isLastItem && styles.pr5]}
                        medium
                    />
                );
            })}
        </ScrollView>
    );
}

SearchStatusBar.displayName = 'SearchStatusBar';

export default SearchStatusBar;
