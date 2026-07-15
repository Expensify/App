import {fireEvent, render, screen} from '@testing-library/react-native';

import AvatarSelector from '@components/AvatarSelector';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {LETTER_AVATAR_COLOR_KEYS, LETTER_AVATAR_SCHEMES} from '@libs/Avatars/letterAvatarPalette';
import {USER_AVATARS} from '@libs/Avatars/UserAvatarCatalog';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockUseLetterAvatars = jest.fn();
jest.mock('@hooks/useLetterAvatars', () => ({
    __esModule: true,
    default: () => mockUseLetterAvatars() as unknown,
}));

const mockIsBetaEnabled = jest.fn<boolean, [string]>();
jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: mockIsBetaEnabled}),
}));

const letterAvatarsResult = {
    initials: 'AB',
    options: LETTER_AVATAR_COLOR_KEYS.map((id) => ({
        id,
        colors: LETTER_AVATAR_SCHEMES[id],
    })),
};

const emptyLetterAvatarsResult = {initials: '', options: []};

describe('AvatarSelector', () => {
    const onSelectMock = jest.fn();

    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsBetaEnabled.mockReturnValue(false);
        mockUseLetterAvatars.mockReturnValue(emptyLetterAvatarsResult);
    });

    const renderAvatarSelector = (props = {}) => {
        return render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <AvatarSelector
                    onSelect={onSelectMock}
                    {...props}
                />
            </ComposeProviders>,
        );
    };

    describe('Common behavior', () => {
        it('renders with label when provided', async () => {
            const label = 'Choose an avatar';
            mockUseLetterAvatars.mockReturnValue(letterAvatarsResult);
            renderAvatarSelector({label});
            await waitForBatchedUpdates();

            expect(screen.getByText(label)).toBeOnTheScreen();
        });

        it('does not render label when not provided', async () => {
            renderAvatarSelector();
            await waitForBatchedUpdates();

            const text = screen.queryByText('Choose an avatar');
            expect(text).not.toBeOnTheScreen();
        });
    });

    describe('USER_AVATARS grid', () => {
        it('renders all user catalog avatars', async () => {
            renderAvatarSelector();
            await waitForBatchedUpdates();

            for (const {id} of USER_AVATARS.ordered) {
                expect(screen.getByTestId(`AvatarSelector_${id}`)).toBeOnTheScreen();
            }
        });

        it('does not render agent (bot) avatars', async () => {
            renderAvatarSelector();
            await waitForBatchedUpdates();

            const agentAvatarIds = ['bot-avatar--blue', 'bot-avatar--green', 'bot-avatar--ice', 'bot-avatar--pink', 'bot-avatar--tangerine', 'bot-avatar--yellow'];
            for (const id of agentAvatarIds) {
                expect(screen.queryByTestId(`AvatarSelector_${id}`)).not.toBeOnTheScreen();
            }
        });

        it('calls onSelect when custom avatar is pressed', async () => {
            renderAvatarSelector();
            await waitForBatchedUpdates();

            const firstAvatarId = USER_AVATARS.ordered.at(0)?.id;
            const firstAvatar = screen.getByTestId(`AvatarSelector_${firstAvatarId}`);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
            fireEvent.press(firstAvatar.parent?.parent!);
            await waitForBatchedUpdates();

            expect(onSelectMock).toHaveBeenCalledWith(firstAvatarId);
            expect(onSelectMock).toHaveBeenCalledTimes(1);
        });

        it('shows selected custom avatar with border styling', async () => {
            const selectedId = USER_AVATARS.ordered.at(1)?.id;

            renderAvatarSelector({selectedID: selectedId});
            await waitForBatchedUpdates();

            const selectedAvatar = screen.getByTestId(`AvatarSelector_${selectedId}`);
            expect(selectedAvatar).toBeOnTheScreen();
        });
    });

    describe('letter avatars', () => {
        beforeEach(() => {
            mockIsBetaEnabled.mockReturnValue(true);
            mockUseLetterAvatars.mockReturnValue(letterAvatarsResult);
        });

        it('renders one option per palette scheme with the user initials', async () => {
            renderAvatarSelector();
            await waitForBatchedUpdates();

            for (const schemeKey of LETTER_AVATAR_COLOR_KEYS) {
                expect(screen.getByTestId(`AvatarSelector_${schemeKey}`)).toBeOnTheScreen();
            }
            expect(screen.getAllByText(letterAvatarsResult.initials)).toHaveLength(LETTER_AVATAR_COLOR_KEYS.length);
        });

        it('does not render letter avatars when there are no initials', async () => {
            mockUseLetterAvatars.mockReturnValue(emptyLetterAvatarsResult);
            renderAvatarSelector();
            await waitForBatchedUpdates();

            for (const schemeKey of LETTER_AVATAR_COLOR_KEYS) {
                expect(screen.queryByTestId(`AvatarSelector_${schemeKey}`)).not.toBeOnTheScreen();
            }
        });

        it('calls onSelect with the scheme key when a letter avatar is pressed', async () => {
            renderAvatarSelector();
            await waitForBatchedUpdates();

            const firstSchemeKey = LETTER_AVATAR_COLOR_KEYS.at(0);
            const firstLetterAvatar = screen.getByTestId(`AvatarSelector_${firstSchemeKey}`);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
            fireEvent.press(firstLetterAvatar.parent?.parent!);
            await waitForBatchedUpdates();

            expect(onSelectMock).toHaveBeenCalledWith(firstSchemeKey);
            expect(onSelectMock).toHaveBeenCalledTimes(1);
        });

        it('shows selected letter avatar with border styling', async () => {
            const selectedSchemeKey = LETTER_AVATAR_COLOR_KEYS.at(2);

            renderAvatarSelector({selectedID: selectedSchemeKey});
            await waitForBatchedUpdates();

            const selectedAvatar = screen.getByTestId(`AvatarSelector_${selectedSchemeKey}`);
            expect(selectedAvatar).toBeOnTheScreen();
        });

        it('renders both custom and letter avatars', async () => {
            renderAvatarSelector();
            await waitForBatchedUpdates();

            const firstUserAvatarId = USER_AVATARS.ordered.at(0)?.id;
            expect(screen.getByTestId(`AvatarSelector_${firstUserAvatarId}`)).toBeOnTheScreen();
            expect(screen.getByTestId(`AvatarSelector_${LETTER_AVATAR_COLOR_KEYS.at(0)}`)).toBeOnTheScreen();
        });
    });

    describe('when LETTER_AVATARS beta is disabled', () => {
        it('does not render any letter avatars even when options exist', async () => {
            mockUseLetterAvatars.mockReturnValue(letterAvatarsResult);
            renderAvatarSelector();
            await waitForBatchedUpdates();

            for (const schemeKey of LETTER_AVATAR_COLOR_KEYS) {
                expect(screen.queryByTestId(`AvatarSelector_${schemeKey}`)).not.toBeOnTheScreen();
            }
        });
    });
});
