import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {SearchQueryContext} from '@components/Search/SearchContextDefinitions';
import {SearchScopeProvider} from '@components/Search/SearchScopeProvider';

import {createTransactionThreadReport} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';

import ChatTransactionPreview from '@pages/inbox/report/actionContents/ChatTransactionPreview';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import React, {useContext, useMemo} from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ReportActionItem/TransactionPreview', () => {
    const {Pressable, Text} = jest.requireActual<Record<string, React.FC<Record<string, unknown>>>>('react-native');
    function MockTransactionPreview({onPreviewPressed}: {onPreviewPressed: () => void}) {
        return (
            <Pressable
                accessibilityRole="button"
                onPress={onPreviewPressed}
            >
                <Text>Transaction preview</Text>
            </Pressable>
        );
    }
    return MockTransactionPreview;
});

jest.mock('@libs/actions/Report', () => {
    const actual = jest.requireActual<Record<string, unknown>>('@libs/actions/Report');
    return {
        ...actual,
        createTransactionThreadReport: jest.fn(),
    };
});

const mockActiveRoute = jest.fn(() => '');
jest.mock('@libs/Navigation/helpers/getActiveRoute', () => ({__esModule: true, default: () => mockActiveRoute()}));

const POLICY_ID = 'policy1';
const POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}` as const;
const FULL_POLICY_SNAPSHOT_KEY = `${ONYXKEYS.COLLECTION.RAM_ONLY_FULL_POLICY_SNAPSHOT}${POLICY_ID}` as const;
const SEARCH_HASH = 123;
const LIVE_FULL_POLICY_SNAPSHOT_LAST_MODIFIED = 1700000000000000;

const iouReport = {reportID: 'iou1', policyID: POLICY_ID, type: CONST.REPORT.TYPE.EXPENSE} as Report;
const iouAction = {
    reportActionID: 'action1',
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    created: '2026-10-20 00:00:00.000',
    originalMessage: {IOUReportID: 'iou1', IOUTransactionID: 'transaction1', type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, amount: 100, currency: 'USD'},
} as ReportAction;

const splitAction = {
    reportActionID: 'split1',
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    created: '2026-10-20 00:00:00.000',
} as ReportAction;
const SEARCH_CHAT_QUERY = `q=${encodeURIComponent('type:chat')}`;

/** Points snapshot-aware Onyx reads at the test's Search snapshot, the way the Search page does for its rows */
function SearchSnapshotQueryProvider({children}: ChildrenProps) {
    const searchQueryContext = useContext(SearchQueryContext);
    const snapshotSearchQueryContext = useMemo(() => ({...searchQueryContext, currentSearchHash: SEARCH_HASH}), [searchQueryContext]);
    return <SearchQueryContext.Provider value={snapshotSearchQueryContext}>{children}</SearchQueryContext.Provider>;
}

describe('ChatTransactionPreview', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    it('sends the full policy snapshot marker when creating a thread from a Search snapshot row', async () => {
        // Given the policy has a full policy snapshot marker, while the Search snapshot holds the policy and no marker,
        // because only OpenReport writes the marker and Search results never carry it
        await Onyx.merge(FULL_POLICY_SNAPSHOT_KEY, {lastModified: LIVE_FULL_POLICY_SNAPSHOT_LAST_MODIFIED});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.SNAPSHOT}${SEARCH_HASH}`, {data: {[POLICY_KEY]: {...createRandomPolicy(1), id: POLICY_ID}}});

        // When a legacy expense preview without a thread is pressed inside Search, where Onyx reads resolve from the snapshot
        render(
            <ComposeProviders components={[OnyxListItemProvider]}>
                <SearchScopeProvider>
                    <SearchSnapshotQueryProvider>
                        <ChatTransactionPreview
                            action={iouAction}
                            reportID="chat1"
                            chatReport={undefined}
                            iouReport={iouReport}
                            shouldShowSplitPreview={false}
                            transactionID="transaction1"
                        />
                    </SearchSnapshotQueryProvider>
                </SearchScopeProvider>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Transaction preview'));
        await waitForBatchedUpdatesWithAct();

        // Then the thread is created with the marker, so OpenReport can skip the large policy collections
        expect(createTransactionThreadReport).toHaveBeenCalledWith(expect.objectContaining({fullPolicySnapshotLastModified: LIVE_FULL_POLICY_SNAPSHOT_LAST_MODIFIED}));
    });

    it('opens split details with the chat reportID when pressed from a Search row', async () => {
        // Given a split preview rendered in a Type: Chat search row, where the active route is the Search root with no reportID
        mockActiveRoute.mockReturnValue(`search?${SEARCH_CHAT_QUERY}`);
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

        // When the preview card is pressed, which handles the press before the search row can
        render(
            <ComposeProviders components={[OnyxListItemProvider]}>
                <SearchScopeProvider>
                    <ChatTransactionPreview
                        action={splitAction}
                        reportID="chat1"
                        chatReport={undefined}
                        iouReport={undefined}
                        shouldShowSplitPreview
                        transactionID="transaction1"
                    />
                </SearchScopeProvider>
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Transaction preview'));

        // Then split details opens on top of Search with the chat reportID, so it is not the full screen not-found page
        expect(navigateSpy).toHaveBeenCalledWith(`search/split/split1?${SEARCH_CHAT_QUERY}&reportID=chat1`);
    });

    it('keeps the split details route unchanged when pressed inside a chat', async () => {
        // Given a split preview rendered in the chat itself, whose route already carries the reportID
        mockActiveRoute.mockReturnValue('r/chat1');
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});

        // When the preview is pressed outside the Search list, where the chat route is already a valid base
        render(
            <ComposeProviders components={[OnyxListItemProvider]}>
                <ChatTransactionPreview
                    action={splitAction}
                    reportID="chat1"
                    chatReport={undefined}
                    iouReport={undefined}
                    shouldShowSplitPreview
                    transactionID="transaction1"
                />
            </ComposeProviders>,
        );
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('Transaction preview'));

        // Then the suffix is appended to the chat route without a reportID query, as before the fix
        expect(navigateSpy).toHaveBeenCalledWith('r/chat1/split/split1');
    });
});
