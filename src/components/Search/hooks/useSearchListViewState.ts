import type {FlashListRef} from '@shopify/flash-list';
import {useRef} from 'react';
import useRowLongPressMenu from '@components/Search/primitives/useRowLongPressMenu';
import useScrollRestoration from '@components/Search/primitives/useScrollRestoration';
import {useSearchRowSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';
import {useEditingCellState} from '@components/TransactionItemRow/EditableCell';
import useKeyboardState from '@hooks/useKeyboardState';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useUndeleteTransactions from '@hooks/useUndeleteTransactions';
import type {TransactionPreviewData} from '@libs/actions/Search';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';

type UseSearchListViewStateParams = {
    /** The source rows the view renders. Drives exit-animation tracking. */
    data: SearchListItem[];

    /** The rows actually rendered by the list, if they differ from `data` (e.g. grouped views split each group
     *  into a header + children-container pair). `scrollToListIndex` indexes over this. Defaults to `data`. */
    listData?: SearchListItem[];

    /** Whether mobile selection mode is on (a row tap toggles selection instead of navigating). */
    isMobileSelectionModeEnabled: boolean;

    /** The navigation/thread-creation handler for a row tap (owned by the router). */
    onSelectRow: (item: SearchListItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => void;

    /** Whether long press is suppressed for this view (chat/task lists set this). */
    shouldPreventLongPressRow?: boolean;
};

/**
 * The shared state and interactions every Search list view repeats: the environment hooks, the selection
 * providers, the per-row display data (payment method, billing grace periods, undelete), the long-press
 * menu, the row-tap handler, scroll-to-index, and scroll restoration. Each view layers its own row
 * renderer, visibility, and selection-count math on top of this bundle.
 *
 * Must be used inside SearchWriteActionsProvider so `toggle`/`toggleAll` resolve to the real actions rather
 * than the no-op defaults.
 */
function useSearchListViewState({data, listData = data, isMobileSelectionModeEnabled, onSelectRow, shouldPreventLongPressRow = false}: UseSearchListViewStateParams) {
    const {toggle, toggleAll} = useSearchRowSelectionActions();
    const {selectedTransactions} = useSearchSelectionContext();

    const {isOffline} = useNetwork();
    const {isKeyboardShown} = useKeyboardState();
    const {safeAreaPaddingBottomStyle} = useSafeAreaPaddings();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout here because there is a race condition that causes shouldUseNarrowLayout to change indefinitely in this component
    // See https://github.com/Expensify/App/issues/48675 for more details
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isLargeScreenWidth} = useResponsiveLayout();
    const {isEditingCell, wasRecentlyEditingCell} = useEditingCellState();

    const listRef = useRef<FlashListRef<SearchListItem>>(null);
    const prevDataLength = usePrevious(data.length);
    const hasItemsBeingRemoved = !!prevDataLength && prevDataLength > data.length;

    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const undeleteTransactions = useUndeleteTransactions();

    const handleUndelete = (transaction: Transaction) => undeleteTransactions([transaction]);

    const {onLongPressRow, modal} = useRowLongPressMenu({shouldPreventLongPressRow, isSmallScreenWidth, isMobileSelectionModeEnabled});

    // In mobile selection mode a row tap toggles selection. This must live inside the providers (not in the
    // router) because the `toggle` it reads is the default no-op outside SearchWriteActionsProvider; here it
    // resolves to the real action.
    const handleSelectRow = (item: SearchListItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => {
        if (isMobileSelectionModeEnabled) {
            if (item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return;
            }
            toggle(item);
            return;
        }
        onSelectRow(item, transactionPreviewData, event);
    };

    const scrollToListIndex = (index: number, animated = true) => {
        const item = listData.at(index);
        if (!listRef.current || !item || index === -1) {
            return;
        }
        // Mirror SearchList: don't scroll while a row's cell is being inline-edited, which would blur/move it mid-edit.
        if (isEditingCell || wasRecentlyEditingCell) {
            return;
        }
        listRef.current.scrollToIndex({index, animated, viewOffset: -variables.contentHeaderHeight});
    };

    useScrollRestoration(listRef);

    return {
        isOffline,
        isKeyboardShown,
        safeAreaPaddingBottomStyle,
        isLargeScreenWidth,
        toggle,
        toggleAll,
        selectedTransactions,
        listRef,
        hasItemsBeingRemoved,
        lastPaymentMethod,
        personalPolicyID,
        userBillingGracePeriodEnds,
        ownerBillingGracePeriodEnd,
        handleUndelete,
        onLongPressRow,
        modal,
        handleSelectRow,
        scrollToListIndex,
    };
}

export default useSearchListViewState;
