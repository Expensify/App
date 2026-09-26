import {act, render, waitFor} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import type Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import {setHasRadio} from '@libs/NetworkState';

import {ActionListContext} from '@pages/inbox/ActionListContext';
import {ReactionListContext} from '@pages/inbox/ReactionListContext';
import ReportActionsList from '@pages/inbox/report/ReportActionsList';
import {AttachmentModalContextProvider} from '@pages/media/AttachmentModalScreen/AttachmentModalContext';

import ComposeProviders from '@src/components/ComposeProviders';
import {LocaleContextProvider} from '@src/components/LocaleContextProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';

import type {RefObject} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import * as ReportTestUtils from '../utils/ReportTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const THRESHOLD = CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD;

type ScrollEvent = {
    nativeEvent: {
        contentOffset: {x: number; y: number};
        contentSize: {height: number; width: number};
        layoutMeasurement: {height: number; width: number};
    };
};
type CapturedListProps = {
    onScroll?: (event: ScrollEvent) => void;
};

let capturedListProps: CapturedListProps = {};
jest.mock('@hooks/useUnreadMarker', () => jest.fn(() => ({unreadMarkerReportActionID: null})));
jest.mock('@hooks/useMarkAsRead', () => jest.fn(() => ({markNewestActionAsRead: jest.fn(), completeSkippedMarkAsRead: jest.fn()})));
const mockUseUnreadMarker: jest.Mock = jest.requireMock('@hooks/useUnreadMarker');
const mockUseMarkAsRead: jest.Mock = jest.requireMock('@hooks/useMarkAsRead');

jest.mock('@legendapp/list/react-native', () => {
    const {forwardRef} = jest.requireActual<typeof React>('react');
    return {
        // The second parameter is intentionally unused; forwardRef requires it to avoid a React development warning.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        LegendList: forwardRef<unknown, CapturedListProps>((props, ref) => {
            capturedListProps = props;
            return null;
        }),
    };
});

function createScrollEvent(distanceFromBottom: number): ScrollEvent {
    const contentHeight = 1000;
    const viewportHeight = 500;
    return {
        nativeEvent: {
            contentOffset: {x: 0, y: contentHeight - viewportHeight - distanceFromBottom},
            contentSize: {height: contentHeight, width: 300},
            layoutMeasurement: {height: viewportHeight, width: 300},
        },
    };
}

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useRoute: () => ({params: {}}),
        useIsFocused: () => true,
    };
});

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    }),
);

const TEST_USER_ACCOUNT_ID = 1;
const TEST_USER_LOGIN = 'test@test.com';
const REPORT_ID = '1';

const mockReactionListContextValue = {
    showReactionList: () => {},
    hideReactionList: () => {},
    isActiveReportAction: () => false,
};

const sortedReportActions = ReportTestUtils.getMockedSortedReportActions(10);
const reportActions: ReportActions = Object.fromEntries(sortedReportActions.map((action: ReportAction) => [action.reportActionID, action]));
const report = ReportTestUtils.createMockReport({reportID: REPORT_ID, lastVisibleActionCreated: sortedReportActions.at(0)?.created});

// Built via a function so the value isn't an inline literal the context-split lint rule would flag.
function buildActionListContextValue(initialOffset: number) {
    const scrollOffsetRef: RefObject<number> = {current: initialOffset};
    return {scrollOffsetRef, getScrollOffset: () => scrollOffsetRef.current, registerListRef: () => {}, getListRef: () => null};
}

async function renderList(initialOffset: number) {
    const actionListContextValue = buildActionListContextValue(initialOffset);
    const utils = render(
        <NavigationContainer ref={navigationRef}>
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, AttachmentModalContextProvider]}>
                <ReactionListContext.Provider value={mockReactionListContextValue}>
                    <ActionListContext.Provider value={actionListContextValue}>
                        <ReportActionsList
                            reportID={REPORT_ID}
                            conciergeChat={undefined}
                        />
                    </ActionListContext.Provider>
                </ReactionListContext.Provider>
            </ComposeProviders>
        </NavigationContainer>,
    );
    await waitFor(() => expect(capturedListProps.onScroll).toBeDefined());
    return utils;
}

beforeEach(async () => {
    capturedListProps = {};
    mockUseUnreadMarker.mockClear();
    mockUseMarkAsRead.mockClear();
    setHasRadio(true);
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    await act(async () => {
        TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
        await Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, reportActions);
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${REPORT_ID}`, {
            isLoadingInitialReportActions: false,
            hasOnceLoadedReportActions: true,
            isLoadingOlderReportActions: false,
            hasLoadingOlderReportActionsError: false,
            isLoadingNewerReportActions: false,
            hasLoadingNewerReportActionsError: false,
        });
        await waitForBatchedUpdates();
    });
});

afterEach(async () => {
    await Onyx.clear();
    await waitForBatchedUpdates();
});

describe('ReportActionsList visible-action threshold', () => {
    it('seeds unread marker and mark-as-read state from a saved offset past the threshold', async () => {
        // Given a report restored away from the newest action.
        await renderList(THRESHOLD + 50);

        // Then neither consumer treats the report as scrolled to the end before onScroll fires.
        expect(mockUseUnreadMarker).toHaveBeenLastCalledWith(expect.objectContaining({isScrolledOverThreshold: true}));
        expect(mockUseMarkAsRead).toHaveBeenLastCalledWith(expect.objectContaining({isScrolledToEnd: false}));
    });

    it('seeds both consumers as being at the newest action when the saved offset is zero', async () => {
        // Given a report restored at its newest action.
        await renderList(0);

        // Then both consumers receive the bottom state immediately.
        expect(mockUseUnreadMarker).toHaveBeenLastCalledWith(expect.objectContaining({isScrolledOverThreshold: false}));
        expect(mockUseMarkAsRead).toHaveBeenLastCalledWith(expect.objectContaining({isScrolledToEnd: true}));
    });

    it('updates both consumers when scrolling across the threshold', async () => {
        // Given a report initially at the newest action.
        await renderList(0);

        // When the reader scrolls away from the newest action.
        act(() => {
            capturedListProps.onScroll?.(createScrollEvent(THRESHOLD + 50));
        });
        // Then the unread marker sees the reader as away and mark-as-read pauses.
        expect(mockUseUnreadMarker).toHaveBeenLastCalledWith(expect.objectContaining({isScrolledOverThreshold: true}));
        expect(mockUseMarkAsRead).toHaveBeenLastCalledWith(expect.objectContaining({isScrolledToEnd: false}));

        // When the reader returns to the newest action.
        act(() => {
            capturedListProps.onScroll?.(createScrollEvent(0));
        });
        // Then both consumers see the bottom state again.
        expect(mockUseUnreadMarker).toHaveBeenLastCalledWith(expect.objectContaining({isScrolledOverThreshold: false}));
        expect(mockUseMarkAsRead).toHaveBeenLastCalledWith(expect.objectContaining({isScrolledToEnd: true}));
    });
});
