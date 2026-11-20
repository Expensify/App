import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {WorkspaceExpensifyCardTableRowData} from '@components/Tables/WorkspaceExpensifyCardsTable';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import {exportExpensifyCardListToCSV} from '@libs/actions/Card';

import CONST from '@src/CONST';
import type {PersonalDetailsList} from '@src/types/onyx';
import type {CardLimitType} from '@src/types/onyx/Card';

type UseExpensifyCardBulkExportOptionsParams = {
    policyID: string;

    /** Every card row the table holds, so the selected keys can be resolved to cards */
    cardRows: WorkspaceExpensifyCardTableRowData[];

    /** The keys of the rows the export applies to */
    selectedCardKeys: string[];

    personalDetails: PersonalDetailsList | undefined;

    /** Settlement currency for the limit amounts in the file */
    settlementCurrency: string;

    /** Policy default limit type, for cards that have none stored */
    defaultLimitType: CardLimitType;

    /** Clear selected card rows */
    clearCardSelection: () => void;
};

/**
 * The actions the selected card rows support. The page and the floating bar both render them, and the list is built
 * here rather than in the page so the page's own render stays cached when the selection changes.
 */
function useExpensifyCardBulkExportOptions({
    policyID,
    cardRows,
    selectedCardKeys,
    personalDetails,
    settlementCurrency,
    defaultLimitType,
    clearCardSelection,
}: UseExpensifyCardBulkExportOptionsParams): Array<DropdownOption<typeof CONST.EXPENSIFY_CARD.BULK_ACTIONS.EXPORT_CSV>> {
    const {translate, formatPhoneNumber} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Export']);

    return [
        {
            icon: icons.Export,
            text: translate('workspace.expensifyCard.exportAsCSV'),
            value: CONST.EXPENSIFY_CARD.BULK_ACTIONS.EXPORT_CSV,
            sentryLabel: CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.BULK_ACTIONS_EXPORT_CSV,
            onSelected: () => {
                const selectedCards = cardRows.filter((row) => selectedCardKeys.includes(row.keyForList)).map((row) => row.card);
                exportExpensifyCardListToCSV({
                    policyID,
                    cards: selectedCards,
                    personalDetailsList: personalDetails,
                    settlementCurrency,
                    defaultLimitType,
                    translate,
                    formatPhoneNumber,
                });

                // Clear the selection now that the export has started, matching what Search and the report view do.
                clearCardSelection();
            },
        },
    ];
}

export default useExpensifyCardBulkExportOptions;
