/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/naming-convention, @typescript-eslint/consistent-type-imports */
/* eslint-disable testing-library/no-unnecessary-act */
import {act, render} from '@testing-library/react-native';
import React from 'react';
import BaseVideoPlayer from '@components/VideoPlayer/BaseVideoPlayer';

// --- Mocks ---

// expo hooks used by BaseVideoPlayer
jest.mock('expo', () => ({
    useEvent: jest.fn((_player, _event, initial) => initial),
    useEventListener: jest.fn(),
}));

jest.mock('react-native-worklets', () => ({
    scheduleOnRN: jest.fn((cb: () => void) => cb()),
    createSerializable: jest.fn(),
}));

// Override the global reanimated mock to avoid the createSerializable crash
jest.mock('react-native-reanimated', () => {
    const {View} = require('react-native');
    return {
        __esModule: true,
        default: {createAnimatedComponent: () => View, View},
        useSharedValue: jest.fn((init: unknown) => ({value: init, get: () => init})),
        useAnimatedStyle: jest.fn((cb: () => unknown) => cb()),
        withTiming: jest.fn((val: unknown) => val),
        cancelAnimation: jest.fn(),
        useAnimatedRef: jest.fn(() => ({current: null})),
        useReducedMotion: jest.fn(() => false),
        useScrollViewOffset: jest.fn(() => 0),
        createAnimatedPropAdapter: jest.fn(),
        makeShareableCloneRecursive: jest.fn(),
        LayoutAnimationConfig: ({children}: {children: React.ReactNode}) => children,
    };
});

// Provide a controlled encryptedAuthToken via useSession mock
let mockEncryptedAuthToken = 'token-1';
jest.mock('@components/OnyxListItemProvider', () => ({
    useSession: () => ({encryptedAuthToken: mockEncryptedAuthToken}),
}));

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useThemeStyles', () => () => ({
    videoContainer: {},
    flex1: {},
    videoContainerLoading: {},
    videoPlaceholder: {},
}));

jest.mock('@components/VideoPlayerContexts/PlaybackContext', () => ({
    usePlaybackStateContext: () => ({
        currentlyPlayingURL: null,
        sharedElement: null,
        originalParent: null,
        currentVideoPlayerRef: {current: null},
        currentVideoViewRef: {current: null},
        mountedVideoPlayersRef: {current: []},
        playerStatus: {current: 'idle'},
        shareVersion: 0,
    }),
    usePlaybackActionsContext: () => ({
        pauseVideo: jest.fn(),
        playVideo: jest.fn(),
        replayVideo: jest.fn(),
        shareVideoPlayerElements: jest.fn(),
        updateCurrentURLAndReportID: jest.fn(),
        setCurrentlyPlayingURL: jest.fn(),
        updatePlayerStatus: jest.fn(),
        requestDonorReRegistration: jest.fn(),
    }),
}));

jest.mock('@components/VideoPlayerContexts/FullScreenContextProvider', () => ({
    useFullScreenState: () => ({
        isFullScreenRef: {current: false},
    }),
}));

jest.mock('@components/VideoPlayerContexts/VideoPopoverMenuContext', () => ({
    useVideoPopoverMenuActions: () => ({
        updateVideoPopoverMenuPlayerRef: jest.fn(),
        updatePlaybackSpeed: jest.fn(),
        updateSource: jest.fn(),
    }),
}));

jest.mock('@components/VideoPlayerContexts/VolumeContext', () => ({
    useVolumeState: () => ({
        volume: {value: 1, get: () => 1},
        lastNonZeroVolume: {value: 1, get: () => 1},
    }),
    useVolumeActions: () => ({
        updateVolume: jest.fn(),
        toggleMute: jest.fn(),
    }),
}));

// Stub out child components that are not under test
jest.mock('@components/VideoPlayer/VideoPlayerControls', () => 'VideoPlayerControls');
jest.mock('@components/VideoPlayer/VideoErrorIndicator', () => 'VideoErrorIndicator');
jest.mock('@components/VideoPopoverMenu', () => 'VideoPopoverMenu');
jest.mock('@components/AttachmentOfflineIndicator', () => 'AttachmentOfflineIndicator');
jest.mock(
    '@components/Hoverable',
    () =>
        ({children}: {children: React.ReactNode | ((isHovered: boolean) => React.ReactNode)}) =>
            typeof children === 'function' ? children(false) : children,
);
jest.mock('@components/LoadingIndicator', () => 'LoadingIndicator');
jest.mock('@components/Pressable/PressableWithoutFeedback', () => 'PressableWithoutFeedback');

