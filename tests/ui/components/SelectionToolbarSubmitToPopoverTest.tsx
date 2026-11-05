import {render} from '@testing-library/react-native';

import SelectionToolbar from '@components/MoneyRequestReportView/SelectionToolbar';
import {useOpenReportSubmitToPopover} from '@components/ReportSubmitToPopoverAnchor';

import useReportSubmitToPopover from '@hooks/useReportSubmitToPopover';
import useSelectionModeReportActions from '@hooks/useSelectionModeReportActions';

import type * as ReactNavigationNative from '@react-navigation/native';

import React from 'react';

const REPORT_ID = '1001';

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useNetworkWithOfflineStatus', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => jest.fn(() => ({shouldUseNarrowLayout: false, isInLandscapeMode: false})));
jest.mock('@hooks/useMobileSelectionMode', () => jest.fn(() => false));
jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: jest.fn()})));
jest.mock('@hooks/useFilterSelectedTransactions', () => jest.fn());
jest.mock('@hooks/useSelectedTransactionsActions', () =>
    jest.fn(() => ({options: [], isDuplicateOptionVisible: false, setDuplicateHandler: jest.fn(), allTransactions: undefined, allReports: undefined})),
);
jest.mock('@hooks/useSelectionModeReportActions', () => jest.fn());
jest.mock('@hooks/useReportSubmitToPopover', () => jest.fn());
jest.mock('@components/MoneyRequestReportView/useShouldShowReportBulkActionBar', () => jest.fn(() => false));
jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    __esModule: true,
    useDelegateNoAccessState: jest.fn(() => ({isDelegateAccessRestricted: false})),
    useDelegateNoAccessActions: jest.fn(() => ({showDelegateNoAccessModal: jest.fn()})),
}));
jest.mock('@components/DecisionModal', () => jest.fn(() => null));

// useThemeStyles throws without a <ThemeStylesProvider>; return a proxy that yields an empty style object for any key.
jest.mock('@hooks/useThemeStyles', () => {
    const styleProxy = new Proxy({}, {get: () => ({})});
    return jest.fn(() => styleProxy);
});

// The user has selected the report's only expense, so the toolbar is shown.
jest.mock('@components/Search/SearchContext', () => ({
    __esModule: true,
    useSearchSelectionContext: jest.fn(() => ({selectedTransactionIDs: ['tx-1'], currentSelectedTransactionReportID: '1001'})),
    useSearchSelectionActions: jest.fn(() => ({clearSelectedTransactions: jest.fn(), setSelectedTransactions: jest.fn(), setCurrentSelectedTransactionReportID: jest.fn()})),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    __esModule: true,
    useRoute: jest.fn(() => ({key: 'route-1', name: 'Report', params: {}})),
    useFocusEffect: jest.fn(),
}));

const mockedUseSelectionModeReportActions = jest.mocked(useSelectionModeReportActions);
const mockedUseReportSubmitToPopover = jest.mocked(useReportSubmitToPopover);

describe('SelectionToolbar bulk Submit', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('opens the submit-to popover from the selection bulk actions', () => {
        // Given the submit-to popover's opener, which a Submit workspace's bulk Submit calls instead of submitting directly
        const openReportSubmitToPopover = jest.fn();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only the opener matters here, and the popover element is never rendered
        mockedUseReportSubmitToPopover.mockReturnValue({
            anchorRef: {current: null},
            openReportSubmitToPopover,
            closeReportSubmitToPopover: jest.fn(),
            reportSubmitToPopover: null,
            isReportSubmitToPopoverVisible: false,
            isReportSubmitToDismissGuardActive: false,
            consumeIgnoreNextSearchSubmitPress: () => false,
        } as unknown as ReturnType<typeof useReportSubmitToPopover>);

        // And the toolbar's bulk report actions, which get that opener from context
        let openFromBulkSubmit: ReturnType<typeof useOpenReportSubmitToPopover> | undefined;
        mockedUseSelectionModeReportActions.mockImplementation(() => {
            openFromBulkSubmit = useOpenReportSubmitToPopover();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the toolbar only reads these fields on the path this test renders
            return {selectionModeReportLevelActions: [], allExpensesSelected: true} as unknown as ReturnType<typeof useSelectionModeReportActions>;
        });

        render(
            <SelectionToolbar
                reportID={REPORT_ID}
                transactions={[]}
                reportActions={[]}
            />,
        );

        // When bulk Submit asks to open the submit-to popover
        openFromBulkSubmit?.();

        // Then the popover opens, rather than the click falling through to the no-op default with no provider above the toolbar
        expect(openReportSubmitToPopover).toHaveBeenCalledTimes(1);
    });
});
