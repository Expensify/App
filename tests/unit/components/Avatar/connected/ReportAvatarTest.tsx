import {cleanup, render, screen} from '@testing-library/react-native';

import ReportAvatar from '@components/Avatar/connected/ReportAvatar';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = 'report123';
const FALLBACK_NAME = 'Fallback Name';

// Capture the props handed to the legacy component — until the report-type wrappers land (#94590),
// delegating to it with the props forwarded verbatim is the whole contract of the dispatcher.
let mockCapturedFallbackProps: Record<string, unknown> = {};

jest.mock('@components/ReportActionAvatars', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedFallbackProps = props;
        return <View testID="MockedReportActionAvatars" />;
    };
});

let mockCapturedGroupChatAvatarProps: Record<string, unknown> = {};

let mockCapturedExpenseReportAvatarProps: Record<string, unknown> = {};

let mockCapturedChatThreadAvatarProps: Record<string, unknown> = {};

let mockCapturedAccountAvatarProps: Record<string, unknown> = {};

let mockCapturedPolicyExpenseChatAvatarProps: Record<string, unknown> = {};

jest.mock('@components/Avatar/connected/PolicyExpenseChatAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedPolicyExpenseChatAvatarProps = props;
        return <View testID="MockedPolicyExpenseChatAvatar" />;
    };
});

jest.mock('@components/Avatar/connected/ChatThreadAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedChatThreadAvatarProps = props;
        return <View testID="MockedChatThreadAvatar" />;
    };
});

jest.mock('@components/Avatar/connected/AccountAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedAccountAvatarProps = props;
        return <View testID="MockedAccountAvatar" />;
    };
});

jest.mock('@components/Avatar/connected/ExpenseReportAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedExpenseReportAvatarProps = props;
        return <View testID="MockedExpenseReportAvatar" />;
    };
});

jest.mock('@components/Avatar/connected/GroupChatAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedGroupChatAvatarProps = props;
        return <View testID="MockedGroupChatAvatar" />;
    };
});

