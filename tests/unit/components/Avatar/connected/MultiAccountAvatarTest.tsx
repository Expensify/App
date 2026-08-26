import {render, screen} from '@testing-library/react-native';

import MultiAccountAvatar from '@components/Avatar/connected/MultiAccountAvatar';

import CONST from '@src/CONST';
import type {PersonalDetailsList} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import React from 'react';

const FIRST_ACCOUNT_ID = 3;
const SECOND_ACCOUNT_ID = 1;
const THIRD_ACCOUNT_ID = 2;

// Stands in for the bundled fallback SVG so the resolved icon can be asserted by identity.
function MockFallbackAvatar() {
    return null;
}

// Captures the props handed to the layout primitives, which is the whole contract of this component.
let mockCapturedHorizontalAvatarsProps: Record<string, unknown> = {};
let mockCapturedSingleAvatarProps: Record<string, unknown> = {};

// `sortIconsByName` has its own tests — here it only has to be observable, so it reverses.
const mockSortIconsByName = jest.fn((icons: Icon[]) => [...icons].reverse());

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({
        ConciergeAvatar: MockFallbackAvatar,
        NotificationsAvatar: MockFallbackAvatar,
        FallbackAvatar: MockFallbackAvatar,
    }),
}));

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({localeCompare: (first: string, second: string) => first.localeCompare(second)})));

jest.mock('@libs/ReportUtils', () => ({
    sortIconsByName: (icons: Icon[]) => mockSortIconsByName(icons),
}));

let mockPersonalDetails: PersonalDetailsList = {};

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => mockPersonalDetails,
}));

