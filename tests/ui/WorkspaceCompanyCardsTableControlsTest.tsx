import {render, screen} from '@testing-library/react-native';

import WorkspaceCompanyCardsTableControls from '@components/Tables/WorkspaceCompanyCardsTable/WorkspaceCompanyCardsTableControls';

import React from 'react';

type MockButtonProps = {
    customText: string;
    isDisabled?: boolean;
};

const mockButtonProps: {current?: MockButtonProps} = {};
let mockProcessedData: Array<{selected?: boolean; disabled?: boolean; isAssigned?: boolean}> = [];
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

function renderControls(isSelectionModeEnabled: boolean) {
    return render(
        <WorkspaceCompanyCardsTableControls
            policyID="policy123"
            domainOrWorkspaceAccountID={123}
            bankName={undefined}
            canWriteCompanyCards
            clearCardSelection={jest.fn()}
            isSelectionModeEnabled={isSelectionModeEnabled}
        />,
    );
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
});