describe('ReportAvatar (connected)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedFallbackProps = {};
        mockCapturedGroupChatAvatarProps = {};
        mockCapturedExpenseReportAvatarProps = {};
        mockCapturedChatThreadAvatarProps = {};
        mockCapturedAccountAvatarProps = {};
        mockCapturedPolicyExpenseChatAvatarProps = {};
    });

    afterEach(async () => {
        // Unmount before clearing so the store updates from the clear don't reach a mounted component outside act().
        cleanup();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it.each([
        ['an IOU report', {type: CONST.REPORT.TYPE.IOU}],
        ['a task report', {type: CONST.REPORT.TYPE.TASK}],
        ['an invoice report', {type: CONST.REPORT.TYPE.INVOICE}],
        ['a room', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}],
        ['a trip room without its parent fields', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM}],
        ['a DM', {type: CONST.REPORT.TYPE.CHAT}],
    ] as const)('should render the legacy component for %s until its wrapper exists', async (_case, reportOverrides) => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, ...reportOverrides});
        await waitForBatchedUpdatesWithAct();

        render(<ReportAvatar reportID={REPORT_ID} />);
        // useOnyx delivers its initial value asynchronously, so flush it inside act() before asserting.
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('MockedReportActionAvatars')).toBeOnTheScreen();
        expect(mockCapturedFallbackProps.reportID).toBe(REPORT_ID);
    });

    it('should render ExpenseReportAvatar for an expense report', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE});
        await waitForBatchedUpdatesWithAct();

        render(
            <ReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                backdropColor="#ff0000"
                subscriptAvatarContainerStyle={{marginRight: 0}}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('MockedExpenseReportAvatar')).toBeOnTheScreen();
        expect(mockCapturedExpenseReportAvatarProps).toMatchObject({
            reportID: REPORT_ID,
            size: CONST.AVATAR_SIZE.SMALL,
            backdropColor: '#ff0000',
            containerStyle: {marginRight: 0},
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it('should route an expense report to the wrapper without stacking props even inside a horizontal stack', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE});
        await waitForBatchedUpdatesWithAct();

        render(
            <ReportAvatar
                reportID={REPORT_ID}
                horizontalStacking={{maxRows: 2}}
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('MockedExpenseReportAvatar')).toBeOnTheScreen();
        expect(mockCapturedExpenseReportAvatarProps).not.toHaveProperty('horizontalStacking');
        expect(mockCapturedExpenseReportAvatarProps).not.toHaveProperty('sort');
    });

    it('should pass no container style for an expense report without subscriptAvatarContainerStyle', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE});
        await waitForBatchedUpdatesWithAct();

        render(<ReportAvatar reportID={REPORT_ID} />);
        await waitForBatchedUpdatesWithAct();

        expect(mockCapturedExpenseReportAvatarProps.containerStyle).toBeUndefined();
    });

    it('should render ChatThreadAvatar for a chat thread with the layout container styles resolved', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT, parentReportID: 'parent1', parentReportActionID: 'parentAction1'});
        await waitForBatchedUpdatesWithAct();

        const singleAvatarContainerStyle = [{marginRight: 12}];
        const subscriptAvatarContainerStyle = [{marginRight: 0}];

        render(
            <ReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                singleAvatarContainerStyle={singleAvatarContainerStyle}
                backdropColor="#ff0000"
                subscriptAvatarContainerStyle={subscriptAvatarContainerStyle}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        expect(screen.getByTestId('MockedChatThreadAvatar')).toBeOnTheScreen();
        expect(mockCapturedChatThreadAvatarProps).toEqual({
            reportID: REPORT_ID,
            size: CONST.AVATAR_SIZE.SMALL,
            backdropColor: '#ff0000',
            containerStyle: singleAvatarContainerStyle,
            subscriptContainerStyle: subscriptAvatarContainerStyle,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it('should hand a chat thread the stacking props and drop its single container styles inside a horizontal stack', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT, parentReportID: 'parent1', parentReportActionID: 'parentAction1'});
        await waitForBatchedUpdatesWithAct();

        render(
            <ReportAvatar
                reportID={REPORT_ID}
                singleAvatarContainerStyle={[{marginRight: 12}]}
                horizontalStacking={{maxRows: 2}}
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
            />,
        );

        expect(mockCapturedChatThreadAvatarProps.containerStyle).toEqual([]);
        expect(mockCapturedChatThreadAvatarProps.subscriptContainerStyle).toBeUndefined();
        expect(mockCapturedChatThreadAvatarProps.horizontalStacking).toEqual({maxRows: 2});
        expect(mockCapturedChatThreadAvatarProps.sort).toBe(CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE);
    });

    it('should render PolicyExpenseChatAvatar for a policy expense chat with the layout container styles resolved', async () => {
        // Given a policy expense chat in Onyx
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT});
        await waitForBatchedUpdatesWithAct();

        const singleAvatarContainerStyle = [{marginRight: 12}];
        const subscriptAvatarContainerStyle = [{marginRight: 0}];

        // When the dispatcher renders it with every prop
        render(
            <ReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                singleAvatarContainerStyle={singleAvatarContainerStyle}
                backdropColor="#ff0000"
                subscriptAvatarContainerStyle={subscriptAvatarContainerStyle}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the wrapper gets each container style under its layout-specific name
        expect(screen.getByTestId('MockedPolicyExpenseChatAvatar')).toBeOnTheScreen();
        expect(mockCapturedPolicyExpenseChatAvatarProps).toEqual({
            reportID: REPORT_ID,
            size: CONST.AVATAR_SIZE.SMALL,
            backdropColor: '#ff0000',
            containerStyle: singleAvatarContainerStyle,
            subscriptContainerStyle: subscriptAvatarContainerStyle,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it('should hand a policy expense chat the stacking props', async () => {
        // Given a policy expense chat in Onyx
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT});
        await waitForBatchedUpdatesWithAct();

        // When the dispatcher renders it inside a horizontal stack
        render(
            <ReportAvatar
                reportID={REPORT_ID}
                horizontalStacking={{maxRows: 2}}
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
            />,
        );

        // Then the wrapper gets the stacking options and the sort to apply to them
        expect(mockCapturedPolicyExpenseChatAvatarProps.horizontalStacking).toEqual({maxRows: 2});
        expect(mockCapturedPolicyExpenseChatAvatarProps.sort).toBe(CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE);
    });

    it('should render ChatThreadAvatar for a trip room, which is a thread of its trip preview', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM,
            parentReportID: 'parent1',
            parentReportActionID: 'parentAction1',
        });
        await waitForBatchedUpdatesWithAct();

        render(<ReportAvatar reportID={REPORT_ID} />);

        expect(screen.getByTestId('MockedChatThreadAvatar')).toBeOnTheScreen();
        expect(mockCapturedChatThreadAvatarProps.reportID).toBe(REPORT_ID);
    });

    it('should render GroupChatAvatar for a group chat', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.GROUP});
        await waitForBatchedUpdatesWithAct();

        const singleAvatarContainerStyle = [{marginRight: 12}];

        render(
            <ReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                singleAvatarContainerStyle={singleAvatarContainerStyle}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('MockedGroupChatAvatar')).toBeOnTheScreen();
        expect(mockCapturedGroupChatAvatarProps).toMatchObject({
            reportID: REPORT_ID,
            size: CONST.AVATAR_SIZE.SMALL,
            containerStyle: singleAvatarContainerStyle,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it('should drop the container styles for a group chat inside a horizontal stack', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.GROUP});
        await waitForBatchedUpdatesWithAct();

        render(
            <ReportAvatar
                reportID={REPORT_ID}
                singleAvatarContainerStyle={[{marginRight: 12}]}
                horizontalStacking={{maxRows: 2}}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockCapturedGroupChatAvatarProps.containerStyle).toEqual([]);
    });

    it('should forward every prop to the legacy component verbatim', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT});
        await waitForBatchedUpdatesWithAct();

        const singleAvatarContainerStyle = [{marginRight: 12}];
        const subscriptAvatarContainerStyle = [{marginRight: 0}];
        const horizontalStacking = {maxRows: 2, maxAvatarsPerRow: 4, overlapDivider: 4};

        render(
            <ReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                singleAvatarContainerStyle={singleAvatarContainerStyle}
                subscriptAvatarContainerStyle={subscriptAvatarContainerStyle}
                backdropColor="#ff0000"
                horizontalStacking={horizontalStacking}
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockCapturedFallbackProps).toMatchObject({
            reportID: REPORT_ID,
            size: CONST.AVATAR_SIZE.SMALL,
            singleAvatarContainerStyle,
            subscriptAvatarContainerStyle,
            backdropColor: '#ff0000',
            horizontalStacking,
            sort: CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it('should render the generic fallback avatar without a reportID', async () => {
        render(<ReportAvatar fallbackDisplayName={FALLBACK_NAME} />);
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('MockedAccountAvatar')).toBeOnTheScreen();
        expect(mockCapturedAccountAvatarProps).toMatchObject({
            accountID: CONST.DEFAULT_NUMBER_ID,
            size: CONST.AVATAR_SIZE.DEFAULT,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });
});
