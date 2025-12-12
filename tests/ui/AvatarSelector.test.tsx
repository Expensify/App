/* eslint-disable @typescript-eslint/no-unsafe-call */
import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import AvatarSelector from '@components/AvatarSelector';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {PRESET_AVATAR_CATALOG} from '@libs/Avatars/PresetAvatarCatalog';
import getFirstAlphaNumericCharacter from '@libs/getFirstAlphaNumericCharacter';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@hooks/useLetterAvatars', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: (name?: string) => {
        if (!name) {
            return {avatarList: [], avatarMap: {}};
        }

        const firstChar = name.at(0)?.toLowerCase();
        const avatarList = [
            {backgroundColor: '#B0D9FF', fillColor: '#0164BF'},
            {backgroundColor: '#0185FF', fillColor: '#003C73'},
            {backgroundColor: '#003C73', fillColor: '#8DC8FF'},
        ].map(({fillColor, backgroundColor}) => {
            const id = `letter-avatar-${backgroundColor}-${fillColor}-${firstChar}`;
            function StyledLetterAvatar() {
                // eslint-disable-next-line react/jsx-no-useless-fragment
                return <>{id}</>;
            }
            return {id, StyledLetterAvatar};
        });

        return {avatarList, avatarMap: {}};
    },
}));
const mockName = 'Alice';

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
            renderAvatarSelector({label, name: mockName});
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

    describe('PRESET_AVATAR_CATALOG_ORDERED avatars', () => {
        it('renders all avatars from custom catalog', async () => {
            renderAvatarSelector();
            await waitForBatchedUpdates();

            // Check that all custom avatars are rendered
            const avatars = Object.keys(PRESET_AVATAR_CATALOG);
            for (const id of avatars) {
                expect(screen.getByTestId(`AvatarSelector_${id}`)).toBeOnTheScreen();
            }
        });

        it('calls onSelect when custom avatar is pressed', async () => {
            renderAvatarSelector();
            await waitForBatchedUpdates();

            const avatars = Object.keys(PRESET_AVATAR_CATALOG);
            const firstAvatarId = avatars.at(0);
            const firstAvatar = screen.getByTestId(`AvatarSelector_${firstAvatarId}`);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
            fireEvent.press(firstAvatar.parent?.parent!);
            await waitForBatchedUpdates();

            expect(onSelectMock).toHaveBeenCalledWith(firstAvatarId);
            expect(onSelectMock).toHaveBeenCalledTimes(1);
        });

        it('shows selected custom avatar with border styling', async () => {
            const avatars = Object.keys(PRESET_AVATAR_CATALOG);
            const selectedId = avatars.at(1) as keyof typeof PRESET_AVATAR_CATALOG;

            renderAvatarSelector({selectedID: selectedId});
            await waitForBatchedUpdates();

            const selectedAvatar = screen.getByTestId(`AvatarSelector_${selectedId}`);
            expect(selectedAvatar).toBeOnTheScreen();
        });
    });

    describe('avatarList (letter avatars)', () => {
        const firstChar = getFirstAlphaNumericCharacter(mockName).toLowerCase();

        it('letter avatars have correct ID format when they are rendered', async () => {
            renderAvatarSelector({name: mockName});
            await waitForBatchedUpdates();

            const allAvatars = screen.queryAllByTestId(/^AvatarSelector_/);
            const letterAvatars = allAvatars.filter((node) => (node.props.testID as string)?.includes('letter-avatar'));

            expect(letterAvatars).toHaveLength(3);

            for (const avatar of letterAvatars) {
                expect(avatar.props.testID).toMatch(/^AvatarSelector_letter-avatar-#[0-9A-F]{6}-#[0-9A-F]{6}-[a-z0-9]$/i);
                expect(avatar.props.testID).toContain(firstChar);
            }
        });

        it('does not render letter avatars when firstName is not provided', async () => {
            renderAvatarSelector();
            await waitForBatchedUpdates();

            const allAvatars = screen.queryAllByTestId(/^AvatarSelector_/);
            const letterAvatars = allAvatars.filter((node) => (node.props.testID as string)?.includes('letter-avatar'));

            expect(letterAvatars).toHaveLength(0);
        });

        it('calls onSelect when letter avatar is pressed (if rendered)', async () => {
            renderAvatarSelector({name: mockName});
            await waitForBatchedUpdates();

            const allAvatars = screen.queryAllByTestId(/^AvatarSelector_/);
            const letterAvatars = allAvatars.filter((node) => (node.props.testID as string)?.includes('letter-avatar'));

            const firstLetterAvatar = letterAvatars.at(0);

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
            fireEvent.press(firstLetterAvatar?.parent?.parent!);
            await waitForBatchedUpdates();

            const expectedId = (firstLetterAvatar?.props.testID as string)?.replace('AvatarSelector_', '');
            expect(onSelectMock).toHaveBeenCalledWith(expectedId);
            expect(onSelectMock).toHaveBeenCalledTimes(1);
        });

        it('shows selected letter avatar with border styling (if rendered)', async () => {
            renderAvatarSelector({name: mockName});
            await waitForBatchedUpdates();

            const allAvatars = screen.queryAllByTestId(/^AvatarSelector_/);
            const letterAvatars = allAvatars.filter((node) => (node.props.testID as string)?.includes('letter-avatar'));

            const letterAvatarId = (letterAvatars.at(2)?.props.testID as string).replace('AvatarSelector_', '');

            screen.unmount();

            renderAvatarSelector({
                name: mockName,
                selectedID: letterAvatarId,
            });
            await waitForBatchedUpdates();

            const selectedAvatar = screen.getByTestId(`AvatarSelector_${letterAvatarId}`);
            expect(selectedAvatar).toBeOnTheScreen();
        });

        it('renders both custom and letter avatars when firstName is provided', async () => {
            renderAvatarSelector({name: mockName});
            await waitForBatchedUpdates();

            const presetAvatars = Object.keys(PRESET_AVATAR_CATALOG);
            expect(screen.getByTestId(`AvatarSelector_${presetAvatars.at(0)}`)).toBeOnTheScreen();

            const allAvatars = screen.queryAllByTestId(/^AvatarSelector_/);
            const letterAvatars = allAvatars.filter((node) => (node.props.testID as string)?.includes('letter-avatar'));

            expect(letterAvatars.at(0)?.props.testID).toMatch(/^AvatarSelector_letter-avatar-/);
        });
    });
});
