import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type PagerView from 'react-native-pager-view';
import AttachmentCarouselView from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView/AttachmentCarouselView';
import AttachmentCarouselPager from '@components/Attachments/AttachmentCarousel/Pager';
import useCarouselArrows from '@components/Attachments/AttachmentCarousel/useCarouselArrows';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import {removeTransactionReceipt} from '@userActions/TransactionEdit';
import ONYXKEYS from '@src/ONYXKEYS';

type ReceiptViewModalProps = {
    route: {
        params: {
            transactionID: string;
        };
    };
};

function ReceiptViewModal({route}: ReceiptViewModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows} = useCarouselArrows();

    const [currentReceipt, setCurrentReceipt] = useState<ReceiptFile | null>();
    const [page, setPage] = useState<number>(0);
    const pagerRef = useRef<PagerView>(null);

    const [receipts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: (items) =>
            Object.values(items ?? {})
                .map((transaction) => (transaction?.receipt ? {...transaction?.receipt, transactionID: transaction.transactionID} : undefined))
                .filter((receipt): receipt is ReceiptFile => !!receipt),
        canBeMissing: true,
    });

    useEffect(() => {
        if (!receipts || receipts.length === 0) {
            return;
        }

        const activeReceipt = receipts.find((receipt) => receipt.transactionID === route?.params?.transactionID);
        const activeReceiptIndex = receipts.findIndex((receipt) => receipt.transactionID === activeReceipt?.transactionID);

        setCurrentReceipt(activeReceipt);
        setPage(activeReceiptIndex);
    }, [receipts, route?.params?.transactionID]);

    const cycleThroughReceipts = useCallback(
        (deltaSlide: number) => {
            const nextIndex = page + deltaSlide;
            const nextItem = receipts?.at(nextIndex);

            setPage(nextIndex);
            setCurrentReceipt(nextItem);
            pagerRef.current?.setPage(nextIndex);
        },
        [page, receipts],
    );

    const handleDelete = useCallback(() => {
        if (!currentReceipt) {
            return;
        }
        Navigation.goBack();
        removeTransactionReceipt(currentReceipt.transactionID);
    }, [currentReceipt]);

    return (
        <Modal
            type="centered"
            isVisible
            onClose={Navigation.goBack}
        >
            <HeaderWithBackButton
                title={translate('common.receipt')}
                onBackButtonPress={Navigation.goBack}
                shouldShowThreeDotsButton
                threeDotsMenuIcon={Expensicons.Trashcan}
                onThreeDotsButtonPress={handleDelete}
            />
            <View style={[styles.flex1, styles.attachmentCarouselContainer]}>
                <AttachmentCarouselView
                    cycleThroughAttachments={cycleThroughReceipts}
                    page={page}
                    attachments={receipts ?? []}
                    shouldShowArrows={shouldShowArrows}
                    autoHideArrows={autoHideArrows}
                    cancelAutoHideArrow={cancelAutoHideArrows}
                    setShouldShowArrows={setShouldShowArrows}
                >
                    <AttachmentCarouselPager
                        items={receipts ?? []}
                        initialPage={page}
                        activeAttachmentID={currentReceipt?.transactionID ?? ''}
                        setShouldShowArrows={setShouldShowArrows}
                        onPageSelected={({nativeEvent: {position: newPage}}) => setPage(newPage)}
                        onClose={Navigation.goBack}
                        ref={pagerRef}
                        reportID={currentReceipt?.transactionID ?? ''}
                    />
                </AttachmentCarouselView>
            </View>
        </Modal>
    );
}

ReceiptViewModal.displayName = 'ReceiptViewModal';

export default ReceiptViewModal;
