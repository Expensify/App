import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import ReportActionItemThread from '@pages/inbox/report/ReportActionItemThread';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../utils/collections/reportActions';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const AGENT_ACCOUNT_ID = 9001;
const FIRST_COMMENTER_ACCOUNT_ID = 111;
const SECOND_COMMENTER_ACCOUNT_ID = 222;

// Captures the account IDs handed to the avatar stack, which is what decides whose avatars the thread row shows.
let mockCapturedAccountIDs: number[] | undefined;

jest.mock('@components/Avatar/connected/MultiAccountAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return ({accountIDs}: {accountIDs: number[]}) => {
        mockCapturedAccountIDs = accountIDs;
        return <View testID="MockedMultiAccountAvatar" />;
    };
});

function buildReportAction(childOldestFourAccountIDs: string | undefined): ReportAction {
    return {
        ...createRandomReportAction(1),
        childReportID: '2',
        childVisibleActionCount: 0,
        childOldestFourAccountIDs,
    };
}

function renderThread(reportAction: ReportAction, processingAgentIDs?: number[]) {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ReportActionItemThread
                report={undefined}
                reportAction={reportAction}
                isHovered={false}
                onSecondaryInteraction={jest.fn()}
                isEditingInline={false}
                processingAgentIDs={processingAgentIDs}
            />
        </ComposeProviders>,
    );
}

describe('ReportActionItemThread', () => {
    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    beforeEach(() => {
        mockCapturedAccountIDs = undefined;
    });

    it.each([
        ['an empty string', ''],
        ['missing', undefined],
    ])('should show the processing agent when the oldest participants list is %s', async (_case, childOldestFourAccountIDs) => {
        // Given a thread with no replies yet, where an agent is still working on its reply
        // When the thread row renders
        renderThread(buildReportAction(childOldestFourAccountIDs), [AGENT_ACCOUNT_ID]);
        await waitForBatchedUpdatesWithAct();

        // Then the agent's avatar is shown, instead of a placeholder for the empty participants list
        expect(mockCapturedAccountIDs).toEqual([AGENT_ACCOUNT_ID]);
    });

    it('should keep showing the existing participants while an agent is processing', async () => {
        // Given a thread that already has replies, where an agent is still working on its reply
        // When the thread row renders
        renderThread(buildReportAction(`${FIRST_COMMENTER_ACCOUNT_ID},${SECOND_COMMENTER_ACCOUNT_ID}`), [AGENT_ACCOUNT_ID]);
        await waitForBatchedUpdatesWithAct();

        // Then the existing participants still take priority over the processing agent
        expect(mockCapturedAccountIDs).toEqual([FIRST_COMMENTER_ACCOUNT_ID, SECOND_COMMENTER_ACCOUNT_ID]);
    });

    it('should not pass placeholder account IDs when no agent is processing', async () => {
        // Given a thread with no replies yet and no agent processing
        // When the thread row renders
        renderThread(buildReportAction(''));
        await waitForBatchedUpdatesWithAct();

        // Then no account IDs are passed, so the avatar stack draws its own single placeholder
        expect(mockCapturedAccountIDs).toEqual([]);
    });
});
