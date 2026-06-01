import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Animated, {useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import {easing} from '@components/Modal/ReanimatedModal/utils';
import type {SearchColumnType, SearchGroupBy} from '@components/Search/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TransactionPreviewData} from '@libs/actions/Search';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import type {BankAccountList, CardFeeds, CardList, ReportMetadata, Transaction} from '@src/types/onyx';
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
    allReportMetadata?: OnyxCollection<ReportMetadata>;
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
    allReportMetadata,
    bankAccountList,
    cardFeeds,
    conciergeReportID,
}: GroupChildrenContainerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();

    const contentHeight = useSharedValue(0);
    const hasExpanded = useSharedValue(isExpanded);
    const [isRendered, setIsRendered] = useState(isExpanded);

    useEffect(() => {
        hasExpanded.set(isExpanded);
    }, [isExpanded, hasExpanded]);

    if (isExpanded && !isRendered) {
        setIsRendered(true);
    }

    const animatedHeight = useDerivedValue(() => {
        if (!contentHeight.get()) {
            return 0;
        }
        const target = hasExpanded.get() ? contentHeight.get() : 0;
        return withTiming(target, {duration: 300, easing}, (finished) => {
            if (!finished || target) {
                return;
            }
            scheduleOnRN(setIsRendered, false);
        });
    }, []);

    const animatedOpacity = useDerivedValue(() => {
        if (!contentHeight.get()) {
            return 0;
        }
        return withTiming(hasExpanded.get() ? 1 : 0, {duration: 300, easing});
    });

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        height: animatedHeight.get(),
        opacity: animatedOpacity.get(),
    }));

    if (!isExpanded && !isRendered) {
        return null;
    }

    return (
        <View style={[styles.mh5, {backgroundColor: isSelected ? theme.activeComponentBG : theme.highlightBG}, isLastItem && [styles.tableBottomRadius, styles.overflowHidden]]}>
            <Animated.View style={contentAnimatedStyle}>
                {(isExpanded || isRendered) && (
                    <Animated.View
                        style={[styles.stickToTop, {paddingBottom: 4}]}
                        onLayout={(e) => {
                            const height = e.nativeEvent.layout.height;
                            if (height) {
                                contentHeight.set(height);
                            }
                        }}
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
                            allReportMetadata={allReportMetadata}
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
