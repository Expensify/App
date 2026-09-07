import {render, screen} from '@testing-library/react-native';

import ChatThreadAvatar from '@components/Avatar/connected/ChatThreadAvatar';

import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report, ReportAction} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import React from 'react';

const THREAD_ID = 'thread123';
const PARENT_REPORT_ID = 'parentReport456';
const PARENT_ACTION_ID = 'parentAction789';
const FALLBACK_NAME = 'Fallback Name';
const CONTAINER_STYLE = [{marginRight: 12}];
const SUBSCRIPT_CONTAINER_STYLE = {marginRight: 0};
const HUMAN_SUPPORT_AGENT_KEY = 'reportAction.humanSupportAgent';

const ACTOR_ACCOUNT_ID = 42;
const ACTOR_LOGIN = 'john@example.com';
const ACTOR_AVATAR_URL = 'https://example.com/actor-avatar.png';
const DELEGATE_ACCOUNT_ID = 7;
const DELEGATE_AVATAR_URL = 'https://example.com/delegate-avatar.png';
const AGENT_ACCOUNT_ID = 9;
const AGENT_AVATAR_URL = 'https://example.com/agent-avatar.png';

// Stands in for the bundled fallback SVG so a resolved account icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

// Capture the props handed to each layout primitive: the routing and the icons are this component's whole contract.
let mockCapturedWorkspaceSubscriptAvatarProps: Record<string, unknown> = {};
let mockCapturedSubscriptAvatarProps: Record<string, unknown> = {};
let mockCapturedSingleAvatarProps: Record<string, unknown> = {};

const mockGetContainerStyles = jest.fn((size: string) => [{marginRight: 12, size}]);

// The component reads three Onyx rows. Serving them from a map keeps the test free of Onyx setup, seeding and clearing.
let mockOnyxData: Record<string, unknown> = {};

// Same shape as InboxTabButtonTest: the mocked module is the hook itself, reading the map lazily on every call.
jest.mock('@hooks/useOnyx', () => (key: string, options?: {selector?: (value: unknown) => unknown}) => {
    const value = mockOnyxData[key];
    return [options?.selector ? options.selector(value) : value, {status: 'loaded'}];
});

jest.mock('@hooks/useStyleUtils', () => jest.fn(() => ({getContainerStyles: mockGetContainerStyles})));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        ConciergeAvatar: MockFallbackAvatar,
        NotificationsAvatar: MockFallbackAvatar,
        FallbackAvatar: MockFallbackAvatar,
    }),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        formatPhoneNumber: (phoneNumber: string) => phoneNumber,
        translate: (key: string) => key,
    })),
);

let mockPersonalDetails: PersonalDetailsList = {};

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => mockPersonalDetails,
}));

jest.mock('@components/Avatar/connected/WorkspaceSubscriptAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedWorkspaceSubscriptAvatarProps = props;
        return <View testID="MockedWorkspaceSubscriptAvatar" />;
    };
});

jest.mock('@components/Avatar/layouts/SubscriptAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedSubscriptAvatarProps = props;
        return <View testID="MockedSubscriptAvatar" />;
    };
});

jest.mock('@components/Avatar/layouts/SingleAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedSingleAvatarProps = props;
        return <View testID="MockedSingleAvatar" />;
    };
});

const thread: Report = {
    reportID: THREAD_ID,
    type: CONST.REPORT.TYPE.CHAT,
    parentReportID: PARENT_REPORT_ID,
    parentReportActionID: PARENT_ACTION_ID,
};

const createIOUAction = (type: ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>, hasIOUDetails = false): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => ({
    reportActionID: PARENT_ACTION_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    actorAccountID: ACTOR_ACCOUNT_ID,
    created: '2024-01-01 00:00:00',
    originalMessage: {
        type,
        IOUTransactionID: 'transaction123',
        amount: 100,
        currency: CONST.CURRENCY.USD,
        ...(hasIOUDetails ? {IOUDetails: {amount: 100, currency: CONST.CURRENCY.USD, comment: ''}} : {}),
    },
});

