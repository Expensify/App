import {render, screen} from '@testing-library/react-native';

import AvatarNamesTooltip from '@components/Avatar/tooltips/AvatarNamesTooltip';
import AvatarTooltip from '@components/Avatar/tooltips/AvatarTooltip';
import {AvatarTooltipsProvider, useAreAvatarTooltipsEnabled} from '@components/Avatar/tooltips/AvatarTooltipContext';
import type {AvatarIcon} from '@components/Avatar/types';

import {getUserDetailTooltipText} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import type {PropsWithChildren} from 'react';

import {View} from 'react-native';

const USER_DETAILS_TOOLTIP_TEST_ID = 'MockUserDetailsTooltip';
const TOOLTIP_TEST_ID = 'MockTooltip';
const CHILD_TEST_ID = 'AvatarChild';

type CapturedUserDetailsTooltipProps = {
    accountID: number;
    delegateAccountID?: number;
    icon?: AvatarIcon;
    fallbackUserDetails?: {displayName?: string};
};

const mockUserDetailsTooltipProps: CapturedUserDetailsTooltipProps[] = [];
const mockTooltipTexts: string[] = [];

function MockUserDetailsTooltip({children, ...props}: PropsWithChildren<CapturedUserDetailsTooltipProps>) {
    mockUserDetailsTooltipProps.push(props);
    return <View testID={USER_DETAILS_TOOLTIP_TEST_ID}>{children}</View>;
}

function MockTooltip({text, children}: PropsWithChildren<{text: string}>) {
    mockTooltipTexts.push(text);
    return <View testID={TOOLTIP_TEST_ID}>{children}</View>;
}

jest.mock('@components/UserDetailsTooltip', () => ({__esModule: true, default: MockUserDetailsTooltip}));

jest.mock('@components/Tooltip', () => ({__esModule: true, default: MockTooltip}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        formatPhoneNumber: (phoneNumber: string) => phoneNumber,
        translate: (key: string) => key,
    })),
);

jest.mock('@libs/ReportUtils', () => ({
    getUserDetailTooltipText: jest.fn((accountID: number, formatPhoneNumber: unknown, translate: unknown, fallbackUserDisplayName = '') => `${fallbackUserDisplayName}#${accountID}`),
}));

function buildAvatar(overrides: Partial<AvatarIcon> = {}): AvatarIcon {
    return {
        source: 'https://example.com/avatar.png',
        type: CONST.ICON_TYPE_AVATAR,
        id: 123,
        name: 'Alice',
        ...overrides,
    };
}

function AvatarChild() {
    return <View testID={CHILD_TEST_ID} />;
}

beforeEach(() => {
    mockUserDetailsTooltipProps.length = 0;
    mockTooltipTexts.length = 0;
    jest.mocked(getUserDetailTooltipText).mockClear();
});

describe('AvatarTooltipsProvider / useAreAvatarTooltipsEnabled', () => {
    function EnabledStateProbe() {
        const areTooltipsEnabled = useAreAvatarTooltipsEnabled();
        return <View testID={`tooltips-enabled-${areTooltipsEnabled}`} />;
    }

    it('is enabled by default (no provider)', () => {
        render(<EnabledStateProbe />);
        expect(screen.getByTestId('tooltips-enabled-true')).toBeOnTheScreen();
    });

    it.each([
        ['disables tooltips when isEnabled is false', false, false],
        ['keeps tooltips enabled when isEnabled is true', true, true],
        ['keeps tooltips enabled by default', undefined, true],
    ])('%s', (_description, isEnabled, expectedEnabled) => {
        render(
            <AvatarTooltipsProvider isEnabled={isEnabled}>
                <EnabledStateProbe />
            </AvatarTooltipsProvider>,
        );
        expect(screen.getByTestId(`tooltips-enabled-${expectedEnabled}`)).toBeOnTheScreen();
    });

    it('lets a nested provider re-enable tooltips', () => {
        render(
            <AvatarTooltipsProvider isEnabled={false}>
                <AvatarTooltipsProvider isEnabled>
                    <EnabledStateProbe />
                </AvatarTooltipsProvider>
            </AvatarTooltipsProvider>,
        );
        expect(screen.getByTestId('tooltips-enabled-true')).toBeOnTheScreen();
    });
});

