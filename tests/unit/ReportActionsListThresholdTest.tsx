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
    maintainVisibleContentPosition?: boolean | {data: boolean};
    onScroll?: (event: ScrollEvent) => void;
};

// Capture the props the list is rendered with so we can verify data anchoring remains enabled while the
// list crosses the visible-action threshold.
let capturedListProps: CapturedListProps = {};

// Whether the captured LegendList configuration enables data-based maintain-visible-content-position.
function isMvcpEnabled() {
    const config = capturedListProps.maintainVisibleContentPosition;
    return typeof config === 'object' && config.data;
}

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
    await waitFor(() => expect(capturedListProps.maintainVisibleContentPosition).toBeDefined());
    return utils;
}

beforeEach(async () => {
    capturedListProps = {};
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

describe('ReportActionsList maintainVisibleContentPosition', () => {
    it('enables data anchoring on first render when mounted while scrolled past the threshold', async () => {
        await renderList(THRESHOLD + 50);

        expect(isMvcpEnabled()).toBe(true);
    });

    it('enables data anchoring at the bottom so initial hydration preserves the visible tail', async () => {
        await renderList(0);

        expect(isMvcpEnabled()).toBe(true);
    });

    it('keeps data anchoring enabled as the user scrolls across the threshold', async () => {
        await renderList(0);
        expect(isMvcpEnabled()).toBe(true);

        act(() => {
            capturedListProps.onScroll?.(createScrollEvent(THRESHOLD + 50));
        });
        expect(isMvcpEnabled()).toBe(true);

        act(() => {
            capturedListProps.onScroll?.(createScrollEvent(0));
        });
        expect(isMvcpEnabled()).toBe(true);
    });
});
