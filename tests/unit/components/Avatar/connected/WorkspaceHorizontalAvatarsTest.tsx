import {cleanup, render, screen} from '@testing-library/react-native';

import WorkspaceHorizontalAvatars from '@components/Avatar/connected/WorkspaceHorizontalAvatars';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {ReportAvatarFields} from '@selectors/Report';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const PARENT_REPORT_ID = 'parentChat456';
const POLICY_ID = 'policy123';
const POLICY_NAME = 'Acme Workspace';
const POLICY_AVATAR_URL = 'https://example.com/workspace-avatar.png';
const FALLBACK_NAME = 'Fallback Name';
const STACKING_OPTIONS = {isHovered: true, maxRows: 2, maxAvatarsPerRow: 8, overlapDivider: 4};

const ACTOR_ACCOUNT_ID = 42;
const PRIMARY_AVATAR: Icon = {id: ACTOR_ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, source: 'https://example.com/actor-avatar.png', name: 'zoe@example.com'};
const WORKSPACE_ICON = {id: POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE, source: POLICY_AVATAR_URL, name: POLICY_NAME};

const report: ReportAvatarFields = {parentReportID: PARENT_REPORT_ID, policyID: POLICY_ID};

// Capture the props handed to the layout primitive, which is the whole contract of this component.
let mockCapturedHorizontalAvatarsProps: Record<string, unknown> = {};

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        formatPhoneNumber: (phoneNumber: string) => phoneNumber,
        translate: (key: string) => key,
        localeCompare: (first: string, second: string) => first.localeCompare(second),
    })),
);

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => ({[ACTOR_ACCOUNT_ID]: {accountID: ACTOR_ACCOUNT_ID, login: 'zoe@example.com', displayName: 'Zoe'}}),
}));

jest.mock('@components/Avatar/layouts/HorizontalAvatars', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedHorizontalAvatarsProps = props;
        return <View testID="MockedHorizontalAvatars" />;
    };
});

describe('WorkspaceHorizontalAvatars (connected)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockCapturedHorizontalAvatarsProps = {};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: POLICY_NAME, avatarURL: POLICY_AVATAR_URL});
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        // Unmount before clearing so the store updates from the clear don't reach a mounted component outside act().
        cleanup();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('should render the primary avatar and the workspace icon side by side with the stacking options spread', async () => {
        render(
            <WorkspaceHorizontalAvatars
                report={report}
                primaryAvatar={PRIMARY_AVATAR}
                size={CONST.AVATAR_SIZE.XXXX_LARGE}
                horizontalStacking={STACKING_OPTIONS}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );
        // useOnyx delivers its initial value asynchronously, so flush it inside act() before asserting.
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('MockedHorizontalAvatars')).toBeOnTheScreen();
        expect(mockCapturedHorizontalAvatarsProps).toEqual({
            ...STACKING_OPTIONS,
            size: CONST.AVATAR_SIZE.XXXX_LARGE,
            icons: [PRIMARY_AVATAR, WORKSPACE_ICON],
            isInReportAction: false,
            fallbackDisplayName: FALLBACK_NAME,
        });
    });

    it("should take the stack's defaults when stacking is requested with `true`", async () => {
        render(
            <WorkspaceHorizontalAvatars
                report={report}
                primaryAvatar={PRIMARY_AVATAR}
                size={CONST.AVATAR_SIZE.DEFAULT}
                horizontalStacking
            />,
        );
        // useOnyx delivers its initial value asynchronously, so flush it inside act() before asserting.
        await waitForBatchedUpdatesWithAct();

        expect(mockCapturedHorizontalAvatarsProps).toEqual({
            isHovered: false,
            size: CONST.AVATAR_SIZE.DEFAULT,
            icons: [PRIMARY_AVATAR, WORKSPACE_ICON],
            isInReportAction: false,
            fallbackDisplayName: undefined,
        });
    });

    it.each([
        ['the given order without a sort', undefined, [PRIMARY_AVATAR, WORKSPACE_ICON]],
        ['reversed', CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE, [WORKSPACE_ICON, PRIMARY_AVATAR]],
        // The workspace icon has no personal details to name it, so its empty name sorts first.
        ['by name', CONST.REPORT_ACTION_AVATARS.SORT_BY.NAME, [WORKSPACE_ICON, PRIMARY_AVATAR]],
        ['by name and then reversed', [CONST.REPORT_ACTION_AVATARS.SORT_BY.NAME, CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE], [PRIMARY_AVATAR, WORKSPACE_ICON]],
    ])('should order the avatars %s', async (_case, sort, expectedIcons) => {
        render(
            <WorkspaceHorizontalAvatars
                report={report}
                primaryAvatar={PRIMARY_AVATAR}
                size={CONST.AVATAR_SIZE.DEFAULT}
                horizontalStacking
                sort={sort}
            />,
        );
        // useOnyx delivers its initial value asynchronously, so flush it inside act() before asserting.
        await waitForBatchedUpdatesWithAct();

        expect(mockCapturedHorizontalAvatarsProps.icons).toEqual(expectedIcons);
    });
});
