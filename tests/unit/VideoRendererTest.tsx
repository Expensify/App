import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import {AttachmentContext} from '@components/AttachmentContext';
import VideoRenderer from '@components/HTMLEngineProvider/HTMLRenderers/VideoRenderer';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

// Mock VideoPlayerPreview to simplify testing
jest.mock('@components/VideoPlayerPreview', () => {
    return ({onShowModalPress, fileName}: {onShowModalPress: () => void; fileName: string}) => {
        // Get PressableWithoutFeedback inside the component to avoid Jest mock issues
        const {PressableWithoutFeedback} = require('@components/Pressable') as {
            PressableWithoutFeedback: React.ComponentType<PressableProps>;
        };

        const handlePress = () => {
            onShowModalPress?.();
        };

        return (
            <PressableWithoutFeedback
                testID="show-modal-button"
                onPress={handlePress}
                accessibilityRole="button"
                accessibilityLabel={fileName}
            />
        );
    };
});

const mockShowContextMenuValue = {
    anchor: null,
    report: undefined,
    reportNameValuePairs: undefined,
    action: undefined,
    transactionThreadReport: undefined,
    checkIfContextMenuActive: () => {},
    isDisabled: true,
    onShowContextMenu: (callback: () => void) => callback(),
};
const mockTNodeAttributes = {
    [CONST.ATTACHMENT_SOURCE_ATTRIBUTE]: 'video/test.mp4',
    [CONST.ATTACHMENT_THUMBNAIL_URL_ATTRIBUTE]: 'thumbnail/test.jpg',
    [CONST.ATTACHMENT_THUMBNAIL_WIDTH_ATTRIBUTE]: '640',
    [CONST.ATTACHMENT_THUMBNAIL_HEIGHT_ATTRIBUTE]: '480',
    [CONST.ATTACHMENT_DURATION_ATTRIBUTE]: '60',
};

describe('VideoRenderer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should open the report attachment with isAuthTokenRequired=true', () => {
        // Given a VideoRenderer component with a valid attributes
        render(
            <ShowContextMenuContext.Provider value={mockShowContextMenuValue}>
                <AttachmentContext.Provider value={{type: CONST.ATTACHMENT_TYPE.SEARCH}}>
                    {/* @ts-expect-error - Ignoring type errors for testing purposes */}
                    <VideoRenderer tnode={{attributes: mockTNodeAttributes}} />
                </AttachmentContext.Provider>
            </ShowContextMenuContext.Provider>,
        );

        // When the user presses the show modal button
        fireEvent.press(screen.getByTestId('show-modal-button'));
        expect(Navigation.navigate).toHaveBeenCalled();

        // Then it should navigate to the attachments route with isAuthTokenRequired=true
        const mockNavigate = jest.spyOn(Navigation, 'navigate');
        const firstCall = mockNavigate.mock.calls.at(0);
        const navigateArgs = firstCall?.at(0);
        expect(navigateArgs).toContain('isAuthTokenRequired=true');
    });
});
