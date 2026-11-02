import {render, screen, waitFor} from '@testing-library/react-native';

import AttachmentPreview from '@components/AttachmentPreview';
import MockText from '@components/Text';

import React from 'react';
import {View as MockView} from 'react-native';

type MockSourceLoadEvent = {videoSource: string} | null;
let mockEvent: MockSourceLoadEvent = null;
const mockGenerateThumbnails = jest.fn(async () => [{uri: 'thumbnail'}]);
const mockPlayer = {generateThumbnailsAsync: mockGenerateThumbnails};
const mockUseEvent = jest.fn<MockSourceLoadEvent, [typeof mockPlayer, 'sourceLoad', null]>(() => mockEvent);
jest.mock('expo', () => ({useEvent: (...args: Parameters<typeof mockUseEvent>) => mockUseEvent(...args)}));
jest.mock('expo-video', () => ({useVideoPlayer: () => mockPlayer}));
jest.mock('@hooks/useThemeStyles', () => ({__esModule: true, default: () => ({})}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({Play: 'play'})}));
jest.mock('@libs/fileDownload/FileUtils', () => ({getFileName: (name: string) => name, cleanFileName: (name: string) => name}));
jest.mock('@components/Attachments/AttachmentView', () => ({checkIsFileImage: () => false}));
jest.mock('@components/Attachments/AttachmentView/DefaultAttachmentView', () => ({__esModule: true, default: () => <MockText>default attachment</MockText>}));
jest.mock('@components/Pressable', () => ({PressableWithFeedback: ({children}: {children: React.ReactNode}) => <MockView>{children}</MockView>}));
jest.mock('@components/Icon', () => ({__esModule: true, default: () => <MockText>play icon</MockText>}));
jest.mock('@components/Image', () => ({__esModule: true, default: () => <MockText>thumbnail</MockText>}));
jest.mock('@components/PDFThumbnail', () => ({__esModule: true, default: () => null}));
beforeEach(() => {
    mockEvent = null;
    mockGenerateThumbnails.mockClear();
    mockUseEvent.mockClear();
});
it('waits for sourceLoad before generating a video thumbnail', async () => {
    // Given a video whose source has not loaded, so the player has nothing to generate a thumbnail from yet
    const {rerender} = render(
        <AttachmentPreview
            source="clip.mp4"
            aspectRatio={1}
            onPress={jest.fn()}
        />,
    );
    expect(mockUseEvent).toHaveBeenLastCalledWith(mockPlayer, 'sourceLoad', null);
    expect(screen.getByText('play icon')).toBeTruthy();
    expect(mockGenerateThumbnails).not.toHaveBeenCalled();
    // When sourceLoad fires, the first point at which the player reports a loaded video source
    mockEvent = {videoSource: 'clip.mp4'};
    rerender(
        <AttachmentPreview
            source="clip.mp4"
            aspectRatio={1}
            onPress={jest.fn()}
        />,
    );
    await waitFor(() => expect(mockGenerateThumbnails).toHaveBeenCalledWith([1]));
    // Then a thumbnail is requested at one second and shown, so the preview displays a video frame behind the play icon
    expect(mockGenerateThumbnails).toHaveBeenCalledWith([1]);
    expect(screen.getByText('thumbnail')).toBeTruthy();
});
it('keeps the non-video branch without generating a thumbnail', () => {
    // Given a text file attachment, which has no video for the player to load
    // When the preview chooses how to display it
    render(
        <AttachmentPreview
            source="notes.txt"
            aspectRatio={1}
            onPress={jest.fn()}
        />,
    );
    // Then it uses the default file view and skips the thumbnail request, because a text file has no frame to capture
    expect(screen.getByText('default attachment')).toBeTruthy();
    expect(mockGenerateThumbnails).not.toHaveBeenCalled();
});
