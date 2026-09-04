import {render, screen} from '@testing-library/react-native';

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

let mockCapturedAccountAvatarProps: Record<string, unknown> = {};

jest.mock('@components/Avatar/connected/AccountAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedAccountAvatarProps = props;
        return <View testID="MockedAccountAvatar" />;
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
        mockCapturedAccountAvatarProps = {};
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it.each([
        ['an expense report', {type: CONST.REPORT.TYPE.EXPENSE}],
        ['an IOU report', {type: CONST.REPORT.TYPE.IOU}],
        ['a task report', {type: CONST.REPORT.TYPE.TASK}],
        ['an invoice report', {type: CONST.REPORT.TYPE.INVOICE}],
        ['a chat thread', {type: CONST.REPORT.TYPE.CHAT, parentReportID: 'parent1', parentReportActionID: 'parentAction1'}],
        ['a policy expense chat', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT}],
        ['a room', {type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM}],
        ['a DM', {type: CONST.REPORT.TYPE.CHAT}],
    ] as const)('should render the legacy component for %s until its wrapper exists', async (_case, reportOverrides) => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, ...reportOverrides});
        await waitForBatchedUpdatesWithAct();

        render(<ReportAvatar reportID={REPORT_ID} />);

        expect(screen.getByTestId('MockedReportActionAvatars')).toBeOnTheScreen();
        expect(mockCapturedFallbackProps.reportID).toBe(REPORT_ID);
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

        expect(mockCapturedGroupChatAvatarProps.containerStyle).toEqual([]);
    });

    it('should forward every prop to the legacy component verbatim', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT});
        await waitForBatchedUpdatesWithAct();

        const singleAvatarContainerStyle = [{marginRight: 12}];
        const secondaryAvatarContainerStyle = [{borderColor: '#00ff00'}];
        const horizontalStacking = {maxRows: 2, maxAvatarsPerRow: 4, overlapDivider: 4};

        render(
            <ReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                singleAvatarContainerStyle={singleAvatarContainerStyle}
                secondaryAvatarContainerStyle={secondaryAvatarContainerStyle}
                subscriptAvatarBorderColor="#ff0000"
                noRightMarginOnSubscriptContainer
                horizontalStacking={horizontalStacking}
                sort={CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        expect(mockCapturedFallbackProps).toMatchObject({
            reportID: REPORT_ID,
            size: CONST.AVATAR_SIZE.SMALL,
            singleAvatarContainerStyle,
            secondaryAvatarContainerStyle,
            subscriptAvatarBorderColor: '#ff0000',
            noRightMarginOnSubscriptContainer: true,
            horizontalStacking,
            sort: CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it('should render the generic fallback avatar without a reportID', () => {
        render(<ReportAvatar fallbackDisplayName={FALLBACK_NAME} />);

        expect(screen.getByTestId('MockedAccountAvatar')).toBeOnTheScreen();
        expect(mockCapturedAccountAvatarProps).toMatchObject({
            accountID: CONST.DEFAULT_NUMBER_ID,
            size: CONST.AVATAR_SIZE.DEFAULT,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });
});
