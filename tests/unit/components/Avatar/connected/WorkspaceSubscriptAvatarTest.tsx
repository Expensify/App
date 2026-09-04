import {render, screen} from '@testing-library/react-native';

import WorkspaceSubscriptAvatar from '@components/Avatar/connected/WorkspaceSubscriptAvatar';

import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ReportAvatarFields} from '@selectors/Report';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const PARENT_REPORT_ID = 'parentChat456';
const POLICY_ID = 'policy123';
const POLICY_NAME = 'Acme Workspace';
const POLICY_AVATAR_URL = 'https://example.com/workspace-avatar.png';
const REPORT_POLICY_AVATAR_URL = 'https://example.com/report-policy-avatar.png';
const PARENT_POLICY_AVATAR_URL = 'https://example.com/parent-policy-avatar.png';
const FALLBACK_NAME = 'Fallback Name';
const CONTAINER_STYLE = {marginRight: 0};
const UNAVAILABLE_WORKSPACE_NAME_KEY = 'workspace.common.unavailable';

const PRIMARY_AVATAR: Icon = {id: 42, type: CONST.ICON_TYPE_AVATAR, source: 'https://example.com/actor-avatar.png', name: 'john@example.com'};

const createReportFields = (overrides: Partial<ReportAvatarFields> = {}): ReportAvatarFields => ({
    parentReportID: PARENT_REPORT_ID,
    policyID: POLICY_ID,
    ...overrides,
});

// Capture the props handed to the layout primitive, which is the whole contract of this component.
let mockCapturedSubscriptAvatarProps: Record<string, unknown> = {};

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        formatPhoneNumber: (phoneNumber: string) => phoneNumber,
        translate: (key: string) => key,
    })),
);

jest.mock('@components/Avatar/layouts/SubscriptAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedSubscriptAvatarProps = props;
        return <View testID="MockedSubscriptAvatar" />;
    };
});

