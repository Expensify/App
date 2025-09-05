import {useRoute} from '@react-navigation/native';
import type {FlashList, FlashListProps, ViewToken} from '@shopify/flash-list';
import React, {forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {NativeSyntheticEvent, StyleProp, ViewStyle} from 'react-native';
import Animated, {Easing, FadeOutUp, LinearTransition} from 'react-native-reanimated';
import Checkbox from '@components/Checkbox';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {PressableWithFeedback} from '@components/Pressable';
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';
import type ChatListItem from '@components/SelectionList/ChatListItem';
import type TaskListItem from '@components/SelectionList/Search/TaskListItem';
import type TransactionGroupListItem from '@components/SelectionList/Search/TransactionGroupListItem';
import type TransactionListItem from '@components/SelectionList/Search/TransactionListItem';
import type {ExtendedTargetedEvent, ReportActionListItemType, TaskListItemType, TransactionGroupListItemType, TransactionListItemType} from '@components/SelectionList/types';
import Text from '@components/Text';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import navigationRef from '@libs/Navigation/navigationRef';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import BaseSearchList from './BaseSearchList';

const easing = Easing.bezier(0.76, 0.0, 0.24, 1.0);

type SearchListItem = TransactionListItemType | TransactionGroupListItemType | ReportActionListItemType | TaskListItemType;
type SearchListItemComponentType = typeof TransactionListItem | typeof ChatListItem | typeof TransactionGroupListItem | typeof TaskListItem;

type SearchListHandle = {
    scrollToIndex: (index: number, animated?: boolean) => void;
};

type SearchListProps = Pick<FlashListProps<SearchListItem>, 'onScroll' | 'contentContainerStyle' | 'onEndReached' | 'onEndReachedThreshold' | 'ListFooterComponent'> & {
    data: SearchListItem[];

    /** Default renderer for every item in the list */
    ListItem: SearchListItemComponentType;

    SearchTableHeader?: React.JSX.Element;

    /** Callback to fire when a row is pressed */
    onSelectRow: (item: SearchListItem) => void;

    /** Whether this is a multi-select list */
    canSelectMultiple: boolean;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress: (item: SearchListItem) => void;

    /** Callback to fire when "Select All" checkbox is pressed. Only use along with `canSelectMultiple` */
    onAllCheckboxPress: () => void;

    /** Styles to apply to SelectionList container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Whether to prevent default focusing of options and focus the text input when selecting an option */
    shouldPreventDefaultFocusOnSelectRow?: boolean;

    /** Whether to prevent long press of options */
    shouldPreventLongPressRow?: boolean;

    /** Whether to animate the items in the list */
    shouldAnimate?: boolean;

    /** The search query */
    queryJSON: SearchQueryJSON;

    /** Columns to show */
    columns: SearchColumnType[];

    /** Whether the screen is focused */
    isFocused: boolean;

    /** Called when the viewability of rows changes, as defined by the viewabilityConfig prop. */
    onViewableItemsChanged?: (info: {changed: Array<ViewToken>; viewableItems: Array<ViewToken>}) => void;

    /** Invoked on mount and layout changes */
    onLayout?: () => void;

    /** Styles to apply to the content container */
    contentContainerStyle?: StyleProp<ViewStyle>;

    /** Whether mobile selection mode is enabled */
    isMobileSelectionModeEnabled: boolean;

    areAllOptionalColumnsHidden: boolean;
};

const keyExtractor = (item: SearchListItem, index: number) => item.keyForList ?? `${index}`;

function isTransactionGroupListItemArray(data: SearchListItem[]): data is TransactionGroupListItemType[] {
    if (data.length <= 0) {
        return false;
    }
    const firstElement = data.at(0);
    return typeof firstElement === 'object' && 'transactions' in firstElement;
}

function SearchList(
    {
        data,
        ListItem,
        SearchTableHeader,
        onSelectRow,
        onCheckboxPress,
        canSelectMultiple,
        onScroll = () => {},
        onAllCheckboxPress,
        contentContainerStyle,
        onEndReachedThreshold,
        onEndReached,
        containerStyle,
        ListFooterComponent,
        shouldPreventDefaultFocusOnSelectRow,
        shouldPreventLongPressRow,
        queryJSON,
        columns,
        isFocused,
        onViewableItemsChanged,
        onLayout,
        shouldAnimate,
        isMobileSelectionModeEnabled,
        areAllOptionalColumnsHidden,
    }: SearchListProps,
    ref: ForwardedRef<SearchListHandle>,
) {
    const styles = useThemeStyles();

    const {hash, groupBy} = queryJSON;
    const flattenedItems = useMemo(() => {
        if (groupBy) {
            if (!isTransactionGroupListItemArray(data)) {
                return data;
            }
            return data.flatMap((item) => item.transactions);
        }
        return data;
    }, [data, groupBy]);
    const flattenedItemsWithoutPendingDelete = useMemo(() => flattenedItems.filter((t) => t?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE), [flattenedItems]);

    const selectedItemsLength = useMemo(
        () =>
            flattenedItems.reduce((acc, item) => {
                return item?.isSelected ? acc + 1 : acc;
            }, 0),
        [flattenedItems],
    );

    const {translate} = useLocalize();
    const listRef = useRef<FlashList<SearchListItem>>(null);
    const {isKeyboardShown} = useKeyboardState();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();
    const prevDataLength = usePrevious(data.length);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout here because there is a race condition that causes shouldUseNarrowLayout to change indefinitely in this component
    // See https://github.com/Expensify/App/issues/48675 for more details
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [longPressedItem, setLongPressedItem] = useState<SearchListItem>();

    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: true,
    });

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});

    const hasItemsBeingRemoved = prevDataLength && prevDataLength > data.length;
    const personalDetails = usePersonalDetails();

    const [userWalletTierName] = useOnyx(ONYXKEYS.USER_WALLET, {selector: (wallet) => wallet?.tierName, canBeMissing: false});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.validated, canBeMissing: true});
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID, {canBeMissing: true});

    const route = useRoute();

    const handleLongPressRow = useCallback(
        (item: SearchListItem) => {
            const currentRoute = navigationRef.current?.getCurrentRoute();
            if (currentRoute && route.key !== currentRoute.key) {
                return;
            }

            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            if (shouldPreventLongPressRow || !isSmallScreenWidth || item?.isDisabled || item?.isDisabledCheckbox) {
                return;
            }
            // disable long press for empty expense reports
            if ('transactions' in item && item.transactions.length === 0) {
                return;
            }
            if (isMobileSelectionModeEnabled) {
                onCheckboxPress(item);
                return;
            }
            setLongPressedItem(item);
            setIsModalVisible(true);
        },
        [route.key, shouldPreventLongPressRow, isSmallScreenWidth, isMobileSelectionModeEnabled, onCheckboxPress],
    );

    const turnOnSelectionMode = useCallback(() => {
        turnOnMobileSelectionMode();
        setIsModalVisible(false);

        if (onCheckboxPress && longPressedItem) {
            onCheckboxPress?.(longPressedItem);
        }
    }, [longPressedItem, onCheckboxPress]);

    /**
     * Scrolls to the desired item index in the section list
     *
     * @param index - the index of the item to scroll to
     * @param animated - whether to animate the scroll
     */
    const scrollToIndex = useCallback(
        (index: number, animated = true) => {
            const item = data.at(index);

            if (!listRef.current || !item || index === -1) {
                return;
            }

            listRef.current.scrollToIndex({index, animated, viewOffset: variables.contentHeaderHeight});
        },
        [data],
    );

    useImperativeHandle(ref, () => ({scrollToIndex}), [scrollToIndex]);

    const renderItem = useCallback(
        (item: SearchListItem, isItemFocused: boolean, onFocus?: (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void) => {
            const isDisabled = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            return (
                <Animated.View
                    exiting={shouldAnimate && isFocused ? FadeOutUp.duration(CONST.SEARCH.EXITING_ANIMATION_DURATION).easing(easing) : undefined}
                    entering={undefined}
                    style={styles.overflowHidden}
                    layout={shouldAnimate && hasItemsBeingRemoved && isFocused ? LinearTransition.easing(easing).duration(CONST.SEARCH.EXITING_ANIMATION_DURATION) : undefined}
                >
                    <ListItem
                        showTooltip
                        isFocused={isItemFocused}
                        onSelectRow={onSelectRow}
                        onLongPressRow={handleLongPressRow}
                        onCheckboxPress={onCheckboxPress}
                        canSelectMultiple={canSelectMultiple}
                        item={item}
                        shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                        queryJSONHash={hash}
                        columns={columns}
                        areAllOptionalColumnsHidden={areAllOptionalColumnsHidden}
                        policies={policies}
                        isDisabled={isDisabled}
                        allReports={allReports}
                        groupBy={groupBy}
                        userWalletTierName={userWalletTierName}
                        isUserValidated={isUserValidated}
                        personalDetails={personalDetails}
                        userBillingFundID={userBillingFundID}
                        onFocus={onFocus}
                    />
                </Animated.View>
            );
        },
        [
            shouldAnimate,
            isFocused,
            styles.overflowHidden,
            hasItemsBeingRemoved,
            ListItem,
            onSelectRow,
            handleLongPressRow,
            columns,
            onCheckboxPress,
            canSelectMultiple,
            shouldPreventDefaultFocusOnSelectRow,
            hash,
            policies,
            allReports,
            groupBy,
            userWalletTierName,
            isUserValidated,
            personalDetails,
            userBillingFundID,
            areAllOptionalColumnsHidden,
        ],
    );

    const tableHeaderVisible = canSelectMultiple || !!SearchTableHeader;
    const selectAllButtonVisible = canSelectMultiple && !SearchTableHeader;
    const isSelectAllChecked = selectedItemsLength > 0 && selectedItemsLength === flattenedItemsWithoutPendingDelete.length;

    return (
        <View style={[styles.flex1, !isKeyboardShown && safeAreaPaddingBottomStyle, containerStyle]}>
            {tableHeaderVisible && (
                <View style={[styles.searchListHeaderContainerStyle, styles.listTableHeader]}>
                    {canSelectMultiple && (
                        <Checkbox
                            accessibilityLabel={translate('workspace.people.selectAll')}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={selectedItemsLength > 0 && selectedItemsLength !== flattenedItemsWithoutPendingDelete.length}
                            onPress={() => {
                                onAllCheckboxPress();
                            }}
                            disabled={flattenedItems.length === 0}
                        />
                    )}

                    {SearchTableHeader}

                    {selectAllButtonVisible && (
                        <PressableWithFeedback
                            style={[styles.userSelectNone, styles.alignItemsCenter]}
                            onPress={onAllCheckboxPress}
                            accessibilityLabel={translate('workspace.people.selectAll')}
                            role="button"
                            accessibilityState={{checked: isSelectAllChecked}}
                            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                        >
                            <Text style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>
                        </PressableWithFeedback>
                    )}
                </View>
            )}

            <BaseSearchList
                data={data}
                renderItem={renderItem}
                onSelectRow={onSelectRow}
                keyExtractor={keyExtractor}
                onScroll={onScroll}
                showsVerticalScrollIndicator={false}
                ref={listRef}
                columns={columns}
                scrollToIndex={scrollToIndex}
                isFocused={isFocused}
                flattenedItemsLength={flattenedItems.length}
                onEndReached={onEndReached}
                onEndReachedThreshold={onEndReachedThreshold}
                ListFooterComponent={ListFooterComponent}
                onViewableItemsChanged={onViewableItemsChanged}
                onLayout={onLayout}
                contentContainerStyle={contentContainerStyle}
            />
            <Modal
                isVisible={isModalVisible}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                onClose={() => setIsModalVisible(false)}
                shouldPreventScrollOnFocus
            >
                <MenuItem
                    title={translate('common.select')}
                    icon={Expensicons.CheckSquare}
                    onPress={turnOnSelectionMode}
                />
            </Modal>
        </View>
    );
}

export default forwardRef(SearchList);
