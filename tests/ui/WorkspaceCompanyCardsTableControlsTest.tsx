import {render, screen} from '@testing-library/react-native';

import WorkspaceCompanyCardsTableControls from '@components/Tables/WorkspaceCompanyCardsTable/WorkspaceCompanyCardsTableControls';
import type {WorkspaceCompanyCardTableItemData} from '@components/Tables/WorkspaceCompanyCardsTable/WorkspaceCompanyCardsTableRow';

import {formatMaskedCardName} from '@libs/CardUtils';
import localFileDownload from '@libs/localFileDownload';

import React from 'react';

type MockDropdownOption = {
    value: string;
    onSelected: () => void;
};

type MockButtonProps = {
    customText: string;
    isDisabled?: boolean;
    options: MockDropdownOption[];
};

const mockButtonProps: {current?: MockButtonProps} = {};

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
let mockSelectedCards: WorkspaceCompanyCardTableItemData[] = [];
let mockShouldUseNarrowLayout = true;

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
    useTableContext: () => ({shouldUseNarrowTableLayout: true}),
}));

jest.mock('@hooks/useConfirmModal', () => ({
    __esModule: true,
    default: () => ({showConfirmModal: jest.fn()}),
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
            bankName={undefined}
            feedName="oauth.chase.com#123"
            canWriteCompanyCards
            clearCardSelection={clearCardSelection}
            isSelectionModeEnabled={isSelectionModeEnabled}
            selectedCards={mockSelectedCards}
        />,
    );
    return {clearCardSelection, ...renderResult};
}

describe('WorkspaceCompanyCardsTableControls narrow-layout selection mode', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockButtonProps.current = undefined;
        mockSelectedCards = [];
        mockShouldUseNarrowLayout = true;
    });

    it('shows the disabled zero-selected action and keeps search mounted when selection mode starts', () => {
        renderControls(true);

        expect(screen.getByTestId('WorkspaceCompanyCardsBulkActions')).toBeTruthy();
        expect(mockButtonProps.current).toEqual(expect.objectContaining({customText: 'workspace.common.selected:0', isDisabled: true}));
        expect(screen.getByTestId('WorkspaceCompanyCardsFilterBar')).toBeTruthy();
    });

    it('enables the action after a card is selected and keeps search mounted', () => {
        mockSelectedCards = [buildCard({isAssigned: false})];

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
        mockSelectedCards = [buildCard({isAssigned: true, cardName: 'card123', customCardName: '=SUM(1,2)', cardholder: {accountID: 1, login: 'alex@example.com'}})];
        jest.mocked(formatMaskedCardName).mockReturnValue('1234');
        renderControls(true);

        // When the CSV export action is selected
        mockButtonProps.current?.options?.find((option) => option.value === 'exportCSV')?.onSelected?.();

        // Then the existing export still uses one safe text cell for the card name
        expect(localFileDownload).toHaveBeenCalledWith('CompanyCards_policy123.csv', expect.stringContaining('\r\nalex@example.com,"\'=SUM(1,2)",1234,'), expect.any(Function));
    });

    it('clears the selection once the export has started', () => {
        // Given a selected company card
        mockSelectedCards = [buildCard({isAssigned: true, cardName: 'card123', cardholder: {accountID: 1, login: 'alex@example.com'}})];
        const {clearCardSelection} = renderControls(true);

        // When the CSV export action is selected
        mockButtonProps.current?.options?.find((option) => option.value === 'exportCSV')?.onSelected?.();

        // Then the selection goes with it, the same as it does in Search and the report view
        expect(clearCardSelection).toHaveBeenCalled();
    });
});
