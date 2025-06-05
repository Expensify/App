import React, {useCallback, useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import AttachmentCarouselView from '@components/Attachments/AttachmentCarousel/AttachmentCarouselView';
import useCarouselArrows from '@components/Attachments/AttachmentCarousel/useCarouselArrows';
import useAttachmentErrors from '@components/Attachments/AttachmentView/useAttachmentErrors';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import {removeTransactionReceipt} from '@userActions/TransactionEdit';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Receipt} from '@src/types/onyx/Transaction';

type ReceiptWithTransactionIDAndSource = Receipt & ReceiptFile;

type ReceiptViewModalProps = {
    route: {
        params: {
            transactionID: string;
        };
    };
};

function ReceiptViewModal({route}: ReceiptViewModalProps) {
    const {translate} = useLocalize();
    const {setAttachmentError, clearAttachmentErrors} = useAttachmentErrors();
    const {shouldShowArrows, setShouldShowArrows, autoHideArrows, cancelAutoHideArrows} = useCarouselArrows();

    const [currentReceipt, setCurrentReceipt] = useState<ReceiptWithTransactionIDAndSource | null>();
    const [page, setPage] = useState<number>(0);
    const [isDeleteReceiptConfirmModalVisible, setIsDeleteReceiptConfirmModalVisible] = useState(false);

    const [receipts = []] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: (items) =>
            Object.values(items ?? {})
                .map((transaction) => (transaction?.receipt ? {...transaction?.receipt, transactionID: transaction.transactionID} : undefined))
                .filter((receipt): receipt is ReceiptWithTransactionIDAndSource => !!receipt),
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

    const handleDeleteReceipt = useCallback(() => {
        if (!currentReceipt) {
            return;
        }

        removeTransactionReceipt(currentReceipt.transactionID);
        Navigation.goBack();
    }, [currentReceipt]);

    const deleteReceiptAndCloseModal = useCallback(() => {
        setIsDeleteReceiptConfirmModalVisible(false);
        handleDeleteReceipt();
    }, [handleDeleteReceipt]);

    return (
        <>
            <Modal
                type="centered"
                isVisible
                onClose={Navigation.goBack}
                onModalHide={clearAttachmentErrors}
            >
                <HeaderWithBackButton
                    title={translate('common.receipt')}
                    onBackButtonPress={Navigation.goBack}
                    shouldShowThreeDotsButton
                    threeDotsMenuIcon={Expensicons.Trashcan}
                    onThreeDotsButtonPress={() => setIsDeleteReceiptConfirmModalVisible(true)}
                />
                <AttachmentCarouselView
                    attachments={receipts}
                    source={currentReceipt?.source ?? ''}
                    page={page}
                    setPage={setPage}
                    attachmentID={currentReceipt?.transactionID ?? ''}
                    onClose={Navigation.goBack}
                    autoHideArrows={autoHideArrows}
                    cancelAutoHideArrow={cancelAutoHideArrows}
                    setShouldShowArrows={setShouldShowArrows}
                    onAttachmentError={setAttachmentError}
                    shouldShowArrows={shouldShowArrows}
                />
            </Modal>
            <ConfirmModal
                title={translate('receipt.deleteReceipt')}
                isVisible={isDeleteReceiptConfirmModalVisible}
                onConfirm={deleteReceiptAndCloseModal}
                onCancel={() => setIsDeleteReceiptConfirmModalVisible(false)}
                prompt={translate('receipt.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
        </>
    );
}

ReceiptViewModal.displayName = 'ReceiptViewModal';

export default ReceiptViewModal;
