import FormHelpMessage from '@components/FormHelpMessage';
import Table, {composeTableListHeader} from '@components/Table';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData} from '@components/Table';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {filterCardsByPersonalDetails, getTranslationKeyForCardStatus, getTranslationKeyForLimitType} from '@libs/CardUtils';
import {convertToShortDisplayString} from '@libs/CurrencyUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';

import WorkspaceCardListLabels from '@pages/workspace/expensifyCard/WorkspaceCardListLabels';

import {fontScale} from '@styles/typography';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {Card, PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import type {CardLimitType} from '@src/types/onyx/Card';
import type ExpensifyCardSettings from '@src/types/onyx/ExpensifyCardSettings';
import type {ExpensifyCardSettingsBase} from '@src/types/onyx/ExpensifyCardSettings';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import type {ListRenderItemInfo} from '@shopify/flash-list';
import type {ReactElement} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import WorkspaceExpensifyCardsTableRow from './WorkspaceExpensifyCardsTableRow';

/** Width the member cell's avatar and the space after it take before the name and subtitle start. */
const MEMBER_CELL_AVATAR_WIDTH = variables.avatarSizeSmall + 12;

type WorkspaceExpensifyCardTableColumnKey = 'name' | 'type' | 'limitType' | 'lastFour' | 'status' | 'exportAccount' | 'limit' | 'remainingLimit' | 'actions';

type WorkspaceExpensifyCardTableRowData = TableData & {
    cardID: number;
    card: Card;
    lastFourPAN: string;
    name: string;
    cardholder?: PersonalDetails | null;
    limit: number;
    remainingLimit: number;
    currency?: string;
    isVirtual: boolean;
    limitType: CardLimitType | undefined;
    exportAccountTitle?: string;
    frozenByDisplayName?: string;
    frozenByAccountID?: number;
    frozenDate?: string;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    action: () => void;
    onClose: () => void;
};

type WorkspaceExpensifyCardsTableProps = {
    policyID: string;

    /** Optional page-level content rendered above the card labels that scrolls with the rows */
    headerComponent?: ReactElement;

    cards: WorkspaceExpensifyCardTableRowData[];

    /** Whether multi selection is enabled */
    selectionEnabled: boolean;

    /** The list of selected keys for the table */
    selectedKeys: string[];

    onRowSelectionChange: (selectedRowKeys: string[]) => void;

    /** Card settings used to display labels and top-level errors */
    cardSettings?: ExpensifyCardSettings;

    /** Base card settings used to display labels */
    cardSettingsBase?: ExpensifyCardSettingsBase;

    /** Whether the Export account column is shown, mirroring the eligibility check on the card details page */
    shouldShowExportAccountColumn: boolean;

    /** Personal details used for search filtering */
    personalDetails?: PersonalDetailsList;

    /** Optional footer component rendered at the bottom of the scrollable list */
    listFooterComponent?: ReactElement;

    listFooterComponentStyle?: StyleProp<ViewStyle>;
    listContentContainerStyle?: StyleProp<ViewStyle>;
};

export default function WorkspaceExpensifyCardsTable({
    policyID,
    headerComponent,
    cards,
    selectionEnabled,
    selectedKeys,
    onRowSelectionChange,
    cardSettings,
    cardSettingsBase,
    shouldShowExportAccountColumn,
    personalDetails,
    listFooterComponent,
    listFooterComponentStyle,
    listContentContainerStyle,
}: WorkspaceExpensifyCardsTableProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;
    const errorMessage = getLatestErrorMessage(cardSettings) ?? '';

    const columns: Array<TableColumn<WorkspaceExpensifyCardTableColumnKey, WorkspaceExpensifyCardTableRowData>> = [
        {
            key: 'name',
            label: translate('workspace.expensifyCard.name'),
            sortable: true,
            styling: {
                // Cardholder names and card titles are the longest values in the table, so this column takes the
                // space freed up by giving Type, Last 4 and Status fixed widths. This flex only applies to the static
                // fallback layout, since dynamic column widths below resolve to px tracks instead.
                flex: 2,
            },
            dynamicSizing: {
                // The cell stacks the cardholder's name above the card's own title, so whichever renders wider decides
                // the column's width.
                getContentToMeasure: (item) => [
                    {text: item.cardholder?.displayName ?? item.cardholder?.login ?? '', fontSize: fontScale.text},
                    {text: item.name, fontSize: fontScale.label},
                ],
                extraWidth: MEMBER_CELL_AVATAR_WIDTH,
            },
        },
        {
            key: 'type',
            label: translate('common.type'),
            sortable: true,
            width: variables.tableTypeColumnWidth,
            styling: {
                containerStyles: [styles.mnw0],
            },
        },
        {
            key: 'limitType',
            label: translate('workspace.card.issueNewCard.limitType'),
            sortable: true,
            dynamicSizing: {
                getContentToMeasure: (item) => [{text: translate(getTranslationKeyForLimitType(item.limitType)), fontSize: fontScale.text}],
                // A limit type is one of a short, known set of labels, so the column always shows them in full.
                shouldFitContent: true,
            },
        },
        {
            key: 'lastFour',
            label: translate('workspace.expensifyCard.lastFour'),
            sortable: true,
            width: variables.tableLastFourColumnWidth,
        },
        {
            key: 'status',
            label: translate('common.status'),
            sortable: true,
            width: variables.tableCardStatusColumnWidth,
            styling: {
                containerStyles: [styles.mnw0],
            },
        },
        ...(shouldShowExportAccountColumn
            ? [
                  {
                      key: 'exportAccount' as const,
                      label: translate('workspace.moreFeatures.companyCards.exportAccount'),
                      sortable: true,
                      dynamicSizing: {
                          getContentToMeasure: (item: WorkspaceExpensifyCardTableRowData) => (item.exportAccountTitle ? [{text: item.exportAccountTitle, fontSize: fontScale.text}] : []),
                          maxWidth: CONST.TABLES.DYNAMIC_COLUMNS.MAX_EXPORT_ACCOUNT_COLUMN_WIDTH,
                      },
                  },
              ]
            : []),
        {
            key: 'limit',
            label: translate('workspace.expensifyCard.limit'),
            sortable: true,
            styling: {
                containerStyles: [styles.justifyContentEnd],
            },
            dynamicSizing: {
                getContentToMeasure: (item) => [{text: convertToShortDisplayString(item.limit, item.currency), fontSize: fontScale.text}],
                // A truncated currency amount is misleading, so this column always shows it in full.
                shouldFitContent: true,
            },
        },
        {
            key: 'remainingLimit',
            label: translate('workspace.expensifyCard.remaining'),
            sortable: true,
            styling: {
                containerStyles: [styles.justifyContentEnd],
            },
            dynamicSizing: {
                getContentToMeasure: (item) => [{text: convertToShortDisplayString(item.remainingLimit, item.currency), fontSize: fontScale.text}],
                shouldFitContent: true,
            },
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            width: variables.tableCaretColumnWidth,
        },
    ];

    const compareItems: CompareItemsCallback<WorkspaceExpensifyCardTableRowData, WorkspaceExpensifyCardTableColumnKey> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;

        if (activeSorting.columnKey === 'type') {
            const type1 = item1.isVirtual ? translate('workspace.expensifyCard.virtual') : translate('workspace.expensifyCard.physical');
            const type2 = item2.isVirtual ? translate('workspace.expensifyCard.virtual') : translate('workspace.expensifyCard.physical');
            return localeCompare(type1, type2) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'limitType') {
            const limitType1 = translate(getTranslationKeyForLimitType(item1.limitType));
            const limitType2 = translate(getTranslationKeyForLimitType(item2.limitType));
            return localeCompare(limitType1, limitType2) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'lastFour') {
            return localeCompare(item1.lastFourPAN, item2.lastFourPAN) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'status') {
            const status1TranslationKey = getTranslationKeyForCardStatus(item1.card.state, item1.isVirtual);
            const status2TranslationKey = getTranslationKeyForCardStatus(item2.card.state, item2.isVirtual);
            const status1 = status1TranslationKey ? translate(status1TranslationKey) : '';
            const status2 = status2TranslationKey ? translate(status2TranslationKey) : '';
            return localeCompare(status1, status2) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'limit') {
            return (item1.limit - item2.limit) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'remainingLimit') {
            return (item1.remainingLimit - item2.remainingLimit) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'exportAccount') {
            const exportAccountComparison = localeCompare(item1.exportAccountTitle ?? '', item2.exportAccountTitle ?? '');

            if (exportAccountComparison !== 0) {
                return exportAccountComparison * orderMultiplier;
            }
        }

        const cardholderName1 = item1.cardholder?.displayName ?? item1.cardholder?.login ?? '';
        const cardholderName2 = item2.cardholder?.displayName ?? item2.cardholder?.login ?? '';
        return localeCompare(cardholderName1, cardholderName2) * orderMultiplier;
    };

    const isItemInSearch: IsItemInSearchCallback<WorkspaceExpensifyCardTableRowData> = (item, searchValue) => filterCardsByPersonalDetails(item.card, searchValue, personalDetails);

    const renderCardItem = ({item, index}: ListRenderItemInfo<WorkspaceExpensifyCardTableRowData>) => (
        <WorkspaceExpensifyCardsTableRow
            item={item}
            rowIndex={index}
            shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
            shouldShowExportAccountColumn={shouldShowExportAccountColumn}
        />
    );

    const cardListLabelsContent = (
        <View style={[styles.appBG, styles.flexShrink0, styles.flexGrow1, styles.mb5]}>
            <WorkspaceCardListLabels
                policyID={policyID}
                cardSettings={cardSettingsBase}
            />
            {!!errorMessage && (
                <View style={[styles.mh5, styles.pr4, styles.mt2]}>
                    <FormHelpMessage
                        isError
                        message={errorMessage}
                    />
                </View>
            )}
        </View>
    );
    const tableHeaderComponent = composeTableListHeader(headerComponent, cardListLabelsContent, <Table.FilterBar label={translate('workspace.expensifyCard.findCard')} />);

    return (
        <Table
            data={cards}
            columns={columns}
            renderItem={renderCardItem}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            shouldUseDynamicColumns
            initialSortColumn="name"
            narrowLayoutSortColumn="name"
            title={translate('workspace.common.expensifyCard')}
            keyExtractor={(item) => item.keyForList}
            selectionEnabled={selectionEnabled}
            selectedKeys={selectedKeys}
            onRowSelectionChange={onRowSelectionChange}
            ListFooterComponent={listFooterComponent}
            ListFooterComponentStyle={listFooterComponentStyle}
        >
            <Table.ListHeader>{tableHeaderComponent}</Table.ListHeader>
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body contentContainerStyle={listContentContainerStyle} />
        </Table>
    );
}

export type {WorkspaceExpensifyCardTableRowData, WorkspaceExpensifyCardTableColumnKey};
