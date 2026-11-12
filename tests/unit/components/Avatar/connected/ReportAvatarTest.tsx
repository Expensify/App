import {cleanup, render, screen} from '@testing-library/react-native';

import ReportAvatar from '@components/Avatar/connected/ReportAvatar';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = 'report123';
const FALLBACK_NAME = 'Fallback Name';

jest.mock('@components/ReportActionAvatars', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return () => <View testID="MockedReportActionAvatars" />;
});

let mockCapturedGroupChatAvatarProps: Record<string, unknown> = {};

let mockCapturedExpenseReportAvatarProps: Record<string, unknown> = {};

let mockCapturedChatThreadAvatarProps: Record<string, unknown> = {};

let mockCapturedAccountAvatarProps: Record<string, unknown> = {};

let mockCapturedPolicyExpenseChatAvatarProps: Record<string, unknown> = {};

let mockCapturedTaskReportAvatarProps: Record<string, unknown> = {};

let mockCapturedRoomAvatarProps: Record<string, unknown> = {};

let mockCapturedInvoiceReportAvatarProps: Record<string, unknown> = {};

jest.mock('@components/Avatar/connected/InvoiceReportAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedInvoiceReportAvatarProps = props;
        return <View testID="MockedInvoiceReportAvatar" />;
    };
});

let mockCapturedIOUReportAvatarProps: Record<string, unknown> = {};

jest.mock('@components/Avatar/connected/IOUReportAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedIOUReportAvatarProps = props;
        return <View testID="MockedIOUReportAvatar" />;
    };
});

jest.mock('@components/Avatar/connected/TaskReportAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedTaskReportAvatarProps = props;
        return <View testID="MockedTaskReportAvatar" />;
    };
});

jest.mock('@components/Avatar/connected/RoomAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedRoomAvatarProps = props;
        return <View testID="MockedRoomAvatar" />;
    };
});

let mockCapturedDefaultReportAvatarProps: Record<string, unknown> = {};

let mockCapturedTripRoomAvatarProps: Record<string, unknown> = {};

jest.mock('@components/Avatar/connected/TripRoomAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedTripRoomAvatarProps = props;
        return <View testID="MockedTripRoomAvatar" />;
    };
});

