import FormHelpMessage from '@components/FormHelpMessage';
import Table from '@components/Table';
import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn, TableData} from '@components/Table';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {filterCardsByPersonalDetails, getTranslationKeyForCardStatus, getTranslationKeyForLimitType} from '@libs/CardUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';

import WorkspaceCardListLabels from '@pages/workspace/expensifyCard/WorkspaceCardListLabels';

import variables from '@styles/variables';

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

type WorkspaceExpensifyCardTableColumnKey = 'name' | 'type' | 'limitType' | 'lastFour' | 'status' | 'limit' | 'actions';

type WorkspaceExpensifyCardTableRowData = TableData & {
    cardID: number;
    card: Card;
    lastFourPAN: string;
    name: string;
    cardholder?: PersonalDetails | null;
    limit: number;
    currency?: string;
    isVirtual: boolean;
    limitType: CardLimitType | undefined;
    frozenByDisplayName?: string;
    frozenByAccountID?: number;
    frozenDate?: string;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
    action: () => void;
    onClose: () => void;
};

type WorkspaceExpensifyCardsTableProps = {
    /** Policy ID */
    policyID: string;

    /** List of Expensify cards to display in the table */
    cards: WorkspaceExpensifyCardTableRowData[];

    /** Whether multi selection is enabled */
    selectionEnabled: boolean;

    /** The list of selected keys for the table */
    selectedKeys: string[];

    /** Callback when row selection changes */
    onRowSelectionChange: (selectedRowKeys: string[]) => void;

    /** Card settings used to display labels and top-level errors */
    cardSettings?: ExpensifyCardSettings;

    /** Base card settings used to display labels */
    cardSettingsBase?: ExpensifyCardSettingsBase;

    /** Personal details used for search filtering */
    personalDetails?: PersonalDetailsList;

    /** Optional footer component rendered at the bottom of the scrollable list */
    listFooterComponent?: ReactElement;

    /** Optional styles for the list footer component */
    listFooterComponentStyle?: StyleProp<ViewStyle>;

    /** Optional styles for the list content container */
    listContentContainerStyle?: StyleProp<ViewStyle>;
};

export default function WorkspaceExpensifyCardsTable({
    policyID,
    cards,
    selectionEnabled,
    selectedKeys,
    onRowSelectionChange,
    cardSettings,
    cardSettingsBase,
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

    const columns: Array<TableColumn<WorkspaceExpensifyCardTableColumnKey>> = [
        {
            key: 'name',
            label: translate('workspace.expensifyCard.name'),
            sortable: true,
        },
        {
            key: 'type',
            label: translate('common.type'),
            sortable: true,
        },
        {
            key: 'limitType',
            label: translate('workspace.card.issueNewCard.limitType'),
            sortable: true,
        },
        {
            key: 'lastFour',
            label: translate('workspace.expensifyCard.lastFour'),
            sortable: true,
        },
        {
            key: 'status',
            label: translate('common.status'),
            sortable: true,
        },
        {
            key: 'limit',
            label: translate('workspace.expensifyCard.limit'),
            sortable: true,
            styling: {
                containerStyles: [styles.justifyContentEnd],
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
            const status1 = translate(getTranslationKeyForCardStatus(item1.card.state, item1.isVirtual));
            const status2 = translate(getTranslationKeyForCardStatus(item2.card.state, item2.isVirtual));
            return localeCompare(status1, status2) * orderMultiplier;
        }

        if (activeSorting.columnKey === 'limit') {
            return (item1.limit - item2.limit) * orderMultiplier;
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
        />
    );

    const cardListHeaderContent = (
        <>
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
            <Table.FilterBar label={translate('workspace.expensifyCard.findCard')} />
            <Table.Header />
        </>
    );

    return (
        <Table
            data={cards}
            columns={columns}
            renderItem={renderCardItem}
            compareItems={compareItems}
            isItemInSearch={isItemInSearch}
            initialSortColumn="name"
            narrowLayoutSortColumn="name"
            title={translate('workspace.common.expensifyCard')}
            keyExtractor={(item) => item.keyForList}
            selectionEnabled={selectionEnabled}
            selectedKeys={selectedKeys}
            onRowSelectionChange={onRowSelectionChange}
            ListFooterComponent={listFooterComponent}
            ListFooterComponentStyle={listFooterComponentStyle}
            ListHeaderComponent={cardListHeaderContent}
        >
            <Table.Body contentContainerStyle={listContentContainerStyle} />
        </Table>
    );
}

export type {WorkspaceExpensifyCardTableRowData, WorkspaceExpensifyCardTableColumnKey};
