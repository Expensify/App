import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import ComposeProviders from '@components/ComposeProviders';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import ReportFooter from '@pages/inbox/report/ReportFooter';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@react-navigation/native', () => ({
    // Minimal stubs used during module initialization in the app's Navigation layer
    createNavigationContainerRef: () => ({current: null}),
    findFocusedRoute: () => undefined,
    useRoute: () => ({params: {reportID: '1'}}),
}));

jest.mock('@hooks/useIsAnonymousUser', () => ({
    __esModule: true,
    default: () => false,
}));

jest.mock('@hooks/useIsReportReadyToDisplay', () => ({
    __esModule: true,
    default: () => ({isCurrentReportLoadedFromOnyx: true}),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    // Simulate a narrow layout (e.g. a side panel thread on desktop)
    default: () => ({isSmallScreenWidth: true, shouldUseNarrowLayout: true}),
}));

jest.mock('@hooks/useReportIsArchived', () => ({
    __esModule: true,
    default: () => false,
}));

jest.mock('@selectors/BlockedFromChat', () => ({
    isBlockedFromChatSelector: () => false,
}));

jest.mock('@libs/ReportUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module object
    const actual = jest.requireActual('@libs/ReportUtils');
    return {
        ...actual,
        canUserPerformWriteAction: () => true,
        canWriteInReport: () => true,
        isAdminsOnlyPostingRoom: () => false,
        isArchivedNonExpenseReport: () => false,
        isPublicRoom: () => false,
        isSystemChat: () => false,
    };
});

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({Lightbulb: {}}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: () => ''}),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({
        chatFooter: {},
        chatFooterFullCompose: {},
        chatFooterBanner: {},
        chatItemComposeSecondaryRow: {},
        offlineIndicatorContainer: {},
        mt4: {},
        mb5: {},
    }),
}));

jest.mock('@components/SwipeableView', () => {
    function SwipeableViewMock({children}: {children: React.ReactNode}) {
        return <>{children}</>;
    }
    SwipeableViewMock.displayName = 'SwipeableView';
    return SwipeableViewMock;
});

jest.mock('@pages/inbox/report/ReportActionCompose/ReportActionCompose', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- jest.requireActual returns an untyped module object
    const {Text} = jest.requireActual('react-native');
    function ReportActionComposeMock() {
        return <Text testID="report-action-compose">compose</Text>;
    }
    ReportActionComposeMock.displayName = 'ReportActionCompose';
    return ReportActionComposeMock;
});

describe('ReportFooter', () => {
    beforeEach(async () => {
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });
    });

    it('should render the composer in narrow layouts by default', async () => {
        const report: Report = {reportID: '1'} as Report;
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}1`, report);
            await waitForBatchedUpdates();
        });

        render(
            <ComposeProviders components={[OnyxListItemProvider]}>
                <ReportFooter />
            </ComposeProviders>,
        );
        await act(async () => {
            await waitForBatchedUpdates();
        });

        expect(screen.getByTestId('report-action-compose')).toBeOnTheScreen();
    });
});
