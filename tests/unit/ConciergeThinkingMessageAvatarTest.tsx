import {render, screen} from '@testing-library/react-native';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import {createAdminRoom, createAnnounceRoom} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Capture props passed to ReportActionAvatars (only rendered for non-Concierge agents).
let mockCapturedAvatarProps: Record<string, unknown> = {};

jest.mock('@components/ReportActionAvatars', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedAvatarProps = props;
        return <View testID="MockedReportActionAvatars" />;
    };
});

// Concierge renders a branded Lottie animation instead of ReportActionAvatars; stub it so the test
// doesn't pull in Lottie and so we can assert it rendered.
jest.mock('@pages/home/report/ConciergeAnimatedAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return () => <View testID="MockedConciergeAnimatedAvatar" />;
});

// The candidate agent set the room is processing for. Mutable so individual tests can switch between
// Concierge and a custom agent. `mock` prefix lets jest's hoist plugin reference it from the factory.
const conciergeAccountID = CONST.ACCOUNT_ID.CONCIERGE;
const customAgentAccountID = 424242;
let mockCandidateAgentIDs: number[] = [conciergeAccountID];

// Mock the AgentZero context to render one bubble per candidate agent.
jest.mock('@pages/inbox/AgentZeroStatusContext', () => ({
    useAgentZeroStatus: () => ({
        candidateAgentIDs: mockCandidateAgentIDs,
    }),
}));

// Mock the per-agent indicator hook so the bubble is in the processing state and renders.
jest.mock('@hooks/useAgentZeroStatusIndicator', () => ({
    __esModule: true,
    default: () => ({
        isProcessing: true,
        reasoningHistory: [],
        statusLabel: 'Thinking...',
    }),
}));

// Mock useShouldSuppressConciergeIndicators to return false (don't suppress)
jest.mock('@hooks/useShouldSuppressConciergeIndicators', () => jest.fn(() => false));

// Suppress reanimated/lazy-asset warnings in test
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({UpArrow: 'UpArrow', DownArrow: 'DownArrow'}),
}));

// Avoid loading the full ReportActionItemMessageHeaderSender
jest.mock('@pages/inbox/report/ReportActionItemMessageHeaderSender', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return () => <View testID="MockedSender" />;
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const ConciergeThinkingMessage = require('@pages/home/report/ConciergeThinkingMessage').default;

const conciergeAvatarURL = 'https://d2k5nsl2zxldvw.cloudfront.net/images/icons/concierge_2022.png';
const adminPolicyID = '7777';
const adminRoomReportID = 9001;
const announceRoomReportID = 9003;

const mockAdminRoom = {...createAdminRoom(adminRoomReportID), policyID: adminPolicyID};
const mockAnnounceRoom = {...createAnnounceRoom(announceRoomReportID), policyID: adminPolicyID};

const personalDetails: PersonalDetailsList = {
    [conciergeAccountID]: {
        accountID: conciergeAccountID,
        displayName: 'Concierge',
        login: 'concierge@expensify.com',
        avatar: conciergeAvatarURL,
    },
    [customAgentAccountID]: {
        accountID: customAgentAccountID,
        displayName: 'Custom Agent',
        login: 'agent@expensify.com',
    },
};

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

beforeEach(async () => {
    mockCapturedAvatarProps = {};
    mockCandidateAgentIDs = [conciergeAccountID];
    await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);
    await waitForBatchedUpdates();
});

afterEach(() => {
    Onyx.clear();
});

describe('ConciergeThinkingMessage avatar prop integration', () => {
    describe('Concierge bubble', () => {
        test('should render the animated avatar (not ReportActionAvatars) in admin room', () => {
            render(<ConciergeThinkingMessage reportID={mockAdminRoom.reportID} />);

            expect(screen.getByTestId('MockedConciergeAnimatedAvatar')).toBeTruthy();
            expect(screen.queryByTestId('MockedReportActionAvatars')).toBeNull();
        });

        test('should render the animated avatar (not ReportActionAvatars) in announce room', () => {
            render(<ConciergeThinkingMessage reportID={mockAnnounceRoom.reportID} />);

            expect(screen.getByTestId('MockedConciergeAnimatedAvatar')).toBeTruthy();
            expect(screen.queryByTestId('MockedReportActionAvatars')).toBeNull();
        });
    });

    describe('Custom agent bubble', () => {
        beforeEach(() => {
            mockCandidateAgentIDs = [customAgentAccountID];
        });

        test('should render ReportActionAvatars (not the Concierge animation)', () => {
            render(<ConciergeThinkingMessage reportID={mockAdminRoom.reportID} />);

            expect(screen.getByTestId('MockedReportActionAvatars')).toBeTruthy();
            expect(screen.queryByTestId('MockedConciergeAnimatedAvatar')).toBeNull();
        });

        test('should pass accountIDs=[agentAccountID] to ReportActionAvatars', () => {
            render(<ConciergeThinkingMessage reportID={mockAdminRoom.reportID} />);

            expect(mockCapturedAvatarProps.accountIDs).toEqual([customAgentAccountID]);
        });

        test('should pass exactly the agent account ID, not an empty array', () => {
            render(<ConciergeThinkingMessage reportID={mockAdminRoom.reportID} />);

            expect(mockCapturedAvatarProps.accountIDs).toBeDefined();
            expect((mockCapturedAvatarProps.accountIDs as number[]).length).toBe(1);
            expect((mockCapturedAvatarProps.accountIDs as number[]).at(0)).toBe(customAgentAccountID);
        });

        test('should not pass policyID to ReportActionAvatars (would force workspace avatar)', () => {
            render(<ConciergeThinkingMessage reportID={mockAdminRoom.reportID} />);

            expect(mockCapturedAvatarProps.policyID).toBeUndefined();
        });

        test('should not pass reportID/chatReportID to ReportActionAvatars (report context would override the agent avatar with the report-preview sender)', () => {
            render(<ConciergeThinkingMessage reportID={mockAdminRoom.reportID} />);

            expect(mockCapturedAvatarProps.reportID).toBeUndefined();
            expect(mockCapturedAvatarProps.chatReportID).toBeUndefined();
        });
    });
});
