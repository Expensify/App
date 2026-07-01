import type {SearchColumnType} from '@components/Search/types';
import type {ListItemFocusEventHandler} from '@components/SelectionList/ListItem/types';
import type {ListItem} from '@components/SelectionList/types';
import type {TransactionPreviewData} from '@libs/actions/Search';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import type {CardList, PolicyCategories, PolicyTagLists, ReportAction, TransactionViolation} from '@src/types/onyx';

type TransactionListItemSharedProps<TItem extends ListItem> = {
    item: TItem;
    isDeletedTransaction: boolean;
    isFocused?: boolean;
    showTooltip: boolean;
    isDisabled?: boolean | null;
    canSelectMultiple?: boolean;
    onSelectRow: (item: TItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => void;
    onCheckboxPress?: (item: TItem) => void;
    onFocus?: ListItemFocusEventHandler;
    onLongPressRow?: (item: TItem) => void;
    shouldSyncFocus?: boolean;
    columns?: SearchColumnType[];
    isLoading?: boolean;
    isActionLoading?: boolean;
    isLastItem?: boolean;
    transactionViolations: TransactionViolation[];
    handleActionButtonPress: (event?: ModifiedMouseEvent) => void;
    shouldDisableActionPointerEvents?: boolean;
    transactionPreviewData: TransactionPreviewData;
    exportedReportActions: ReportAction[];
    policyCategories?: PolicyCategories;
    policyTagLists?: PolicyTagLists;
    nonPersonalAndWorkspaceCards?: CardList;
    isAttendeesEnabledForMovingPolicy?: boolean;
};

type TransactionListItemWideProps<TItem extends ListItem> = TransactionListItemSharedProps<TItem> & {
    currentSearchHash?: number;
};

type TransactionListItemNarrowProps<TItem extends ListItem> = TransactionListItemSharedProps<TItem> & {
    isFirstItem?: boolean;
};

export type {TransactionListItemWideProps, TransactionListItemNarrowProps};
