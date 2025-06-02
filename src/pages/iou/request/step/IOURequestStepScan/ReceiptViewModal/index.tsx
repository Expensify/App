import React, {useCallback, useRef, useState} from 'react';
import {Keyboard, View} from 'react-native';
import AttachmentCarouselView from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView/AttachmentCarouselView';
import type {AttachmentCarouselPagerHandle} from '@components/Attachments/AttachmentCarousel/Pager';
import AttachmentCarouselPager from '@components/Attachments/AttachmentCarousel/Pager';
import useCarouselArrows from '@components/Attachments/AttachmentCarousel/useCarouselArrows';
import type {AttachmentSource} from '@components/Attachments/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Receipt} from '@src/types/onyx/Transaction';

type ReceiptWithSource = Receipt & {
    source: AttachmentSource;
};

type ReceiptViewModalProps = {
    /** Whether the modal is open or not */
    isOpen: boolean;
    /** An array of receipt image source URLs to display in the modal. */
    sources: ReceiptWithSource[];
    /** The index of the currently selected receipt in the sources array. */
    selectedIndex: number;
    /** Callback to delete a receipt */
    onDelete: (index: number) => void;
    /** Callback to close modal */
    onClose: () => void;
};

function ReceiptViewModal({sources, isOpen, selectedIndex, onDelete, onClose}: ReceiptViewModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows} = useCarouselArrows();
    const pagerRef = useRef<AttachmentCarouselPagerHandle>(null);

    const [page, setPage] = useState<number>(selectedIndex);
    const [activeAttachmentID, setActiveAttachmentID] = useState<AttachmentSource>(sources.at(selectedIndex)?.receiptID ?? sources.at(selectedIndex)?.source ?? 0);

    const handleDelete = useCallback(() => {
        onDelete(page);
        onClose();
    }, [onDelete, onClose, page]);

    const updatePage = useCallback(
        (newPageIndex: number) => {
            Keyboard.dismiss();
            setShouldShowArrows(true);

            const item = sources.at(newPageIndex);

            setPage(newPageIndex);
            if (newPageIndex >= 0 && item) {
                setActiveAttachmentID(item.receiptID ?? item.source);
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

    return (
        <Modal
            type="centered"
            isVisible={isOpen}
            onClose={onClose}
        >
            <HeaderWithBackButton
                title={translate('common.receipt')}
                onBackButtonPress={onClose}
                shouldShowThreeDotsButton
                threeDotsMenuIcon={Expensicons.Trashcan}
                onThreeDotsButtonPress={handleDelete}
            />

            <View style={[styles.flex1, styles.attachmentCarouselContainer]}>
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
                        onClose={onClose}
                        ref={pagerRef}
                    />
                </AttachmentCarouselView>
            </View>
        </Modal>
    );
}

ReceiptViewModal.displayName = 'ReceiptViewModal';

export default ReceiptViewModal;
