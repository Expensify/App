import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import Table from '@components/Table';
import {useTableContext} from '@components/Table/TableContext';
import TableSettingsTrigger from '@components/Table/TableFilterBar/TableSettingsTrigger';

import type {UseCompanyCardsResult} from '@hooks/useCompanyCards';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {unassignWorkspaceCompanyCard} from '@libs/actions/CompanyCards';
import navigateToCardTransactions from '@libs/CardNavigationUtils';
import {formatMaskedCardName} from '@libs/CardUtils';
import localFileDownload from '@libs/localFileDownload';

import CONST from '@src/CONST';

import {format, parseISO} from 'date-fns';
import React from 'react';
import {View} from 'react-native';

import type {WorkspaceCompanyCardTableItemData} from './WorkspaceCompanyCardsTableRow';

type WorkspaceCompanyCardBulkActionType = 'unassign' | 'viewTransactions' | 'exportCSV';

type WorkspaceCompanyCardsTableControlsProps = {
    /** Current policy id */
    policyID: string;

    /** Domain or workspace account ID */
    domainOrWorkspaceAccountID: number;

    /** Bank name */
    bankName: UseCompanyCardsResult['bankName'];

    /** Whether the current member can edit company cards */
    canWriteCompanyCards: boolean;

    /** Clear selected card rows */
    clearCardSelection: () => void;
};

const CSV_FORMULA_PREFIX_REGEXP = /^(?:[\t\r\n]|\s*[=+\-@])/;

function escapeCsvField(value: string): string {
    const safeValue = CSV_FORMULA_PREFIX_REGEXP.test(value) ? `'${value}` : value;
    if (safeValue.includes('"') || safeValue.includes(',') || safeValue.includes('\n') || safeValue.includes('\r')) {
        return `"${safeValue.replaceAll('"', '""')}"`;
    }
    return safeValue;
}

function WorkspaceCompanyCardsTableControls({policyID, domainOrWorkspaceAccountID, bankName, canWriteCompanyCards, clearCardSelection}: WorkspaceCompanyCardsTableControlsProps) {
    const styles = useThemeStyles();
    const {translate, getLocalDateFromDatetime} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const icons = useMemoizedLazyExpensifyIcons(['Export', 'MoneySearch', 'RemoveMembers']);
    const {processedData, shouldUseNarrowTableLayout} = useTableContext<WorkspaceCompanyCardTableItemData>();

    const selectedCards = processedData.filter((card) => card.selected && !card.disabled);
    const selectedAssignedCards = selectedCards.filter((card) => card.isAssigned && !!card.assignedCard);
    const isOnlyAssignedCardsSelected = selectedCards.length > 0 && selectedAssignedCards.length === selectedCards.length;

    const exportSelectedCardsToCSV = () => {
        if (selectedCards.length === 0) {
            return;
        }

        const header = [
            translate('common.email'),
            translate('workspace.expensifyCard.name'),
            translate('workspace.moreFeatures.companyCards.cardNumber'),
            translate('workspace.moreFeatures.companyCards.transactionStartDate'),
            translate('workspace.moreFeatures.companyCards.lastUpdated'),
            translate('workspace.moreFeatures.companyCards.assignedCards'),
        ]
            .map(escapeCsvField)
            .join(',');

        const rows = selectedCards.map((card) => {
            const assignedCard = card.assignedCard;
            const transactionStartDate = assignedCard?.scrapeMinDate ? format(parseISO(assignedCard.scrapeMinDate), CONST.DATE.FNS_FORMAT_STRING) : '';
            const lastUpdated = assignedCard?.lastScrape ? format(getLocalDateFromDatetime(assignedCard.lastScrape), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING) : '';

            return [
                card.isAssigned ? (card.cardholder?.login ?? '') : 'unassigned',
                card.isAssigned ? (card.customCardName ?? '') : '',
                formatMaskedCardName(card.cardName),
                card.isAssigned ? transactionStartDate : '',
                card.isAssigned ? lastUpdated : '',
                translate(card.isAssigned ? 'common.yes' : 'common.no'),
            ]
                .map(escapeCsvField)
                .join(',');
        });

        const csvContent = [header, ...rows].join('\r\n');
        const safePolicySegment = policyID.replaceAll(/[^\dA-Za-z-_]/g, '') || 'workspace';
        localFileDownload(`CompanyCards_${safePolicySegment}.csv`, csvContent, translate);
    };

    const confirmBulkUnassign = async () => {
        if (!bankName || selectedAssignedCards.length === 0) {
            return;
        }

        const {action} = await showConfirmModal({
            shouldSetModalVisibility: false,
            title: translate('workspace.moreFeatures.companyCards.unassignCards'),
            prompt: translate('workspace.moreFeatures.companyCards.unassignCardsDescription'),
            confirmText: translate('workspace.moreFeatures.companyCards.unassign'),
            cancelText: translate('common.cancel'),
            danger: true,
        });

        if (action !== ModalActions.CONFIRM) {
            return;
        }

        for (const card of selectedAssignedCards) {
            if (!card.assignedCard) {
                continue;
            }
            unassignWorkspaceCompanyCard(domainOrWorkspaceAccountID, bankName, card.assignedCard);
        }
        clearCardSelection();
    };

    const viewSelectedCardTransactions = () => {
        const selectedCardIDs = selectedAssignedCards.map((card) => card.assignedCard?.cardID).filter((cardID): cardID is number => cardID !== undefined);
        if (selectedCardIDs.length === 0) {
            return;
        }

        navigateToCardTransactions(selectedCardIDs.join(','));
        clearCardSelection();
    };

    const getBulkActionOptions = (): Array<DropdownOption<WorkspaceCompanyCardBulkActionType>> => {
        const options: Array<DropdownOption<WorkspaceCompanyCardBulkActionType>> = [];

        if (isOnlyAssignedCardsSelected) {
            if (canWriteCompanyCards) {
                options.push({
                    icon: icons.RemoveMembers,
                    text: translate('workspace.moreFeatures.companyCards.unassignCards'),
                    value: 'unassign',
                    onSelected: confirmBulkUnassign,
                });
            }

            options.push({
                icon: icons.MoneySearch,
                text: translate('workspace.common.viewTransactions'),
                value: 'viewTransactions',
                onSelected: viewSelectedCardTransactions,
            });
        }

        options.push({
            icon: icons.Export,
            text: translate('workspace.expensifyCard.exportAsCSV'),
            value: 'exportCSV',
            onSelected: exportSelectedCardsToCSV,
        });

        return options;
    };

    if (selectedCards.length === 0) {
        return (
            <Table.FilterBar label={translate('workspace.companyCards.findCompanyCard')}>
                <TableSettingsTrigger />
            </Table.FilterBar>
        );
    }

    return (
        <View style={[styles.w100, styles.ph5, styles.pb3, !shouldUseNarrowTableLayout && styles.flexRow]}>
            <ButtonWithDropdownMenu<WorkspaceCompanyCardBulkActionType>
                success
                onPress={() => {}}
                customText={translate('workspace.common.selected', {count: selectedCards.length})}
                options={getBulkActionOptions()}
                isSplitButton={false}
                shouldAlwaysShowDropdownMenu
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.COMPANY_CARDS.BULK_ACTIONS_DROPDOWN}
                wrapperStyle={[shouldUseNarrowTableLayout ? styles.w100 : styles.flexGrow0, styles.tableBulkActionsButton(shouldUseNarrowTableLayout)]}
            />
        </View>
    );
}

export default WorkspaceCompanyCardsTableControls;
