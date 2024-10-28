import React, {useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as RNScrollView} from 'react-native';
import Button from '@components/Button';
import * as Expensicons from '@components/Icon/Expensicons';
import ScrollView from '@components/ScrollView';
import SearchStatusSkeleton from '@components/Skeletons/SearchStatusSkeleton';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type IconAsset from '@src/types/utils/IconAsset';
import {useSearchContext} from './SearchContext';
import type {ChatSearchStatus, ExpenseSearchStatus, InvoiceSearchStatus, SearchQueryJSON, TripSearchStatus} from './types';

type SearchStatusBarProps = {
    queryJSON: SearchQueryJSON;
    onStatusChange?: () => void;
};

const expenseOptions: Array<{status: ExpenseSearchStatus; type: SearchDataTypes; icon: IconAsset; text: TranslationPaths}> = [
    {
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        status: CONST.SEARCH.STATUS.EXPENSE.ALL,
        icon: Expensicons.All,
        text: 'common.all',
    },
    {
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        status: CONST.SEARCH.STATUS.EXPENSE.DRAFTS,
        icon: Expensicons.Pencil,
        text: 'common.drafts',
    },
    {
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        status: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING,
        icon: Expensicons.Hourglass,
        text: 'common.outstanding',
    },
    {
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        status: CONST.SEARCH.STATUS.EXPENSE.APPROVED,
        icon: Expensicons.ThumbsUp,
        text: 'iou.approved',
    },
    {
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        status: CONST.SEARCH.STATUS.EXPENSE.PAID,
        icon: Expensicons.MoneyBag,
        text: 'iou.settledExpensify',
    },
];

const invoiceOptions: Array<{type: SearchDataTypes; status: InvoiceSearchStatus; icon: IconAsset; text: TranslationPaths}> = [
    {
        type: CONST.SEARCH.DATA_TYPES.INVOICE,
        status: CONST.SEARCH.STATUS.INVOICE.ALL,
        icon: Expensicons.All,
        text: 'common.all',
    },
    {
        type: CONST.SEARCH.DATA_TYPES.INVOICE,
        status: CONST.SEARCH.STATUS.INVOICE.OUTSTANDING,
        icon: Expensicons.Hourglass,
        text: 'common.outstanding',
    },
    {
        type: CONST.SEARCH.DATA_TYPES.INVOICE,
        status: CONST.SEARCH.STATUS.INVOICE.PAID,
        icon: Expensicons.MoneyBag,
        text: 'iou.settledExpensify',
    },
];

const tripOptions: Array<{type: SearchDataTypes; status: TripSearchStatus; icon: IconAsset; text: TranslationPaths}> = [
    {
        type: CONST.SEARCH.DATA_TYPES.TRIP,
        status: CONST.SEARCH.STATUS.TRIP.ALL,
        icon: Expensicons.All,
        text: 'common.all',
    },
    {
        type: CONST.SEARCH.DATA_TYPES.TRIP,
        status: CONST.SEARCH.STATUS.TRIP.CURRENT,
        icon: Expensicons.Calendar,
        text: 'search.filters.current',
    },
    {
        type: CONST.SEARCH.DATA_TYPES.TRIP,
        status: CONST.SEARCH.STATUS.TRIP.PAST,
        icon: Expensicons.History,
        text: 'search.filters.past',
    },
];

const chatOptions: Array<{type: SearchDataTypes; status: ChatSearchStatus; icon: IconAsset; text: TranslationPaths}> = [
    {
        type: CONST.SEARCH.DATA_TYPES.CHAT,
        status: CONST.SEARCH.STATUS.CHAT.ALL,
        icon: Expensicons.All,
        text: 'common.all',
    },
    {
        type: CONST.SEARCH.DATA_TYPES.CHAT,
        status: CONST.SEARCH.STATUS.CHAT.UNREAD,
        icon: Expensicons.ChatBubbleUnread,
        text: 'common.unread',
    },
    {
        type: CONST.SEARCH.DATA_TYPES.CHAT,
        status: CONST.SEARCH.STATUS.CHAT.SENT,
        icon: Expensicons.Send,
        text: 'common.sent',
    },
    {
        type: CONST.SEARCH.DATA_TYPES.CHAT,
        status: CONST.SEARCH.STATUS.CHAT.ATTACHMENTS,
        icon: Expensicons.Document,
        text: 'common.attachments',
    },
    {
        type: CONST.SEARCH.DATA_TYPES.CHAT,
        status: CONST.SEARCH.STATUS.CHAT.LINKS,
        icon: Expensicons.Paperclip,
        text: 'common.links',
    },
    {
        type: CONST.SEARCH.DATA_TYPES.CHAT,
        status: CONST.SEARCH.STATUS.CHAT.PINNED,
        icon: Expensicons.Pin,
        text: 'search.filters.pinned',
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

function SearchStatusBar({queryJSON, onStatusChange}: SearchStatusBarProps) {
    const {singleExecution} = useSingleExecution();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const {translate} = useLocalize();
    const options = getOptions(queryJSON.type);
    const scrollRef = useRef<RNScrollView>(null);
    const isScrolledRef = useRef(false);
    const {shouldShowStatusBarLoading} = useSearchContext();

    if (shouldShowStatusBarLoading) {
        return <SearchStatusSkeleton shouldAnimate />;
    }

    return (
        <ScrollView
            style={[styles.flexRow, styles.mb2, styles.overflowScroll, styles.flexGrow0]}
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
        >
            {options.map((item, index) => {
                const onPress = singleExecution(() => {
                    onStatusChange?.();
                    const query = SearchQueryUtils.buildSearchQueryString({...queryJSON, status: item.status});
                    Navigation.setParams({q: query});
                });
                const isActive = queryJSON.status === item.status;
                const isFirstItem = index === 0;
                const isLastItem = index === options.length - 1;

                return (
                    <Button
                        key={item.status}
                        onLayout={(e) => {
                            if (!isActive || isScrolledRef.current || !('left' in e.nativeEvent.layout)) {
                                return;
                            }
                            isScrolledRef.current = true;
                            scrollRef.current?.scrollTo({x: (e.nativeEvent.layout.left as number) - styles.pl5.paddingLeft});
                        }}
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
                    />
                );
            })}
        </ScrollView>
    );
}

SearchStatusBar.displayName = 'SearchStatusBar';

export default SearchStatusBar;