const createCommentAction = (overrides: Partial<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT>> = {}): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT> => ({
    reportActionID: PARENT_ACTION_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    actorAccountID: ACTOR_ACCOUNT_ID,
    created: '2024-01-01 00:00:00',
    message: [{type: 'COMMENT', html: 'Hello', text: 'Hello'}],
    ...overrides,
});

const tripPreviewAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW> = {
    reportActionID: PARENT_ACTION_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW,
    actorAccountID: ACTOR_ACCOUNT_ID,
    created: '2024-01-01 00:00:00',
    originalMessage: {linkedReportID: THREAD_ID},
};

const harvestedSubmitAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED> = {
    reportActionID: PARENT_ACTION_ID,
    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
    actorAccountID: ACTOR_ACCOUNT_ID,
    created: '2024-01-01 00:00:00',
    originalMessage: {amount: 100, currency: CONST.CURRENCY.USD, harvesting: true},
};

/** Serves the thread row, its parent row and the parent's actions from the map, so a test only declares what exists. */
const seedThread = (parentType: ValueOf<typeof CONST.REPORT.TYPE> | undefined, parentAction: ReportAction | undefined, threadOverrides: Partial<Report> = {}) => {
    mockOnyxData = {
        [`${ONYXKEYS.COLLECTION.REPORT}${THREAD_ID}`]: {...thread, ...threadOverrides},
        ...(parentType ? {[`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`]: {reportID: PARENT_REPORT_ID, type: parentType}} : {}),
        ...(parentAction ? {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`]: {[PARENT_ACTION_ID]: parentAction}} : {}),
    };
};

describe('ChatThreadAvatar (connected)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedWorkspaceSubscriptAvatarProps = {};
        mockCapturedSubscriptAvatarProps = {};
        mockCapturedSingleAvatarProps = {};
        mockOnyxData = {};
        mockPersonalDetails = {
            [ACTOR_ACCOUNT_ID]: {accountID: ACTOR_ACCOUNT_ID, login: ACTOR_LOGIN, avatar: ACTOR_AVATAR_URL},
            [DELEGATE_ACCOUNT_ID]: {accountID: DELEGATE_ACCOUNT_ID, login: 'copilot@example.com', avatar: DELEGATE_AVATAR_URL},
            [AGENT_ACCOUNT_ID]: {accountID: AGENT_ACCOUNT_ID, login: 'agent@expensify.com', avatar: AGENT_AVATAR_URL, firstName: 'Agnes'},
        };
    });

    it.each([
        ['an expense report and a created expense', CONST.REPORT.TYPE.EXPENSE, createIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE), 'MockedWorkspaceSubscriptAvatar', {}],
        // A send-money PAY action carries IOUDetails, which `isTransactionThread` counts as a transaction.
        ['an expense report and a paid send-money action', CONST.REPORT.TYPE.EXPENSE, createIOUAction(CONST.IOU.REPORT_ACTION_TYPE.PAY, true), 'MockedWorkspaceSubscriptAvatar', {}],
        ['an IOU report and a created expense', CONST.REPORT.TYPE.IOU, createIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE), 'MockedSingleAvatar', {}],
        ['an expense report and a comment', CONST.REPORT.TYPE.EXPENSE, createCommentAction(), 'MockedSingleAvatar', {}],
        ['an expense report and a plain pay action', CONST.REPORT.TYPE.EXPENSE, createIOUAction(CONST.IOU.REPORT_ACTION_TYPE.PAY), 'MockedSingleAvatar', {}],
        ['a chat and a comment', CONST.REPORT.TYPE.CHAT, createCommentAction(), 'MockedSingleAvatar', {}],
        // A thread inherits its room's chat type, but only a trip room takes the workspace subscript.
        ['a policy room and a comment', CONST.REPORT.TYPE.CHAT, createCommentAction(), 'MockedSingleAvatar', {chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}],
        ['an admins room and a comment', CONST.REPORT.TYPE.CHAT, createCommentAction(), 'MockedSingleAvatar', {chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS}],
        ['a policy expense chat and a comment', CONST.REPORT.TYPE.CHAT, createCommentAction(), 'MockedSingleAvatar', {chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT}],
        ['a workspace chat and a trip preview', CONST.REPORT.TYPE.CHAT, tripPreviewAction, 'MockedWorkspaceSubscriptAvatar', {chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM}],
        ['an expense report whose parent action has not loaded', CONST.REPORT.TYPE.EXPENSE, undefined, 'MockedSingleAvatar', {}],
        ['a parent that has not loaded', undefined, undefined, 'MockedSingleAvatar', {}],
    ])('should route a thread under %s', (_case, parentType, parentAction, expectedTestID, threadOverrides: Partial<Report>) => {
        seedThread(parentType, parentAction, threadOverrides);

        render(
            <ChatThreadAvatar
                reportID={THREAD_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(screen.getByTestId(expectedTestID)).toBeOnTheScreen();
    });

    it('should hand an expense request the subscript props, its row and the resolved actor', () => {
        seedThread(CONST.REPORT.TYPE.EXPENSE, createIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE));

        render(
            <ChatThreadAvatar
                reportID={THREAD_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                backdropColor="#ff0000"
                containerStyle={CONTAINER_STYLE}
                subscriptContainerStyle={SUBSCRIPT_CONTAINER_STYLE}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        expect(mockCapturedWorkspaceSubscriptAvatarProps).toEqual({
            // The rows read here are handed over rather than subscribed to again
            report: expect.objectContaining({parentReportID: PARENT_REPORT_ID, parentReportActionID: PARENT_ACTION_ID}),
            primaryAvatar: expect.objectContaining({id: ACTOR_ACCOUNT_ID, source: ACTOR_AVATAR_URL}),
            size: CONST.AVATAR_SIZE.SMALL,
            backdropColor: '#ff0000',
            containerStyle: SUBSCRIPT_CONTAINER_STYLE,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it('should hand an expense request the copilot as the primary avatar when one created the expense', () => {
        seedThread(CONST.REPORT.TYPE.EXPENSE, {...createIOUAction(CONST.IOU.REPORT_ACTION_TYPE.CREATE), delegateAccountID: DELEGATE_ACCOUNT_ID});

        render(
            <ChatThreadAvatar
                reportID={THREAD_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockCapturedWorkspaceSubscriptAvatarProps.primaryAvatar).toEqual(expect.objectContaining({id: DELEGATE_ACCOUNT_ID, source: DELEGATE_AVATAR_URL}));
    });

    it("should hand a trip room the trip preview's actor as the primary avatar", () => {
        seedThread(CONST.REPORT.TYPE.CHAT, tripPreviewAction, {chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM});

        render(
            <ChatThreadAvatar
                reportID={THREAD_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockCapturedWorkspaceSubscriptAvatarProps.primaryAvatar).toEqual(expect.objectContaining({id: ACTOR_ACCOUNT_ID, source: ACTOR_AVATAR_URL}));
    });

    it('should render the parent action actor as a single avatar', () => {
        seedThread(CONST.REPORT.TYPE.CHAT, createCommentAction());

        render(
            <ChatThreadAvatar
                reportID={THREAD_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                containerStyle={CONTAINER_STYLE}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        expect(mockCapturedSingleAvatarProps.avatar).toEqual({id: ACTOR_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: ACTOR_AVATAR_URL, name: ACTOR_LOGIN, displayName: ACTOR_LOGIN});
        expect(mockCapturedSingleAvatarProps.size).toBe(CONST.AVATAR_SIZE.SMALL);
        expect(mockCapturedSingleAvatarProps.containerStyles).toBe(CONTAINER_STYLE);
        expect(mockCapturedSingleAvatarProps.fallbackDisplayName).toBe(FALLBACK_NAME);
    });

    it('should fall back to the size-derived container styles for a single avatar', () => {
        seedThread(CONST.REPORT.TYPE.CHAT, createCommentAction());

        render(
            <ChatThreadAvatar
                reportID={THREAD_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockGetContainerStyles).toHaveBeenCalledWith(CONST.AVATAR_SIZE.DEFAULT);
        expect(mockCapturedSingleAvatarProps.containerStyles).toEqual(mockGetContainerStyles.mock.results.at(0)?.value);
    });

    it('should render the copilot as the primary avatar, badged as acting for the actor', () => {
        seedThread(CONST.REPORT.TYPE.CHAT, createCommentAction({delegateAccountID: DELEGATE_ACCOUNT_ID}));

        render(
            <ChatThreadAvatar
                reportID={THREAD_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockCapturedSingleAvatarProps.avatar).toEqual(
            expect.objectContaining({id: DELEGATE_ACCOUNT_ID, source: DELEGATE_AVATAR_URL, copilot: {accountID: DELEGATE_ACCOUNT_ID, actedForAccountID: ACTOR_ACCOUNT_ID}}),
        );
    });

    it('should render Concierge for a harvested submit', () => {
        seedThread(CONST.REPORT.TYPE.CHAT, harvestedSubmitAction);

        render(
            <ChatThreadAvatar
                reportID={THREAD_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockCapturedSingleAvatarProps.avatar).toEqual(expect.objectContaining({id: CONST.ACCOUNT_ID.CONCIERGE}));
    });

    it.each([
        ['the first name when personal details carry one', 'Agnes', 'Agnes'],
        ['the generic support-agent label otherwise', undefined, HUMAN_SUPPORT_AGENT_KEY],
    ])('should render Concierge with the revealed human agent as the subscript, named by %s', (_case, firstName, expectedName) => {
        mockPersonalDetails[AGENT_ACCOUNT_ID] = {accountID: AGENT_ACCOUNT_ID, avatar: AGENT_AVATAR_URL, firstName};
        seedThread(
            CONST.REPORT.TYPE.CHAT,
            createCommentAction({
                actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
                originalMessage: {html: 'Hello', whisperedTo: [], humanAgentAccountID: AGENT_ACCOUNT_ID},
            }),
        );

        render(
            <ChatThreadAvatar
                reportID={THREAD_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
                backdropColor="#ff0000"
                subscriptContainerStyle={SUBSCRIPT_CONTAINER_STYLE}
            />,
        );

        expect(screen.getByTestId('MockedSubscriptAvatar')).toBeOnTheScreen();
        expect(mockCapturedSubscriptAvatarProps.primaryAvatar).toEqual(expect.objectContaining({id: CONST.ACCOUNT_ID.CONCIERGE}));
        expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual(expect.objectContaining({id: AGENT_ACCOUNT_ID, source: AGENT_AVATAR_URL, name: expectedName}));
        expect(mockCapturedSubscriptAvatarProps.backdropColor).toBe('#ff0000');
        expect(mockCapturedSubscriptAvatarProps.containerStyle).toBe(SUBSCRIPT_CONTAINER_STYLE);
    });

    it('should render the fallback avatar when the parent action is missing', () => {
        seedThread(CONST.REPORT.TYPE.CHAT, undefined);

        render(
            <ChatThreadAvatar
                reportID={THREAD_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockCapturedSingleAvatarProps.avatar).toEqual(expect.objectContaining({id: CONST.DEFAULT_NUMBER_ID, source: MockFallbackAvatar}));
    });

    it('should seed the default avatar from the account ID when the actor is missing from personal details', () => {
        mockPersonalDetails = {};
        seedThread(CONST.REPORT.TYPE.CHAT, createCommentAction());

        render(
            <ChatThreadAvatar
                reportID={THREAD_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockCapturedSingleAvatarProps.avatar).toEqual(expect.objectContaining({id: ACTOR_ACCOUNT_ID, source: getDefaultAvatarURL({accountID: ACTOR_ACCOUNT_ID})}));
    });
});