describe('WorkspaceSubscriptAvatar (connected)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedSubscriptAvatarProps = {};
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('should render the given primary avatar with the workspace icon as the subscript', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: POLICY_NAME, avatarURL: POLICY_AVATAR_URL});
        await waitForBatchedUpdatesWithAct();

        render(
            <WorkspaceSubscriptAvatar
                report={createReportFields()}
                primaryAvatar={PRIMARY_AVATAR}
                size={CONST.AVATAR_SIZE.SMALL}
                backdropColor="#ff0000"
                containerStyle={CONTAINER_STYLE}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        expect(screen.getByTestId('MockedSubscriptAvatar')).toBeOnTheScreen();
        expect(mockCapturedSubscriptAvatarProps).toEqual({
            primaryAvatar: PRIMARY_AVATAR,
            secondaryAvatar: {id: POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, source: POLICY_AVATAR_URL, name: POLICY_NAME},
            size: CONST.AVATAR_SIZE.SMALL,
            backdropColor: '#ff0000',
            containerStyle: CONTAINER_STYLE,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it.each([
        ['the uploaded workspace avatar when the policy has one', {policy: {avatarURL: POLICY_AVATAR_URL}}, POLICY_AVATAR_URL],
        // A workspace with no uploaded avatar stores an empty string, which has to fall through to the default avatar.
        ['the default workspace avatar when avatarURL is an empty string', {policy: {avatarURL: ''}}, getDefaultWorkspaceAvatar(POLICY_NAME)],
        // The report-carried `policyAvatar` only applies while the policy row is entirely absent.
        ["the report's policyAvatar when the policy row is missing", {reportPolicyAvatar: REPORT_POLICY_AVATAR_URL}, REPORT_POLICY_AVATAR_URL],
        ["the parent chat's policyAvatar when the report carries none either", {parentChatPolicyAvatar: PARENT_POLICY_AVATAR_URL}, PARENT_POLICY_AVATAR_URL],
        // A report-carried '' means "no uploaded avatar" and must fall through to the parent chat's avatar, not shadow it.
        [
            "the parent chat's policyAvatar when the report's policyAvatar is an empty string",
            {reportPolicyAvatar: '', parentChatPolicyAvatar: PARENT_POLICY_AVATAR_URL},
            PARENT_POLICY_AVATAR_URL,
        ],
    ])(
        'should resolve %s as the subscript source',
        async (
            _case,
            {
                policy,
                reportPolicyAvatar,
                parentChatPolicyAvatar,
            }: {
                policy?: {avatarURL: string};
                reportPolicyAvatar?: string;
                parentChatPolicyAvatar?: string;
            },
            expectedSource,
        ) => {
            if (policy) {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: POLICY_NAME, ...policy});
            }
            if (parentChatPolicyAvatar) {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`, {reportID: PARENT_REPORT_ID, type: CONST.REPORT.TYPE.CHAT, policyAvatar: parentChatPolicyAvatar});
            }
            await waitForBatchedUpdatesWithAct();

            render(
                <WorkspaceSubscriptAvatar
                    report={createReportFields({policyName: POLICY_NAME, policyAvatar: reportPolicyAvatar})}
                    primaryAvatar={PRIMARY_AVATAR}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                />,
            );

            expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual(expect.objectContaining({source: expectedSource}));
        },
    );

    it.each([
        ['the policy name', {policy: {name: POLICY_NAME}, report: {policyName: 'Report Policy Name'}}, POLICY_NAME],
        ["the report's policyName when the policy row is missing", {report: {policyName: 'Report Policy Name', oldPolicyName: 'Old Policy Name'}}, 'Report Policy Name'],
        ["the report's oldPolicyName when there is no policyName", {report: {oldPolicyName: 'Old Policy Name'}}, 'Old Policy Name'],
        ["the parent chat's policyName when the report has neither", {parentChat: {policyName: 'Parent Policy Name', oldPolicyName: 'Parent Old Name'}}, 'Parent Policy Name'],
        ["the parent chat's oldPolicyName as the next fallback", {parentChat: {oldPolicyName: 'Parent Old Name'}}, 'Parent Old Name'],
        ['the unavailable-workspace translation when nothing resolves', {}, UNAVAILABLE_WORKSPACE_NAME_KEY],
    ])(
        'should name the workspace icon after %s',
        async (
            _case,
            {
                policy,
                report,
                parentChat,
            }: {
                policy?: {name: string};
                report?: Partial<ReportAvatarFields>;
                parentChat?: Partial<Report>;
            },
            expectedName,
        ) => {
            if (policy) {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, ...policy});
            }
            if (parentChat) {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`, {reportID: PARENT_REPORT_ID, type: CONST.REPORT.TYPE.CHAT, ...parentChat});
            }
            await waitForBatchedUpdatesWithAct();

            render(
                <WorkspaceSubscriptAvatar
                    report={createReportFields(report)}
                    primaryAvatar={PRIMARY_AVATAR}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                />,
            );

            expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual(expect.objectContaining({name: expectedName}));
        },
    );

    it('should reach the policy row through the workspace chat when the report has no policyID', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`, {reportID: PARENT_REPORT_ID, type: CONST.REPORT.TYPE.CHAT, policyID: POLICY_ID});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: POLICY_NAME, avatarURL: POLICY_AVATAR_URL});
        await waitForBatchedUpdatesWithAct();

        render(
            <WorkspaceSubscriptAvatar
                report={createReportFields({policyID: undefined})}
                primaryAvatar={PRIMARY_AVATAR}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual(expect.objectContaining({id: POLICY_ID, name: POLICY_NAME, source: POLICY_AVATAR_URL}));
    });

    it('should resolve the workspace chat through chatReportID when parentReportID is absent', async () => {
        const chatReportID = 'workspaceChat789';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, {reportID: chatReportID, type: CONST.REPORT.TYPE.CHAT, policyName: 'Chat Policy Name'});
        await waitForBatchedUpdatesWithAct();

        render(
            <WorkspaceSubscriptAvatar
                report={createReportFields({parentReportID: undefined, chatReportID})}
                primaryAvatar={PRIMARY_AVATAR}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual(expect.objectContaining({name: 'Chat Policy Name'}));
    });

    it('should still render the subscript while the report row has not loaded', () => {
        render(
            <WorkspaceSubscriptAvatar
                report={undefined}
                primaryAvatar={PRIMARY_AVATAR}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockCapturedSubscriptAvatarProps.primaryAvatar).toBe(PRIMARY_AVATAR);
        expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual(expect.objectContaining({type: CONST.ICON_TYPE_WORKSPACE, name: UNAVAILABLE_WORKSPACE_NAME_KEY}));
    });
});
