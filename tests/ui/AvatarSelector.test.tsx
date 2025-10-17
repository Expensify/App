import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import AvatarSelector from '@components/AvatarSelector';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {ALL_CUSTOM_AVATARS} from '@libs/Avatars/CustomAvatarCatalog';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

TestHelper.setupApp();

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

    it('renders all avatars from catalog', async () => {
        renderAvatarSelector();
        await waitForBatchedUpdates();

        // Check that all avatars are rendered
        const avatars = Object.keys(ALL_CUSTOM_AVATARS);
        avatars.forEach((id) => {
            expect(screen.getByTestId(`AvatarSelector_${id}`)).toBeOnTheScreen();
        });
    });

    it('calls onSelect when avatar is pressed', async () => {
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

    it('renders with label when provided', async () => {
        const label = 'Choose an avatar';
        renderAvatarSelector({label});
        await waitForBatchedUpdates();

        expect(screen.getByText(label)).toBeOnTheScreen();
    });

    it('does not render label when not provided', async () => {
        renderAvatarSelector();
        await waitForBatchedUpdates();

        // Label should not exist when not provided
        const text = screen.queryByText('Choose an avatar');
        expect(text).not.toBeOnTheScreen();
    });

    it('shows selected avatar with different styling', async () => {
        const avatars = Object.keys(ALL_CUSTOM_AVATARS);
        const selectedId = avatars.at(0) as keyof typeof ALL_CUSTOM_AVATARS;

        renderAvatarSelector({selectedID: selectedId});
        await waitForBatchedUpdates();

        const selectedAvatar = screen.getByTestId(`AvatarSelector_${selectedId}`);
        expect(selectedAvatar).toBeOnTheScreen();
    });
});
