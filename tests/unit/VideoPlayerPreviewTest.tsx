import {act, fireEvent, render, screen} from '@testing-library/react-native';

import {usePlaybackActionsContext, usePlaybackStateContext} from '@components/VideoPlayerContexts/PlaybackContext';
import VideoPlayerPreview from '@components/VideoPlayerPreview';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import type {Button as NativeButton, View as NativeView} from 'react-native';

import React from 'react';

const mockNavigation = {addListener: jest.fn<() => void, [string, () => void]>().mockReturnValue(jest.fn())};

jest.mock('@components/OnyxListItemProvider', () => ({useSession: () => undefined}));
jest.mock('@components/Search/SearchScopeProvider', () => ({useIsOnSearch: () => false}));
jest.mock('@components/VideoPlayerContexts/PlaybackContext', () => ({
    usePlaybackActionsContext: jest.fn(),
    usePlaybackStateContext: jest.fn(),
}));
jest.mock('@components/VideoPlayer', () => {
    const {View} = jest.requireActual<{View: typeof NativeView}>('react-native');
    return () => <View testID="inline-video-player" />;
});
jest.mock('@components/VideoPlayer/IconButton', () => () => null);
jest.mock('@components/VideoPlayerPreview/VideoPlayerThumbnail', () => {
    const {Button} = jest.requireActual<{Button: typeof NativeButton}>('react-native');
    return ({onPress, accessibilityLabel}: {onPress: () => void; accessibilityLabel: string}) => (
        <Button
            onPress={onPress}
            accessibilityLabel={accessibilityLabel}
            title={accessibilityLabel}
        />
    );
});
jest.mock('@hooks/useCheckIfRouteHasRemainedUnchanged', () => () => () => true);
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({})}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useReportOrReportDraft', () => () => undefined);
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useThemeStyles', () => () => ({webViewStyles: {tagStyles: {video: {}}}}));
jest.mock('@hooks/useThumbnailDimensions', () => () => ({thumbnailDimensionsStyles: {}}));
jest.mock('@navigation/Navigation', () => ({getActiveRouteWithoutParams: () => ''}));
jest.mock('@react-navigation/native', () => ({useNavigation: () => mockNavigation}));

const mockUpdateCurrentURLAndReportID = jest.fn();
const mockShowModal = jest.fn();
const videoUrl = 'https://example.com/video.mp4';
const reportID = '123';
const previewProps = {
    videoUrl,
    reportID,
    fileName: 'video.mp4',
    videoDimensions: {width: 640, height: 480},
    videoDuration: 60,
    onShowModalPress: mockShowModal,
};

describe('VideoPlayerPreview', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(usePlaybackStateContext).mockReturnValue({
            currentlyPlayingURL: videoUrl,
            currentRouteReportID: reportID,
            originalParent: null,
            sharedElement: null,
            mountedVideoPlayersRef: {current: []},
            playerStatus: {current: 'readyToPlay'},
            shareVersion: 0,
            currentVideoPlayerRef: {current: null},
            currentVideoViewRef: {current: null},
        });
        jest.mocked(usePlaybackActionsContext).mockReturnValue({
            updateCurrentURLAndReportID: mockUpdateCurrentURLAndReportID,
            shareVideoPlayerElements: jest.fn(),
            setCurrentlyPlayingURL: jest.fn(),
            updatePlayerStatus: jest.fn(),
            requestDonorReRegistration: jest.fn(),
            resetVideoPlayerData: jest.fn(),
            playVideo: jest.fn(),
            pauseVideo: jest.fn(),
            replayVideo: jest.fn(),
            stopVideo: jest.fn(),
            checkIfVideoIsPlaying: jest.fn(),
        });
        jest.mocked(useResponsiveLayout).mockReturnValue({...useResponsiveLayout(), isSmallScreenWidth: false});
    });

    it('plays an already selected video on desktop only after pressing Play', () => {
        // Given a fresh thread preview whose parent video is already selected
        render(<VideoPlayerPreview {...previewProps} />);
        expect(screen.queryByTestId('inline-video-player')).toBeNull();

        // When Play is pressed without changing the shared selection returned by the context
        fireEvent.press(screen.getByLabelText(previewProps.fileName));

        // Then explicit user intent mounts the player without opening a modal or requiring a new selection
        expect(screen.getByTestId('inline-video-player')).toBeOnTheScreen();
        expect(mockUpdateCurrentURLAndReportID).toHaveBeenCalledWith(videoUrl, undefined, reportID);
        expect(mockShowModal).not.toHaveBeenCalled();
    });

    it('plays again after blur resets the thumbnail while the selection stays unchanged', () => {
        // Given an active inline preview whose video remains selected across navigation
        render(<VideoPlayerPreview {...previewProps} />);
        fireEvent.press(screen.getByLabelText(previewProps.fileName));
        expect(screen.getByTestId('inline-video-player')).toBeOnTheScreen();

        // When leaving the report resets the thumbnail and the user presses Play on return
        const blurListener = mockNavigation.addListener.mock.calls.at(0)?.[1];
        expect(blurListener).toBeDefined();
        act(() => blurListener?.());
        expect(screen.queryByTestId('inline-video-player')).toBeNull();
        fireEvent.press(screen.getByLabelText(previewProps.fileName));

        // Then the same selected video can be activated again
        expect(screen.getByTestId('inline-video-player')).toBeOnTheScreen();
    });

    it('plays an initially unselected video on desktop', () => {
        // Given an ordinary chat preview with no shared playback selection
        jest.mocked(usePlaybackStateContext).mockReturnValue({...usePlaybackStateContext(), currentlyPlayingURL: null, currentRouteReportID: undefined});
        render(<VideoPlayerPreview {...previewProps} />);

        // When the user presses Play
        fireEvent.press(screen.getByLabelText(previewProps.fileName));

        // Then the clicked preview mounts its player and updates the shared selection
        expect(screen.getByTestId('inline-video-player')).toBeOnTheScreen();
        expect(mockUpdateCurrentURLAndReportID).toHaveBeenCalledWith(videoUrl, undefined, reportID);
    });

    it('keeps opening the attachment modal on small screens', () => {
        // Given the same selected video on a small screen where playback belongs in the modal
        jest.mocked(useResponsiveLayout).mockReturnValue({...useResponsiveLayout(), isSmallScreenWidth: true});
        render(<VideoPlayerPreview {...previewProps} />);

        // When the user presses Play
        fireEvent.press(screen.getByLabelText(previewProps.fileName));

        // Then the modal opens instead of mounting an inline player
        expect(mockShowModal).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('inline-video-player')).toBeNull();
    });
});
