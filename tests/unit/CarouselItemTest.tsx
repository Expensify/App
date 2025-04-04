import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import CarouselItem from '@components/Attachments/AttachmentCarousel/CarouselItem';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxProvider from '@components/OnyxProvider';
import {PlaybackContextProvider} from '@components/VideoPlayerContexts/PlaybackContext';
import {translateLocal} from '@libs/Localize';
import {ReportAttachmentsProvider} from '@pages/home/report/ReportAttachmentsContext';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('CarouselItem', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });
    it('should hide flagged attachments initially', async () => {
        // Given a CarouselItem component with a valid attributes
        render(
            <OnyxProvider>
                <LocaleContextProvider>
                    <PlaybackContextProvider>
                        <ReportAttachmentsProvider>
                            <CarouselItem
                                item={{
                                    reportActionID: '1',
                                    attachmentID: '1_1',
                                    source: 'img.jpeg',
                                    hasBeenFlagged: true,
                                }}
                                isFocused
                            />
                        </ReportAttachmentsProvider>
                    </PlaybackContextProvider>
                </LocaleContextProvider>
            </OnyxProvider>,
        );
        await waitForBatchedUpdates();

        // Then initially the attachment should be hidden so the reveal button should be displayed.
        expect(screen.getByTestId('moderationButton')).toHaveTextContent(translateLocal('moderation.revealMessage'));
    });
});
