import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import {View} from 'react-native';
import type {SvgProps} from 'react-native-svg';
import AvatarSelector from '@components/AvatarSelector';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {ALL_CUSTOM_AVATARS, LETTER_AVATAR_COLOR_OPTIONS} from '@libs/Avatars/CustomAvatarCatalog';
import getFirstAlphaNumericCharacter from '@libs/getFirstAlphaNumericCharacter';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLetterAvatars', () => ({
    __esModule: true,
    default: (name?: string) => {
        if (!name) {
            return {avatarList: [], avatarMap: {}};
        }

        const firstChar = name.at(0)?.toLowerCase();
        const avatarList = LETTER_AVATAR_COLOR_OPTIONS.map(({fillColor, backgroundColor}) => {
            const id = `letter-avatar-${backgroundColor}-${fillColor}-${firstChar}`;
            const StyledLetterAvatar = () => <View id={id}></View>;
            return {id, StyledLetterAvatar};
        });

        return {avatarList, avatarMap: {}};
    },
}));

describe('AvatarSelector', () => {
    const onSelectMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderAvatarSelector = (props = {}) => {
        return render(
            <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
                <AvatarSelector
                    onSelect={onSelectMock}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                />
            </ComposeProviders>,
        );
    };

    describe('Common behavior', () => {
        it('renders with label when provided', async () => {
            const label = 'Choose an avatar';
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

    // TODO uncomment when we add ALL_CUSTOM_AVATARS https://github.com/Expensify/App/pull/72542
    xdescribe('CUSTOM_AVATAR_CATALOG avatars', () => {
        it('renders all avatars from custom catalog', async () => {
            renderAvatarSelector();
            await waitForBatchedUpdates();

            // Check that all custom avatars are rendered
            const avatars = Object.keys(ALL_CUSTOM_AVATARS);
            avatars.forEach((id) => {
                expect(screen.getByTestId(`AvatarSelector_${id}`)).toBeOnTheScreen();
            });
        });

        it('calls onSelect when custom avatar is pressed', async () => {
            renderAvatarSelector();
            await waitForBatchedUpdates();

            const avatars = Object.keys(ALL_CUSTOM_AVATARS);
            const firstAvatarId = avatars.at(0);
            const firstAvatar = screen.getByTestId(`AvatarSelector_${firstAvatarId}`);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
            fireEvent.press(firstAvatar.parent?.parent!);
            await waitForBatchedUpdates();

            expect(onSelectMock).toHaveBeenCalledWith(firstAvatarId);
            expect(onSelectMock).toHaveBeenCalledTimes(1);
        });

        it('shows selected custom avatar with border styling', async () => {
            const avatars = Object.keys(ALL_CUSTOM_AVATARS);
            const selectedId = avatars.at(1) as keyof typeof ALL_CUSTOM_AVATARS;

            renderAvatarSelector({selectedID: selectedId});
            await waitForBatchedUpdates();

            const selectedAvatar = screen.getByTestId(`AvatarSelector_${selectedId}`);
            expect(selectedAvatar).toBeOnTheScreen();
        });
    });

    describe('avatarList (letter avatars)', () => {
        const testFirstName = 'Alice';
        const firstChar = getFirstAlphaNumericCharacter(testFirstName).toLowerCase();

        it('letter avatars have correct ID format when they are rendered', async () => {
            renderAvatarSelector({firstName: testFirstName});
            await waitForBatchedUpdates();

            const allAvatars = screen.queryAllByTestId(/^AvatarSelector_/);
            screen.debug();
            console.log(allAvatars);
            const letterAvatars = allAvatars.filter((node) => node.props.testID?.includes('letter-avatar'));

            expect(letterAvatars).toHaveLength(LETTER_AVATAR_COLOR_OPTIONS.length);

            for (const avatar of letterAvatars) {
                expect(avatar.props.testID).toMatch(/^AvatarSelector_letter-avatar-#[0-9A-F]{6}-#[0-9A-F]{6}-[a-z0-9]$/i);
                expect(avatar.props.testID).toContain(firstChar);
            }
        });

        it('does not render letter avatars when firstName is not provided', async () => {
            renderAvatarSelector();
            await waitForBatchedUpdates();

            const allAvatars = screen.queryAllByTestId(/^AvatarSelector_/);
            const letterAvatars = allAvatars.filter((node) => node.props.testID?.includes('letter-avatar'));

            expect(letterAvatars).toHaveLength(0);
        });

        it('calls onSelect when letter avatar is pressed (if rendered)', async () => {
            renderAvatarSelector({firstName: testFirstName});
            await waitForBatchedUpdates();

            const allAvatars = screen.queryAllByTestId(/^AvatarSelector_/);
            const letterAvatars = allAvatars.filter((node) => node.props.testID?.includes('letter-avatar'));

            const firstLetterAvatar = letterAvatars.at(0);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
            fireEvent.press(firstLetterAvatar?.parent?.parent!);
            await waitForBatchedUpdates();

            const expectedId = firstLetterAvatar?.props.testID.replace('AvatarSelector_', '');
            expect(onSelectMock).toHaveBeenCalledWith(expectedId);
            expect(onSelectMock).toHaveBeenCalledTimes(1);
        });

        it('shows selected letter avatar with border styling (if rendered)', async () => {
            renderAvatarSelector({firstName: testFirstName});
            await waitForBatchedUpdates();

            const allAvatars = screen.queryAllByTestId(/^AvatarSelector_/);
            const letterAvatars = allAvatars.filter((node) => node.props.testID?.includes('letter-avatar'));

            const letterAvatarId = letterAvatars.at(2)?.props.testID.replace('AvatarSelector_', '');

            screen.unmount();

            renderAvatarSelector({
                firstName: testFirstName,
                selectedID: letterAvatarId,
            });
            await waitForBatchedUpdates();

            const selectedAvatar = screen.getByTestId(`AvatarSelector_${letterAvatarId}`);
            expect(selectedAvatar).toBeOnTheScreen();
        });

        // TODO uncomment when we add ALL_CUSTOM_AVATARS https://github.com/Expensify/App/pull/72542
        xit('renders both custom and letter avatars when firstName is provided', async () => {
            renderAvatarSelector({firstName: testFirstName});
            await waitForBatchedUpdates();

            const customAvatars = Object.keys(ALL_CUSTOM_AVATARS);
            expect(screen.getByTestId(`AvatarSelector_${customAvatars[0]}`)).toBeOnTheScreen();

            const allAvatars = screen.queryAllByTestId(/^AvatarSelector_/);
            const letterAvatars = allAvatars.filter((node) => node.props.testID?.includes('letter-avatar'));

            expect(letterAvatars.at(0)?.props.testID).toMatch(/^AvatarSelector_letter-avatar-/);
        });
    });
});