describe('AvatarTooltip', () => {
    it('wraps children in UserDetailsTooltip', () => {
        render(
            <AvatarTooltip avatar={buildAvatar()}>
                <AvatarChild />
            </AvatarTooltip>,
        );

        expect(screen.getByTestId(USER_DETAILS_TOOLTIP_TEST_ID)).toBeOnTheScreen();
        expect(screen.getByTestId(CHILD_TEST_ID)).toBeOnTheScreen();
        expect(mockUserDetailsTooltipProps.at(0)?.icon).toEqual(buildAvatar());
    });

    it.each([
        ['uses the avatar id as accountID', buildAvatar({id: 123}), 123, undefined],
        ['converts a string avatar id to a number', buildAvatar({id: '42'}), 42, undefined],
        ['uses the acted-for account for a copilot avatar and passes the copilot as delegate', buildAvatar({id: 123, copilot: {accountID: 789, actedForAccountID: 456}}), 456, 789],
        ['falls back to the avatar id when the copilot has no acted-for account', buildAvatar({id: 123, copilot: {accountID: 789}}), 123, 789],
        ['falls back to DEFAULT_NUMBER_ID without an avatar', undefined, CONST.DEFAULT_NUMBER_ID, undefined],
    ])('%s', (_description, avatar, expectedAccountID, expectedDelegateAccountID) => {
        render(
            <AvatarTooltip avatar={avatar}>
                <AvatarChild />
            </AvatarTooltip>,
        );

        expect(mockUserDetailsTooltipProps.at(0)?.accountID).toBe(expectedAccountID);
        expect(mockUserDetailsTooltipProps.at(0)?.delegateAccountID).toBe(expectedDelegateAccountID);
    });

    it.each([
        ['prefers fallbackDisplayName over the avatar name', 'Fallback Name', 'Fallback Name'],
        ['falls back to the avatar name when fallbackDisplayName is empty', '', 'Alice'],
        ['falls back to the avatar name when fallbackDisplayName is missing', undefined, 'Alice'],
    ])('%s', (_description, fallbackDisplayName, expectedDisplayName) => {
        render(
            <AvatarTooltip
                avatar={buildAvatar({name: 'Alice'})}
                fallbackDisplayName={fallbackDisplayName}
            >
                <AvatarChild />
            </AvatarTooltip>,
        );

        expect(mockUserDetailsTooltipProps.at(0)?.fallbackUserDetails?.displayName).toBe(expectedDisplayName);
    });

    it('renders children without a tooltip when tooltips are disabled', () => {
        render(
            <AvatarTooltipsProvider isEnabled={false}>
                <AvatarTooltip avatar={buildAvatar()}>
                    <AvatarChild />
                </AvatarTooltip>
            </AvatarTooltipsProvider>,
        );

        expect(screen.queryByTestId(USER_DETAILS_TOOLTIP_TEST_ID)).not.toBeOnTheScreen();
        expect(screen.getByTestId(CHILD_TEST_ID)).toBeOnTheScreen();
        expect(mockUserDetailsTooltipProps).toHaveLength(0);
    });
});

describe('AvatarNamesTooltip', () => {
    const avatars: Icon[] = [
        {source: 'https://example.com/a.png', type: CONST.ICON_TYPE_AVATAR, id: 1, name: 'Alice'},
        {source: 'https://example.com/b.png', type: CONST.ICON_TYPE_AVATAR, id: 2, name: 'Bob'},
    ];

    it('joins the tooltip text of every avatar with a comma', () => {
        render(
            <AvatarNamesTooltip avatars={avatars}>
                <AvatarChild />
            </AvatarNamesTooltip>,
        );

        expect(screen.getByTestId(TOOLTIP_TEST_ID)).toBeOnTheScreen();
        expect(screen.getByTestId(CHILD_TEST_ID)).toBeOnTheScreen();
        expect(mockTooltipTexts.at(0)).toBe('Alice#1, Bob#2');
        expect(getUserDetailTooltipText).toHaveBeenCalledTimes(2);
        expect(getUserDetailTooltipText).toHaveBeenNthCalledWith(1, 1, expect.any(Function), expect.any(Function), 'Alice');
        expect(getUserDetailTooltipText).toHaveBeenNthCalledWith(2, 2, expect.any(Function), expect.any(Function), 'Bob');
    });

    it('renders children without a tooltip when tooltips are disabled', () => {
        render(
            <AvatarTooltipsProvider isEnabled={false}>
                <AvatarNamesTooltip avatars={avatars}>
                    <AvatarChild />
                </AvatarNamesTooltip>
            </AvatarTooltipsProvider>,
        );

        expect(screen.queryByTestId(TOOLTIP_TEST_ID)).not.toBeOnTheScreen();
        expect(screen.getByTestId(CHILD_TEST_ID)).toBeOnTheScreen();
        expect(mockTooltipTexts).toHaveLength(0);
    });
});