jest.mock('@components/Avatar/layouts/HorizontalAvatars', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return (props: Record<string, unknown>) => {
        mockCapturedHorizontalAvatarsProps = props;
        return <View testID="MockedHorizontalAvatars" />;
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

/** Builds the `toEqual` shape for a list of icons in a known order, so the assertions never poke at the captured props. */
function iconsForAccountsInOrder(...accountIDs: number[]) {
    return accountIDs.map((accountID) => expect.objectContaining({id: accountID}));
}

describe('MultiAccountAvatar (connected)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCapturedHorizontalAvatarsProps = {};
        mockCapturedSingleAvatarProps = {};
        mockPersonalDetails = {
            [FIRST_ACCOUNT_ID]: {accountID: FIRST_ACCOUNT_ID, login: 'carol@example.com'},
            [SECOND_ACCOUNT_ID]: {accountID: SECOND_ACCOUNT_ID, login: 'alice@example.com'},
            [THIRD_ACCOUNT_ID]: {accountID: THIRD_ACCOUNT_ID, login: 'bob@example.com'},
        };
    });

    describe('accounts to render', () => {
        it('should hand every account to the horizontal stack, in the order they were passed', () => {
            render(<MultiAccountAvatar accountIDs={[FIRST_ACCOUNT_ID, SECOND_ACCOUNT_ID, THIRD_ACCOUNT_ID]} />);

            expect(mockCapturedHorizontalAvatarsProps.icons).toEqual(iconsForAccountsInOrder(FIRST_ACCOUNT_ID, SECOND_ACCOUNT_ID, THIRD_ACCOUNT_ID));
        });

        it('should drop placeholder account IDs', () => {
            render(<MultiAccountAvatar accountIDs={[CONST.DEFAULT_NUMBER_ID, FIRST_ACCOUNT_ID]} />);

            expect(mockCapturedHorizontalAvatarsProps.icons).toEqual(iconsForAccountsInOrder(FIRST_ACCOUNT_ID));
        });

        it.each([
            ['no account IDs at all', []],
            ['only placeholder account IDs', [CONST.DEFAULT_NUMBER_ID]],
        ])('should render one placeholder avatar for %s, so the slot keeps its size', (_case, accountIDs) => {
            render(<MultiAccountAvatar accountIDs={accountIDs} />);

            expect(mockCapturedSingleAvatarProps.avatar).toEqual(expect.objectContaining({id: CONST.DEFAULT_NUMBER_ID}));
            // The lone placeholder must not go through the stack, which would draw the overlap border around it
            expect(screen.queryByTestId('MockedHorizontalAvatars')).toBeNull();
        });
    });

    describe('sorting', () => {
        it('should leave the icons in the order they were passed when no sorting is requested', () => {
            render(<MultiAccountAvatar accountIDs={[FIRST_ACCOUNT_ID, SECOND_ACCOUNT_ID]} />);

            expect(mockSortIconsByName).not.toHaveBeenCalled();
            expect(mockCapturedHorizontalAvatarsProps.icons).toEqual(iconsForAccountsInOrder(FIRST_ACCOUNT_ID, SECOND_ACCOUNT_ID));
        });

        it('should sort by ID', () => {
            render(
                <MultiAccountAvatar
                    accountIDs={[FIRST_ACCOUNT_ID, SECOND_ACCOUNT_ID, THIRD_ACCOUNT_ID]}
                    sortBy={[CONST.REPORT_ACTION_AVATARS.SORT_BY.ID]}
                />,
            );

            expect(mockCapturedHorizontalAvatarsProps.icons).toEqual(iconsForAccountsInOrder(SECOND_ACCOUNT_ID, THIRD_ACCOUNT_ID, FIRST_ACCOUNT_ID));
        });

        it('should delegate sorting by name', () => {
            render(
                <MultiAccountAvatar
                    accountIDs={[FIRST_ACCOUNT_ID, SECOND_ACCOUNT_ID]}
                    sortBy={[CONST.REPORT_ACTION_AVATARS.SORT_BY.NAME]}
                />,
            );

            expect(mockSortIconsByName).toHaveBeenCalledTimes(1);
            expect(mockCapturedHorizontalAvatarsProps.icons).toEqual(iconsForAccountsInOrder(SECOND_ACCOUNT_ID, FIRST_ACCOUNT_ID));
        });

        it('should reverse the order after sorting', () => {
            render(
                <MultiAccountAvatar
                    accountIDs={[FIRST_ACCOUNT_ID, SECOND_ACCOUNT_ID, THIRD_ACCOUNT_ID]}
                    sortBy={[CONST.REPORT_ACTION_AVATARS.SORT_BY.ID, CONST.REPORT_ACTION_AVATARS.SORT_BY.REVERSE]}
                />,
            );

            expect(mockCapturedHorizontalAvatarsProps.icons).toEqual(iconsForAccountsInOrder(FIRST_ACCOUNT_ID, THIRD_ACCOUNT_ID, SECOND_ACCOUNT_ID));
        });
    });

    describe('forwarded presentation props', () => {
        it('should forward the stacking options', () => {
            render(
                <MultiAccountAvatar
                    accountIDs={[FIRST_ACCOUNT_ID]}
                    horizontalOptions={{maxRows: 2, isHovered: true}}
                    isInReportAction
                />,
            );

            expect(mockCapturedHorizontalAvatarsProps).toEqual(expect.objectContaining({maxRows: 2, isHovered: true, isInReportAction: true}));
        });

        it.each([
            ['the default size when none is passed', undefined, CONST.AVATAR_SIZE.DEFAULT],
            ['the passed size', CONST.AVATAR_SIZE.SMALL, CONST.AVATAR_SIZE.SMALL],
        ])('should forward %s', (_case, size, expectedSize) => {
            render(
                <MultiAccountAvatar
                    accountIDs={[FIRST_ACCOUNT_ID]}
                    size={size}
                />,
            );

            expect(mockCapturedHorizontalAvatarsProps.size).toBe(expectedSize);
        });

        it('should forward the tooltip fallback display name', () => {
            render(
                <MultiAccountAvatar
                    accountIDs={[FIRST_ACCOUNT_ID]}
                    fallbackDisplayName="John Doe"
                />,
            );

            expect(mockCapturedHorizontalAvatarsProps.fallbackDisplayName).toBe('John Doe');
        });
    });
});
