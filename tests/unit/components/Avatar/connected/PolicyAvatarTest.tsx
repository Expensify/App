import {render, screen} from '@testing-library/react-native';

import PolicyAvatar from '@components/Avatar/connected/PolicyAvatar';

import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {ViewStyle} from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../../../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'policy123';
const POLICY_NAME = 'Acme Workspace';
const POLICY_AVATAR_URL = 'https://example.com/workspace-avatar.png';
const FALLBACK_NAME = 'Pending Workspace';

const ACCOUNT_ID = 42;
const ACCOUNT_WITHOUT_DETAILS_ID = 7;
const LOGIN = 'john@example.com';
const ACCOUNT_AVATAR_URL = 'https://example.com/uploaded-avatar.png';

const CUSTOM_CONTAINER_STYLE = {borderRadius: 20};
const EMPTY_CONTAINER_STYLE: ViewStyle[] = [];
const BORDER_COLOR = '#ff0000';

// Stands in for the bundled fallback SVG so a resolved account icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

// Capture the props handed to the layout primitives, which is the whole contract of this component.
let mockCapturedSingleAvatarProps: Record<string, unknown> = {};
let mockCapturedSubscriptAvatarProps: Record<string, unknown> = {};

const mockGetContainerStyles = jest.fn((size: string) => [{marginRight: 12, size}]);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        ConciergeAvatar: MockFallbackAvatar,
        NotificationsAvatar: MockFallbackAvatar,
        FallbackAvatar: MockFallbackAvatar,
    }),
}));

jest.mock('@hooks/useStyleUtils', () => jest.fn(() => ({getContainerStyles: mockGetContainerStyles})));

let mockPersonalDetails: PersonalDetailsList = {};

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => mockPersonalDetails,
}));

jest.mock('@components/Avatar/layouts/SingleAvatar', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedSingleAvatarProps = props;
        return <View testID="MockedSingleAvatar" />;
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

describe('PolicyAvatar (connected)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedSingleAvatarProps = {};
        mockCapturedSubscriptAvatarProps = {};
        mockPersonalDetails = {
            [ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: LOGIN, avatar: ACCOUNT_AVATAR_URL},
        };
    });

    afterEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it.each([
        ['the uploaded avatar when the policy has one', {id: POLICY_ID, name: POLICY_NAME, avatarURL: POLICY_AVATAR_URL}, POLICY_AVATAR_URL, POLICY_NAME],
        // A workspace with no uploaded avatar stores an empty string, which has to fall through to the default avatar.
        ['the default avatar when avatarURL is an empty string', {id: POLICY_ID, name: POLICY_NAME, avatarURL: ''}, getDefaultWorkspaceAvatar(POLICY_NAME), POLICY_NAME],
    ])('should render a single workspace avatar resolved from %s', async (_case, policy, expectedSource, expectedName) => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await waitForBatchedUpdatesWithAct();

        render(<PolicyAvatar policyID={POLICY_ID} />);

        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps.avatar).toEqual({
            id: POLICY_ID,
            type: CONST.ICON_TYPE_WORKSPACE,
            source: expectedSource,
            name: expectedName,
        });
    });

    it('should seed the avatar from the fallback display name when the policy is not in Onyx', () => {
        render(
            <PolicyAvatar
                policyID={POLICY_ID}
                fallbackDisplayName={FALLBACK_NAME}
            />,
        );

        expect(mockCapturedSingleAvatarProps.avatar).toEqual({
            id: POLICY_ID,
            type: CONST.ICON_TYPE_WORKSPACE,
            source: getDefaultWorkspaceAvatar(FALLBACK_NAME),
            name: FALLBACK_NAME,
        });
        expect(mockCapturedSingleAvatarProps.fallbackDisplayName).toBe(FALLBACK_NAME);
    });

    it('should render the account as a subscript on the workspace avatar when an accountID is passed', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: POLICY_NAME, avatarURL: POLICY_AVATAR_URL});
        await waitForBatchedUpdatesWithAct();

        render(
            <PolicyAvatar
                policyID={POLICY_ID}
                accountID={ACCOUNT_ID}
                subscriptAvatarBorderColor={BORDER_COLOR}
            />,
        );

        expect(screen.getByTestId('MockedSubscriptAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedSingleAvatar')).not.toBeOnTheScreen();
        expect(mockCapturedSubscriptAvatarProps.primaryAvatar).toEqual(expect.objectContaining({id: POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE}));
        expect(mockCapturedSubscriptAvatarProps.secondaryAvatar).toEqual(expect.objectContaining({id: ACCOUNT_ID, type: CONST.ICON_TYPE_AVATAR, name: LOGIN}));
        expect(mockCapturedSubscriptAvatarProps.subscriptAvatarBorderColor).toBe(BORDER_COLOR);
    });

    it('should downgrade to a single avatar while the account icon is still nameless', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: POLICY_NAME, avatarURL: POLICY_AVATAR_URL});
        await waitForBatchedUpdatesWithAct();

        render(
            <PolicyAvatar
                policyID={POLICY_ID}
                accountID={ACCOUNT_WITHOUT_DETAILS_ID}
            />,
        );

        expect(screen.getByTestId('MockedSingleAvatar')).toBeOnTheScreen();
        expect(screen.queryByTestId('MockedSubscriptAvatar')).not.toBeOnTheScreen();
        expect(mockCapturedSingleAvatarProps.avatar).toEqual(expect.objectContaining({id: POLICY_ID, type: CONST.ICON_TYPE_WORKSPACE}));
    });

    it.each([
        ['the default size when none is passed', undefined, CONST.AVATAR_SIZE.DEFAULT],
        ['the passed size', CONST.AVATAR_SIZE.SMALL, CONST.AVATAR_SIZE.SMALL],
    ])('should derive the container styles from %s', (_case, size, expectedSize) => {
        render(
            <PolicyAvatar
                policyID={POLICY_ID}
                size={size}
            />,
        );

        expect(mockGetContainerStyles).toHaveBeenCalledWith(expectedSize);
        expect(mockCapturedSingleAvatarProps.size).toBe(expectedSize);
        expect(mockCapturedSingleAvatarProps.containerStyles).toEqual(mockGetContainerStyles(expectedSize));
    });

    it.each([
        ['a style object', CUSTOM_CONTAINER_STYLE],
        // An empty array is a deliberate "no container styles" request, so it must win over the size-derived default
        ['an empty style array', EMPTY_CONTAINER_STYLE],
    ])('should replace the derived container styles when containerStyle is %s', (_case, containerStyle) => {
        render(
            <PolicyAvatar
                policyID={POLICY_ID}
                containerStyle={containerStyle}
            />,
        );

        expect(mockCapturedSingleAvatarProps.containerStyles).toBe(containerStyle);
        expect(mockGetContainerStyles).not.toHaveBeenCalled();
    });

    // `ReportActionAvatars` never applied the single-avatar container style to a subscript stack, and the subscript
    // frame supplies its own size-derived container, so forwarding it here would shift every workspace+member row.
    it('should not forward the container style to the subscript layout', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, {id: POLICY_ID, name: POLICY_NAME, avatarURL: POLICY_AVATAR_URL});
        await waitForBatchedUpdatesWithAct();

        render(
            <PolicyAvatar
                policyID={POLICY_ID}
                accountID={ACCOUNT_ID}
                containerStyle={CUSTOM_CONTAINER_STYLE}
            />,
        );

        expect(mockCapturedSubscriptAvatarProps.containerStyle).toBeUndefined();
    });
});
