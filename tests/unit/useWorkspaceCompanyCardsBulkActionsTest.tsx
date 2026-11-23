/**
 * Tests for useWorkspaceCompanyCardsBulkActions, the single list of actions the company cards table hands to both
 * the floating bar and the narrow layout's "Selected" dropdown. The hook is exercised directly, because the two
 * consumers only render what it returns.
 */

import {renderHook} from '@testing-library/react-native';

import CardUnsubmittedTransactionsPrompt from '@components/CardUnsubmittedTransactionsPrompt';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {ModalStateChangePayload} from '@components/Modal/Global/ModalContext';
import useWorkspaceCompanyCardsBulkActions from '@components/Tables/WorkspaceCompanyCardsTable/useWorkspaceCompanyCardsBulkActions';
import type {WorkspaceCompanyCardTableItemData} from '@components/Tables/WorkspaceCompanyCardsTable/WorkspaceCompanyCardsTableRow';

import {unassignWorkspaceCompanyCard} from '@libs/actions/CompanyCards';
import {formatMaskedCardName} from '@libs/CardUtils';
import localFileDownload from '@libs/localFileDownload';

import CONST from '@src/CONST';

import React from 'react';

import createRandomCard from '../utils/collections/card';

const mockShowConfirmModal = jest.fn<Promise<ModalStateChangePayload>, [{prompt: React.ReactNode}]>();

jest.mock('@components/CardUnsubmittedTransactionsPrompt', () => () => null);

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: mockShowConfirmModal}),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string, params?: {count?: number}) => (params?.count === undefined ? key : `${key}:${params.count}`),
        getLocalDateFromDatetime: jest.fn(),
    }),
}));

jest.mock('@libs/actions/CompanyCards', () => ({unassignWorkspaceCompanyCard: jest.fn()}));
jest.mock('@libs/CardNavigationUtils', () => jest.fn());
jest.mock('@libs/CardUtils', () => ({formatMaskedCardName: jest.fn()}));
jest.mock('@libs/localFileDownload', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));

/** Fills in the fields the actions never read, so each case states just what it is about. */
function buildCard(card: Partial<WorkspaceCompanyCardTableItemData>): WorkspaceCompanyCardTableItemData {
    return {
        keyForList: 'card',
        cardName: '',
        encryptedCardNumber: '',
        isCardDeleted: false,
        isAssigned: false,
        ...card,
    };
}

function renderBulkActions(selectedCards: WorkspaceCompanyCardTableItemData[]) {
    const clearCardSelection = jest.fn();
    const {result} = renderHook(() =>
        useWorkspaceCompanyCardsBulkActions({
            policyID: 'policy123',
            domainOrWorkspaceAccountID: 123,
            bankName: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
            feedName: 'oauth.chase.com#123',
            canWriteCompanyCards: true,
            clearCardSelection,
            selectedCards,
        }),
    );
    return {clearCardSelection, getOption: (value: string) => result.current.find((option) => option.value === value)};
}

describe('useWorkspaceCompanyCardsBulkActions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CLOSE});
    });

    it('exports formula-like card names as quoted text', () => {
        // Given a selected company card with a formula-like custom name
        const selectedCards = [buildCard({isAssigned: true, cardName: 'card123', customCardName: '=SUM(1,2)', cardholder: {accountID: 1, login: 'alex@example.com'}})];
        jest.mocked(formatMaskedCardName).mockReturnValue('1234');
        const {getOption} = renderBulkActions(selectedCards);

        // When the CSV export action is selected
        getOption('exportCSV')?.onSelected?.();

        // Then the existing export still uses one safe text cell for the card name
        expect(localFileDownload).toHaveBeenCalledWith('CompanyCards_policy123.csv', expect.stringContaining('\r\nalex@example.com,"\'=SUM(1,2)",1234,'), expect.any(Function));
    });

    it('clears the selection once the export has started', () => {
        // Given a selected company card
        const selectedCards = [buildCard({isAssigned: true, cardName: 'card123', cardholder: {accountID: 1, login: 'alex@example.com'}})];
        const {clearCardSelection, getOption} = renderBulkActions(selectedCards);

        // When the CSV export action is selected
        getOption('exportCSV')?.onSelected?.();

        // Then the selection goes with it, the same as it does in Search and the report view
        expect(clearCardSelection).toHaveBeenCalled();
    });

    it.each([[123], [123, 456]])('links only the selected assigned cards in the warning: %j', async (...cardIDs) => {
        // Given the selected assigned cards the table passes down
        const selectedCards = cardIDs.map((cardID) => buildCard({isAssigned: true, assignedCard: createRandomCard(cardID)}));
        const {clearCardSelection, getOption} = renderBulkActions(selectedCards);

        // When opening and closing the warning without confirming
        await getOption('unassign')?.onSelected?.();

        // Then the prompt contains exactly the selected IDs and no card is unassigned
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                prompt: (
                    <CardUnsubmittedTransactionsPrompt
                        cardIDs={cardIDs}
                        descriptionKey={cardIDs.length === 1 ? 'workspace.moreFeatures.companyCards.unassignCardDescription' : 'workspace.moreFeatures.companyCards.unassignCardsDescription'}
                    />
                ),
            }),
        );
        expect(unassignWorkspaceCompanyCard).not.toHaveBeenCalled();
        expect(clearCardSelection).not.toHaveBeenCalled();
    });

    it('still unassigns the selected cards only after explicit confirmation', async () => {
        // Given one selected assigned card and an explicit confirmation result
        const card = createRandomCard(123);
        const selectedCards = [buildCard({isAssigned: true, assignedCard: card})];
        mockShowConfirmModal.mockResolvedValueOnce({action: ModalActions.CONFIRM});
        const {clearCardSelection, getOption} = renderBulkActions(selectedCards);

        // When the unassign action is confirmed
        await getOption('unassign')?.onSelected?.();

        // Then the existing destructive behavior remains scoped to the selected card
        expect(unassignWorkspaceCompanyCard).toHaveBeenCalledTimes(1);
        expect(unassignWorkspaceCompanyCard).toHaveBeenCalledWith(123, CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE, card);
        expect(clearCardSelection).toHaveBeenCalledTimes(1);
    });
});
