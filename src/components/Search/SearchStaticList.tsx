/**
 * Lightweight, hook-minimal static version of the search results list used
 * during the submit-and-navigate flow for fast perceived performance.
 *
 * IMPORTANT - keeping visual parity:
 *  • The narrow-layout rendering here mirrors TransactionListItem /
 *    UserInfoAndActionButtonRow. If you change the list item UI in those
 *    components, verify this static version still looks visually identical.
 *  • This component intentionally avoids expensive hooks and Onyx reads.
 *    Do NOT add new subscriptions unless absolutely necessary for correctness.
 */
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {FlatList, View} from 'react-native';
import type {ListRenderItemInfo, StyleProp, ViewStyle} from 'react-native';
import Button from '@components/Button';
import {useSession} from '@components/OnyxListItemProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import SearchRowSkeleton from '@components/Skeletons/SearchRowSkeleton';
import TransactionItemRow from '@components/TransactionItemRow';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasDeferredWrite} from '@libs/deferredLayoutWrite';
import Navigation from '@libs/Navigation/Navigation';
import {isOneTransactionReport} from '@libs/ReportUtils';
import {createAndOpenSearchTransactionThread, getSections, getSortedSections, getValidGroupBy, isCorrectSearchUserName} from '@libs/SearchUIUtils';
import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SearchResults} from '@src/types/onyx';
import type {SearchTransactionAction} from '@src/types/onyx/SearchResults';
import actionTranslationsMap from './SearchList/ListItem/ActionCell/actionTranslationsMap';
import type {TransactionListItemType} from './SearchList/ListItem/types';
import UserInfoCellsWithArrow from './SearchList/ListItem/UserInfoCellsWithArrow';
import type {SearchQueryJSON} from './types';

const STATIC_LIST_MAX_ITEMS = 10;

type SearchStaticListProps = {
    searchResults: SearchResults | undefined;
    queryJSON: SearchQueryJSON;
    contentContainerStyle?: StyleProp<ViewStyle>;
    onLayout?: () => void;
    onDestinationVisible?: (wasListEmpty: boolean, source: 'focus' | 'layout') => void;
};

function StaticActionButton({action}: {action: SearchTransactionAction | undefined}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const actionType = action ?? CONST.SEARCH.ACTION_TYPES.VIEW;
    const isViewAction = actionType === CONST.SEARCH.ACTION_TYPES.VIEW || actionType === CONST.SEARCH.ACTION_TYPES.PAID || actionType === CONST.SEARCH.ACTION_TYPES.DONE;
    const text = translate(actionTranslationsMap[actionType] ?? actionTranslationsMap[CONST.SEARCH.ACTION_TYPES.VIEW]);

    return (
        <Button
            text={text}
            extraSmall
            style={[styles.w100, styles.pointerEventsNone]}
            isDisabled
            shouldStayNormalOnDisable
            isNested
            success={!isViewAction}
        />
    );
}

