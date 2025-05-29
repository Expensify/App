import React, {useCallback, useRef, useState} from 'react';
import {Keyboard, View} from 'react-native';
import AttachmentCarouselView from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView/AttachmentCarouselView';
import type {AttachmentCarouselPagerHandle} from '@components/Attachments/AttachmentCarousel/Pager';
import AttachmentCarouselPager from '@components/Attachments/AttachmentCarousel/Pager';
import useCarouselArrows from '@components/Attachments/AttachmentCarousel/useCarouselArrows';
import type {Attachment, AttachmentSource} from '@components/Attachments/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';

type ReceiptViewModalProps = {
    /** An array of receipt image source URLs to display in the modal. */
    sources: Attachment[];
    /** The index of the currently selected receipt in the sources array. */
    selectedIndex: number;
    /** Callback function invoked when a receipt is deleted. */
    onDelete: () => void;
};

const mockAttachments: Attachment[] = [
    {
        source: 'https://picsum.photos/200/300',
        attachmentID: '1',
    },
    {
        source: 'https://picsum.photos/200/300',
        attachmentID: '2',
    },
    {
        source: 'https://picsum.photos/200/300',
        attachmentID: '3',
    },
];

function ReceiptViewModal({
    sources = mockAttachments,
    selectedIndex = 0,
    onDelete = () => {},
}: // route: {
//     params: {action, iouType, reportID, transactionID: initialTransactionID, backTo, backToReport},
// },
ReceiptViewModalProps) {
    // const [currentIndex, setCurrentIndex] = useState(selectedIndex);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isOpen, setIsOpen] = useState(true);
    const [activeAttachmentID, setActiveAttachmentID] = useState<AttachmentSource>(selectedIndex);
    const {shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows} = useCarouselArrows();
    const pagerRef = useRef<AttachmentCarouselPagerHandle>(null);

    // const onCycleThroughAttachments = (deltaSlide: number) => {
    //     const newIndex = (currentIndex + deltaSlide + sources.length) % sources.length;
    //     setCurrentIndex(newIndex);
    // };

    const [page, setPage] = useState<number>(0);

    const updatePage = useCallback(
        (newPageIndex: number) => {
            Keyboard.dismiss();
            setShouldShowArrows(true);

            const item = sources.at(newPageIndex);

            setPage(newPageIndex);
            if (newPageIndex >= 0 && item) {
                setActiveAttachmentID(item.attachmentID ?? item.source);
                // if (onNavigate) {
                //     onNavigate(item);
                // }
                // onNavigate?.(item);
            }
        },
        [setShouldShowArrows, sources],
    );

    /**
     * Increments or decrements the index to get another selected item
     * @param {Number} deltaSlide
     */
    const cycleThroughAttachments = useCallback(
        (deltaSlide: number) => {
            if (page === undefined) {
                return;
            }
            const nextPageIndex = page + deltaSlide;
            updatePage(nextPageIndex);
            pagerRef.current?.setPage(nextPageIndex);

            autoHideArrows();
        },
        [autoHideArrows, page, updatePage],
    );

    const containerStyles = [styles.flex1, styles.attachmentCarouselContainer];

    return (
        <Modal
            type="centered"
            isVisible={isOpen}
            onClose={() => {
                setIsOpen(false);
                Navigation.goBack();
            }}
        >
            <HeaderWithBackButton
                title={translate('common.receipt')}
                onBackButtonPress={Navigation.goBack}
                shouldShowThreeDotsButton
                threeDotsMenuIcon={Expensicons.Trashcan}
                onThreeDotsButtonPress={onDelete}
            />

            <View style={containerStyles}>
                <AttachmentCarouselView
                    cycleThroughAttachments={cycleThroughAttachments}
                    page={page}
                    attachments={sources}
                    shouldShowArrows={shouldShowArrows}
                    autoHideArrows={autoHideArrows}
                    cancelAutoHideArrow={cancelAutoHideArrows}
                >
                    <AttachmentCarouselPager
                        items={sources}
                        initialPage={page}
                        activeAttachmentID={activeAttachmentID}
                        setShouldShowArrows={setShouldShowArrows}
                        onPageSelected={({nativeEvent: {position: newPage}}) => updatePage(newPage)}
                        onClose={() => {}}
                        ref={pagerRef}
                    />
                </AttachmentCarouselView>
            </View>
        </Modal>
    );
}

ReceiptViewModal.displayName = 'ReceiptViewModal';

export default ReceiptViewModal;
