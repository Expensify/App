import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import CarouselItem from '@components/Attachments/AttachmentCarousel/CarouselItem';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {PlaybackContextProvider} from '@components/VideoPlayerContexts/PlaybackContext';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from '@libs/Localize';
import {AttachmentModalContextProvider} from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

describe('CarouselItem', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });
    it('should hide flagged attachments initially', async () => {
        // Given a CarouselItem component with a valid attributes
        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <PlaybackContextProvider>
                        <AttachmentModalContextProvider>
                            <CarouselItem
                                item={{
                                    reportActionID: '1',
                                    attachmentID: '1_1',
                                    source: 'img.jpeg',
                                    hasBeenFlagged: true,
                                }}
                                isFocused
                            />
                        </AttachmentModalContextProvider>
                    </PlaybackContextProvider>
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );
        await waitForBatchedUpdatesWithAct();

        // Then initially the attachment should be hidden so the reveal button should be displayed.
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        expect(screen.getByTestId('moderationButton')).toHaveTextContent(translateLocal('moderation.revealMessage'));
    });
});
