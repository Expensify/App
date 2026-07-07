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

type ScrollEvent = {nativeEvent: {contentOffset: {y: number}}};
type CapturedListProps = {
    shouldMaintainVisibleContentPosition?: boolean;
    onScroll?: (event: ScrollEvent) => void;
};

// Capture the props the list is rendered with so we can observe `shouldMaintainVisibleContentPosition`,
// which is `hasScrolledOverThreshold || shouldFocusToTopOnMount`. With no deep-link the latter is false,
// so the prop mirrors the boolean under test.
let capturedListProps: CapturedListProps = {};
// Every value `shouldMaintainVisibleContentPosition` has held, in render order. `[0]` is the value on the
// list's very first render — the property that matters, since the boolean must be right before any effect runs.
let mockMvcpHistory: Array<boolean | undefined> = [];
jest.mock('@components/FlashList/InvertedFlashList', () => {
    const {forwardRef} = jest.requireActual<typeof React>('react');
    return {
        __esModule: true,
        default: forwardRef<unknown, CapturedListProps>((props) => {
            capturedListProps = props;
            mockMvcpHistory.push(props.shouldMaintainVisibleContentPosition);
            return null;
        }),
    };
});

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
                        <ReportActionsList reportID={REPORT_ID} />
                    </ActionListContext.Provider>
                </ReactionListContext.Provider>
            </ComposeProviders>
        </NavigationContainer>,
    );
    await waitFor(() => expect(capturedListProps.shouldMaintainVisibleContentPosition).toBeDefined());
    return utils;
}

beforeEach(async () => {
    capturedListProps = {};
    mockMvcpHistory = [];
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

describe('ReportActionsList hasScrolledOverThreshold', () => {
    it('enables maintainVisibleContentPosition on first render when mounted while scrolled past the threshold', async () => {
        await renderList(THRESHOLD + 50);

        // Must be true on the FIRST render, not merely after an effect settles — deferring this to an effect
        // would let the mount-time mark-as-read path observe a wrong `isScrolledToEnd`.
        expect(mockMvcpHistory.at(0)).toBe(true);
        expect(capturedListProps.shouldMaintainVisibleContentPosition).toBe(true);
    });

    it('leaves maintainVisibleContentPosition off on first render when mounted at the bottom (offset below threshold)', async () => {
        await renderList(0);

        expect(capturedListProps.shouldMaintainVisibleContentPosition).toBe(false);
    });

    it('flips the flag as the user scrolls across the threshold', async () => {
        await renderList(0);
        expect(capturedListProps.shouldMaintainVisibleContentPosition).toBe(false);

        act(() => {
            capturedListProps.onScroll?.({nativeEvent: {contentOffset: {y: THRESHOLD + 50}}});
        });
        expect(capturedListProps.shouldMaintainVisibleContentPosition).toBe(true);

        act(() => {
            capturedListProps.onScroll?.({nativeEvent: {contentOffset: {y: 0}}});
        });
        expect(capturedListProps.shouldMaintainVisibleContentPosition).toBe(false);
    });
});
