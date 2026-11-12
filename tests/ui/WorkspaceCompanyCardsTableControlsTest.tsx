import {render, screen} from '@testing-library/react-native';

import CardUnsubmittedTransactionsPrompt from '@components/CardUnsubmittedTransactionsPrompt';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {ModalStateChangePayload} from '@components/Modal/Global/ModalContext';
import WorkspaceCompanyCardsTableControls from '@components/Tables/WorkspaceCompanyCardsTable/WorkspaceCompanyCardsTableControls';
import type {WorkspaceCompanyCardTableItemData} from '@components/Tables/WorkspaceCompanyCardsTable/WorkspaceCompanyCardsTableRow';

import {unassignWorkspaceCompanyCard} from '@libs/actions/CompanyCards';
import {formatMaskedCardName} from '@libs/CardUtils';
import localFileDownload from '@libs/localFileDownload';

import CONST from '@src/CONST';

import React from 'react';

import createRandomCard from '../utils/collections/card';

type MockDropdownOption = {
    value: string;
    onSelected: () => void | Promise<void>;
};

type MockButtonProps = {
    customText: string;
    isDisabled?: boolean;
    options: MockDropdownOption[];
};

const mockButtonProps: {current?: MockButtonProps} = {};
let mockProcessedData: Array<Partial<WorkspaceCompanyCardTableItemData> & {selected?: boolean}> = [];
let mockShouldUseNarrowLayout = true;
const mockShowConfirmModal = jest.fn<Promise<ModalStateChangePayload>, [{prompt: React.ReactNode}]>();

jest.mock('@components/CardUnsubmittedTransactionsPrompt', () => () => null);

jest.mock('@components/ButtonWithDropdownMenu', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return {
        __esModule: true,
        default: (props: MockButtonProps) => {
            mockButtonProps.current = props;
            return <View testID="WorkspaceCompanyCardsBulkActions" />;
        },
    };
});

jest.mock('@components/Table', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return {
        __esModule: true,
        default: {
            FilterBar: () => <View testID="WorkspaceCompanyCardsFilterBar" />,
        },
    };
});

jest.mock('@components/Table/TableContext', () => ({
    useTableContext: () => ({
        processedData: mockProcessedData,
        shouldUseNarrowTableLayout: true,
    }),
}));

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

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout}),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({
        w100: {},
        ph5: {},
        pb3: {},
        flexRow: {},
        flexGrow0: {},
        dNone: {},
        tableBulkActionsButton: () => ({}),
    }),
}));

jest.mock('@libs/actions/CompanyCards', () => ({unassignWorkspaceCompanyCard: jest.fn()}));
jest.mock('@libs/CardNavigationUtils', () => jest.fn());
jest.mock('@libs/CardUtils', () => ({formatMaskedCardName: jest.fn()}));
jest.mock('@libs/localFileDownload', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));

function renderControls(isSelectionModeEnabled: boolean) {
    const clearCardSelection = jest.fn();
    const renderResult = render(
        <WorkspaceCompanyCardsTableControls
            policyID="policy123"
            domainOrWorkspaceAccountID={123}
            bankName={CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}
            feedName="oauth.chase.com#123"
            canWriteCompanyCards
            clearCardSelection={clearCardSelection}
            isSelectionModeEnabled={isSelectionModeEnabled}
        />,
    );
    return {clearCardSelection, ...renderResult};
}

describe('WorkspaceCompanyCardsTableControls narrow-layout selection mode', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockButtonProps.current = undefined;
        mockProcessedData = [];
        mockShouldUseNarrowLayout = true;
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CLOSE});
    });

    it('shows the disabled zero-selected action and keeps search mounted when selection mode starts', () => {
        renderControls(true);

        expect(screen.getByTestId('WorkspaceCompanyCardsBulkActions')).toBeTruthy();
        expect(mockButtonProps.current).toEqual(expect.objectContaining({customText: 'workspace.common.selected:0', isDisabled: true}));
        expect(screen.getByTestId('WorkspaceCompanyCardsFilterBar')).toBeTruthy();
    });

    it('enables the action after a card is selected and keeps search mounted', () => {
        mockProcessedData = [{selected: true, disabled: false, isAssigned: false}];

        renderControls(true);

        expect(mockButtonProps.current).toEqual(expect.objectContaining({customText: 'workspace.common.selected:1', isDisabled: false}));
        expect(screen.getByTestId('WorkspaceCompanyCardsFilterBar')).toBeTruthy();
    });

    it('does not show the action before narrow-layout selection mode starts', () => {
        renderControls(false);

        expect(screen.queryByTestId('WorkspaceCompanyCardsBulkActions')).toBeNull();
        expect(screen.getByTestId('WorkspaceCompanyCardsFilterBar')).toBeTruthy();
    });

    it('exports formula-like card names as quoted text', async () => {
        // Given a selected company card with a formula-like custom name
        mockProcessedData = [{selected: true, isAssigned: true, cardName: 'card123', customCardName: '=SUM(1,2)', cardholder: {accountID: 1, login: 'alex@example.com'}}];
        jest.mocked(formatMaskedCardName).mockReturnValue('1234');
        renderControls(true);

        // When the CSV export action is selected
        mockButtonProps.current?.options?.find((option) => option.value === 'exportCSV')?.onSelected?.();

        // Then the existing export still uses one safe text cell for the card name
        expect(localFileDownload).toHaveBeenCalledWith('CompanyCards_policy123.csv', expect.stringContaining('\r\nalex@example.com,"\'=SUM(1,2)",1234,'), expect.any(Function));
    });

    it.each([[123], [123, 456]])('links only the selected assigned cards in the warning: %j', async (...cardIDs) => {
        // Given selected assigned cards, plus disabled and unselected rows that must not enter the link
        mockProcessedData = cardIDs.map((cardID) => ({selected: true, isAssigned: true, assignedCard: createRandomCard(cardID)}));
        mockProcessedData.push({selected: true, disabled: true, isAssigned: true, assignedCard: createRandomCard(789)}, {selected: false, isAssigned: false});
        const {clearCardSelection} = renderControls(true);

        // When opening and closing the warning without confirming
        await mockButtonProps.current?.options.find((option) => option.value === 'unassign')?.onSelected();

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
        mockProcessedData = [{selected: true, isAssigned: true, assignedCard: card}];
        mockShowConfirmModal.mockResolvedValueOnce({action: ModalActions.CONFIRM});
        const {clearCardSelection} = renderControls(true);

        // When the unassign action is confirmed
        await mockButtonProps.current?.options.find((option) => option.value === 'unassign')?.onSelected();

        // Then the existing destructive behavior remains scoped to the selected card
        expect(unassignWorkspaceCompanyCard).toHaveBeenCalledTimes(1);
        expect(unassignWorkspaceCompanyCard).toHaveBeenCalledWith(123, CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE, card);
        expect(clearCardSelection).toHaveBeenCalledTimes(1);
    });
});