// Track the mock player instances created by useVideoPlayer so we can assert on replaceAsync
type MockPlayer = {replaceAsync: jest.Mock; [key: string]: unknown};
let lastMockPlayer: MockPlayer | null = null;
jest.mock('expo-video', () => {
    const originalMock = jest.requireActual('../../__mocks__/expo-video');
    return {
        ...originalMock,
        useVideoPlayer: jest.fn((...args: unknown[]) => {
            const player = originalMock.useVideoPlayer(...args);
            lastMockPlayer = player;
            return player;
        }),
    };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const mockUseVideoPlayer = require('expo-video').useVideoPlayer as jest.Mock;

describe('BaseVideoPlayer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockEncryptedAuthToken = 'token-1';
        lastMockPlayer = null;
    });

    it('calls replaceAsync when encryptedAuthToken changes', () => {
        const url = 'https://example.com/video.mp4';

        const {rerender} = render(
            <BaseVideoPlayer
                url={url}
                reportID="123"
            />,
        );

        // Get the mock player instance created during the first render
        expect(lastMockPlayer).toBeDefined();
        const mockPlayer = lastMockPlayer!;
        expect(mockPlayer.replaceAsync).not.toHaveBeenCalled();

        // Simulate auth token change (e.g. after cache clear and re-login)
        mockEncryptedAuthToken = 'token-2';

        act(() => {
            rerender(
                <BaseVideoPlayer
                    url={url}
                    reportID="123"
                />,
            );
        });

        // The effect should have called replaceAsync with the new URL containing the new token
        expect(mockPlayer.replaceAsync).toHaveBeenCalledTimes(1);
        const newURL = String(mockPlayer.replaceAsync.mock.calls.at(0)?.at(0));
        expect(newURL).toContain('token-2');
        expect(newURL).not.toContain('token-1');
    });

    it('does not call replaceAsync when url and token remain the same', () => {
        const url = 'https://example.com/video.mp4';

        const {rerender} = render(
            <BaseVideoPlayer
                url={url}
                reportID="123"
            />,
        );

        const mockPlayer = lastMockPlayer!;

        act(() => {
            rerender(
                <BaseVideoPlayer
                    url={url}
                    reportID="123"
                />,
            );
        });

        expect(mockPlayer.replaceAsync).not.toHaveBeenCalled();
    });

    it('does not add auth token for local file URLs', () => {
        const localUrl = 'file:///tmp/video.mp4';

        render(
            <BaseVideoPlayer
                url={localUrl}
                reportID="123"
            />,
        );

        // The sourceURL passed to useVideoPlayer should not contain encryptedAuthToken
        const passedURL = String(mockUseVideoPlayer.mock.calls.at(0)?.at(0));
        expect(passedURL).not.toContain('encryptedAuthToken');
        expect(passedURL).toContain('file:///tmp/video.mp4');
    });

    it('passes a stable initial URL to useVideoPlayer across re-renders', () => {
        const url = 'https://example.com/video.mp4';

        const {rerender} = render(
            <BaseVideoPlayer
                url={url}
                reportID="123"
            />,
        );

        const firstCallURL = String(mockUseVideoPlayer.mock.calls.at(0)?.at(0));

        // Change the auth token to trigger a sourceURL change
        mockEncryptedAuthToken = 'token-2';

        act(() => {
            rerender(
                <BaseVideoPlayer
                    url={url}
                    reportID="123"
                />,
            );
        });

        // useVideoPlayer should still receive the same initial URL on re-render
        // (the update is handled by replaceAsync, not by useVideoPlayer recreating the player)
        const secondCallURL = String(mockUseVideoPlayer.mock.calls.at(1)?.at(0));
        expect(secondCallURL).toBe(firstCallURL);
    });
});
