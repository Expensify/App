import {render, screen} from '@testing-library/react-native';

import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import type {WorkspaceCompanyCardBulkActionType} from '@components/Tables/WorkspaceCompanyCardsTable/useWorkspaceCompanyCardsBulkActions';
import WorkspaceCompanyCardsTableControls from '@components/Tables/WorkspaceCompanyCardsTable/WorkspaceCompanyCardsTableControls';

import React from 'react';

type MockButtonProps = {
    customText: string;
    isDisabled?: boolean;
    options: Array<DropdownOption<WorkspaceCompanyCardBulkActionType>>;
};

const mockButtonProps: {current?: MockButtonProps} = {};
let mockShouldUseNarrowLayout = true;

/** The one action every selection offers, which is enough to tell an enabled dropdown from a disabled one. */
const bulkActionOptions: Array<DropdownOption<WorkspaceCompanyCardBulkActionType>> = [{text: 'workspace.expensifyCard.exportAsCSV', value: 'exportCSV'}];

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

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string, params?: {count?: number}) => (params?.count === undefined ? key : `${key}:${params.count}`),
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

function renderControls(isSelectionModeEnabled: boolean, selectedCardsCount = 0) {
    return render(
        <WorkspaceCompanyCardsTableControls
            bulkActionOptions={bulkActionOptions}
            isSelectionModeEnabled={isSelectionModeEnabled}
            selectedCardsCount={selectedCardsCount}
        />,
    );
}

describe('WorkspaceCompanyCardsTableControls narrow-layout selection mode', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockButtonProps.current = undefined;
        mockShouldUseNarrowLayout = true;
    });

    it('shows the disabled zero-selected action and keeps search mounted when selection mode starts', () => {
        renderControls(true);

        expect(screen.getByTestId('WorkspaceCompanyCardsBulkActions')).toBeTruthy();
        expect(mockButtonProps.current).toEqual(expect.objectContaining({customText: 'workspace.common.selected:0', isDisabled: true}));
        expect(screen.getByTestId('WorkspaceCompanyCardsFilterBar')).toBeTruthy();
    });

    it('enables the action after a card is selected and keeps search mounted', () => {
        renderControls(true, 1);

        expect(mockButtonProps.current).toEqual(expect.objectContaining({customText: 'workspace.common.selected:1', isDisabled: false}));
        expect(screen.getByTestId('WorkspaceCompanyCardsFilterBar')).toBeTruthy();
    });

    it('does not show the action before narrow-layout selection mode starts', () => {
        renderControls(false);

        expect(screen.queryByTestId('WorkspaceCompanyCardsBulkActions')).toBeNull();
        expect(screen.getByTestId('WorkspaceCompanyCardsFilterBar')).toBeTruthy();
    });

    it('does not show the action on a wide layout, where the floating bar carries it instead', () => {
        mockShouldUseNarrowLayout = false;

        renderControls(true, 1);

        expect(screen.queryByTestId('WorkspaceCompanyCardsBulkActions')).toBeNull();
        expect(screen.getByTestId('WorkspaceCompanyCardsFilterBar')).toBeTruthy();
    });
});
