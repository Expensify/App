import {render, screen} from '@testing-library/react-native';

import WorkspaceCompanyCardsTableControls from '@components/Tables/WorkspaceCompanyCardsTable/WorkspaceCompanyCardsTableControls';

import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

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
let mockProcessedData: Array<{selected?: boolean; disabled?: boolean; isAssigned?: boolean; assignedCard?: {cardID: number}}> = [];
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
    useTableContext: () => ({
        processedData: mockProcessedData,
        shouldUseNarrowTableLayout: true,
    }),
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

    it('opens the bulk transaction start date screen for the selected assigned cards', () => {
        // Given two assigned cards are selected
        mockProcessedData = [
            {selected: true, disabled: false, isAssigned: true, assignedCard: {cardID: 123}},
            {selected: true, disabled: false, isAssigned: true, assignedCard: {cardID: 456}},
        ];
        const {clearCardSelection} = renderControls(true);

        // When the bulk transaction start date action is selected
        mockButtonProps.current?.options.find((option) => option.value === 'editTransactionStartDate')?.onSelected();

        // Then the editor opens with both card IDs and clears the table selection
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.WORKSPACE_COMPANY_CARDS_BULK_EDIT_TRANSACTION_START_DATE.getRoute('policy123', 'oauth.chase.com#123', ['123', '456']));
        expect(clearCardSelection).toHaveBeenCalledTimes(1);
    });
});