function SearchStaticList({searchResults, queryJSON, contentContainerStyle, onLayout: onLayoutProp, onDestinationVisible}: SearchStaticListProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const session = useSession();
    const accountID = session?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    const email = session?.email;

    const [showPendingExpensePlaceholder, setShowPendingExpensePlaceholder] = useState(
        () => hasDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH) || Navigation.getIsFullscreenPreInsertedUnderRHP(),
    );

    const {type, status, sortBy, sortOrder, groupBy} = queryJSON;
    const validGroupBy = getValidGroupBy(groupBy);
    const searchData = searchResults?.data;

    const sortedData = (() => {
        if (!searchData) {
            return [] as TransactionListItemType[];
        }

        const [filteredData] = getSections({
            type,
            data: searchData,
            currentAccountID: accountID,
            currentUserEmail: email ?? '',
            translate,
            formatPhoneNumber,
            bankAccountList: undefined,
            allReportMetadata: undefined,
            conciergeReportID: undefined,
        });

        return getSortedSections(type, status, filteredData, localeCompare, translate, sortBy, sortOrder, validGroupBy)
            .filter((item): item is TransactionListItemType => 'transactionID' in item && item.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            .slice(0, STATIC_LIST_MAX_ITEMS);
    })();

    // Sync the pending-expense placeholder on focus and notify the parent that
    // the destination is visible (focus signal for the dual-gate span ending).
    useFocusEffect(
        useCallback(() => {
            const hasPendingAction = getPendingSubmitFollowUpAction()?.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH;
            if (!showPendingExpensePlaceholder && hasPendingAction) {
                setShowPendingExpensePlaceholder(true);
            } else if (showPendingExpensePlaceholder && !hasPendingAction && sortedData.length > 0) {
                // Only clear the placeholder once real data is available to avoid
                // a blank flash when the stale snapshot has been filtered empty.
                setShowPendingExpensePlaceholder(false);
            }

            onDestinationVisible?.(sortedData.length === 0, 'focus');
        }, [showPendingExpensePlaceholder, sortedData.length, onDestinationVisible]),
    );

    const onPressItem = (item: TransactionListItemType) => {
        const backTo = Navigation.getActiveRoute();

        if (!item.reportAction?.childReportID) {
            const shouldOpenTransactionThread = !isOneTransactionReport(item.report) || item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
            // betas and introSelected are passed as undefined to avoid extra Onyx subscriptions in this lightweight placeholder.
            // They're only used for guided-setup onboarding data, which is gated behind introSelected/onboarding checks
            // that won't apply here - the user has already completed onboarding if they're submitting expenses.
            createAndOpenSearchTransactionThread(item, undefined, backTo, email ?? '', accountID, undefined, item.reportAction?.childReportID, undefined, shouldOpenTransactionThread);
            if (shouldOpenTransactionThread) {
                return;
            }
        }

        const isFromSelfDM = item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
        const isFromOneTransactionReport = isOneTransactionReport(item.report);

        let reportID = item.reportID;
        if (item.reportAction?.childReportID && (isFromSelfDM || !isFromOneTransactionReport)) {
            reportID = item.reportAction.childReportID;
        }

        if (!reportID) {
            return;
        }

        requestAnimationFrame(() => Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo})));
    };

    const renderItem = ({item}: ListRenderItemInfo<TransactionListItemType>) => {
        if (!('transactionID' in item)) {
            return null;
        }

        const hasFromSender = !!item.from?.accountID && !!item.from?.displayName;
        const hasToRecipient = !!item.to?.accountID && !!item.to?.displayName;
        const participantFromDisplayName = item.formattedFrom ?? item.from?.displayName ?? '';
        const participantToDisplayName = item.formattedTo ?? item.to?.displayName ?? '';
        const shouldShowToRecipient = hasFromSender && hasToRecipient && !!item.to?.accountID && !!isCorrectSearchUserName(participantToDisplayName);
        const shouldShowUserInfo = !!item.from;

        return (
            <PressableWithoutFeedback
                sentryLabel="SearchStaticList-item"
                accessibilityRole="button"
                accessibilityLabel=""
                onPress={() => onPressItem(item)}
            >
                <View style={[styles.mb2, styles.mh5, styles.flex1, styles.userSelectNone, {backgroundColor: theme.highlightBG, borderRadius: variables.componentBorderRadius}]}>
                    <View style={[styles.transactionListItemStyle, styles.pt3, styles.flexColumn, styles.alignItemsStretch]}>
                        <View style={[styles.pt0, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2, styles.ph3]}>
                            {shouldShowUserInfo && (
                                <UserInfoCellsWithArrow
                                    shouldShowToRecipient={shouldShowToRecipient}
                                    participantFrom={item.from}
                                    participantFromDisplayName={participantFromDisplayName}
                                    participantToDisplayName={participantToDisplayName}
                                    participantTo={item.to}
                                    avatarSize={CONST.AVATAR_SIZE.SMALL_SUBSCRIPT}
                                    style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}
                                    infoCellsTextStyle={{lineHeight: 14}}
                                    infoCellsAvatarStyle={styles.pr1}
                                    fromRecipientStyle={!shouldShowToRecipient ? styles.mw100 : undefined}
                                    shouldUseArrowIcon={false}
                                />
                            )}
                            <View style={[{width: variables.w72}, styles.alignItemsEnd]}>
                                <StaticActionButton action={item.action} />
                            </View>
                        </View>
                        <TransactionItemRow
                            transactionItem={item}
                            shouldUseNarrowLayout
                            isSelected={false}
                            shouldShowTooltip={false}
                            shouldShowCheckbox={false}
                            shouldShowErrors={false}
                            dateColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                            amountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                            taxAmountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                            style={[styles.p3, styles.pv2, styles.pt2]}
                        />
                    </View>
                </View>
            </PressableWithoutFeedback>
        );
    };

    const keyExtractor = (item: TransactionListItemType) => item.keyForList;

    const hasEndedSpanRef = useRef(false);
    const onLayout = () => {
        if (hasEndedSpanRef.current) {
            return;
        }
        hasEndedSpanRef.current = true;

        onDestinationVisible?.(sortedData.length === 0, 'layout');
        onLayoutProp?.();
    };

    const pendingExpenseReasonAttributes = {context: 'SearchStaticList.PendingExpensePlaceholder'} as const;

    if (sortedData.length === 0 && showPendingExpensePlaceholder) {
        return (
            <View
                style={styles.flex1}
                onLayout={onLayout}
            >
                <SearchRowSkeleton
                    shouldAnimate
                    fixedNumItems={1}
                    containerStyle={contentContainerStyle}
                    reasonAttributes={pendingExpenseReasonAttributes}
                />
            </View>
        );
    }

    if (sortedData.length === 0) {
        return <View onLayout={onLayout} />;
    }

    return (
        <View
            style={styles.flex1}
            onLayout={onLayout}
        >
            <FlatList
                data={sortedData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={contentContainerStyle}
                removeClippedSubviews
                ListFooterComponent={
                    showPendingExpensePlaceholder ? (
                        <SearchRowSkeleton
                            shouldAnimate
                            fixedNumItems={1}
                            reasonAttributes={pendingExpenseReasonAttributes}
                        />
                    ) : undefined
                }
            />
        </View>
    );
}

SearchStaticList.displayName = 'SearchStaticList';

export default React.memo(
    SearchStaticList,
    (prev, next) =>
        prev.searchResults?.data === next.searchResults?.data &&
        prev.queryJSON === next.queryJSON &&
        prev.contentContainerStyle === next.contentContainerStyle &&
        prev.onLayout === next.onLayout &&
        prev.onDestinationVisible === next.onDestinationVisible,
);
