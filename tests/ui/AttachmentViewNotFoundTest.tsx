import {render, screen, userEvent} from '@testing-library/react-native';

import {AttachmentCarouselPagerActionsContext} from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import type {AttachmentCarouselPagerActionsContextType} from '@components/Attachments/AttachmentCarousel/Pager/types';
import AttachmentView from '@components/Attachments/AttachmentView';
import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/DeviceCapabilities', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/DeviceCapabilities'),
    canUseTouchScreen: jest.fn(() => true),
}));

// The image fails to load as soon as it mounts, like an attachment whose URL doesn't exist.
jest.mock('@components/ImageView', () => ({
    __esModule: true,
    default: function MockImageView({onError}: {onError?: () => void}) {
        const {useEffect: mockUseEffect} = jest.requireActual<typeof React>('react');
        mockUseEffect(() => {
            onError?.();
        }, [onError]);
        return null;
    },
}));

jest.mock('@components/VideoPlayerContexts/PlaybackContext', () => ({
    usePlaybackActionsContext: () => ({updateCurrentURLAndReportID: jest.fn()}),
}));

jest.mock('@hooks/useFirstRenderRoute', () => () => ({isFocused: false}));

const mockedCanUseTouchScreen = jest.mocked(canUseTouchScreen);
const MISSING_IMAGE_URL = 'https://example.com/images/missing.png';

function FallbackIcon() {
    return <View />;
}

async function renderNotFoundAttachment(actions: AttachmentCarouselPagerActionsContextType, onPress?: () => void) {
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <AttachmentCarouselPagerActionsContext.Provider value={actions}>
                <AttachmentView
                    source={MISSING_IMAGE_URL}
                    fallbackSource={FallbackIcon}
                    onPress={onPress}
                    isUsedInAttachmentModal
                    isFocused
                />
            </AttachmentCarouselPagerActionsContext.Provider>
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

describe('AttachmentView not found state', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockedCanUseTouchScreen.mockReturnValue(true);
    });

    it('toggles the carousel arrows when the not found view is tapped on a touch screen', async () => {
        // Given an image in the native carousel, which toggles the arrows through the pager's onTap, that failed to load
        const actions = {onTap: jest.fn()};
        await renderNotFoundAttachment(actions);
        expect(screen.getByText('Attachment not found')).toBeOnTheScreen();

        // When the user taps the not found view, which is all they can tap once the arrows auto-hid
        await userEvent.press(screen.getByText('Attachment not found'));

        // Then the carousel toggles the arrows, so the user can bring them back to move to the other attachments
        expect(actions.onTap).toHaveBeenCalledTimes(1);
        expect(actions.onTap).toHaveBeenCalledWith();
    });

    it('uses the onPress given by the carousel instead of the pager onTap', async () => {
        // Given an image in the web carousel on a touch screen, which passes its tap handler as onPress, that failed to load
        const actions = {onTap: jest.fn()};
        const onPress = jest.fn();
        await renderNotFoundAttachment(actions, onPress);

        // When the user taps the not found view
        await userEvent.press(screen.getByText('Attachment not found'));

        // Then only the carousel's own handler runs, so the arrows aren't toggled twice
        expect(onPress).toHaveBeenCalledTimes(1);
        expect(actions.onTap).not.toHaveBeenCalled();
    });

    it('does not toggle the arrows from the not found view without a touch screen', async () => {
        // Given a failed image in the carousel on a device without a touch screen, where hovering shows the arrows
        mockedCanUseTouchScreen.mockReturnValue(false);
        const actions = {onTap: jest.fn()};

        await renderNotFoundAttachment(actions);

        // When the user clicks the not found view
        await userEvent.press(screen.getByText('Attachment not found'));

        // Then the arrows aren't toggled, because a click must not hide the arrows the hover just showed
        expect(actions.onTap).not.toHaveBeenCalled();
    });

    it('keeps the arrows as they are when Retry is pressed', async () => {
        // Given a failed image in the carousel on a touch screen
        const actions = {onTap: jest.fn()};
        await renderNotFoundAttachment(actions);

        // When the user presses Retry
        await userEvent.press(screen.getByText('Retry'));

        // Then only the image reloads, because the Retry press must not also toggle the arrows
        expect(actions.onTap).not.toHaveBeenCalled();
    });
});
