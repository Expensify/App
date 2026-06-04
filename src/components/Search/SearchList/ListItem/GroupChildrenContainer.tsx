import React from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Animated from 'react-native-reanimated';
import type {SearchColumnType, SearchGroupBy} from '@components/Search/types';
import useExpandCollapseAnimation from '@hooks/useExpandCollapseAnimation';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TransactionPreviewData} from '@libs/actions/Search';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import type {BankAccountList, CardFeeds, CardList, Transaction} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import GroupChildrenContent from './GroupChildrenContent';
import type {GroupChildrenContainerItemType, SearchListItem, TransactionListItemType} from './types';

type GroupChildrenContainerProps = {
    item: GroupChildrenContainerItemType;
    isExpanded: boolean;
    groupBy?: SearchGroupBy;
    searchType?: SearchDataTypes;
    columns?: SearchColumnType[];
    canSelectMultiple: boolean;
    onSelectRow: (item: SearchListItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => void;
    onCheckboxPress: (item: SearchListItem, itemTransactions?: TransactionListItemType[]) => void;
    onLongPressRow?: (item: SearchListItem, itemTransactions?: TransactionListItemType[]) => void;
    nonPersonalAndWorkspaceCards?: CardList;
    onUndelete?: (transaction: Transaction) => void;
    isLastItem?: boolean;
    isSelected?: boolean;
    newTransactionID?: string;
    bankAccountList?: OnyxEntry<BankAccountList>;
    cardFeeds?: OnyxCollection<CardFeeds>;
    conciergeReportID?: string;
};

function GroupChildrenContainer({
    item,
    isExpanded,
    groupBy,
    searchType,
    columns,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onLongPressRow,
    nonPersonalAndWorkspaceCards,
    onUndelete,
    isLastItem,
    isSelected,
    newTransactionID,
    bankAccountList,
    cardFeeds,
    conciergeReportID,
}: GroupChildrenContainerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isRendered, animatedStyle, onLayout} = useExpandCollapseAnimation(isExpanded);

    if (!isExpanded && !isRendered) {
        return null;
    }

    return (
        <View style={[styles.mh5, {backgroundColor: isSelected ? theme.activeComponentBG : theme.highlightBG}, isLastItem && [styles.tableBottomRadius, styles.overflowHidden]]}>
            <Animated.View style={animatedStyle}>
                {(isExpanded || isRendered) && (
                    <Animated.View
                        style={[styles.stickToTop, styles.pb1]}
                        onLayout={onLayout}
                    >
                        <GroupChildrenContent
                            item={item}
                            isExpanded={isExpanded}
                            groupBy={groupBy}
                            searchType={searchType}
                            columns={columns}
                            canSelectMultiple={canSelectMultiple}
                            onSelectRow={onSelectRow}
                            onCheckboxPress={onCheckboxPress}
                            onLongPressRow={onLongPressRow}
                            nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                            onUndelete={onUndelete}
                            newTransactionID={newTransactionID}
                            bankAccountList={bankAccountList}
                            cardFeeds={cardFeeds}
                            conciergeReportID={conciergeReportID}
                        />
                    </Animated.View>
                )}
            </Animated.View>
        </View>
    );
}

export default GroupChildrenContainer;