jest.mock('@components/Avatar/connected/DefaultReportAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedDefaultReportAvatarProps = props;
        return <View testID="MockedDefaultReportAvatar" />;
    };
});

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
        mockCapturedGroupChatAvatarProps = {};
        mockCapturedExpenseReportAvatarProps = {};
        mockCapturedChatThreadAvatarProps = {};
        mockCapturedAccountAvatarProps = {};
        mockCapturedPolicyExpenseChatAvatarProps = {};
        mockCapturedTaskReportAvatarProps = {};
        mockCapturedRoomAvatarProps = {};
        mockCapturedDefaultReportAvatarProps = {};
        mockCapturedTripRoomAvatarProps = {};
        mockCapturedInvoiceReportAvatarProps = {};
        mockCapturedIOUReportAvatarProps = {};
    });

    afterEach(async () => {
        // Unmount before clearing so the store updates from the clear don't reach a mounted component outside act().
        cleanup();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
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

    it.each([
        ['the single container style outside a horizontal stack', undefined, [{marginRight: 12}]],
        ['no container styles inside a horizontal stack', {maxRows: 2}, []],
    ])('should render TaskReportAvatar for a task report with %s', async (_case, horizontalStacking, expectedContainerStyle) => {
        // Given a task report in Onyx
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.TASK});
        await waitForBatchedUpdatesWithAct();

        // When the dispatcher renders it with every prop
        render(
            <ReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                singleAvatarContainerStyle={[{marginRight: 12}]}
                backdropColor="#ff0000"
                subscriptAvatarContainerStyle={[{marginRight: 0}]}
                horizontalStacking={horizontalStacking}
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the always-single wrapper gets only the single container style, dropped inside a horizontal stack like the legacy component
        expect(screen.getByTestId('MockedTaskReportAvatar')).toBeOnTheScreen();
        expect(mockCapturedTaskReportAvatarProps).toEqual({
            reportID: REPORT_ID,
            size: CONST.AVATAR_SIZE.SMALL,
            containerStyle: expectedContainerStyle,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it.each([
        ['an admins room', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS}],
        ['an announce room', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE}],
        ['a user-created room', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}],
        ['a domain room', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL}],
        ['an invoice room', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.INVOICE}],
        ['a room whose type has not populated yet', {chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS}],
    ] as const)('should render RoomAvatar for %s', async (_case, reportOverrides) => {
        // Given a room in Onyx
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, ...reportOverrides});
        await waitForBatchedUpdatesWithAct();

        // When the dispatcher renders it
        render(<ReportAvatar reportID={REPORT_ID} />);

        // Then the room routes to its wrapper instead of ReportActionAvatars
        expect(screen.getByTestId('MockedRoomAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedReportActionAvatars')).not.toBeOnTheScreen();
        expect(mockCapturedRoomAvatarProps.reportID).toBe(REPORT_ID);
    });

    it.each([
        ['the single container style outside a horizontal stack', undefined, [{marginRight: 12}]],
        ['no single container style inside a horizontal stack', {maxRows: 2}, []],
    ])('should render InvoiceReportAvatar for an invoice report with %s', async (_case, horizontalStacking, expectedContainerStyle) => {
        // Given an invoice report in Onyx
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.INVOICE});
        await waitForBatchedUpdatesWithAct();

        // When the dispatcher renders it with every prop
        render(
            <ReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                singleAvatarContainerStyle={[{marginRight: 12}]}
                backdropColor="#ff0000"
                subscriptAvatarContainerStyle={[{marginRight: 0}]}
                horizontalStacking={horizontalStacking}
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the wrapper gets both container styles but no stacking options, because no caller stacks an invoice report
        expect(screen.getByTestId('MockedInvoiceReportAvatar')).toBeOnTheScreen();
        expect(mockCapturedInvoiceReportAvatarProps).toEqual({
            reportID: REPORT_ID,
            size: CONST.AVATAR_SIZE.SMALL,
            backdropColor: '#ff0000',
            containerStyle: expectedContainerStyle,
            subscriptContainerStyle: [{marginRight: 0}],
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it('should render RoomAvatar for a room with the layout container styles resolved', async () => {
        // Given a room in Onyx
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM});
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
        expect(mockCapturedRoomAvatarProps).toEqual({
            reportID: REPORT_ID,
            size: CONST.AVATAR_SIZE.SMALL,
            backdropColor: '#ff0000',
            containerStyle: singleAvatarContainerStyle,
            subscriptContainerStyle: subscriptAvatarContainerStyle,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it('should hand a room the stacking props and drop its single container styles inside a horizontal stack', async () => {
        // Given a room in Onyx
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.INVOICE});
        await waitForBatchedUpdatesWithAct();

        // When the dispatcher renders it inside a horizontal stack
        render(
            <ReportAvatar
                reportID={REPORT_ID}
                singleAvatarContainerStyle={[{marginRight: 12}]}
                horizontalStacking={{maxRows: 2}}
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
            />,
        );

        // Then the single layout loses its container styles, and the wrapper gets the stacking options and the sort
        expect(mockCapturedRoomAvatarProps.containerStyle).toEqual([]);
        expect(mockCapturedRoomAvatarProps.horizontalStacking).toEqual({maxRows: 2});
        expect(mockCapturedRoomAvatarProps.sort).toBe(CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE);
    });

    it.each([
        ['the single container style outside a horizontal stack', undefined, [{marginRight: 12}]],
        ['no container styles inside a horizontal stack', {maxRows: 2}, []],
    ])('should render IOUReportAvatar for an IOU report with %s', async (_case, horizontalStacking, expectedContainerStyle) => {
        // Given an IOU report in Onyx
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.IOU});
        await waitForBatchedUpdatesWithAct();

        // When the dispatcher renders it with every prop
        render(
            <ReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                singleAvatarContainerStyle={[{marginRight: 12}]}
                backdropColor="#ff0000"
                subscriptAvatarContainerStyle={[{marginRight: 0}]}
                horizontalStacking={horizontalStacking}
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the wrapper gets everything but the subscript style, which no IOU layout uses, and the single container style is dropped inside a horizontal stack
        expect(screen.getByTestId('MockedIOUReportAvatar')).toBeOnTheScreen();
        expect(mockCapturedIOUReportAvatarProps).toEqual({
            reportID: REPORT_ID,
            size: CONST.AVATAR_SIZE.SMALL,
            backdropColor: '#ff0000',
            containerStyle: expectedContainerStyle,
            horizontalStacking,
            sort: CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE,
            fallbackDisplayName: FALLBACK_NAME,
        });
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

    it.each([
        ['a DM', {type: CONST.REPORT.TYPE.CHAT}],
        ['a self DM', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.SELF_DM}],
        ['the system chat', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.SYSTEM}],
        ['a trip room whose type has not populated yet', {chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM}],
        ['a report with neither a type nor a chat type', {}],
        ['a support ticket', {type: CONST.REPORT.TYPE.SUPPORT_TICKET}],
        ['an unsupported report type', {type: CONST.REPORT.UNSUPPORTED_TYPE.PAYCHECK}],
        ['a report that has not loaded', null],
    ] as const)('should render DefaultReportAvatar for %s', async (_case, reportOverrides) => {
        // Given a report without a dedicated avatar, or no report row at all
        if (reportOverrides) {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, ...reportOverrides});
            await waitForBatchedUpdatesWithAct();
        }

        // When the dispatcher renders it
        render(<ReportAvatar reportID={REPORT_ID} />);
        await waitForBatchedUpdatesWithAct();

        // Then it routes to the default wrapper instead of ReportActionAvatars
        expect(screen.getByTestId('MockedDefaultReportAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedReportActionAvatars')).not.toBeOnTheScreen();
        expect(mockCapturedDefaultReportAvatarProps.reportID).toBe(REPORT_ID);
    });

    it.each([
        ['outside a horizontal stack, with the single container style', undefined, [{marginRight: 12}]],
        ['inside a horizontal stack, without container styles', {maxRows: 2}, []],
    ])('should hand a DM its props %s', async (_case, horizontalStacking, expectedContainerStyle) => {
        // Given a DM in Onyx
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT});
        await waitForBatchedUpdatesWithAct();

        // When the dispatcher renders it with every prop
        render(
            <ReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                singleAvatarContainerStyle={[{marginRight: 12}]}
                backdropColor="#ff0000"
                subscriptAvatarContainerStyle={[{marginRight: 0}]}
                horizontalStacking={horizontalStacking}
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then the wrapper gets only the single container style, emptied inside a stack
        expect(mockCapturedDefaultReportAvatarProps).toEqual({
            reportID: REPORT_ID,
            size: CONST.AVATAR_SIZE.SMALL,
            containerStyle: expectedContainerStyle,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it.each([
        ['outside a horizontal stack, with the single container style', undefined, [{marginRight: 12}]],
        ['inside a horizontal stack, without container styles', {maxRows: 2}, []],
    ])('should hand a trip room without its parent fields to TripRoomAvatar %s', async (_case, horizontalStacking, expectedContainerStyle) => {
        // Given a trip room missing its parent fields
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM});
        await waitForBatchedUpdatesWithAct();

        // When the dispatcher renders it with every prop
        render(
            <ReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                singleAvatarContainerStyle={[{marginRight: 12}]}
                backdropColor="#ff0000"
                subscriptAvatarContainerStyle={[{marginRight: 0}]}
                horizontalStacking={horizontalStacking}
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        // Then TripRoomAvatar gets the stacking props and the single container style, emptied inside a stack
        expect(screen.getByTestId('MockedTripRoomAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedDefaultReportAvatar')).not.toBeOnTheScreen();
        expect(mockCapturedTripRoomAvatarProps).toEqual({
            reportID: REPORT_ID,
            size: CONST.AVATAR_SIZE.SMALL,
            containerStyle: expectedContainerStyle,
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
