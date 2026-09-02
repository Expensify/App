import {render, screen} from '@testing-library/react-native';

import ExpenseReportAvatar from '@components/Avatar/connected/ExpenseReportAvatar';

import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Report} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = 'report123';
const PARENT_REPORT_ID = 'parentChat456';
const POLICY_ID = 'policy123';
const POLICY_NAME = 'Acme Workspace';
const POLICY_AVATAR_URL = 'https://example.com/workspace-avatar.png';
const REPORT_POLICY_AVATAR_URL = 'https://example.com/report-policy-avatar.png';
const PARENT_POLICY_AVATAR_URL = 'https://example.com/parent-policy-avatar.png';
const FALLBACK_NAME = 'Fallback Name';
const UNAVAILABLE_WORKSPACE_NAME_KEY = 'workspace.common.unavailable';

const OWNER_ACCOUNT_ID = 42;
const OWNER_LOGIN = 'john@example.com';
const OWNER_AVATAR_URL = 'https://example.com/owner-avatar.png';

// Stands in for the bundled fallback SVG so a resolved account icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

// Capture the props handed to the layout primitive, which is the whole contract of this component.
let mockCapturedSubscriptAvatarProps: Record<string, unknown> = {};

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

jest.mock('@components/Avatar/layouts/SubscriptAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedSubscriptAvatarProps = props;
        return <View testID="MockedSubscriptAvatar" />;
    };
});

const createExpenseReport = (overrides: Partial<Report> = {}): Report => ({
    reportID: REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    ownerAccountID: OWNER_ACCOUNT_ID,
    policyID: POLICY_ID,
    parentReportID: PARENT_REPORT_ID,
    ...overrides,
});

describe('ExpenseReportAvatar (connected)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedSubscriptAvatarProps = {};
        mockPersonalDetails = {
            [OWNER_ACCOUNT_ID]: {accountID: OWNER_ACCOUNT_ID, login: OWNER_LOGIN, avatar: OWNER_AVATAR_URL},
        };
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('should render the owner as the primary avatar with the workspace icon as the subscript', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createExpenseReport());
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: POLICY_NAME, avatarURL: POLICY_AVATAR_URL});
        await waitForBatchedUpdatesWithAct();

        render(
            <ExpenseReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.SMALL}
                backdropColor="#ff0000"
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        expect(screen.getByTestId('MockedSubscriptAvatar')).toBeOnTheScreen();
        expect(mockCapturedSubscriptAvatarProps.primaryAvatar).toEqual(
            expect.objectContaining({id: OWNER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: OWNER_AVATAR_URL, name: OWNER_LOGIN}),
        );
        expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual(
            expect.objectContaining({id: POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, source: POLICY_AVATAR_URL, name: POLICY_NAME}),
        );
        expect(mockCapturedSubscriptAvatarProps.size).toBe(CONST.AVATAR_SIZE.SMALL);
        expect(mockCapturedSubscriptAvatarProps.backdropColor).toBe('#ff0000');
        expect(mockCapturedSubscriptAvatarProps.fallbackDisplayName).toBe(FALLBACK_NAME);
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
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createExpenseReport({policyName: POLICY_NAME, policyAvatar: reportPolicyAvatar}));
            if (policy) {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: POLICY_NAME, ...policy});
            }
            if (parentChatPolicyAvatar) {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`, {reportID: PARENT_REPORT_ID, type: CONST.REPORT.TYPE.CHAT, policyAvatar: parentChatPolicyAvatar});
            }
            await waitForBatchedUpdatesWithAct();

            render(
                <ExpenseReportAvatar
                    reportID={REPORT_ID}
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
                report?: Partial<Report>;
                parentChat?: Partial<Report>;
            },
            expectedName,
        ) => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createExpenseReport(report));
            if (policy) {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, ...policy});
            }
            if (parentChat) {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`, {reportID: PARENT_REPORT_ID, type: CONST.REPORT.TYPE.CHAT, ...parentChat});
            }
            await waitForBatchedUpdatesWithAct();

            render(
                <ExpenseReportAvatar
                    reportID={REPORT_ID}
                    size={CONST.AVATAR_SIZE.DEFAULT}
                />,
            );

            expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual(expect.objectContaining({name: expectedName}));
        },
    );

    it('should resolve the workspace chat through chatReportID when parentReportID is absent', async () => {
        const chatReportID = 'workspaceChat789';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createExpenseReport({parentReportID: undefined, chatReportID}));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, {reportID: chatReportID, type: CONST.REPORT.TYPE.CHAT, policyName: 'Chat Policy Name'});
        await waitForBatchedUpdatesWithAct();

        render(
            <ExpenseReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual(expect.objectContaining({name: 'Chat Policy Name'}));
    });

    it('should render the fallback avatar as the primary when the report has no owner', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createExpenseReport({ownerAccountID: undefined}));
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: POLICY_NAME});
        await waitForBatchedUpdatesWithAct();

        render(
            <ExpenseReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockCapturedSubscriptAvatarProps.primaryAvatar).toEqual(expect.objectContaining({id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: MockFallbackAvatar}));
    });

    it('should seed the default avatar from the account ID when the owner is missing from personal details', async () => {
        mockPersonalDetails = {};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createExpenseReport());
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: POLICY_NAME});
        await waitForBatchedUpdatesWithAct();

        render(
            <ExpenseReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
            />,
        );

        expect(mockCapturedSubscriptAvatarProps.primaryAvatar).toEqual(
            expect.objectContaining({id: OWNER_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: getDefaultAvatarURL({accountID: OWNER_ACCOUNT_ID})}),
        );
    });

    const CONTAINER_STYLE = {marginRight: 0};

    it.each([
        ['forward the container style to the subscript stack', CONTAINER_STYLE, CONTAINER_STYLE],
        ['leave the subscript stack on its default container styles when no container style is passed', undefined, undefined],
    ])('should %s', async (_case, containerStyle, expectedContainerStyle) => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, createExpenseReport());
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: POLICY_NAME});
        await waitForBatchedUpdatesWithAct();

        render(
            <ExpenseReportAvatar
                reportID={REPORT_ID}
                size={CONST.AVATAR_SIZE.DEFAULT}
                containerStyle={containerStyle}
            />,
        );

        expect(mockCapturedSubscriptAvatarProps.containerStyle).toBe(expectedContainerStyle);
    });
});
