import {render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';
import {createAdminRoom, createAnnounceRoom} from '../utils/collections/reports';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Capture props passed to ReportActionAvatars
let mockCapturedAvatarProps: Record<string, unknown> = {};

jest.mock('@components/ReportActionAvatars', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedAvatarProps = props;
        return <View testID="MockedReportActionAvatars" />;
    };
});

// Mock the AgentZero context to make isProcessing=true so the component renders
jest.mock('@pages/inbox/AgentZeroStatusContext', () => ({
    useAgentZeroStatus: () => ({
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
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return () => <View testID="MockedSender" />;
});

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const ConciergeThinkingMessage = require('@pages/home/report/ConciergeThinkingMessage').default;

const conciergeAccountID = CONST.ACCOUNT_ID.CONCIERGE;
const conciergeAvatarURL = 'https://d2k5nsl2zxldvw.cloudfront.net/images/icons/concierge_2022.png';
const adminPolicyID = '7777';
const adminRoomReportID = 9001;
const announceRoomReportID = 9003;

const mockAdminRoom = {...createAdminRoom(adminRoomReportID), policyID: adminPolicyID};
const mockAnnounceRoom = {...createAnnounceRoom(announceRoomReportID), policyID: adminPolicyID};

const conciergePersonalDetails: PersonalDetailsList = {
    [conciergeAccountID]: {
        accountID: conciergeAccountID,
        displayName: 'Concierge',
        login: 'concierge@expensify.com',
        avatar: conciergeAvatarURL,
    },
};

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});

beforeEach(async () => {
    mockCapturedAvatarProps = {};
    await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, conciergePersonalDetails);
    await waitForBatchedUpdates();
});

afterEach(() => {
    Onyx.clear();
});

describe('ConciergeThinkingMessage avatar prop integration', () => {
    test('should pass accountIDs=[CONCIERGE] to ReportActionAvatars in admin room', () => {
        render(<ConciergeThinkingMessage report={mockAdminRoom} />);

        expect(mockCapturedAvatarProps.accountIDs).toEqual([conciergeAccountID]);
    });

    test('should pass accountIDs=[CONCIERGE] to ReportActionAvatars in announce room', () => {
        render(<ConciergeThinkingMessage report={mockAnnounceRoom} />);

        expect(mockCapturedAvatarProps.accountIDs).toEqual([conciergeAccountID]);
    });

    test('should pass exactly CONCIERGE account ID, not an empty array', () => {
        render(<ConciergeThinkingMessage report={mockAdminRoom} />);

        expect(mockCapturedAvatarProps.accountIDs).toBeDefined();
        expect((mockCapturedAvatarProps.accountIDs as number[]).length).toBe(1);
        expect((mockCapturedAvatarProps.accountIDs as number[]).at(0)).toBe(conciergeAccountID);
    });

    test('should not pass policyID to ReportActionAvatars (would force workspace avatar)', () => {
        render(<ConciergeThinkingMessage report={mockAdminRoom} />);

        expect(mockCapturedAvatarProps.policyID).toBeUndefined();
    });
});
