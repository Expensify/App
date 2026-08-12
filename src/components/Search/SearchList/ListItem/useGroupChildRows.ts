import useActionLoadingReportIDs from '@hooks/useActionLoadingReportIDs';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';

import {getSections, isTransactionListItemType} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import type {SearchListItem, TransactionListItemType} from './types';

type GetSectionsArgs = Parameters<typeof getSections>[0];

type UseGroupChildRowsArgs = {
    /** Whether this is the expense-report view, where the rows arrive ready to render */
    isExpenseReportType: boolean;

    /** The children source in expense-report views */
    groupTransactions: TransactionListItemType[];

    /** The children source in group-by views, loaded when the group opens */
    snapshotData: GetSectionsArgs['data'] | undefined;

    /** Needed to build the rows, and passed down rather than read again per group */
    bankAccountList: GetSectionsArgs['bankAccountList'];

    /** Needed to build the rows, and passed down rather than read again per group */
    cardFeeds: GetSectionsArgs['cardFeeds'];

    /** Needed to build the rows, and passed down rather than read again per group */
    conciergeReportID: GetSectionsArgs['conciergeReportID'];
};

function getSnapshotTransactionRows(snapshotData: GetSectionsArgs['data'] | undefined, args: Omit<GetSectionsArgs, 'data'>): TransactionListItemType[] {
    if (!snapshotData) {
        return [];
    }
    const [sectionData] = getSections({...args, data: snapshotData});
    // With type EXPENSE every row is a transaction. The guard narrows getSections' union return without a cast.
    const rows: SearchListItem[] = sectionData;
    return rows.filter(isTransactionListItemType);
}

/** A group's child rows. Deriving them anywhere else gives thin rows, whose action flags are computed from data the snapshot alone doesn't carry. */
function useGroupChildRows({isExpenseReportType, groupTransactions, snapshotData, bankAccountList, cardFeeds, conciergeReportID}: UseGroupChildRowsArgs): TransactionListItemType[] {
    const currentUserDetails = useCurrentUserPersonalDetails();
    const {translate, formatPhoneNumber, dateFnsLocale} = useLocalize();
    const isActionLoadingSet = useActionLoadingReportIDs();
    const {convertToDisplayString} = useCurrencyListActions();

    // `useSearchSnapshot` runs this same derivation for every group whose sub-snapshot is already cached, so rebuilding it here would be the third copy.
    if (isExpenseReportType || groupTransactions.length > 0) {
        return groupTransactions;
    }
    return getSnapshotTransactionRows(snapshotData, {
        dateFnsLocale,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        currentAccountID: currentUserDetails.accountID,
        currentUserEmail: currentUserDetails.email ?? '',
        translate,
        formatPhoneNumber,
        bankAccountList,
        isActionLoadingSet,
        cardFeeds,
        conciergeReportID,
        convertToDisplayString,
        reportAttributesDerivedValue: undefined,
    });
}

export default useGroupChildRows;
export type {UseGroupChildRowsArgs};
