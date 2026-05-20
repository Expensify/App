import type {MouseEvent} from 'react';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType} from '@components/Search/types';
import type {ListItemFocusEventHandler} from '@components/SelectionList/ListItem/types';
import type {ListItem} from '@components/SelectionList/types';
import type {TransactionPreviewData} from '@libs/actions/Search';
import type {CardList, ReportAction, TransactionViolation} from '@src/types/onyx';

type TransactionListItemInlineEditProps = {
    shouldDisableHoverStyle: boolean;
    onPressRow: () => void;
    onMouseDownRow: (e?: MouseEvent) => void;
    onHoverInRow: () => void;
    onEditDate: (newDate: string) => void;
    onEditMerchant: (newMerchant: string) => void;
    onEditDescription: (newDescription: string) => void;
    onEditCategory: (newCategory: string) => void;
    onEditAmount: (newAmount: number) => void;
    onEditTag: (newTag: string) => void;
    canEditDate: boolean;
    canEditMerchant: boolean;
    canEditDescription: boolean;
    canEditCategory: boolean;
    canEditAmount: boolean;
    canEditTag: boolean;
};

type TransactionListItemWideProps<TItem extends ListItem> = {
    item: TItem;
    transactionItem: TransactionListItemType;
    isDeletedTransaction: boolean;
    isFocused?: boolean;
    showTooltip: boolean;
    isDisabled?: boolean | null;
    canSelectMultiple?: boolean;
    onSelectRow: (item: TItem, transactionPreviewData?: TransactionPreviewData) => void;
    onCheckboxPress?: (item: TItem) => void;
    onFocus?: ListItemFocusEventHandler;
    onLongPressRow?: (item: TItem) => void;
    shouldSyncFocus?: boolean;
    columns?: SearchColumnType[];
    isLoading?: boolean;
    isActionLoading?: boolean;
    isLastItem?: boolean;
    transactionViolations: TransactionViolation[];
    handleActionButtonPress: () => void;
    transactionPreviewData: TransactionPreviewData;
    exportedReportActions: ReportAction[];
    nonPersonalAndWorkspaceCards?: CardList;
    isAttendeesEnabledForMovingPolicy?: boolean;
} & TransactionListItemInlineEditProps;

type TransactionListItemNarrowProps<TItem extends ListItem> = TransactionListItemWideProps<TItem> & {
    isFirstItem?: boolean;
};

export type {TransactionListItemWideProps, TransactionListItemNarrowProps};
