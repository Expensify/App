import React, {useCallback, useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import AttachmentCarouselView from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView/AttachmentCarouselView';
import useCarouselArrows from '@components/Attachments/AttachmentCarousel/useCarouselArrows';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import Image from '@components/Image';
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

    const [currentReceipt, setCurrentReceipt] = React.useState<ReceiptFile | null>();
    const [page, setPage] = React.useState<number>(0);

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
        const currentReceiptIndex = receipts.findIndex((receipt) => receipt.transactionID === activeReceipt?.transactionID);

        setCurrentReceipt(activeReceipt);
        setPage(currentReceiptIndex);
    }, [receipts, route?.params?.transactionID]);

    const cycleThroughReceipts = useCallback(
        (deltaSlide: number) => {
            const nextIndex = page + deltaSlide;
            const nextItem = receipts?.at(nextIndex);

            setPage(nextIndex);
            setCurrentReceipt(nextItem);
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
            <AttachmentCarouselView
                attachments={receipts ?? []}
                autoHideArrows={autoHideArrows}
                cancelAutoHideArrow={cancelAutoHideArrows}
                cycleThroughAttachments={cycleThroughReceipts}
                shouldShowArrows={shouldShowArrows}
                page={page}
                setShouldShowArrows={setShouldShowArrows}
            >
                <Image
                    style={[styles.flex1]}
                    source={{uri: currentReceipt?.source ?? ''}}
                />
            </AttachmentCarouselView>
        </Modal>
    );
}

ReceiptViewModal.displayName = 'ReceiptViewModal';

export default ReceiptViewModal;
