import {render, screen, waitFor} from '@testing-library/react-native';

import AttachmentPreview from '@components/AttachmentPreview';
import MockText from '@components/Text';

import React from 'react';
import {View as MockView} from 'react-native';

let mockEvent: {videoSource: string} | null = null;
const mockGenerateThumbnails = jest.fn(async () => [{uri: 'thumbnail'}]);
const mockPlayer = {generateThumbnailsAsync: mockGenerateThumbnails};
jest.mock('expo', () => ({useEvent: () => mockEvent}));
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
});
it('waits for sourceLoad before generating a video thumbnail', async () => {
    // Given a video player without an initial source event
    const {rerender} = render(
        <AttachmentPreview
            source="clip.mp4"
            aspectRatio={1}
            onPress={jest.fn()}
        />,
    );
    expect(screen.getByText('play icon')).toBeTruthy();
    expect(mockGenerateThumbnails).not.toHaveBeenCalled();
    // When sourceLoad supplies a video source
    mockEvent = {videoSource: 'clip.mp4'};
    rerender(
        <AttachmentPreview
            source="clip.mp4"
            aspectRatio={1}
            onPress={jest.fn()}
        />,
    );
    await waitFor(() => expect(mockGenerateThumbnails).toHaveBeenCalledWith([1]));
    // Then the production effect requests the thumbnail at one second and renders it
    expect(mockGenerateThumbnails).toHaveBeenCalledWith([1]);
    expect(screen.getByText('thumbnail')).toBeTruthy();
});
it('keeps the non-video branch without generating a thumbnail', () => {
    // Given a document attachment
    // When the production preview renders it
    render(
        <AttachmentPreview
            source="notes.txt"
            aspectRatio={1}
            onPress={jest.fn()}
        />,
    );
    // Then it takes the default branch without a video request
    expect(screen.getByText('default attachment')).toBeTruthy();
    expect(mockGenerateThumbnails).not.toHaveBeenCalled();
});
